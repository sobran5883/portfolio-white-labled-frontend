// Fetch wrapper for the Express backend.
//
// Auth model: short-lived access token in memory (token-store.js) + rotated
// httpOnly refresh cookie scoped to /api/auth. On 401 this client refreshes
// (single-flight) or runs the step-up modal, then retries the request at most
// once. Credential endpoints always skipRetry — a 401 there is an answer,
// not a hiccup.

import { getAccessToken, setAccessToken } from "@/lib/token-store";
import { isStepUpHandlerRegistered, requestStepUp } from "@/lib/reauth-coordinator";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function readError(res) {
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON body */
  }
  return new ApiError(
    res.status,
    (data && data.error) || "unknown_error",
    (data && data.message) || `Request failed (${res.status})`
  );
}

let inflightRefresh = null;

/**
 * Trades the refresh cookie for a fresh access token. Single-flight: bursts
 * of concurrent 401s share one refresh — required for cookie rotation, since
 * a second parallel call would replay the just-rotated cookie and kill the
 * session. Returns the response body, or null when the session is gone.
 */
export function refreshAccessToken() {
  if (inflightRefresh) return inflightRefresh;
  inflightRefresh = fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then(async (res) => {
      if (!res.ok) {
        setAccessToken(null);
        return null;
      }
      const data = await res.json();
      setAccessToken(data.token, data.expires_in);
      return data;
    })
    .catch(() => {
      setAccessToken(null);
      return null;
    })
    .finally(() => {
      inflightRefresh = null;
    });
  return inflightRefresh;
}

async function request(path, { method = "GET", body, headers = {}, skipRetry = false } = {}) {
  const finalHeaders = { ...headers };
  if (body !== undefined) finalHeaders["Content-Type"] = "application/json";
  const token = getAccessToken();
  if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (res.status === 401 && !skipRetry) {
    const err = await readError(res.clone());
    if (err.code === "reauth_required" && isStepUpHandlerRegistered()) {
      if (await requestStepUp()) {
        return request(path, { method, body, headers, skipRetry: true });
      }
      throw new ApiError(401, "reauth_cancelled", "Re-authentication was cancelled.");
    }
    if (err.code === "invalid_token") {
      if (await refreshAccessToken()) {
        return request(path, { method, body, headers, skipRetry: true });
      }
    }
    throw err;
  }

  if (!res.ok) throw await readError(res);
  if (res.status === 204) return undefined;
  const text = await res.text();
  return text ? JSON.parse(text) : undefined;
}

export const api = {
  // ---- auth (credential endpoints never auto-retry) ----
  register: (payload) => request("/auth/register", { method: "POST", body: payload, skipRetry: true }),
  verifyOtp: (payload) => request("/auth/verify-otp", { method: "POST", body: payload, skipRetry: true }),
  resendOtp: (payload) => request("/auth/resend-otp", { method: "POST", body: payload, skipRetry: true }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, skipRetry: true }),
  totpVerify: (payload) => request("/auth/totp/verify", { method: "POST", body: payload, skipRetry: true }),
  totpBackupVerify: (payload) =>
    request("/auth/totp/backup/verify", { method: "POST", body: payload, skipRetry: true }),
  totpEnrollBegin: () => request("/auth/totp/enroll/begin", { method: "POST", body: {} }),
  totpEnrollConfirm: (payload) =>
    request("/auth/totp/enroll/confirm", { method: "POST", body: payload, skipRetry: true }),
  reauth: (payload) => request("/auth/reauth", { method: "POST", body: payload, skipRetry: true }),
  logout: () => request("/auth/logout", { method: "POST", body: {}, skipRetry: true }),
  me: () => request("/auth/me"),

  // ---- my portfolio (protected) ----
  getMyPortfolio: () => request("/portfolio"),
  updatePortfolio: (payload) => request("/portfolio", { method: "PUT", body: payload }),
  setSlug: (slug) => request("/portfolio/slug", { method: "PUT", body: { slug } }),
  checkSlug: (slug) => request(`/portfolio/slug-available/${encodeURIComponent(slug)}`),
  setPublished: (published) =>
    request("/portfolio/publish", { method: "PUT", body: { published } }),

  // ---- admin (requires userType=admin) ----
  adminListUsers: () => request("/admin/users"),
  adminGetUser: (id) => request(`/admin/users/${encodeURIComponent(id)}`),

  // ---- uploads ----
  signUpload: (payload) => request("/upload/sign", { method: "POST", body: payload }),

  // ---- public ----
  getPublicPortfolio: (slug) => request(`/public/${encodeURIComponent(slug)}`),
};

/**
 * Uploads a File to S3 using a presigned URL from the backend.
 * Returns the public URL of the stored object.
 */
export async function uploadFile(file, folder = "misc") {
  const { uploadUrl, publicUrl } = await api.signUpload({
    contentType: file.type,
    folder,
  });
  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!put.ok) throw new Error("Upload to storage failed.");
  return publicUrl;
}

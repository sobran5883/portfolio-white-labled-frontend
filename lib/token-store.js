// The access token lives ONLY in this module — never in localStorage or a
// readable cookie — so XSS can't exfiltrate a durable credential. A reload
// wipes it by design; AuthContext restores the session from the httpOnly
// refresh cookie on mount.

let accessToken = null;
let expiresAt = null;

export function getAccessToken() {
  return accessToken;
}

export function getAccessTokenExpiresAt() {
  return expiresAt;
}

export function setAccessToken(token, expiresInSeconds) {
  accessToken = token || null;
  expiresAt = token && expiresInSeconds ? Date.now() + expiresInSeconds * 1000 : null;
}

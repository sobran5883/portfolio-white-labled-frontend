/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // User-uploaded images live on S3 (or a CDN in front of it). The exact
    // host comes from env, so allow any https host for next/image.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      // Local dev: uploads are served by LocalStack over plain http.
      { protocol: "http", hostname: "localhost" },
    ],
  },
  // Deployed: proxy /api to the backend so the browser only ever talks to this
  // origin. The refresh cookie is SameSite=Strict, so it must be first-party —
  // a direct call to a different site (e.g. *.onrender.com) would never carry
  // it. Unset in local dev, where NEXT_PUBLIC_API_URL points at the backend.
  async rewrites() {
    const backend = process.env.BACKEND_URL;
    return backend
      ? [{ source: "/api/:path*", destination: `${backend.replace(/\/$/, "")}/api/:path*` }]
      : [];
  },
};

export default nextConfig;

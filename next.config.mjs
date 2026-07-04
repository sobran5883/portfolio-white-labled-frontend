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
};

export default nextConfig;

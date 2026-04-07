/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core", "playwright-core"],
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};
export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core", "playwright-core"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        os: false,
        path: false,
        child_process: false,
        net: false,
        tls: false,
        dns: false,
      };
    }
    return config;
  },
};
export default nextConfig;

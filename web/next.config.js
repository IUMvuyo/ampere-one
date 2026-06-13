/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so it deploys straight to GitHub Pages (and any quantyx subdomain via CNAME).
  output: 'export',
  images: { unoptimized: true },
  // Served from a custom subdomain root, so no basePath. trailingSlash keeps /dashboard/ working on Pages.
  trailingSlash: true,
};

module.exports = nextConfig;

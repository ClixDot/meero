import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the project root so Next.js ignores the stray lockfile in the home folder.
  turbopack: { root: path.resolve(process.cwd()) },
  // Keep the dev badge clear of the admin sidebar's Collapse button.
  devIndicators: { position: 'bottom-right' },
};

export default nextConfig;

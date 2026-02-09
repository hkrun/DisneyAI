import type { NextConfig } from "next";
import createMDX from '@next/mdx'

const withMDX = createMDX()

const nextConfig: NextConfig = {
  // 统一 URL 形式：不带尾斜杠，与 sitemap 中 URL 一致，避免「重复网页」与「网页会自动重定向」导致未编入索引
  trailingSlash: false,
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx','md'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    serverActions: {
      bodySizeLimit: '1.5gb'
    },
  },
  reactStrictMode: false,
};

export default withMDX(nextConfig);

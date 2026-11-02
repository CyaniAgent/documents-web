import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // emits .next/standalone (a minimal server with traced dependencies) —
  // used by the Docker image; `next start` prints a warning but still works
  output: 'standalone',
};

export default withMDX(config);

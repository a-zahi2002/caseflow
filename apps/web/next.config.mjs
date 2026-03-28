/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@caseflow/types'],
  output: 'standalone',
}

export default nextConfig

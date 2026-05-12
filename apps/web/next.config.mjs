/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@caseflow/types', '@caseflow/ui', '@caseflow/db'],
  output: 'standalone',
}

export default nextConfig

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@caseflow/types', '@caseflow/ui', '@caseflow/db'],
  output: 'standalone',
  experimental: {
    ppr: true,
  },
}

export default nextConfig

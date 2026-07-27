/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@base-ui/react", "@paper-design/shaders-react"],
  },
}

export default nextConfig

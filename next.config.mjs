/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Permitir conexiones externas al entorno de desarrollo
  allowedDevOrigins: ["192.168.1.24"],
}

export default nextConfig

import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { Providers } from "@/components/providers"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Timer",
  description:
    "Un temporizador minimalista y accesible que anuncia el tiempo restante o transcurrido por voz en múltiples idiomas.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Timer",
  },
  icons: {
    icon: [
      {
        url: "/icons/icon-light-512x512.png",
        sizes: "512x512",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icons/icon-light-192x192.png",
        sizes: "192x192",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icons/icon-light-34x34.png",
        sizes: "34x34",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icons/icon-light-44x44.png",
        sizes: "44x44",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icons/icon-dark-34x34.png",
        sizes: "34x34",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icons/icon-dark-44x44.png",
        sizes: "44x44",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icons/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "/icons/icon-light-512x512.png",
        sizes: "512x512",
      },
      {
        url: "/icons/icon-light-192x192.png",
        sizes: "192x192",
      },
      {
        url: "/icons/icon-light-44x44.png",
        sizes: "44x44",
      },
    ],
  },
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

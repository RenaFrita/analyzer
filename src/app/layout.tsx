import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { HyperliquidProvider } from '@/providers/HyperliquidContext'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Analyzer',
  description: 'Hyperliquid chart analyzer',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`h-full ${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex flex-col h-full max-h-screen overflow-hidden">
        <HyperliquidProvider>
          {children}
        </HyperliquidProvider>
      </body>
    </html>
  )
}

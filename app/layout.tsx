import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AlphaScanner — Detect Unusual Crypto Activity Before Everyone Else',
  description: 'Real-time crypto unusual activity scanner. Volume spikes, whale movements, smart money alerts. Free tier available.',
  openGraph: {
    title: 'AlphaScanner — Crypto Unusual Activity Scanner',
    description: 'Detect volume spikes, whale movements, and smart money before the crowd.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}

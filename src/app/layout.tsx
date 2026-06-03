import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lison CRM',
  description: 'O\'quv markazi boshqaruv tizimi',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className="antialiased">{children}</body>
    </html>
  )
}

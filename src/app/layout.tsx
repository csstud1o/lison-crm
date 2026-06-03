import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lison CRM - O\'quv markazi boshqaruv tizimi',
  description: 'O\'quv markazini boshqarish uchun CRM tizimi: o\'quvchilar, guruhlar, to\'lovlar va davomat',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}

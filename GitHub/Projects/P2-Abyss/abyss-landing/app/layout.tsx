import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Abyss | Protecting Human Artistry in the Age of AI',
  description: 'A sanctuary for real, human-made art. Share your work without worrying about AI takeover or unauthorized reuse.',
  keywords: 'art platform, human art, AI protection, artist community, authentic art',
  openGraph: {
    title: 'Abyss | Protecting Human Artistry',
    description: 'A sanctuary for real, human-made art.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="min-h-screen">{children}</body>
      </html>
    </ClerkProvider>
  )
}

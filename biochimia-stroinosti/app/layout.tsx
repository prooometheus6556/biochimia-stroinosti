import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Биохимия стройности | Минус 29 кг без жестких диет',
  description: 'Научный подход к снижению веса через контроль инсулина и метаболическую гибкость. Похудейте без голода и срывов.',
  keywords: 'похудение, инсулин, метаболизм, стройность, биохимия, жиросжигание, метаболическая гибкость',
  openGraph: {
    title: 'Биохимия стройности | Минус 29 кг без жестких диет',
    description: 'Научный подход к снижению веса. Похудейте без голода и срывов.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}

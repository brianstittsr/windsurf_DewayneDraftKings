import type { Metadata } from 'next'
import { Inter, Nunito, Varela_Round } from 'next/font/google'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../globals.css'
import '../public/css/grayscale.min.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })
const nunito = Nunito({ subsets: ['latin'] })
const varelaRound = Varela_Round({ weight: '400', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'All Pro Sports - Elite Athletic League',
  description: 'Join our elite athletic league with automated SMS updates, player profiles, and real-time notifications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="/css/sb-admin-2.min.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" async></script>
      </head>
      <body className={nunito.className}>
        <Providers>
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}

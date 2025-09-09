import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard - All Pro Sports',
  description: 'Administrative dashboard for All Pro Sports league management',
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  )
}

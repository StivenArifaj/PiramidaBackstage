import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f0' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, marginLeft: 220, minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}

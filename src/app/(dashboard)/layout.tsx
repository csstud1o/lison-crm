import Sidebar from '@/components/Sidebar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // DEMO MODE: mock user
  const profile = { role: 'superadmin', full_name: 'Demo Admin' }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={profile.role} userName={profile.full_name} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 shrink-0">
          <h2 className="text-sm font-medium text-gray-700">Boshqaruv paneli</h2>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'reception'
  const userName = profile?.full_name || user.email || 'User'

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-64 h-64 bg-indigo-200/25 rounded-full blur-3xl orb-1" />
        <div className="absolute bottom-20 left-40 w-80 h-80 bg-purple-200/15 rounded-full blur-3xl orb-2" />
      </div>
      <Sidebar role={role} userName={userName} />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="h-14 glass-white flex items-center justify-between px-6 shrink-0 border-b border-white/30">
          <span className="text-sm font-medium text-gray-700">Lison CRM</span>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/30">
            {userName.charAt(0).toUpperCase()}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}

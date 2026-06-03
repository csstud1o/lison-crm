import { createClient } from '@/lib/supabase/server'
import { Users, BookOpen, UserCheck, CreditCard, TrendingUp, GraduationCap } from 'lucide-react'

async function getStats() {
  const supabase = await createClient()
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [students, groups, subjects, teachers, payments, todayAttendance] = await Promise.all([
    supabase.from('students').select('id', { count: 'exact' }).eq('is_active', true),
    supabase.from('groups').select('id', { count: 'exact' }).eq('is_active', true),
    supabase.from('subjects').select('id', { count: 'exact' }).eq('is_active', true),
    supabase.from('teachers').select('id', { count: 'exact' }).eq('is_active', true),
    supabase.from('payments').select('amount').eq('month', month).eq('year', year),
    supabase.from('attendance').select('status').eq('date', now.toISOString().split('T')[0]),
  ])

  const monthTotal = (payments.data || []).reduce((s, p) => s + Number(p.amount), 0)
  const presentToday = (todayAttendance.data || []).filter(a => a.status === 'present').length
  const absentToday = (todayAttendance.data || []).filter(a => a.status === 'absent').length

  return {
    students: students.count || 0,
    groups: groups.count || 0,
    subjects: subjects.count || 0,
    teachers: teachers.count || 0,
    monthTotal,
    presentToday,
    absentToday,
    month,
    year,
  }
}

async function getRecentPayments() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('payments')
    .select('*, students(full_name), groups(name, subjects(name))')
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

export default async function DashboardPage() {
  const [stats, recentPayments] = await Promise.all([getStats(), getRecentPayments()])
  const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']

  const cards = [
    { label: 'Jami o\'quvchilar', value: stats.students, icon: Users, color: 'bg-blue-500' },
    { label: 'Faol guruhlar', value: stats.groups, icon: UserCheck, color: 'bg-green-500' },
    { label: 'Fanlar', value: stats.subjects, icon: BookOpen, color: 'bg-purple-500' },
    { label: 'O\'qituvchilar', value: stats.teachers, icon: GraduationCap, color: 'bg-orange-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.label}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} text-white p-3 rounded-xl`}>
                <card.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly payment & today attendance */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-500 text-white p-2 rounded-xl"><CreditCard size={18} /></div>
            <div>
              <p className="text-gray-500 text-sm">{MONTHS[stats.month - 1]} {stats.year} - jami to'lovlar</p>
              <p className="text-2xl font-bold text-green-600">{stats.monthTotal.toLocaleString()} so'm</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-500 text-white p-2 rounded-xl"><TrendingUp size={18} /></div>
            <p className="font-semibold">Bugungi davomat</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.presentToday}</p>
              <p className="text-xs text-gray-500">Keldi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{stats.absentToday}</p>
              <p className="text-xs text-gray-500">Kelmadi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent payments */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold">So'nggi to'lovlar</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">O'quvchi</th>
              <th className="text-left px-4 py-3">Guruh</th>
              <th className="text-left px-4 py-3">Summa</th>
              <th className="text-left px-4 py-3">Sana</th>
            </tr>
          </thead>
          <tbody>
            {recentPayments.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{(p.students as any)?.full_name}</td>
                <td className="px-4 py-3">{(p.groups as any)?.name} - {(p.groups as any)?.subjects?.name}</td>
                <td className="px-4 py-3 text-green-700 font-medium">{Number(p.amount).toLocaleString()} so'm</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.payment_date).toLocaleDateString('uz-UZ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {recentPayments.length === 0 && <p className="text-center text-gray-400 py-6">To'lovlar yo'q</p>}
      </div>
    </div>
  )
}

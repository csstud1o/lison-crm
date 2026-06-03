import { Users, BookOpen, UserCheck, CreditCard, TrendingUp, GraduationCap } from 'lucide-react'

const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']

function getStats() {
  const now = new Date()
  return {
    students: 0, groups: 0, subjects: 5, teachers: 0,
    monthTotal: 0, presentToday: 0, absentToday: 0, lateToday: 0,
    month: now.getMonth() + 1, year: now.getFullYear(),
  }
}

export default function DashboardPage() {
  const stats = getStats()

  const totalAttendance = stats.presentToday + stats.absentToday + stats.lateToday
  const attendancePercent = totalAttendance > 0 ? Math.round((stats.presentToday / totalAttendance) * 100) : 0

  const cards = [
    { label: "Jami o'quvchilar", value: stats.students, icon: Users, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Faol guruhlar', value: stats.groups, icon: UserCheck, gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Fanlar', value: stats.subjects, icon: BookOpen, gradient: 'from-violet-500 to-violet-600' },
    { label: "O'qituvchilar", value: stats.teachers, icon: GraduationCap, gradient: 'from-amber-500 to-amber-600' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Boshqaruv paneli</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{card.value.toLocaleString()}</p>
              </div>
              <div className={`bg-gradient-to-br ${card.gradient} text-white p-3 rounded-xl shadow-lg`}>
                <card.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-2.5 rounded-xl shadow-lg">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Oylik to&apos;lovlar</p>
              <p className="text-xs text-gray-400">{MONTHS[stats.month - 1]} {stats.year}</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-3">{stats.monthTotal.toLocaleString()} <span className="text-base font-normal text-gray-500">so&apos;m</span></p>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2.5 rounded-full" style={{ width: '65%' }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">Taxminiy to&apos;lov rejasiga nisbatan</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Bugungi davomat</p>
              <p className="text-xs text-gray-400">{totalAttendance} ta o&apos;quvchi</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Keldi: {stats.presentToday}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Kelmadi: {stats.absentToday}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
              <span className="w-2 h-2 rounded-full bg-yellow-500" /> Kech: {stats.lateToday}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2.5 rounded-full" style={{ width: `${attendancePercent}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">Davomat: {attendancePercent}%</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-2 rounded-lg">
            <CreditCard size={16} />
          </div>
          <h2 className="font-semibold text-gray-800">So&apos;nggi to&apos;lovlar</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">O&apos;quvchi</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Guruh</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Summa</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Hali to&apos;lovlar yo&apos;q</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

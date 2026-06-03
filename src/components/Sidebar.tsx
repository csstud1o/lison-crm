'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import {
  LayoutDashboard, Users, BookOpen, UserCheck, CreditCard,
  CalendarCheck, Settings, LogOut, GraduationCap
} from 'lucide-react'

const adminLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'O\'quvchilar', icon: Users },
  { href: '/subjects', label: 'Fanlar', icon: BookOpen },
  { href: '/teachers', label: 'O\'qituvchilar', icon: GraduationCap },
  { href: '/groups', label: 'Guruhlar', icon: UserCheck },
  { href: '/payments', label: 'To\'lovlar', icon: CreditCard },
  { href: '/attendance', label: 'Davomat', icon: CalendarCheck },
  { href: '/admin/users', label: 'Foydalanuvchilar', icon: Settings },
]

const receptionLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'O\'quvchilar', icon: Users },
  { href: '/groups', label: 'Guruhlar', icon: UserCheck },
  { href: '/payments', label: 'To\'lovlar', icon: CreditCard },
  { href: '/attendance', label: 'Davomat', icon: CalendarCheck },
]

export default function Sidebar({ role, userName }: { role: string; userName: string }) {
  const pathname = usePathname()
  const links = role === 'superadmin' ? adminLinks : receptionLinks

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      {/* Logo */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap size={20} />
          </div>
          <span className="font-bold text-lg">Lison CRM</span>
        </div>
      </div>

      {/* User info */}
      <div className="px-5 pb-4 mb-2 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-300">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{userName}</p>
            <span className="text-xs text-gray-500">
              {role === 'superadmin' ? 'Superadmin' : 'Resepshn'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
              isActive(href)
                ? 'bg-blue-600/20 text-blue-400 border-l-[3px] border-blue-400 pl-[9px]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-800">
        <form action={logout}>
          <button className="flex items-center gap-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 text-sm w-full px-3 py-2.5 rounded-lg transition-all duration-200">
            <LogOut size={18} />
            Chiqish
          </button>
        </form>
      </div>
    </aside>
  )
}

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

  return (
    <aside className="w-56 bg-blue-800 text-white flex flex-col">
      <div className="p-4 border-b border-blue-700">
        <h1 className="font-bold text-lg">Lison CRM</h1>
        <p className="text-blue-300 text-xs mt-1">{userName}</p>
        <span className="text-xs bg-blue-600 px-2 py-0.5 rounded-full mt-1 inline-block">
          {role === 'superadmin' ? 'Superadmin' : 'Resepshn'}
        </span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-blue-600 text-white'
                : 'text-blue-200 hover:bg-blue-700'
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-blue-700">
        <form action={logout}>
          <button className="flex items-center gap-3 text-blue-200 hover:text-white text-sm w-full px-3 py-2 rounded-lg hover:bg-blue-700">
            <LogOut size={16} />
            Chiqish
          </button>
        </form>
      </div>
    </aside>
  )
}

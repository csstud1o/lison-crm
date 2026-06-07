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
  { href: '/students', label: "O'quvchilar", icon: Users },
  { href: '/subjects', label: 'Fanlar', icon: BookOpen },
  { href: '/teachers', label: "O'qituvchilar", icon: GraduationCap },
  { href: '/groups', label: 'Guruhlar', icon: UserCheck },
  { href: '/payments', label: "To'lovlar", icon: CreditCard },
  { href: '/attendance', label: 'Davomat', icon: CalendarCheck },
  { href: '/admin/users', label: 'Foydalanuvchilar', icon: Settings },
]

const receptionLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/students', label: "O'quvchilar", icon: Users },
  { href: '/groups', label: 'Guruhlar', icon: UserCheck },
  { href: '/payments', label: "To'lovlar", icon: CreditCard },
  { href: '/attendance', label: 'Davomat', icon: CalendarCheck },
]

export default function Sidebar({ role, userName }: { role: string; userName: string }) {
  const pathname = usePathname()
  const links = role === 'superadmin' ? adminLinks : receptionLinks

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))

  return (
    <aside className="w-64 glass-dark text-white flex flex-col relative overflow-hidden shrink-0 z-10">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="p-5 pb-4 slide-in-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <GraduationCap size={20} />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            Lison CRM
          </span>
        </div>
      </div>

      <div className="px-4 pb-4 mb-2 border-b border-white/10">
        <div className="flex items-center gap-3 glass rounded-xl px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-sm font-bold shadow-lg">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/90 truncate">{userName}</p>
            <span className="text-xs text-white/50">{role === 'superadmin' ? 'Superadmin' : 'Resepshn'}</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto py-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-glass flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${
              isActive(href)
                ? 'bg-indigo-500/25 text-white border-l-[3px] border-indigo-400 pl-[9px]'
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <a
          href="https://t.me/wasadmin"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-glass flex items-center gap-3 text-white/50 hover:text-sky-400 text-sm w-full px-3 py-2.5 rounded-xl"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.667l-2.95-.924c-.64-.203-.658-.64.135-.954l11.57-4.461c.537-.194 1.006.131.97.893z"/>
          </svg>
          Qo&apos;llab-quvvatlash
        </a>
        <form action={logout}>
          <button className="nav-glass flex items-center gap-3 text-white/50 hover:text-red-400 text-sm w-full px-3 py-2.5 rounded-xl">
            <LogOut size={18} />
            Chiqish
          </button>
        </form>
      </div>
    </aside>
  )
}

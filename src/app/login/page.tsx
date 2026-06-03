'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Loader2, GraduationCap, Sparkles, Zap, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError("Email yoki parol noto'g'ri")
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex bg-mesh relative overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-white/20 rounded-full blur-3xl orb-1" />
        <div className="absolute bottom-20 right-[15%] w-96 h-96 bg-purple-300/20 rounded-full blur-3xl orb-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl float-anim" />
      </div>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative z-10">
        <div className="text-center text-white px-12 fade-in-scale">
          <div className="w-24 h-24 glass rounded-3xl flex items-center justify-center mx-auto mb-8 float-anim shadow-2xl">
            <GraduationCap size={48} />
          </div>
          <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">Lison CRM</h1>
          <p className="text-white/80 text-xl font-light">O&apos;quv markazi boshqaruv tizimi</p>
          <div className="mt-8 flex justify-center gap-3">
            <div className="glass rounded-2xl px-4 py-3 text-sm stagger-1 flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-300" /> Zamonaviy
            </div>
            <div className="glass rounded-2xl px-4 py-3 text-sm stagger-2 flex items-center gap-2">
              <Zap size={16} className="text-cyan-300" /> Tezkor
            </div>
            <div className="glass rounded-2xl px-4 py-3 text-sm stagger-3 flex items-center gap-2">
              <ShieldCheck size={16} className="text-green-300" /> Xavfsiz
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 relative z-10">
        <div className="w-full max-w-md fade-in-up">
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Lison CRM</h1>
          </div>

          <div className="glass-card rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Kirish</h2>
            <p className="text-gray-500 text-sm mb-8">Hisobingizga kiring</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative group">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/50 border border-white/60 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/80 transition-all"
                />
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="password"
                  placeholder="Parol"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/50 border border-white/60 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/80 transition-all"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50/80 backdrop-blur px-4 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-medium text-sm btn-3d shadow-lg shadow-indigo-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Kirish...</> : 'Kirish'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { getTeachers, getActiveSubjects, upsertTeacher, toggleTeacherActive } from '@/app/actions/crud'
import { Teacher, Subject } from '@/lib/types'
import { Plus, Pencil, GraduationCap } from 'lucide-react'

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [form, setForm] = useState({ full_name: '', phone: '', subject_id: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    const [t, s] = await Promise.all([getTeachers(), getActiveSubjects()])
    setTeachers(t); setSubjects(s)
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await upsertTeacher({ full_name: form.full_name, phone: form.phone || null, subject_id: form.subject_id || null }, editId || undefined)
    setForm({ full_name: '', phone: '', subject_id: '' })
    setEditId(null); setShowForm(false); load()
  }

  function startEdit(t: Teacher) {
    setForm({ full_name: t.full_name, phone: t.phone || '', subject_id: t.subject_id || '' })
    setEditId(t.id); setShowForm(true)
  }

  async function handleToggle(t: Teacher) {
    await toggleTeacherActive(t.id, !t.is_active)
    load()
  }

  function formatPhone(phone: string) {
    if (!phone) return '—'
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 12) return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`
    if (cleaned.length === 9) return `+998 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`
    return phone
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 rounded-xl">
            <GraduationCap size={22} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">O&apos;qituvchilar</h1>
            <p className="text-sm text-gray-500">{teachers.length} ta o&apos;qituvchi</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ full_name: '', phone: '', subject_id: '' }) }}
          className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-colors shadow-sm shadow-purple-200">
          <Plus size={18} /> Qo&apos;shish
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl space-y-5 animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="font-bold text-xl text-gray-900">{editId ? 'Tahrirlash' : 'Yangi o\'qituvchi'}</h2>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">F.I.Sh.</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow" placeholder="To'liq ism" value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Telefon</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow" placeholder="+998 90 123 45 67" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Fan</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow" value={form.subject_id}
                onChange={e => setForm({ ...form, subject_id: e.target.value })}>
                <option value="">Fan tanlang</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors">Saqlash</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">Bekor</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">F.I.Sh.</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Telefon</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Fan</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Holat</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {teachers.map(t => (
              <tr key={t.id} className="hover:bg-purple-50/40 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-xs">
                      {t.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="font-medium text-gray-900">{t.full_name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600 font-mono text-xs">{formatPhone(t.phone || '')}</td>
                <td className="px-5 py-4">
                  {(t.subjects as any)?.name ? (
                    <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                      {(t.subjects as any).name}
                    </span>
                  ) : <span className="text-gray-400">—</span>}
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => handleToggle(t)}
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${t.is_active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${t.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {t.is_active ? 'Faol' : 'Nofaol'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => startEdit(t)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                    <Pencil size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {teachers.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <GraduationCap size={40} className="mx-auto mb-3 opacity-50" />
            <p>Hali o&apos;qituvchilar yo&apos;q</p>
          </div>
        )}
      </div>
    </div>
  )
}

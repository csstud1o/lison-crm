'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Subject } from '@/lib/types'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [form, setForm] = useState({ name: '', description: '', monthly_fee: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  async function load() {
    const { data } = await supabase.from('subjects').select('*').order('created_at')
    setSubjects(data || [])
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { name: form.name, description: form.description, monthly_fee: Number(form.monthly_fee) }
    if (editId) {
      await supabase.from('subjects').update(payload).eq('id', editId)
    } else {
      await supabase.from('subjects').insert(payload)
    }
    setForm({ name: '', description: '', monthly_fee: '' })
    setEditId(null)
    setShowForm(false)
    load()
  }

  function startEdit(s: Subject) {
    setForm({ name: s.name, description: s.description || '', monthly_fee: String(s.monthly_fee) })
    setEditId(s.id)
    setShowForm(true)
  }

  async function toggleActive(s: Subject) {
    await supabase.from('subjects').update({ is_active: !s.is_active }).eq('id', s.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl">
            <BookOpen size={22} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fanlar</h1>
            <p className="text-sm text-gray-500">{subjects.length} ta fan</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', description: '', monthly_fee: '' }) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
          <Plus size={18} /> Fan qo&apos;shish
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl space-y-5 animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="font-bold text-xl text-gray-900">{editId ? 'Fanni tahrirlash' : 'Yangi fan qo\'shish'}</h2>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Fan nomi</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="Masalan: Ingliz tili" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Tavsif</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="Ixtiyoriy" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Oylik to&apos;lov (so&apos;m)</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" type="number" placeholder="500000" value={form.monthly_fee}
                onChange={e => setForm({ ...form, monthly_fee: e.target.value })} required />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors">Saqlash</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">Bekor</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Fan nomi</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Tavsif</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Oylik to&apos;lov</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Holat</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {subjects.map(s => (
              <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                <td className="px-5 py-4 font-medium text-gray-900">{s.name}</td>
                <td className="px-5 py-4 text-gray-500">{s.description || '—'}</td>
                <td className="px-5 py-4 font-medium text-gray-900">{s.monthly_fee.toLocaleString()} <span className="text-gray-400 font-normal">so&apos;m</span></td>
                <td className="px-5 py-4">
                  <button onClick={() => toggleActive(s)}
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${s.is_active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${s.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {s.is_active ? 'Faol' : 'Nofaol'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => startEdit(s)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Pencil size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subjects.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
            <p>Hali fanlar yo&apos;q</p>
          </div>
        )}
      </div>
    </div>
  )
}

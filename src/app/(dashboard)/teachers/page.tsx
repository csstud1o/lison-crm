'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Teacher, Subject } from '@/lib/types'
import { Plus, Pencil } from 'lucide-react'

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [form, setForm] = useState({ full_name: '', phone: '', subject_id: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  async function load() {
    const [t, s] = await Promise.all([
      supabase.from('teachers').select('*, subjects(name)').order('created_at'),
      supabase.from('subjects').select('*').eq('is_active', true)
    ])
    setTeachers(t.data || [])
    setSubjects(s.data || [])
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { full_name: form.full_name, phone: form.phone, subject_id: form.subject_id || null }
    if (editId) await supabase.from('teachers').update(payload).eq('id', editId)
    else await supabase.from('teachers').insert(payload)
    setForm({ full_name: '', phone: '', subject_id: '' })
    setEditId(null); setShowForm(false); load()
  }

  function startEdit(t: Teacher) {
    setForm({ full_name: t.full_name, phone: t.phone || '', subject_id: t.subject_id || '' })
    setEditId(t.id); setShowForm(true)
  }

  async function toggleActive(t: Teacher) {
    await supabase.from('teachers').update({ is_active: !t.is_active }).eq('id', t.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">O'qituvchilar</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ full_name: '', phone: '', subject_id: '' }) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={16} /> Qo'shish
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="font-bold text-lg">{editId ? 'Tahrirlash' : 'Yangi o\'qituvchi'}</h2>
            <input className="input" placeholder="F.I.Sh." value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })} required />
            <input className="input" placeholder="Telefon" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} />
            <select className="input" value={form.subject_id}
              onChange={e => setForm({ ...form, subject_id: e.target.value })}>
              <option value="">Fan tanlang</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Saqlash</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-2 rounded-lg">Bekor</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">F.I.Sh.</th>
              <th className="text-left px-4 py-3">Telefon</th>
              <th className="text-left px-4 py-3">Fan</th>
              <th className="text-left px-4 py-3">Holat</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(t => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{t.full_name}</td>
                <td className="px-4 py-3">{t.phone || '-'}</td>
                <td className="px-4 py-3">{(t.subjects as any)?.name || '-'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(t)}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {t.is_active ? 'Faol' : 'Nofaol'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => startEdit(t)} className="text-blue-500 hover:text-blue-700"><Pencil size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

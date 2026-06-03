'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Subject } from '@/lib/types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Fanlar</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', description: '', monthly_fee: '' }) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={16} /> Fan qo'shish
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="font-bold text-lg">{editId ? 'Tahrirlash' : 'Yangi fan'}</h2>
            <input className="input" placeholder="Fan nomi" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input className="input" placeholder="Tavsif (ixtiyoriy)" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
            <input className="input" type="number" placeholder="Oylik to'lov (so'm)" value={form.monthly_fee}
              onChange={e => setForm({ ...form, monthly_fee: e.target.value })} required />
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
              <th className="text-left px-4 py-3">Fan nomi</th>
              <th className="text-left px-4 py-3">Tavsif</th>
              <th className="text-left px-4 py-3">Oylik to'lov</th>
              <th className="text-left px-4 py-3">Holat</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(s => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-gray-500">{s.description || '-'}</td>
                <td className="px-4 py-3">{s.monthly_fee.toLocaleString()} so'm</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(s)}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.is_active ? 'Faol' : 'Nofaol'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => startEdit(s)} className="text-blue-500 hover:text-blue-700 mr-3"><Pencil size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

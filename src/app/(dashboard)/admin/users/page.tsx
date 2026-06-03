'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/lib/types'
import { Plus, Pencil } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [form, setForm] = useState({ email: '', full_name: '', role: 'reception', password: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState('')
  const supabase = createClient()

  async function load() {
    const { data } = await supabase.from('users').select('*').order('created_at')
    setUsers(data || [])
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    if (editId) {
      await supabase.from('users').update({ full_name: form.full_name, role: form.role as any }).eq('id', editId)
      setMsg('Saqlandi!')
    } else {
      // Create auth user then profile
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, full_name: form.full_name, role: form.role })
      })
      const json = await res.json()
      if (json.error) { setMsg('Xato: ' + json.error); return }
      setMsg('Foydalanuvchi yaratildi!')
    }
    setForm({ email: '', full_name: '', role: 'reception', password: '' })
    setEditId(null); setShowForm(false); load()
  }

  async function toggleActive(u: User) {
    await supabase.from('users').update({ is_active: !u.is_active }).eq('id', u.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Foydalanuvchilar</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ email: '', full_name: '', role: 'reception', password: '' }) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={16} /> Qo'shish
        </button>
      </div>

      {msg && <p className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">{msg}</p>}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="font-bold text-lg">{editId ? 'Tahrirlash' : 'Yangi foydalanuvchi'}</h2>
            {!editId && (
              <>
                <input className="input" type="email" placeholder="Email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
                <input className="input" type="password" placeholder="Parol" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required />
              </>
            )}
            <input className="input" placeholder="F.I.Sh." value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })} required />
            <select className="input" value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="reception">Resepshn</option>
              <option value="superadmin">Superadmin</option>
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
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Rol</th>
              <th className="text-left px-4 py-3">Holat</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.full_name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role === 'superadmin' ? 'Superadmin' : 'Resepshn'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(u)}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.is_active ? 'Faol' : 'Nofaol'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => { setForm({ email: u.email, full_name: u.full_name, role: u.role, password: '' }); setEditId(u.id); setShowForm(true) }}
                    className="text-blue-500 hover:text-blue-700"><Pencil size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { getUsers, updateUser, toggleUserActive } from '@/app/actions/crud'
import { User } from '@/lib/types'
import { Plus, Pencil, Shield } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [form, setForm] = useState({ email: '', full_name: '', role: 'reception', password: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() { setUsers(await getUsers()) }
  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    if (editId) {
      await updateUser(editId, { full_name: form.full_name, role: form.role })
      setMsg('Saqlandi!')
    } else {
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

  async function handleToggle(u: User) {
    await toggleUserActive(u.id, !u.is_active)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Foydalanuvchilar</h1>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ email: '', full_name: '', role: 'reception', password: '' }) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
          <Plus size={18} /> Qo&apos;shish
        </button>
      </div>

      {msg && (
        <div className={`text-sm px-4 py-3 rounded-xl border ${msg.startsWith('Xato') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>{msg}</div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="font-bold text-xl text-gray-800">{editId ? 'Tahrirlash' : 'Yangi foydalanuvchi'}</h2>
            <div className="space-y-3">
              {!editId && (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Email *</label>
                    <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" type="email" placeholder="email@example.com" value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Parol *</label>
                    <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" type="password" placeholder="Kamida 6 belgi" value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })} required />
                  </div>
                </>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">F.I.Sh. *</label>
                <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" placeholder="To'liq ism" value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Rol</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="reception">Resepshn</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-md">Saqlash</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-all">Bekor</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">F.I.Sh.</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Holat</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-blue-50/30 transition-all">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${u.role === 'superadmin' ? 'bg-gradient-to-br from-purple-400 to-purple-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'}`}>
                      {u.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{u.full_name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">{u.email}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${u.role === 'superadmin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                    <Shield size={12} />
                    {u.role === 'superadmin' ? 'Superadmin' : 'Resepshn'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => handleToggle(u)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${u.is_active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                    {u.is_active ? 'Faol' : 'Nofaol'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => { setForm({ email: u.email, full_name: u.full_name, role: u.role, password: '' }); setEditId(u.id); setShowForm(true) }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Tahrirlash">
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

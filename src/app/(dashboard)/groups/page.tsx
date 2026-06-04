'use client'
import { useEffect, useState } from 'react'
import { getGroups, getActiveSubjects, getActiveTeachers, upsertGroup, toggleGroupActive } from '@/app/actions/crud'
import { Group, Subject, Teacher } from '@/lib/types'
import { Plus, Pencil, Users } from 'lucide-react'

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [form, setForm] = useState({ name: '', subject_id: '', teacher_id: '', schedule: '', capacity: '20' })
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    const [g, s, t] = await Promise.all([getGroups(), getActiveSubjects(), getActiveTeachers()])
    setGroups(g); setSubjects(s); setTeachers(t)
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await upsertGroup({
      name: form.name, subject_id: form.subject_id,
      teacher_id: form.teacher_id || null, schedule: form.schedule,
      capacity: Number(form.capacity)
    }, editId || undefined)
    setForm({ name: '', subject_id: '', teacher_id: '', schedule: '', capacity: '20' })
    setEditId(null); setShowForm(false); load()
  }

  function startEdit(g: Group) {
    setForm({ name: g.name, subject_id: g.subject_id, teacher_id: g.teacher_id || '', schedule: g.schedule || '', capacity: String(g.capacity) })
    setEditId(g.id); setShowForm(true)
  }

  async function handleToggle(g: Group) {
    await toggleGroupActive(g.id, !g.is_active)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl">
            <Users size={22} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Guruhlar</h1>
            <p className="text-sm text-gray-500">{groups.length} ta guruh</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', subject_id: '', teacher_id: '', schedule: '', capacity: '20' }) }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
          <Plus size={18} /> Guruh qo&apos;shish
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl space-y-5 animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="font-bold text-xl text-gray-900">{editId ? 'Guruhni tahrirlash' : 'Yangi guruh'}</h2>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Guruh nomi</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow" placeholder="Masalan: A1, B2" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Fan</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow" value={form.subject_id}
                onChange={e => setForm({ ...form, subject_id: e.target.value })} required>
                <option value="">Fan tanlang</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">O&apos;qituvchi</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow" value={form.teacher_id}
                onChange={e => setForm({ ...form, teacher_id: e.target.value })}>
                <option value="">O&apos;qituvchi tanlang</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Dars vaqti</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow" placeholder="Du,Cho,Ju 10:00-12:00" value={form.schedule}
                onChange={e => setForm({ ...form, schedule: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Sig&apos;im</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow" type="number" placeholder="20" value={form.capacity}
                onChange={e => setForm({ ...form, capacity: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors">Saqlash</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">Bekor</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {groups.map(g => {
          const enrolled = (g.enrollments as any)?.[0]?.count || 0
          const percent = g.capacity > 0 ? Math.min((enrolled / g.capacity) * 100, 100) : 0
          return (
            <div key={g.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{g.name}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium mt-1">
                    {(g.subjects as any)?.name}
                  </span>
                </div>
                <button onClick={() => handleToggle(g)}
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${g.is_active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${g.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  {g.is_active ? 'Faol' : 'Nofaol'}
                </button>
              </div>
              <div className="space-y-2.5 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">O&apos;qituvchi:</span>
                  <span className="font-medium text-gray-800">{(g.teachers as any)?.full_name || 'Belgilanmagan'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Dars vaqti:</span>
                  <span className="font-medium text-gray-800">{g.schedule || 'Belgilanmagan'}</span>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-500 flex items-center gap-1"><Users size={12} /> O&apos;quvchilar</span>
                  <span className="font-semibold text-gray-700">{enrolled} / {g.capacity}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${percent >= 90 ? 'bg-red-500' : percent >= 70 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                    style={{ width: `${percent}%` }} />
                </div>
              </div>
              <button onClick={() => startEdit(g)} className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
                <Pencil size={14} /> Tahrirlash
              </button>
            </div>
          )
        })}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Users size={48} className="mx-auto mb-3 opacity-50" />
          <p>Hali guruhlar yo&apos;q</p>
        </div>
      )}
    </div>
  )
}

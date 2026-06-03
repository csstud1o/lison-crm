'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Group, Subject, Teacher } from '@/lib/types'
import { Plus, Pencil, Users } from 'lucide-react'

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [form, setForm] = useState({ name: '', subject_id: '', teacher_id: '', schedule: '', capacity: '20' })
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  async function load() {
    const [g, s, t] = await Promise.all([
      supabase.from('groups').select('*, subjects(name), teachers(full_name), enrollments(count)').order('created_at'),
      supabase.from('subjects').select('*').eq('is_active', true),
      supabase.from('teachers').select('*').eq('is_active', true)
    ])
    setGroups(g.data || [])
    setSubjects(s.data || [])
    setTeachers(t.data || [])
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      name: form.name, subject_id: form.subject_id,
      teacher_id: form.teacher_id || null, schedule: form.schedule,
      capacity: Number(form.capacity)
    }
    if (editId) await supabase.from('groups').update(payload).eq('id', editId)
    else await supabase.from('groups').insert(payload)
    setForm({ name: '', subject_id: '', teacher_id: '', schedule: '', capacity: '20' })
    setEditId(null); setShowForm(false); load()
  }

  function startEdit(g: Group) {
    setForm({ name: g.name, subject_id: g.subject_id, teacher_id: g.teacher_id || '', schedule: g.schedule || '', capacity: String(g.capacity) })
    setEditId(g.id); setShowForm(true)
  }

  async function toggleActive(g: Group) {
    await supabase.from('groups').update({ is_active: !g.is_active }).eq('id', g.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Guruhlar</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', subject_id: '', teacher_id: '', schedule: '', capacity: '20' }) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={16} /> Guruh qo'shish
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="font-bold text-lg">{editId ? 'Tahrirlash' : 'Yangi guruh'}</h2>
            <input className="input" placeholder="Guruh nomi (e.g. A1, B2)" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
            <select className="input" value={form.subject_id}
              onChange={e => setForm({ ...form, subject_id: e.target.value })} required>
              <option value="">Fan tanlang</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select className="input" value={form.teacher_id}
              onChange={e => setForm({ ...form, teacher_id: e.target.value })}>
              <option value="">O'qituvchi tanlang</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
            <input className="input" placeholder="Dars vaqti (e.g. Du,Cho,Ju 10:00-12:00)" value={form.schedule}
              onChange={e => setForm({ ...form, schedule: e.target.value })} />
            <input className="input" type="number" placeholder="Sig'im" value={form.capacity}
              onChange={e => setForm({ ...form, capacity: e.target.value })} />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Saqlash</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-2 rounded-lg">Bekor</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map(g => (
          <div key={g.id} className="bg-white rounded-2xl shadow p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{g.name}</h3>
                <p className="text-blue-600 text-sm">{(g.subjects as any)?.name}</p>
              </div>
              <button onClick={() => toggleActive(g)}
                className={`px-2 py-1 rounded-full text-xs font-medium ${g.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {g.is_active ? 'Faol' : 'Nofaol'}
              </button>
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p>👨‍🏫 {(g.teachers as any)?.full_name || 'Belgilanmagan'}</p>
              <p>🕐 {g.schedule || 'Belgilanmagan'}</p>
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{(g.enrollments as any)?.[0]?.count || 0} / {g.capacity} o'quvchi</span>
              </div>
            </div>
            <button onClick={() => startEdit(g)} className="mt-4 flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm">
              <Pencil size={13} /> Tahrirlash
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

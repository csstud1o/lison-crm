'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Student, Group, Subject } from '@/lib/types'
import { Plus, Pencil, UserPlus, Eye } from 'lucide-react'

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showEnroll, setShowEnroll] = useState<Student | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('')
  const [enrollments, setEnrollments] = useState<any[]>([])

  const [form, setForm] = useState({
    full_name: '', phone: '', parent_phone: '', birth_date: '', address: '',
    group_id: ''
  })
  const supabase = createClient()

  async function load() {
    const [s, g, sub] = await Promise.all([
      supabase.from('students').select('*').order('created_at', { ascending: false }),
      supabase.from('groups').select('*, subjects(name)').eq('is_active', true),
      supabase.from('subjects').select('*').eq('is_active', true)
    ])
    setStudents(s.data || [])
    setGroups(g.data || [])
    setSubjects(sub.data || [])
  }

  async function loadEnrollments(studentId: string) {
    const { data } = await supabase
      .from('enrollments')
      .select('*, groups(name, subjects(name))')
      .eq('student_id', studentId)
      .eq('is_active', true)
    setEnrollments(data || [])
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      full_name: form.full_name, phone: form.phone || null,
      parent_phone: form.parent_phone || null,
      birth_date: form.birth_date || null, address: form.address || null
    }
    let studentId = editId
    if (editId) {
      await supabase.from('students').update(payload).eq('id', editId)
    } else {
      const { data } = await supabase.from('students').insert(payload).select().single()
      studentId = data?.id
    }
    // Enroll to group if selected
    if (!editId && form.group_id && studentId) {
      await supabase.from('enrollments').upsert({ student_id: studentId, group_id: form.group_id, is_active: true })
    }
    setForm({ full_name: '', phone: '', parent_phone: '', birth_date: '', address: '', group_id: '' })
    setEditId(null); setShowForm(false); load()
  }

  async function handleEnroll(student: Student) {
    if (!selectedGroupId) return
    await supabase.from('enrollments').upsert({ student_id: student.id, group_id: selectedGroupId, is_active: true })
    await loadEnrollments(student.id)
    setSelectedGroupId('')
  }

  async function removeEnrollment(enrollId: string, studentId: string) {
    await supabase.from('enrollments').update({ is_active: false, left_at: new Date().toISOString() }).eq('id', enrollId)
    await loadEnrollments(studentId)
  }

  function startEdit(s: Student) {
    setForm({ full_name: s.full_name, phone: s.phone || '', parent_phone: s.parent_phone || '', birth_date: s.birth_date || '', address: s.address || '', group_id: '' })
    setEditId(s.id); setShowForm(true)
  }

  const filteredStudents = students.filter(s => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone || '').includes(search)
    return matchSearch
  })

  const filteredGroups = selectedSubjectFilter
    ? groups.filter(g => g.subject_id === selectedSubjectFilter)
    : groups

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">O'quvchilar</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ full_name: '', phone: '', parent_phone: '', birth_date: '', address: '', group_id: '' }) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <UserPlus size={16} /> Yangi o'quvchi
        </button>
      </div>

      <input
        placeholder="Ism yoki telefon bo'yicha qidirish..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-lg">{editId ? 'O\'quvchini tahrirlash' : 'Yangi o\'quvchi ro\'yxatga olish'}</h2>
            <input className="input" placeholder="F.I.Sh. *" value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })} required />
            <input className="input" placeholder="Telefon raqami" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} />
            <input className="input" placeholder="Ota-ona telefoni" value={form.parent_phone}
              onChange={e => setForm({ ...form, parent_phone: e.target.value })} />
            <div>
              <label className="text-xs text-gray-500">Tug'ilgan sana</label>
              <input className="input" type="date" value={form.birth_date}
                onChange={e => setForm({ ...form, birth_date: e.target.value })} />
            </div>
            <input className="input" placeholder="Manzil" value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })} />
            {!editId && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Guruhga biriktirish (ixtiyoriy)</p>
                <select className="input mb-2" value={selectedSubjectFilter}
                  onChange={e => setSelectedSubjectFilter(e.target.value)}>
                  <option value="">Barcha fanlar</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select className="input" value={form.group_id}
                  onChange={e => setForm({ ...form, group_id: e.target.value })}>
                  <option value="">Guruh tanlang</option>
                  {filteredGroups.map(g => <option key={g.id} value={g.id}>{g.name} - {(g.subjects as any)?.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Saqlash</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-2 rounded-lg">Bekor</button>
            </div>
          </form>
        </div>
      )}

      {/* Enroll Modal */}
      {showEnroll && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="font-bold text-lg">{showEnroll.full_name} - Guruhlar</h2>
            <div className="space-y-2">
              {enrollments.map(e => (
                <div key={e.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm">{e.groups?.name} - {e.groups?.subjects?.name}</span>
                  <button onClick={() => removeEnrollment(e.id, showEnroll.id)}
                    className="text-red-500 text-xs hover:text-red-700">Chiqarish</button>
                </div>
              ))}
              {enrollments.length === 0 && <p className="text-sm text-gray-400">Guruhlar yo'q</p>}
            </div>
            <div className="border-t pt-3 space-y-2">
              <p className="text-sm font-medium">Guruhga qo'shish:</p>
              <select className="input" value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)}>
                <option value="">Guruh tanlang</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name} - {(g.subjects as any)?.name}</option>)}
              </select>
              <button onClick={() => handleEnroll(showEnroll)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg">Qo'shish</button>
            </div>
            <button onClick={() => setShowEnroll(null)} className="w-full border py-2 rounded-lg">Yopish</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">F.I.Sh.</th>
              <th className="text-left px-4 py-3">Telefon</th>
              <th className="text-left px-4 py-3">Ota-ona tel.</th>
              <th className="text-left px-4 py-3">Sana</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(s => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{s.full_name}</td>
                <td className="px-4 py-3">{s.phone || '-'}</td>
                <td className="px-4 py-3">{s.parent_phone || '-'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(s.created_at).toLocaleDateString('uz-UZ')}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => { setShowEnroll(s); loadEnrollments(s.id) }}
                    className="text-green-500 hover:text-green-700" title="Guruhlar">
                    <Eye size={15} />
                  </button>
                  <button onClick={() => startEdit(s)} className="text-blue-500 hover:text-blue-700">
                    <Pencil size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <p className="text-center text-gray-400 py-8">O'quvchilar topilmadi</p>
        )}
      </div>
    </div>
  )
}

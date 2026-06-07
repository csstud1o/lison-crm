'use client'
import { useEffect, useState } from 'react'
import { getStudents, getActiveGroups, getActiveSubjects, upsertStudent, enrollStudent, getStudentEnrollments, removeEnrollment, deleteStudent } from '@/app/actions/crud'
import { Student, Group, Subject } from '@/lib/types'
import { Plus, Pencil, UserPlus, Eye, Search, Trash2 } from 'lucide-react'

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
  const [form, setForm] = useState({ full_name: '', phone: '', parent_phone: '', birth_date: '', address: '', group_id: '' })

  async function load() {
    const [s, g, sub] = await Promise.all([getStudents(), getActiveGroups(), getActiveSubjects()])
    setStudents(s); setGroups(g); setSubjects(sub)
  }

  async function loadEnrolls(studentId: string) {
    setEnrollments(await getStudentEnrollments(studentId))
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { full_name: form.full_name, phone: form.phone || null, parent_phone: form.parent_phone || null, birth_date: form.birth_date || null, address: form.address || null }
    const studentId = await upsertStudent(payload, editId || undefined)
    if (!editId && form.group_id && studentId) {
      await enrollStudent(studentId, form.group_id)
    }
    setForm({ full_name: '', phone: '', parent_phone: '', birth_date: '', address: '', group_id: '' })
    setEditId(null); setShowForm(false); load()
  }

  async function handleEnroll(student: Student) {
    if (!selectedGroupId) return
    const { error } = await enrollStudent(student.id, selectedGroupId) as any
    if (error) { alert('Xato: ' + error.message); return }
    await loadEnrolls(student.id)
    setSelectedGroupId('')
    load()
  }

  async function handleRemoveEnrollment(enrollId: string, studentId: string) {
    await removeEnrollment(enrollId)
    await loadEnrolls(studentId)
  }

  function startEdit(s: Student) {
    setForm({ full_name: s.full_name, phone: s.phone || '', parent_phone: s.parent_phone || '', birth_date: s.birth_date || '', address: s.address || '', group_id: '' })
    setEditId(s.id); setShowForm(true)
  }

  async function handleDelete(s: Student) {
    if (!confirm(`"${s.full_name}"ni o'chirishni tasdiqlaysizmi?`)) return
    await deleteStudent(s.id)
    load()
  }

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) || (s.phone || '').includes(search)
  )
  const filteredGroups = selectedSubjectFilter ? groups.filter(g => g.subject_id === selectedSubjectFilter) : groups

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">O&apos;quvchilar</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ full_name: '', phone: '', parent_phone: '', birth_date: '', address: '', group_id: '' }) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
          <UserPlus size={18} /> Yangi o&apos;quvchi
        </button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input placeholder="Ism yoki telefon bo'yicha qidirish..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white shadow-sm transition-all" />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <h2 className="font-bold text-xl text-gray-800">{editId ? 'O\'quvchini tahrirlash' : 'Yangi o\'quvchi ro\'yxatga olish'}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">F.I.Sh. *</label>
                <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" placeholder="To'liq ism" value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Telefon</label>
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" placeholder="+998..." value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Ota-ona telefoni</label>
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" placeholder="+998..." value={form.parent_phone}
                    onChange={e => setForm({ ...form, parent_phone: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Tug&apos;ilgan sana</label>
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" type="date" value={form.birth_date}
                    onChange={e => setForm({ ...form, birth_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Manzil</label>
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" placeholder="Manzil" value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>
              {!editId && (
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Guruhga biriktirish (ixtiyoriy)</p>
                  <div className="space-y-2">
                    <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" value={selectedSubjectFilter}
                      onChange={e => setSelectedSubjectFilter(e.target.value)}>
                      <option value="">Barcha fanlar</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" value={form.group_id}
                      onChange={e => setForm({ ...form, group_id: e.target.value })}>
                      <option value="">Guruh tanlang</option>
                      {filteredGroups.map(g => <option key={g.id} value={g.id}>{g.name} - {(g.subjects as any)?.name}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-md">Saqlash</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-all">Bekor</button>
            </div>
          </form>
        </div>
      )}

      {showEnroll && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserPlus size={18} className="text-blue-600" />
              </div>
              <h2 className="font-bold text-lg text-gray-800">{showEnroll.full_name}</h2>
            </div>
            <div className="space-y-2">
              {enrollments.map(e => (
                <div key={e.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <span className="text-sm font-medium text-gray-700">{e.groups?.name} - {e.groups?.subjects?.name}</span>
                  <button onClick={() => handleRemoveEnrollment(e.id, showEnroll!.id)}
                    className="text-red-500 text-xs font-medium hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-all">Chiqarish</button>
                </div>
              ))}
              {enrollments.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Guruhlar yo&apos;q</p>}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">Guruhga qo&apos;shish:</p>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)}>
                <option value="">Guruh tanlang</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name} - {(g.subjects as any)?.name}</option>)}
              </select>
              <button onClick={() => handleEnroll(showEnroll)}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-md">Qo&apos;shish</button>
            </div>
            <button onClick={() => setShowEnroll(null)} className="w-full border border-gray-200 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-all">Yopish</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">O&apos;quvchi</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Telefon</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ota-ona tel.</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sana</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredStudents.map(s => (
              <tr key={s.id} className="hover:bg-blue-50/30 transition-all">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {s.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{s.full_name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">{s.phone || '-'}</td>
                <td className="px-5 py-4 text-gray-600">{s.parent_phone || '-'}</td>
                <td className="px-5 py-4 text-gray-400 text-xs">{new Date(s.created_at).toLocaleDateString('uz-UZ')}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-1">
                    <button onClick={() => { setShowEnroll(s); loadEnrolls(s.id) }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Guruhlar">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => startEdit(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Tahrirlash">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(s)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="O'chirish">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <p className="text-center text-gray-400 py-12">O&apos;quvchilar topilmadi</p>
        )}
      </div>
    </div>
  )
}

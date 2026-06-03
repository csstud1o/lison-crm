'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search } from 'lucide-react'

const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
const METHODS = ['cash', 'card', 'transfer']
const METHOD_LABELS: Record<string, string> = { cash: 'Naqd', card: 'Karta', transfer: 'O\'tkazma' }

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())
  const [studentEnrollments, setStudentEnrollments] = useState<any[]>([])

  const now = new Date()
  const [form, setForm] = useState({
    student_id: '', group_id: '', amount: '',
    payment_date: now.toISOString().split('T')[0],
    month: now.getMonth() + 1, year: now.getFullYear(),
    payment_method: 'cash', note: ''
  })
  const supabase = createClient()

  async function load() {
    const { data } = await supabase
      .from('payments')
      .select('*, students(full_name, phone), groups(name, subjects(name))')
      .eq('month', filterMonth).eq('year', filterYear)
      .order('created_at', { ascending: false })
    setPayments(data || [])
    const [s, g] = await Promise.all([
      supabase.from('students').select('id, full_name, phone').order('full_name'),
      supabase.from('groups').select('id, name, subject_id, subjects(name), monthly_fee:subjects(monthly_fee)').eq('is_active', true)
    ])
    setStudents(s.data || [])
    setGroups(g.data || [])
  }

  useEffect(() => { load() }, [filterMonth, filterYear])

  async function loadStudentEnrollments(studentId: string) {
    const { data } = await supabase
      .from('enrollments')
      .select('group_id, groups(id, name, subjects(name, monthly_fee))')
      .eq('student_id', studentId)
      .eq('is_active', true)
    setStudentEnrollments(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('payments').insert({
      student_id: form.student_id, group_id: form.group_id,
      amount: Number(form.amount), payment_date: form.payment_date,
      month: form.month, year: form.year,
      payment_method: form.payment_method, note: form.note || null
    })
    setShowForm(false)
    setForm({ student_id: '', group_id: '', amount: '', payment_date: now.toISOString().split('T')[0], month: now.getMonth() + 1, year: now.getFullYear(), payment_method: 'cash', note: '' })
    setStudentEnrollments([])
    load()
  }

  const filtered = payments.filter(p =>
    p.students?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.students?.phone?.includes(search)
  )
  const total = filtered.reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">To'lovlar</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={16} /> To'lov qabul qilish
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input placeholder="Qidirish..." value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-9 w-full" />
        </div>
        <select className="input" value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select className="input" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 mb-4 flex justify-between items-center">
        <span className="text-blue-700 font-medium">{MONTHS[filterMonth - 1]} {filterYear} - jami to'lovlar:</span>
        <span className="text-blue-800 font-bold text-lg">{total.toLocaleString()} so'm</span>
      </div>

      {/* Add Payment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="font-bold text-lg">To'lov qabul qilish</h2>
            <select className="input" value={form.student_id}
              onChange={e => { setForm({ ...form, student_id: e.target.value, group_id: '', amount: '' }); if (e.target.value) loadStudentEnrollments(e.target.value) }} required>
              <option value="">O'quvchi tanlang</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.full_name} {s.phone ? `(${s.phone})` : ''}</option>)}
            </select>
            {studentEnrollments.length > 0 && (
              <select className="input" value={form.group_id}
                onChange={e => {
                  const g = studentEnrollments.find(en => en.group_id === e.target.value)
                  const fee = g?.groups?.subjects?.monthly_fee || ''
                  setForm({ ...form, group_id: e.target.value, amount: String(fee) })
                }} required>
                <option value="">Guruh tanlang</option>
                {studentEnrollments.map(e => (
                  <option key={e.group_id} value={e.group_id}>
                    {e.groups?.name} - {e.groups?.subjects?.name} ({Number(e.groups?.subjects?.monthly_fee || 0).toLocaleString()} so'm)
                  </option>
                ))}
              </select>
            )}
            {form.student_id && studentEnrollments.length === 0 && (
              <p className="text-sm text-orange-500">Bu o'quvchi hech qanday guruhda emas</p>
            )}
            <input className="input" type="number" placeholder="Summa (so'm)" value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={form.month} onChange={e => setForm({ ...form, month: Number(e.target.value) })}>
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <select className="input" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })}>
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <select className="input" value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })}>
              {METHODS.map(m => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
            </select>
            <input className="input" type="date" value={form.payment_date}
              onChange={e => setForm({ ...form, payment_date: e.target.value })} />
            <input className="input" placeholder="Izoh (ixtiyoriy)" value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })} />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Saqlash</button>
              <button type="button" onClick={() => { setShowForm(false); setStudentEnrollments([]) }} className="flex-1 border py-2 rounded-lg">Bekor</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">O'quvchi</th>
              <th className="text-left px-4 py-3">Guruh</th>
              <th className="text-left px-4 py-3">Summa</th>
              <th className="text-left px-4 py-3">Oy</th>
              <th className="text-left px-4 py-3">Usul</th>
              <th className="text-left px-4 py-3">Sana</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.students?.full_name}</td>
                <td className="px-4 py-3">{p.groups?.name} - {p.groups?.subjects?.name}</td>
                <td className="px-4 py-3 text-green-700 font-medium">{Number(p.amount).toLocaleString()} so'm</td>
                <td className="px-4 py-3">{MONTHS[p.month - 1]} {p.year}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{METHOD_LABELS[p.payment_method] || p.payment_method}</span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.payment_date).toLocaleDateString('uz-UZ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-8">To'lovlar topilmadi</p>}
      </div>
    </div>
  )
}

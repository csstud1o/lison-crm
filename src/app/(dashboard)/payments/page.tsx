'use client'
import { useEffect, useState } from 'react'
import { getPayments, getAllStudents, getStudentActiveEnrollments, createPayment } from '@/app/actions/crud'
import { Plus, Search, CreditCard } from 'lucide-react'

const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
const METHODS = ['cash', 'card', 'transfer']
const METHOD_LABELS: Record<string, string> = { cash: 'Naqd', card: 'Karta', transfer: 'O\'tkazma' }

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
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

  async function load() {
    const [p, s] = await Promise.all([getPayments(filterMonth, filterYear), getAllStudents()])
    setPayments(p); setStudents(s)
  }

  useEffect(() => { load() }, [filterMonth, filterYear])

  async function loadStudentEnrolls(studentId: string) {
    setStudentEnrollments(await getStudentActiveEnrollments(studentId))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await createPayment({
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
    p.students?.full_name?.toLowerCase().includes(search.toLowerCase()) || p.students?.phone?.includes(search)
  )
  const total = filtered.reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">To&apos;lovlar</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
          <Plus size={18} /> To&apos;lov qabul qilish
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Qidirish..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white shadow-sm transition-all" />
        </div>
        <select className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm transition-all" value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm transition-all" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl px-6 py-5 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <CreditCard size={20} className="text-white" />
          </div>
          <span className="text-blue-100 font-medium">{MONTHS[filterMonth - 1]} {filterYear} — jami to&apos;lovlar</span>
        </div>
        <span className="text-white font-bold text-xl">{total.toLocaleString()} so&apos;m</span>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="font-bold text-xl text-gray-800">To&apos;lov qabul qilish</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">O&apos;quvchi *</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" value={form.student_id}
                  onChange={e => { setForm({ ...form, student_id: e.target.value, group_id: '', amount: '' }); if (e.target.value) loadStudentEnrolls(e.target.value) }} required>
                  <option value="">O&apos;quvchi tanlang</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name} {s.phone ? `(${s.phone})` : ''}</option>)}
                </select>
              </div>
              {studentEnrollments.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Guruh *</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" value={form.group_id}
                    onChange={e => {
                      const g = studentEnrollments.find(en => en.group_id === e.target.value)
                      const fee = g?.groups?.subjects?.monthly_fee || ''
                      setForm({ ...form, group_id: e.target.value, amount: String(fee) })
                    }} required>
                    <option value="">Guruh tanlang</option>
                    {studentEnrollments.map(e => (
                      <option key={e.group_id} value={e.group_id}>
                        {e.groups?.name} - {e.groups?.subjects?.name} ({Number(e.groups?.subjects?.monthly_fee || 0).toLocaleString()} so&apos;m)
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {form.student_id && studentEnrollments.length === 0 && (
                <p className="text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">Bu o&apos;quvchi hech qanday guruhda emas</p>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Summa *</label>
                <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" type="number" placeholder="0" value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Oy</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" value={form.month} onChange={e => setForm({ ...form, month: Number(e.target.value) })}>
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Yil</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })}>
                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">To&apos;lov usuli</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })}>
                  {METHODS.map(m => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Sana</label>
                <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" type="date" value={form.payment_date}
                  onChange={e => setForm({ ...form, payment_date: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Izoh</label>
                <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" placeholder="Ixtiyoriy..." value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-md">Saqlash</button>
              <button type="button" onClick={() => { setShowForm(false); setStudentEnrollments([]) }} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-all">Bekor</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">O&apos;quvchi</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Guruh</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Summa</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Oy</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usul</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sana</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-blue-50/30 transition-all">
                <td className="px-5 py-4 font-medium text-gray-800">{p.students?.full_name}</td>
                <td className="px-5 py-4 text-gray-600">{p.groups?.name} - {p.groups?.subjects?.name}</td>
                <td className="px-5 py-4 text-green-700 font-semibold">{Number(p.amount).toLocaleString()} so&apos;m</td>
                <td className="px-5 py-4 text-gray-600">{MONTHS[p.month - 1]} {p.year}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    p.payment_method === 'cash' ? 'bg-green-50 text-green-700' :
                    p.payment_method === 'card' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                  }`}>{METHOD_LABELS[p.payment_method] || p.payment_method}</span>
                </td>
                <td className="px-5 py-4 text-gray-400 text-xs">{new Date(p.payment_date).toLocaleDateString('uz-UZ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-12">To&apos;lovlar topilmadi</p>}
      </div>
    </div>
  )
}

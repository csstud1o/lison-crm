'use client'
import { useEffect, useState } from 'react'
import { getActiveGroupsList, getGroupStudentsWithAttendance, saveAttendanceRecords } from '@/app/actions/crud'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

const STATUS_CONFIG = {
  present: { label: 'Keldi', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  absent: { label: 'Kelmadi', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  late: { label: 'Kech', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
}

export default function AttendancePage() {
  const [groups, setGroups] = useState<any[]>([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => { getActiveGroupsList().then(setGroups) }, [])

  useEffect(() => {
    if (!selectedGroup) return
    loadData()
  }, [selectedGroup, selectedDate])

  async function loadData() {
    const { students: enrolls, attendance: existing } = await getGroupStudentsWithAttendance(selectedGroup, selectedDate)
    setStudents(enrolls)
    const map: Record<string, string> = {}
    enrolls.forEach((e: any) => { map[e.student_id] = 'present' })
    existing.forEach((a: any) => { map[a.student_id] = a.status })
    setAttendance(map)
    setSaved(false)
  }

  async function handleSave() {
    const records = students.map(e => ({
      student_id: e.student_id,
      group_id: selectedGroup,
      date: selectedDate,
      status: attendance[e.student_id] || 'present'
    }))
    await saveAttendanceRecords(records)
    setSaved(true)
  }

  const counts = {
    present: students.filter(e => attendance[e.student_id] === 'present').length,
    absent: students.filter(e => attendance[e.student_id] === 'absent').length,
    late: students.filter(e => attendance[e.student_id] === 'late').length,
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Davomat</h1>

      <div className="flex flex-wrap gap-3">
        <select className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm transition-all min-w-[220px]" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
          <option value="">Guruh tanlang</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name} - {g.subjects?.name}</option>)}
        </select>
        <input type="date" className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm transition-all" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
      </div>

      {selectedGroup && students.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <div key={key} className={`flex items-center gap-3 px-5 py-4 rounded-xl ${cfg.bg} border ${cfg.border}`}>
                <cfg.icon size={22} className={cfg.color} />
                <div>
                  <p className={`text-2xl font-bold ${cfg.color}`}>{counts[key as keyof typeof counts]}</p>
                  <p className="text-xs text-gray-500 font-medium">{cfg.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">O&apos;quvchi</th>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <th key={key} className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${cfg.color}`}>
                        <cfg.icon size={14} /> {cfg.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map(e => (
                  <tr key={e.student_id} className="hover:bg-blue-50/30 transition-all">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {e.students?.full_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{e.students?.full_name}</span>
                      </div>
                    </td>
                    {Object.keys(STATUS_CONFIG).map(status => (
                      <td key={status} className="px-5 py-4 text-center">
                        <input type="radio" name={`status-${e.student_id}`} value={status}
                          checked={attendance[e.student_id] === status}
                          onChange={() => { setAttendance({ ...attendance, [e.student_id]: status }); setSaved(false) }}
                          className="w-4 h-4 cursor-pointer accent-blue-600" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={handleSave}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all shadow-md ${saved ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {saved ? '✓ Saqlandi' : 'Davomatni saqlash'}
          </button>
        </>
      )}

      {selectedGroup && students.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          Bu guruhda o&apos;quvchilar yo&apos;q
        </div>
      )}
    </div>
  )
}

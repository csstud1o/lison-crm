'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

const STATUS_CONFIG = {
  present: { label: 'Keldi', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  absent: { label: 'Kelmadi', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  late: { label: 'Kech', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
}

export default function AttendancePage() {
  const [groups, setGroups] = useState<any[]>([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('groups').select('*, subjects(name)').eq('is_active', true).then(({ data }) => setGroups(data || []))
  }, [])

  useEffect(() => {
    if (!selectedGroup) return
    loadGroupStudents()
  }, [selectedGroup, selectedDate])

  async function loadGroupStudents() {
    const { data: enrolls } = await supabase
      .from('enrollments')
      .select('student_id, students(id, full_name)')
      .eq('group_id', selectedGroup)
      .eq('is_active', true)

    const { data: existing } = await supabase
      .from('attendance')
      .select('student_id, status')
      .eq('group_id', selectedGroup)
      .eq('date', selectedDate)

    setStudents(enrolls || [])
    const map: Record<string, string> = {}
    enrolls?.forEach(e => { map[e.student_id] = 'present' })
    existing?.forEach(a => { map[a.student_id] = a.status })
    setAttendance(map)
    setSaved(false)
  }

  async function saveAttendance() {
    const records = students.map(e => ({
      student_id: e.student_id,
      group_id: selectedGroup,
      date: selectedDate,
      status: attendance[e.student_id] || 'present'
    }))
    await supabase.from('attendance').upsert(records, { onConflict: 'student_id,group_id,date' })
    setSaved(true)
  }

  const counts = {
    present: students.filter(e => attendance[e.student_id] === 'present').length,
    absent: students.filter(e => attendance[e.student_id] === 'absent').length,
    late: students.filter(e => attendance[e.student_id] === 'late').length,
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Davomat</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <select className="input" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
          <option value="">Guruh tanlang</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name} - {g.subjects?.name}</option>)}
        </select>
        <input type="date" className="input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
      </div>

      {selectedGroup && students.length > 0 && (
        <>
          {/* Summary */}
          <div className="flex gap-4 mb-4">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <div key={key} className={`flex items-center gap-2 px-4 py-2 rounded-xl ${cfg.bg}`}>
                <cfg.icon size={16} className={cfg.color} />
                <span className={`font-bold ${cfg.color}`}>{counts[key as keyof typeof counts]}</span>
                <span className="text-sm text-gray-600">{cfg.label}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">O'quvchi</th>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <th key={key} className="px-4 py-3">
                      <span className={`flex items-center justify-center gap-1 ${cfg.color}`}>
                        <cfg.icon size={14} /> {cfg.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(e => (
                  <tr key={e.student_id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{e.students?.full_name}</td>
                    {Object.keys(STATUS_CONFIG).map(status => (
                      <td key={status} className="px-4 py-3 text-center">
                        <input
                          type="radio"
                          name={`status-${e.student_id}`}
                          value={status}
                          checked={attendance[e.student_id] === status}
                          onChange={() => setAttendance({ ...attendance, [e.student_id]: status })}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={saveAttendance}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            {saved ? '✓ Saqlandi' : 'Davomatni saqlash'}
          </button>
        </>
      )}

      {selectedGroup && students.length === 0 && (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
          Bu guruhda o'quvchilar yo'q
        </div>
      )}
    </div>
  )
}

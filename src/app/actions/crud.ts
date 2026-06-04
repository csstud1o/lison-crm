'use server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// === SUBJECTS ===
export async function getSubjects() {
  const { data } = await supabase.from('subjects').select('*').order('created_at')
  return data || []
}
export async function upsertSubject(payload: { name: string; description: string; monthly_fee: number }, id?: string) {
  if (id) return supabase.from('subjects').update(payload).eq('id', id)
  return supabase.from('subjects').insert(payload)
}
export async function toggleSubjectActive(id: string, is_active: boolean) {
  return supabase.from('subjects').update({ is_active }).eq('id', id)
}

// === TEACHERS ===
export async function getTeachers() {
  const { data } = await supabase.from('teachers').select('*, subjects(name)').order('created_at')
  return data || []
}
export async function getActiveSubjects() {
  const { data } = await supabase.from('subjects').select('*').eq('is_active', true)
  return data || []
}
export async function upsertTeacher(payload: { full_name: string; phone: string | null; subject_id: string | null }, id?: string) {
  if (id) return supabase.from('teachers').update(payload).eq('id', id)
  return supabase.from('teachers').insert(payload)
}
export async function toggleTeacherActive(id: string, is_active: boolean) {
  return supabase.from('teachers').update({ is_active }).eq('id', id)
}

// === GROUPS ===
export async function getGroups() {
  const { data } = await supabase.from('groups').select('*, subjects(name), teachers(full_name), enrollments(count)').order('created_at')
  return data || []
}
export async function getActiveTeachers() {
  const { data } = await supabase.from('teachers').select('*').eq('is_active', true)
  return data || []
}
export async function upsertGroup(payload: { name: string; subject_id: string; teacher_id: string | null; schedule: string; capacity: number }, id?: string) {
  if (id) return supabase.from('groups').update(payload).eq('id', id)
  return supabase.from('groups').insert(payload)
}
export async function toggleGroupActive(id: string, is_active: boolean) {
  return supabase.from('groups').update({ is_active }).eq('id', id)
}

// === STUDENTS ===
export async function getStudents() {
  const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false })
  return data || []
}
export async function getActiveGroups() {
  const { data } = await supabase.from('groups').select('*, subjects(name)').eq('is_active', true)
  return data || []
}
export async function upsertStudent(payload: { full_name: string; phone: string | null; parent_phone: string | null; birth_date: string | null; address: string | null }, id?: string) {
  if (id) {
    await supabase.from('students').update(payload).eq('id', id)
    return id
  }
  const { data } = await supabase.from('students').insert(payload).select().single()
  return data?.id
}
export async function enrollStudent(student_id: string, group_id: string) {
  return supabase.from('enrollments').upsert({ student_id, group_id, is_active: true })
}
export async function getStudentEnrollments(studentId: string) {
  const { data } = await supabase.from('enrollments').select('*, groups(name, subjects(name))').eq('student_id', studentId).eq('is_active', true)
  return data || []
}
export async function removeEnrollment(enrollId: string) {
  return supabase.from('enrollments').update({ is_active: false, left_at: new Date().toISOString() }).eq('id', enrollId)
}

// === PAYMENTS ===
export async function getPayments(month: number, year: number) {
  const { data } = await supabase.from('payments').select('*, students(full_name, phone), groups(name, subjects(name))').eq('month', month).eq('year', year).order('created_at', { ascending: false })
  return data || []
}
export async function getAllStudents() {
  const { data } = await supabase.from('students').select('id, full_name, phone').order('full_name')
  return data || []
}
export async function getStudentActiveEnrollments(studentId: string) {
  const { data } = await supabase.from('enrollments').select('group_id, groups(id, name, subjects(name, monthly_fee))').eq('student_id', studentId).eq('is_active', true)
  return data || []
}
export async function createPayment(payload: { student_id: string; group_id: string; amount: number; payment_date: string; month: number; year: number; payment_method: string; note: string | null }) {
  return supabase.from('payments').insert(payload)
}

// === ATTENDANCE ===
export async function getActiveGroupsList() {
  const { data } = await supabase.from('groups').select('*, subjects(name)').eq('is_active', true)
  return data || []
}
export async function getGroupStudentsWithAttendance(groupId: string, date: string) {
  const [enrolls, existing] = await Promise.all([
    supabase.from('enrollments').select('student_id, students(id, full_name)').eq('group_id', groupId).eq('is_active', true),
    supabase.from('attendance').select('student_id, status').eq('group_id', groupId).eq('date', date)
  ])
  return { students: enrolls.data || [], attendance: existing.data || [] }
}
export async function saveAttendanceRecords(records: { student_id: string; group_id: string; date: string; status: string }[]) {
  return supabase.from('attendance').upsert(records, { onConflict: 'student_id,group_id,date' })
}

// === DASHBOARD ===
export async function getDashboardStats() {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const today = now.toISOString().split('T')[0]

  const [students, groups, subjects, teachers, payments, attendance, recentPayments] = await Promise.all([
    supabase.from('students').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('groups').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('subjects').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('teachers').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('payments').select('amount').eq('month', month).eq('year', year),
    supabase.from('attendance').select('status').eq('date', today),
    supabase.from('payments').select('*, students(full_name), groups(name, subjects(name))').order('created_at', { ascending: false }).limit(5),
  ])

  const monthTotal = (payments.data || []).reduce((sum, p) => sum + Number(p.amount), 0)
  const att = attendance.data || []

  return {
    students: students.count || 0,
    groups: groups.count || 0,
    subjects: subjects.count || 0,
    teachers: teachers.count || 0,
    monthTotal,
    presentToday: att.filter(a => a.status === 'present').length,
    absentToday: att.filter(a => a.status === 'absent').length,
    lateToday: att.filter(a => a.status === 'late').length,
    month, year,
    recentPayments: recentPayments.data || [],
  }
}

// === USERS ===
export async function getUsers() {
  const { data } = await supabase.from('users').select('*').order('created_at')
  return data || []
}
export async function updateUser(id: string, payload: { full_name: string; role: string }) {
  return supabase.from('users').update(payload).eq('id', id)
}
export async function toggleUserActive(id: string, is_active: boolean) {
  return supabase.from('users').update({ is_active }).eq('id', id)
}

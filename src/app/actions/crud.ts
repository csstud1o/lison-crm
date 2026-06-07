'use server'
import { createClient } from '@supabase/supabase-js'

const clean = (s: string) => s.replace(/^\uFEFF/, '').trim()

function getSupabase() {
  return createClient(
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL!),
    clean(process.env.SUPABASE_SERVICE_ROLE_KEY!)
  )
}

// === SUBJECTS ===
export async function getSubjects() {
  const { data } = await getSupabase().from('subjects').select('*').order('created_at')
  return data || []
}
export async function upsertSubject(payload: { name: string; description: string; monthly_fee: number }, id?: string) {
  if (id) {
    const { error } = await getSupabase().from('subjects').update(payload).eq('id', id)
    return { error: error ? { message: error.message } : null }
  }
  const { error } = await getSupabase().from('subjects').insert(payload)
  return { error: error ? { message: error.message } : null }
}
export async function toggleSubjectActive(id: string, is_active: boolean) {
  const { error } = await getSupabase().from('subjects').update({ is_active }).eq('id', id)
  return { error: error ? { message: error.message } : null }
}
export async function deleteSubject(id: string) {
  const { error } = await getSupabase().from('subjects').delete().eq('id', id)
  return { error: error ? { message: error.message } : null }
}

// === TEACHERS ===
export async function getTeachers() {
  const { data } = await getSupabase().from('teachers').select('*, subjects(name)').order('created_at')
  return data || []
}
export async function getActiveSubjects() {
  const { data } = await getSupabase().from('subjects').select('*').eq('is_active', true)
  return data || []
}
export async function upsertTeacher(payload: { full_name: string; phone: string | null; subject_id: string | null }, id?: string) {
  if (id) {
    const { error } = await getSupabase().from('teachers').update(payload).eq('id', id)
    return { error: error ? { message: error.message } : null }
  }
  const { error } = await getSupabase().from('teachers').insert(payload)
  return { error: error ? { message: error.message } : null }
}
export async function toggleTeacherActive(id: string, is_active: boolean) {
  const { error } = await getSupabase().from('teachers').update({ is_active }).eq('id', id)
  return { error: error ? { message: error.message } : null }
}
export async function deleteTeacher(id: string) {
  const { error } = await getSupabase().from('teachers').delete().eq('id', id)
  return { error: error ? { message: error.message } : null }
}

// === GROUPS ===
export async function getGroups() {
  const { data } = await getSupabase().from('groups').select('*, subjects(name), teachers(full_name), enrollments(count)').order('created_at')
  return data || []
}
export async function getActiveTeachers() {
  const { data } = await getSupabase().from('teachers').select('*').eq('is_active', true)
  return data || []
}
export async function upsertGroup(payload: { name: string; subject_id: string; teacher_id: string | null; schedule: string; capacity: number }, id?: string) {
  if (id) {
    const { error } = await getSupabase().from('groups').update(payload).eq('id', id)
    return { error: error ? { message: error.message } : null }
  }
  const { error } = await getSupabase().from('groups').insert(payload)
  return { error: error ? { message: error.message } : null }
}
export async function toggleGroupActive(id: string, is_active: boolean) {
  const { error } = await getSupabase().from('groups').update({ is_active }).eq('id', id)
  return { error: error ? { message: error.message } : null }
}
export async function deleteGroup(id: string) {
  const { error } = await getSupabase().from('groups').delete().eq('id', id)
  return { error: error ? { message: error.message } : null }
}

// === STUDENTS ===
export async function getStudents() {
  const { data } = await getSupabase().from('students').select('*').order('created_at', { ascending: false })
  return data || []
}
export async function getActiveGroups() {
  const { data } = await getSupabase().from('groups').select('*, subjects(name)').eq('is_active', true)
  return data || []
}
export async function upsertStudent(payload: { full_name: string; phone: string | null; parent_phone: string | null; birth_date: string | null; address: string | null }, id?: string) {
  if (id) {
    await getSupabase().from('students').update(payload).eq('id', id)
    return id
  }
  const { data } = await getSupabase().from('students').insert(payload).select().single()
  return data?.id
}
export async function deleteStudent(id: string) {
  const { error } = await getSupabase().from('students').delete().eq('id', id)
  return { error: error ? { message: error.message } : null }
}
export async function enrollStudent(student_id: string, group_id: string) {
  const { error } = await getSupabase().from('enrollments').upsert(
    { student_id, group_id, is_active: true, left_at: null },
    { onConflict: 'student_id,group_id' }
  )
  return { error: error ? { message: error.message } : null }
}
export async function getStudentEnrollments(studentId: string) {
  const { data } = await getSupabase().from('enrollments').select('*, groups(name, subjects(name))').eq('student_id', studentId).eq('is_active', true)
  return data || []
}
export async function removeEnrollment(enrollId: string) {
  const { error } = await getSupabase().from('enrollments').update({ is_active: false, left_at: new Date().toISOString() }).eq('id', enrollId)
  return { error: error ? { message: error.message } : null }
}

// === PAYMENTS ===
export async function getPayments(month: number, year: number) {
  const { data } = await getSupabase().from('payments').select('*, students(full_name, phone), groups(name, subjects(name))').eq('month', month).eq('year', year).order('created_at', { ascending: false })
  return data || []
}
export async function getAllStudents() {
  const { data } = await getSupabase().from('students').select('id, full_name, phone').order('full_name')
  return data || []
}
export async function getStudentActiveEnrollments(studentId: string) {
  const { data } = await getSupabase().from('enrollments').select('group_id, groups(id, name, subjects(name, monthly_fee))').eq('student_id', studentId).eq('is_active', true)
  return data || []
}
export async function createPayment(payload: { student_id: string; group_id: string; amount: number; payment_date: string; month: number; year: number; payment_method: string; note: string | null }) {
  const { error } = await getSupabase().from('payments').insert(payload)
  return { error: error ? { message: error.message } : null }
}

// === ATTENDANCE ===
export async function getActiveGroupsList() {
  const { data } = await getSupabase().from('groups').select('*, subjects(name)').eq('is_active', true)
  return data || []
}
export async function getGroupStudentsWithAttendance(groupId: string, date: string) {
  const [enrolls, existing] = await Promise.all([
    getSupabase().from('enrollments').select('student_id, students(id, full_name)').eq('group_id', groupId).eq('is_active', true),
    getSupabase().from('attendance').select('student_id, status').eq('group_id', groupId).eq('date', date)
  ])
  return { students: enrolls.data || [], attendance: existing.data || [] }
}
export async function saveAttendanceRecords(records: { student_id: string; group_id: string; date: string; status: string }[]) {
  const { error } = await getSupabase().from('attendance').upsert(records, { onConflict: 'student_id,group_id,date' })
  return { error: error ? { message: error.message } : null }
}

// === DASHBOARD ===
export async function getDashboardStats() {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const today = now.toISOString().split('T')[0]

  const [students, groups, subjects, teachers, payments, attendance, recentPayments] = await Promise.all([
    getSupabase().from('students').select('id', { count: 'exact', head: true }).eq('is_active', true),
    getSupabase().from('groups').select('id', { count: 'exact', head: true }).eq('is_active', true),
    getSupabase().from('subjects').select('id', { count: 'exact', head: true }).eq('is_active', true),
    getSupabase().from('teachers').select('id', { count: 'exact', head: true }).eq('is_active', true),
    getSupabase().from('payments').select('amount').eq('month', month).eq('year', year),
    getSupabase().from('attendance').select('status').eq('date', today),
    getSupabase().from('payments').select('*, students(full_name), groups(name, subjects(name))').order('created_at', { ascending: false }).limit(5),
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
  const { data } = await getSupabase().from('users').select('*').order('created_at')
  return data || []
}
export async function updateUser(id: string, payload: { full_name: string; role: string }) {
  const { error } = await getSupabase().from('users').update(payload).eq('id', id)
  return { error: error ? { message: error.message } : null }
}
export async function toggleUserActive(id: string, is_active: boolean) {
  const { error } = await getSupabase().from('users').update({ is_active }).eq('id', id)
  return { error: error ? { message: error.message } : null }
}

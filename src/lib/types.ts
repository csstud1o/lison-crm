export type UserRole = 'superadmin' | 'reception'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface Subject {
  id: string
  name: string
  description?: string
  monthly_fee: number
  is_active: boolean
  created_at: string
}

export interface Teacher {
  id: string
  full_name: string
  phone?: string
  subject_id?: string
  is_active: boolean
  created_at: string
  subjects?: Subject
}

export interface Group {
  id: string
  name: string
  subject_id: string
  teacher_id?: string
  schedule?: string
  capacity: number
  is_active: boolean
  created_at: string
  subjects?: Subject
  teachers?: Teacher
  enrollments?: { count: number }[]
}

export interface Student {
  id: string
  full_name: string
  phone?: string
  parent_phone?: string
  birth_date?: string
  address?: string
  is_active: boolean
  created_at: string
}

export interface Enrollment {
  id: string
  student_id: string
  group_id: string
  enrolled_at: string
  left_at?: string
  is_active: boolean
  students?: Student
  groups?: Group
}

export interface Payment {
  id: string
  student_id: string
  group_id: string
  amount: number
  payment_date: string
  month: number
  year: number
  payment_method: string
  note?: string
  received_by?: string
  created_at: string
  students?: Student
  groups?: Group
}

export interface Attendance {
  id: string
  student_id: string
  group_id: string
  date: string
  status: 'present' | 'absent' | 'late'
  note?: string
  marked_by?: string
  created_at: string
  students?: Student
}

'use server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('demo_role')
  cookieStore.delete('demo_user')
  redirect('/login')
}

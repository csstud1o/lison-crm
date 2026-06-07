import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const clean = (s: string) => s.replace(/^\uFEFF/, '').trim()

export function createClient() {
  return createSupabaseClient(
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL!),
    clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  )
}

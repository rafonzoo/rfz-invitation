import { createClient } from '@supabase/supabase-js'

export default function Supabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    throw new Error('Missing STORAGE_URL in config env')
  }

  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
}

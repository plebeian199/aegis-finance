import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cek apakah env variables ada untuk mencegah error saat build jika belum diset
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL and Anon Key are not defined in environment variables. Silakan atur di .env.local")
}

export const supabase = createClient(supabaseUrl || "https://placeholder-url.supabase.co", supabaseAnonKey || "placeholder-key")

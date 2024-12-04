import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,       // Use environment variables
  import.meta.env.VITE_SUPABASE_ANON_KEY   // Use environment variables
)
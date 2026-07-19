import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ekxnyhdffnewxmqeqhfg.supabase.co'

const supabaseKey = 'sb_publishable_LJHZghV6lE8qV68ahYskZg_J-Wd_eLe'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jgsrcnhumwmnhnplwepb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnc3Jjbmh1bXdtbmhucGx3ZXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MjkxOTEsImV4cCI6MjA2NjUwNTE5MX0.GQnWIE6S2CcqUGcJHlJHolSXyk0K6tvL8RenCjXpC_o'

console.log("▶ supabaseUrl:", supabaseUrl)
console.log("▶ supabaseAnonKey starts with:", supabaseAnonKey?.substr(0, 8))


export const supabase = createClient(supabaseUrl, supabaseAnonKey)

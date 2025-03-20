import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = 'https://yolnffbqipdkkfpxoecu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbG5mZmJxaXBka2tmcHhvZWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzODU3MTksImV4cCI6MjA1Nzk2MTcxOX0.KlvVf8sAmjGvscN9ceRffKm_1_epFlc99b8U1x13uK4'

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
) 
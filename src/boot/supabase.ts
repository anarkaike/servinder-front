import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fqisvpmwislskdkqjxhi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxaXN2cG13aXNsc2tka3FqeGhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MDI5MTYsImV4cCI6MjA0OTk3ODkxNn0.sVZX7kIk43YOCRcFMnHY_3TIyjVktk_wyoDc0k4xfQ0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

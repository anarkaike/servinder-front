import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_KEY')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  try {
    const sql = fs.readFileSync('scripts/create_migrations_table.sql', 'utf8')
    const { data, error } = await supabase.rpc('execute_sql', { sql })
    if (error) throw error
    console.log('Tabela de migrações criada com sucesso!')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

run()

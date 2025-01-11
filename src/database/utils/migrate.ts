import { createClient } from '@supabase/supabase-js'
import { MigrationRunner } from '../src/database/MigrationRunner.js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_KEY')
}

const supabase = createClient(supabaseUrl, supabaseKey)
const migrationRunner = new MigrationRunner(supabase)

const command = process.argv[2] || 'migrate'

async function run() {
  try {
    switch (command) {
      case 'migrate':
        await migrationRunner.migrate()
        break
      case 'rollback':
        await migrationRunner.rollback()
        break
      case 'refresh':
        await migrationRunner.refresh()
        break
      case 'reset':
        await migrationRunner.reset()
        break
      default:
        console.log('Invalid command')
    }
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

run()

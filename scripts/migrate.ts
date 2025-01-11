import { supabase } from '../src/boot/supabase.js'
import { MigrationRunner } from '../src/database/MigrationRunner.js'

async function migrate() {
  try {
    const runner = new MigrationRunner(supabase)
    await runner.migrate()
    console.log('Migrations executadas com sucesso!')
    process.exit(0)
  } catch (error) {
    console.error('Erro ao executar migrations:', error)
    process.exit(1)
  }
}

migrate()

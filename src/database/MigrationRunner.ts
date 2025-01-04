import { SupabaseClient } from '@supabase/supabase-js'
import { Migration } from './migrations/Migration.js'
import { getMigrations } from './migrations/index.js'

export class MigrationRunner {
  constructor(private supabase: SupabaseClient) {}

  private async executeSql(sql: string) {
    const { data, error } = await this.supabase.rpc('execute_sql', { sql })
    if (error) throw error
    return data
  }

  private async getExecutedMigrations(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('migrations')
        .select('name')
        .order('id', { ascending: true })

      if (error) throw error
      return data.map(m => m.name)
    } catch (error) {
      // Se a tabela não existir, criar
      if ((error as any).message.includes('relation "migrations" does not exist')) {
        await this.executeSql(`
          CREATE TABLE migrations (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            batch INTEGER NOT NULL,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `)
        return []
      }
      throw error
    }
  }

  private async getCurrentBatch(): Promise<number> {
    const { data, error } = await this.supabase
      .from('migrations')
      .select('batch')
      .order('batch', { ascending: false })
      .limit(1)

    if (error) throw error
    if (!data || data.length === 0) return 0
    return data[0].batch
  }

  private async markMigrationAsExecuted(name: string) {
    const batch = await this.getCurrentBatch() + 1
    const { error } = await this.supabase
      .from('migrations')
      .insert({ name, batch })

    if (error) throw error
  }

  private async removeMigration(name: string) {
    const { error } = await this.supabase
      .from('migrations')
      .delete()
      .eq('name', name)

    if (error) throw error
  }

  async migrate() {
    const migrations = getMigrations()
    const executedMigrations = await this.getExecutedMigrations()

    for (const migration of migrations) {
      if (!executedMigrations.includes(migration.name)) {
        console.log(`Executando migration: ${migration.name}`)
        const sql = await migration.up()
        await this.executeSql(sql)
        await this.markMigrationAsExecuted(migration.name)
        console.log(`Migration ${migration.name} executada com sucesso`)
      }
    }

    console.log('Todas as migrations foram executadas com sucesso!')
  }

  async rollback() {
    const executedMigrations = await this.getExecutedMigrations()
    if (executedMigrations.length === 0) {
      console.log('Não há migrations para reverter')
      return
    }

    const lastMigration = executedMigrations[executedMigrations.length - 1]
    const migrations = getMigrations()
    const migration = migrations.find(m => m.name === lastMigration)

    if (migration) {
      console.log(`Revertendo migration: ${migration.name}`)
      const sql = await migration.down()
      await this.executeSql(sql)
      await this.removeMigration(migration.name)
      console.log(`Migration ${migration.name} revertida com sucesso`)
    }
  }

  async refresh() {
    const executedMigrations = await this.getExecutedMigrations()
    const migrations = getMigrations()

    // Reverter todas as migrations na ordem inversa
    for (const migrationName of executedMigrations.reverse()) {
      const migration = migrations.find(m => m.name === migrationName)
      if (migration) {
        console.log(`Revertendo migration: ${migration.name}`)
        const sql = await migration.down()
        await this.executeSql(sql)
        await this.removeMigration(migration.name)
        console.log(`Migration ${migration.name} revertida com sucesso`)
      }
    }

    // Executar todas as migrations novamente
    await this.migrate()
  }

  async reset() {
    await this.executeSql('drop table if exists migrations cascade;')
    await this.getExecutedMigrations() // Isso irá recriar a tabela
    await this.migrate()
  }
}

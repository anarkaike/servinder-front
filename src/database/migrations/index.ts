import { Migration } from './Migration.js'
import { EntityMigration } from './EntityMigration.js'
import { entities } from '../entities/index.js'
import { CreateAuditsTable } from './create_audits_table.js'
import { CreateAuthTrigger } from './create_auth_trigger.js'
import { AlterAuditsUserId } from './alter_audits_user_id.js'

export function getMigrations(): Migration[] {
  const migrations = new Map<string, Migration>()

  // Primeira migration: criar a tabela de auditorias
  migrations.set('create_audits_table', new CreateAuditsTable())

  // Migrações das entidades
  for (const entity of entities) {
    const migration = new EntityMigration(entity)
    migrations.set(migration.name, migration)
  }

  // Alterar a coluna user_id da tabela de auditorias
  migrations.set('alter_audits_user_id', new AlterAuditsUserId())

  // Última migration: criar o trigger de autenticação
  migrations.set('create_auth_trigger', new CreateAuthTrigger())

  return Array.from(migrations.values())
}

export * from './Migration.js'

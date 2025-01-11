import { Migration } from './Migration.js'
import { EntityMigration } from './EntityMigration.js'
import { entities } from '../entities/index.js'
import { CreateAuditsTable } from './create_audits_table.js'
import { CreateAuthTrigger } from './create_auth_trigger.js'
import { AlterAuditsUserId } from './alter_audits_user_id.js'
import { FixAuthTrigger } from './fix_auth_trigger.js'
import { VerifyUsersTable } from './verify_users_table.js'
import { FixUserMetadata } from './fix_user_metadata.js'
import { RecreateTesteTable } from './recreate_teste_table.js'

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

  // Criar o trigger de autenticação
  migrations.set('create_auth_trigger', new CreateAuthTrigger())

  // Corrigir o trigger de autenticação e políticas
  migrations.set('fix_auth_trigger', new FixAuthTrigger())

  // Verificar e corrigir a tabela users
  migrations.set('verify_users_table', new VerifyUsersTable())

  // Corrigir o caminho dos metadados do usuário
  migrations.set('fix_user_metadata', new FixUserMetadata())

  // Recriar tabela de teste com RLS
  migrations.set('recreate_teste_table', new RecreateTesteTable())

  return Array.from(migrations.values())
}

export * from './Migration.js'

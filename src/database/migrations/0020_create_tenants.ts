import { sql } from 'drizzle-orm';
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { Entity } from '../entities/Entity';

export async function up(db: any): Promise<void> {
  // Criar tabela de tenants
  await db.schema.createTable('tenants', (table: any) => ({
    ...Entity,
    name: text('name').notNull(),
    domain: text('domain').notNull().unique(),
    database: text('database'),
    settings: text('settings'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  }));

  // Adicionar coluna tenant_id nas tabelas que precisam ser isoladas
  const tables = ['users', 'products', 'services', 'spaces', 'movements', 'account_vaults'];
  
  for (const tableName of tables) {
    await db.schema.alterTable(tableName, (table: any) => {
      table.uuid('tenant_id').references(() => tenants.id).notNull();
    });
    
    // Criar índice para melhor performance
    await db.schema.createIndex(`idx_${tableName}_tenant_id`).on(tableName).column('tenant_id');
  }
}

export async function down(db: any): Promise<void> {
  const tables = ['users', 'products', 'services', 'spaces', 'movements', 'account_vaults'];
  
  for (const tableName of tables) {
    await db.schema.alterTable(tableName, (table: any) => {
      table.dropColumn('tenant_id');
    });
  }

  await db.schema.dropTable('tenants');
}

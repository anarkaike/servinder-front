import { InferModel } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { Entity } from './Entity';
import { user } from './User';

export const tenant = pgTable('tenants', {
  ...Entity,
  name: text('name').notNull(),
  domain: text('domain').notNull().unique(),
  database: text('database'),
  settings: text('settings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tenantRelations = relations(tenant, ({ many }) => ({
  users: many(user),
}));

export type Tenant = typeof tenant.$inferSelect;
export type NewTenant = typeof tenant.$inferInsert;

import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { relations, sql } from 'drizzle-orm';
import { Entity } from "./Entity";
import { tenant } from "./Tenant";

export const user = pgTable('users', {
  ...Entity,
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  metadata: jsonb('metadata'),
  tenantId: uuid('tenant_id').references(() => tenant.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userRelations = relations(user, ({ one }) => ({
  tenant: one(tenant, {
    fields: [user.tenantId],
    references: [tenant.id],
  }),
}));

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

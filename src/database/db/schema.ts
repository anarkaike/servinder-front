import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const teste = pgTable('teste', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

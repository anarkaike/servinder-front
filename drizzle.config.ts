import type { Config } from 'drizzle-kit'
import * as dotenv from 'dotenv'
dotenv.config()

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.SUPABASE_URL || ''
  }
} satisfies Config

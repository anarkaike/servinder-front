import type { Config } from 'drizzle-kit'
import * as dotenv from 'dotenv'
dotenv.config()

export default {
  schema: './src/database/entities/*.ts',
  out: './drizzle',
  dialect: 'postgresql',
  driver: 'turso',
  dbCredentials: {
    url: process.env.SUPABASE_URL || '',
    authToken: process.env.SUPABASE_ANON_KEY || ''
  },
  verbose: true,
  strict: true
} satisfies Config

import { createClient } from '@supabase/supabase-js';
import { migrationRunner } from '../src/core/database';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL or SUPABASE_KEY is not defined');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  try {
    const runner = migrationRunner(supabase);
    await runner.runMigrations();
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

migrate();

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

async function generateMigration() {
  try {
    const runner = migrationRunner(supabase);
    await runner.generateMigrations();
    console.log('Migration files generated successfully');
  } catch (error) {
    console.error('Error generating migration files:', error);
    process.exit(1);
  }
}

generateMigration();

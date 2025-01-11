import { SupabaseClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pkg from 'pg';
import { exec } from 'child_process';
import { promisify } from 'util';
const { Pool } = pkg;

const execAsync = promisify(exec);

export class MigrationRunner {
  private static instance: MigrationRunner;
  private supabase: SupabaseClient;
  private pool: pkg.Pool;

  private constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  public static getInstance(supabase: SupabaseClient): MigrationRunner {
    if (!MigrationRunner.instance) {
      MigrationRunner.instance = new MigrationRunner(supabase);
    }
    return MigrationRunner.instance;
  }

  private async executeSql(sql: string) {
    const { data, error } = await this.supabase.rpc('execute_sql', { sql });
    if (error) throw error;
    return data;
  }

  private async getExecutedMigrations(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('migrations')
        .select('name')
        .order('id', { ascending: true });

      if (error) throw error;
      return data.map((m) => m.name);
    } catch (error) {
      console.error('Error getting executed migrations:', error);
      return [];
    }
  }

  private async recordMigration(name: string) {
    const { error } = await this.supabase
      .from('migrations')
      .insert({ name });

    if (error) throw error;
  }

  public async runMigrations() {
    const db = drizzle(this.pool);

    try {
      // Usar o migrador do Drizzle
      await migrate(db, {
        migrationsFolder: './drizzle',
      });

      console.log('Migrations completed successfully');
    } catch (error) {
      console.error('Error running migrations:', error);
      throw error;
    } finally {
      await this.pool.end();
    }
  }

  public async generateMigrations() {
    try {
      const { stdout, stderr } = await execAsync('npx drizzle-kit generate');
      console.log(`Migration generation output: ${stdout}`);
      if (stderr) {
        console.error(`Migration generation errors: ${stderr}`);
      }
    } catch (error) {
      console.error('Error generating migrations:', error);
      throw error;
    }
  }
}

export const migrationRunner = (supabase: SupabaseClient) => MigrationRunner.getInstance(supabase);

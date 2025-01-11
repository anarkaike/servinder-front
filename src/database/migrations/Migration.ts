import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

export interface Migration {
  name: string
  up(): Promise<void>
  down(): Promise<void>
}

export abstract class MigrationImpl implements Migration {
  protected client: any;

  constructor() {
    const connectionString = process.env.SUPABASE_URL;
    if (!connectionString) {
      throw new Error('SUPABASE_URL is not defined');
    }
    
    const sql = postgres(connectionString);
    this.client = drizzle(sql);
  }

  protected async executeSql(sql: string) {
    const { data, error } = await this.client.execute(sql)
    
    if (error) {
      throw new Error(JSON.stringify(error, null, 2))
    }

    return data
  }

  abstract up(): Promise<void>
  abstract down(): Promise<void>
  abstract get name(): string
}

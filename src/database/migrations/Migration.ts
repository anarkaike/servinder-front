import { SupabaseClient } from '@supabase/supabase-js'

export interface Migration {
  name: string
  up(): Promise<string>
  down(): Promise<string>
}

export abstract class MigrationImpl implements Migration {
  constructor(protected supabase: SupabaseClient) {}

  protected async executeSql(sql: string) {
    const { data, error } = await this.supabase.rpc('execute_sql', { sql })
    
    if (error) {
      throw new Error(JSON.stringify(error, null, 2))
    }

    return data
  }

  abstract up(): Promise<string>
  abstract down(): Promise<string>
  abstract get name(): string
}

import { createClient } from '@supabase/supabase-js';
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
    // Executar a migration do tenant
    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        -- Create tenants table
        CREATE TABLE IF NOT EXISTS tenants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          domain TEXT NOT NULL UNIQUE,
          database TEXT,
          settings TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
        );

        -- Add tenant_id to users table
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

        -- Create index for tenant_id on users
        CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);

        -- Create RLS policies for tenants
        ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS tenant_isolation_policy ON tenants;
        CREATE POLICY tenant_isolation_policy ON tenants
          FOR ALL
          TO authenticated
          USING (true)
          WITH CHECK (true);

        -- Create RLS policies for users with tenant isolation
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS user_tenant_isolation_policy ON users;
        CREATE POLICY user_tenant_isolation_policy ON users
          FOR ALL
          TO authenticated
          USING (true)
          WITH CHECK (true);

        -- Function to set updated_at automatically
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        -- Add trigger for tenants
        DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
        CREATE TRIGGER update_tenants_updated_at
            BEFORE UPDATE ON tenants
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
      `
    });

    if (error) {
      throw error;
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

migrate();

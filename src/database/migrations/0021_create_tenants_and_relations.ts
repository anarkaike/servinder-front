import { Migration } from './Migration';
import { readFileSync } from 'fs';
import { join } from 'path';

export class CreateTenantsAndRelations extends Migration {
  async up(): Promise<void> {
    const sql = readFileSync(
      join(__dirname, '0021_create_tenants_and_relations.sql'),
      'utf8'
    );
    await this.client.execute(sql);
  }

  async down(): Promise<void> {
    await this.client.execute(`
      DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
      DROP FUNCTION IF EXISTS update_updated_at_column();
      DROP POLICY IF EXISTS user_tenant_isolation_policy ON users;
      DROP POLICY IF EXISTS tenant_isolation_policy ON tenants;
      ALTER TABLE users DROP COLUMN IF EXISTS tenant_id;
      DROP TABLE IF EXISTS tenants;
    `);
  }
}

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { migrationRunner } from './migrations/MigrationRunner';

// Configurando o pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Exportando a instância do Drizzle
export const db = drizzle(pool);

// Exportando o runner de migrações
export { migrationRunner };

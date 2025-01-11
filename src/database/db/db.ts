import { drizzle } from "drizzle-orm/node-postgres"; // Ou outro adaptador como o MySQL
import { Pool } from 'pg'; // Adaptador PostgreSQL
// Certifique-se de instalar 'pg' e '@types/pg' como dependências: npm install pg @types/pg

// Configurando o pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Variável de ambiente para a String de Conexão
});

export const db = drizzle(pool); // Inicializando o Drizzle ORM com o pool

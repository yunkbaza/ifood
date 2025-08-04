import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

pool.connect()
  .then(() => console.log('✅ Conectado ao banco de dados PostgreSQL com sucesso!'))
  .catch((err: Error) => console.error('❌ Falha ao conectar ao banco de dados:', err));
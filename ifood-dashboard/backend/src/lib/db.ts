import { Pool } from 'pg';

export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ifood_dashboard',
  password: '240824',
  port: 5432,
});

pool.connect()
  .then(() => console.log('✅ Conectado ao banco de dados PostgreSQL com sucesso!'))
  .catch((err: Error) => console.error('❌ Falha ao conectar ao banco de dados:', err));

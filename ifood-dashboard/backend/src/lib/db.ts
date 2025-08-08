// backend/src/lib/db.ts

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// A variável de ambiente DATABASE_URL é usada para configurar o pool de conexões.
// O Node.js automaticamente pega as informações de conexão (usuário, senha, host, etc.)
// a partir desta URL.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Listener para verificar se a conexão com o banco de dados foi bem-sucedida
pool.on('connect', () => {
  console.log('Conectado com sucesso ao banco de dados PostgreSQL.');
});

pool.on('error', (err, client) => {
  console.error('Erro inesperado no cliente do banco de dados', err);
  process.exit(-1);
});
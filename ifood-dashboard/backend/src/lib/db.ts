// Importações
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente para a conexão
dotenv.config();

// Cria um pool de conexões com o banco de dados PostgreSQL
// Isso é mais eficiente do que criar uma nova conexão para cada requisição.
export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10), // Converte a porta para número
});

// Testa a conexão com o banco de dados
pool.connect()
  .then(() => console.log('✅ Conectado ao banco de dados PostgreSQL com sucesso!'))
  .catch((err: Error) => console.error('❌ Falha ao conectar ao banco de dados:', err));
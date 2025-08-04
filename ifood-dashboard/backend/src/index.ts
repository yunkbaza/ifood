// backend/src/index.ts

// Importações de módulos e bibliotecas
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importação dos arquivos de rotas
import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import restaurantRoutes from './routes/restaurant.routes';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Inicializa o aplicativo Express
const app = express();

// Configura middlewares globais
// - cors(): Permite requisições de diferentes domínios.
// - express.json(): Permite que a aplicação entenda requisições com formato JSON.
app.use(cors());
app.use(express.json());

// Define as rotas da API
// Cada URL base é associada a um arquivo de rota específico
app.use('/auth', authRoutes);
app.use('/orders', orderRoutes);
app.use('/restaurants', restaurantRoutes);

// Middleware de tratamento de erros global
// Este middleware é o último a ser chamado e lida com todos os erros passados via next(err).
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Registra o erro completo no console para debug
  res.status(500).json({
    message: 'Ocorreu um erro interno no servidor.',
    error: err.message
  });
});

// Define a porta do servidor, usando a variável de ambiente ou 3333 como padrão
const PORT = process.env.PORT || 3333;

// Inicia o servidor e escuta na porta especificada
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import restaurantRoutes from './routes/restaurant.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/orders', orderRoutes);
app.use('/restaurants', restaurantRoutes);

// Middleware de tratamento de erros centralizado
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Ocorreu um erro interno no servidor.',
    error: err.message
  });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
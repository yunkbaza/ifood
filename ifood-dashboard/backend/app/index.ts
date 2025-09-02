import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron'; // Importa a biblioteca cron
import { runUpdateJob } from './jobs/updateMetricsJob'; // Importa o job
import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import restaurantRoutes from './routes/restaurant.routes';
import metricsRoutes from './routes/metrics.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/orders', orderRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/metrics', metricsRoutes);

// ANOTAÇÃO: Agendamento do job de atualização
// O job será executado todos os dias à meia-noite
// Sinta-se à vontade para ajustar o cron schedule, por exemplo:
// '*/5 * * * *' para a cada 5 minutos (útil para testes)
cron.schedule('0 0 * * *', runUpdateJob, {
  timezone: "America/Sao_Paulo"
});

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
  runUpdateJob(); // ANOTAÇÃO: Executa o job uma vez ao iniciar o servidor para popular os dados
});
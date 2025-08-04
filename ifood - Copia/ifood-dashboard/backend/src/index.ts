import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import restaurantRoutes from './routes/restaurant.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); 

app.use('/auth', authRoutes);
app.use('/restaurants', restaurantRoutes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Importações
import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurant.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// A rota de criação de restaurantes é protegida pelo middleware de autenticação.
router.post('/', authenticate, RestaurantController.create);

export default router;
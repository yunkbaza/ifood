// Importações
import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// ANOTAÇÃO: O middleware 'authenticate' protege a rota, garantindo que apenas
// usuários autenticados possam acessar a importação de pedidos.
router.post('/import', authenticate, OrderController.create);

// A rota de listagem também é protegida.
router.get('/', authenticate, OrderController.getAll);

export default router;
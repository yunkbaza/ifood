import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Importação de pedidos via arquivo, acessível apenas para usuários autenticados
router.post('/import', authenticate, (req, res, next) => {
  OrderController.create(req, res).catch(next);
});

// Consulta de todos os pedidos cadastrados
router.get('/', authenticate, OrderController.getAll);

export default router;

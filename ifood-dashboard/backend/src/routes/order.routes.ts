// ifood-dashboard/backend/src/routes/order.routes.ts

import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Rota para criar/importar um novo pedido.
// O middleware 'authenticate' garante que apenas usuários logados possam usar.
router.post('/import', authenticate, OrderController.create);

// Rota para listar todos os pedidos do usuário logado.
router.get('/', authenticate, OrderController.getAll);

// --- CORREÇÃO PRINCIPAL ---
// Adiciona a linha de exportação padrão que estava faltando.
export default router;
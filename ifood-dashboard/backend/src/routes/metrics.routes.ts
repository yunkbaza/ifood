// backend/src/routes/metrics.routes.ts

import { Router } from 'express';
import { MetricsController } from '../controllers/metrics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Rota para buscar o faturamento mensal por unidade
router.get('/monthly-revenue', authenticate, MetricsController.getMonthlyRevenue);

// Rota para buscar os top 5 produtos mais vendidos
router.get('/top-selling-products', authenticate, MetricsController.getTopSellingProducts);

// Rota para buscar a média de notas por unidade
router.get('/average-ratings', authenticate, MetricsController.getAverageRatings);

// Rota para buscar o número de pedidos por status
router.get('/orders-by-status', authenticate, MetricsController.getOrdersByStatus);

// Rota para buscar a evolução de pedidos por semana
router.get('/weekly-orders', authenticate, MetricsController.getWeeklyOrders);

export default router;
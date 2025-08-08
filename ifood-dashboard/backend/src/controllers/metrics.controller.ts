// ifood-dashboard/backend/src/controllers/metrics.controller.ts

import { Response, NextFunction } from 'express';
import { pool } from '../lib/db';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const MetricsController = {
  getMonthlyRevenue: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { userId } = req;
    try {
      const result = await pool.query(
        `SELECT
          u.nome AS unidade,
          DATE_TRUNC('month', p.data_pedido) AS mes,
          SUM(p.valor_total) AS faturamento_total
        FROM pedidos p
        JOIN unidades u ON u.id = p.id_unidade
        JOIN login l ON l.id_unidade = u.id
        WHERE p.status = 'Entregue' AND l.id = $1
        GROUP BY u.nome, DATE_TRUNC('month', p.data_pedido)
        ORDER BY mes;`,
        [userId]
      );
      res.status(200).json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  getTopSellingProducts: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { userId } = req;
    try {
      const result = await pool.query(
        `SELECT
          pr.nome,
          SUM(ip.quantidade) AS total_vendido
        FROM itens_pedido ip
        JOIN produtos pr ON pr.id = ip.id_produto
        JOIN pedidos p ON p.id = ip.id_pedido
        JOIN login l ON l.id_unidade = p.id_unidade
        WHERE l.id = $1
        GROUP BY pr.nome
        ORDER BY total_vendido DESC
        LIMIT 5;`,
        [userId]
      );
      res.status(200).json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  getAverageRatings: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { userId } = req;
    try {
      const result = await pool.query(
        `SELECT
          u.nome AS unidade,
          AVG(f.nota) AS media_nota
        FROM feedbacks f
        JOIN pedidos p ON p.id = f.id_pedido
        JOIN unidades u ON u.id = p.id_unidade
        JOIN login l ON l.id_unidade = u.id
        WHERE l.id = $1
        GROUP BY u.nome;`,
        [userId]
      );
      res.status(200).json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  getOrdersByStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { userId } = req;
    try {
      const result = await pool.query(
        `SELECT 
          p.status, 
          COUNT(*) AS total 
        FROM pedidos p
        JOIN login l ON l.id_unidade = p.id_unidade
        WHERE l.id = $1
        GROUP BY p.status;`,
        [userId]
      );
      res.status(200).json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  getWeeklyOrders: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { userId } = req;
    try {
      const result = await pool.query(
        `SELECT
          DATE_TRUNC('week', p.data_pedido) AS semana,
          COUNT(*) AS total_pedidos
        FROM pedidos p
        JOIN login l ON l.id_unidade = p.id_unidade
        WHERE l.id = $1
        GROUP BY DATE_TRUNC('week', p.data_pedido)
        ORDER BY semana;`,
        [userId]
      );
      res.status(200).json(result.rows);
    } catch (error) {
      next(error);
    }
  },
};
// backend/src/controllers/metrics.controller.ts

import { Request, Response, NextFunction } from 'express';
import { pool } from '../lib/db';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const MetricsController = {
  // Obtém o faturamento mensal por unidade (com filtro de data)
  getMonthlyRevenue: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { start_date, end_date } = req.query;
      let query = `
        SELECT unidade, mes, faturamento_total
        FROM faturamento_mensal_unidades
      `;
      const params = [];

      // ANOTAÇÃO: Adiciona a cláusula WHERE se as datas forem fornecidas
      if (start_date && end_date) {
        query += ` WHERE mes >= $1 AND mes <= $2`;
        params.push(start_date, end_date);
      }
      query += ` ORDER BY mes`;
      
      const result = await pool.query(query, params);
      res.status(200).json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  // Obtém os top 5 produtos mais vendidos (com filtro de data)
  getTopSellingProducts: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { start_date, end_date } = req.query;
      const params = [];
      let whereClause = '';

      if (start_date && end_date) {
        whereClause = ` WHERE p.data_pedido >= $1 AND p.data_pedido <= $2`;
        params.push(start_date, end_date);
      }

      const query = `
        WITH produtos_mais_vendidos AS (
            SELECT
                pr.nome,
                SUM(ip.quantidade) AS total_vendido
            FROM itens_pedido ip
            JOIN produtos pr ON pr.id = ip.id_produto
            JOIN pedidos p ON p.id = ip.id_pedido
            ${whereClause}
            GROUP BY pr.nome
        )
        SELECT * FROM produtos_mais_vendidos ORDER BY total_vendido DESC LIMIT 5;
      `;
      
      const result = await pool.query(query, params);
      res.status(200).json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  // Obtém a média de notas por unidade (com filtro de data)
  getAverageRatings: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { start_date, end_date } = req.query;
      const params = [];
      let whereClause = '';

      if (start_date && end_date) {
        whereClause = ` WHERE p.data_pedido >= $1 AND p.data_pedido <= $2`;
        params.push(start_date, end_date);
      }
      
      const query = `
        WITH media_notas AS (
            SELECT
                u.nome AS unidade,
                AVG(f.nota) AS media_nota
            FROM feedbacks f
            JOIN pedidos p ON p.id = f.id_pedido
            JOIN unidades u ON u.id = p.id_unidade
            ${whereClause}
            GROUP BY u.nome
        )
        SELECT * FROM media_notas;
      `;
      
      const result = await pool.query(query, params);
      res.status(200).json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  // Obtém o número de pedidos por status (com filtro de data)
  getOrdersByStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { start_date, end_date } = req.query;
      const params = [];
      let whereClause = '';

      if (start_date && end_date) {
        whereClause = ` WHERE data_pedido >= $1 AND data_pedido <= $2`;
        params.push(start_date, end_date);
      }

      const query = `
        SELECT status, COUNT(*) AS total
        FROM pedidos
        ${whereClause}
        GROUP BY status;
      `;

      const result = await pool.query(query, params);
      res.status(200).json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  // Obtém a evolução de pedidos por semana (com filtro de data)
  getWeeklyOrders: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { start_date, end_date } = req.query;
      const params = [];
      let whereClause = '';

      if (start_date && end_date) {
        whereClause = ` WHERE data_pedido >= $1 AND data_pedido <= $2`;
        params.push(start_date, end_date);
      }
      
      const query = `
        WITH pedidos_semana AS (
            SELECT
                DATE_TRUNC('week', data_pedido) AS semana,
                COUNT(*) AS total_pedidos
            FROM pedidos
            ${whereClause}
            GROUP BY DATE_TRUNC('week', data_pedido)
        )
        SELECT * FROM pedidos_semana ORDER BY semana;
      `;
      
      const result = await pool.query(query, params);
      res.status(200).json(result.rows);
    } catch (error) {
      next(error);
    }
  },
};
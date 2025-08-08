// ifood-dashboard/backend/src/controllers/order.controller.ts

import { Request, Response, NextFunction } from 'express';
import { pool } from '../lib/db';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const OrderController = {
  // --- FUNÇÃO 'create' ADICIONADA DE VOLTA ---
  // Esta função simula a importação/criação de pedidos.
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    // Para um uso real, os dados viriam de req.body em vez de um mock.
    const mockOrderData = {
        customer_name: 'Cliente Teste',
        valor_total: 99.9,
        status: 'Em andamento',
        id_unidade: req.body.restaurantId || 1, // Usa o ID do restaurante ou um padrão
        id_cliente: 1, // ID de cliente padrão
        items: [
            { id_produto: 1, quantity: 1, price: 25.00 },
            { id_produto: 3, quantity: 2, price: 6.00 }
        ]
    };

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const pedidoResult = await client.query(
        `INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, status, valor_total)
         VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4)
         RETURNING id`,
        [mockOrderData.id_cliente, mockOrderData.id_unidade, mockOrderData.status, mockOrderData.valor_total]
      );
      const pedidoId = pedidoResult.rows[0].id;

      for (const item of mockOrderData.items) {
        await client.query(
          `INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
           VALUES ($1, $2, $3, $4)`,
          [pedidoId, item.id_produto, item.quantity, item.price]
        );
      }

      await client.query('COMMIT');
      res.status(201).json({ message: 'Pedido criado com sucesso!', pedidoId: pedidoId });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  },

  // --- FUNÇÃO 'getAll' COM A CONSULTA JÁ CORRIGIDA ---
  getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req;

    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado.' });
      return;
    }

    try {
      const pedidosResult = await pool.query(
        `SELECT
            p.id,
            c.nome AS customer_name,
            p.valor_total AS total,
            p.status,
            p.data_pedido AS created_at,
            u.nome AS restaurant_name,
            p.motivo_cancelamento,
            p.data_entrega
         FROM pedidos p
         JOIN unidades u ON u.id = p.id_unidade
         JOIN login l ON l.id_unidade = u.id
         JOIN clientes c ON c.id = p.id_cliente
         WHERE l.id = $1
         ORDER BY p.data_pedido DESC`,
        [userId]
      );

      const pedidos = pedidosResult.rows;

      if (pedidos.length === 0) {
        res.status(200).json([]);
        return;
      }

      const pedidoIds = pedidos.map(p => p.id);
      const itensResult = await pool.query(
        `SELECT
            ip.id_pedido,
            pr.nome,
            ip.quantidade,
            ip.preco_unitario
         FROM itens_pedido ip
         JOIN produtos pr ON pr.id = ip.id_produto
         WHERE ip.id_pedido = ANY($1::int[])`,
        [pedidoIds]
      );

      const todosItens = itensResult.rows;

      const pedidosComItens = pedidos.map(pedido => ({
        ...pedido,
        items: todosItens.filter(item => item.id_pedido === pedido.id),
      }));

      res.status(200).json(pedidosComItens);
    } catch (error) {
      next(error);
    }
  },
};
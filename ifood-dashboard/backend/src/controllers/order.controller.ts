// Importações
import { Request, Response, NextFunction } from 'express';
import { pool } from '../lib/db';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

// ANOTAÇÃO: Definição de interfaces para tipagem forte, melhorando a previsibilidade e manutenção do código.
interface PedidoItem {
  id?: number;
  name: string;
  quantity: number;
  price: number;
  pedido_id?: number;
}
interface PedidoDB {
  id: number;
  external_id: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: Date;
  id_restaurante: number;
  id_usuario: number;
  restaurant_name: string;
}
interface PedidoMock {
  externalId: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: Date;
  items: PedidoItem[];
}
const pedidosMock: PedidoMock[] = [
  {
    externalId: 'IF123456',
    customerName: 'Allan Baeza',
    total: 89.9,
    status: 'delivered',
    createdAt: new Date(),
    items: [
      { name: 'Pizza Calabresa', quantity: 1, price: 50 },
      { name: 'Refrigerante', quantity: 2, price: 19.95 }
    ]
  }
];

export const OrderController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const { restaurantId } = req.body;
    const { userId } = req;

    if (!restaurantId || !userId) {
      res.status(400).json({ message: 'Dados de requisição incompletos.' });
      return;
    }

    const client = await pool.connect();
    
    try {
      // ANOTAÇÃO: Uso de transação para garantir que todas as inserções de um pedido
      // (principal e itens) sejam atômicas. Se algo falhar, tudo é desfeito.
      await client.query('BEGIN');
      for (const pedido of pedidosMock) {
        const pedidoResult = await client.query(
          `INSERT INTO pedidos (external_id, customer_name, total, status, created_at, id_restaurante, id_usuario)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [pedido.externalId, pedido.customerName, pedido.total, pedido.status, pedido.createdAt, restaurantId, userId]
        );
        const pedidoId = pedidoResult.rows[0].id;
        for (const item of pedido.items) {
          await client.query(
            `INSERT INTO pedido_items (name, quantity, price, pedido_id)
             VALUES ($1, $2, $3, $4)`,
            [item.name, item.quantity, item.price, pedidoId]
          );
        }
      }
      await client.query('COMMIT');
      res.status(201).json({ message: 'Pedidos importados com sucesso!' });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      // ANOTAÇÃO: É crucial liberar o cliente de volta para o pool para evitar
      // que as conexões se esgotem.
      client.release();
    }
  },

  getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req;

    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado.' });
      return;
    }

    try {
      const pedidosResult = await pool.query(
        `SELECT p.*, r.name as restaurant_name
         FROM pedidos p
         JOIN restaurants r ON r.id = p.id_restaurante
         WHERE r.owner_id = $1
         ORDER BY p.created_at DESC`,
        [userId]
      );
      const pedidosComItens = await Promise.all(
        pedidosResult.rows.map(async (pedido: PedidoDB) => {
          const itensResult = await pool.query(
            `SELECT id, name, quantity, price FROM pedido_items WHERE pedido_id = $1`,
            [pedido.id]
          );
          return { ...pedido, items: itensResult.rows as PedidoItem[] };
        })
      );
      res.status(200).json(pedidosComItens);
    } catch (error) {
      next(error);
    }
  },
};
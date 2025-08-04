// backend/src/controllers/order.controller.ts

import { Request, Response, NextFunction } from 'express';
import { pool } from '../lib/db'; // Importa a conexão do pool do PostgreSQL
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

// Interface para os itens de cada pedido
interface PedidoItem {
  id?: number;
  name: string;
  quantity: number;
  price: number;
  pedido_id?: number;
}

// Interface para estrutura de um pedido retornado do banco
interface PedidoDB {
  id: number;
  external_id: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: Date;
  id_restaurante: number;
  id_usuario: number;
  restaurante_nome: string;
}

// Interface usada para simular um pedido importado
interface PedidoMock {
  externalId: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: Date;
  items: PedidoItem[];
}

// Exemplo de pedido mockado (poderá ser substituído pela integração com a API real do iFood)
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
  /**
   * Função responsável por importar pedidos mockados para o banco de dados.
   * Cada pedido será vinculado ao restaurante e ao usuário logado.
   */
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { restaurantId } = req.body;
    const { userId } = req;

    if (!restaurantId) {
      return res.status(400).json({ message: 'O campo "restaurantId" é obrigatório.' });
    }
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const client = await pool.connect(); // Obtém um cliente do pool
    
    try {
      await client.query('BEGIN'); // Inicia a transação
      for (const pedido of pedidosMock) {
        // Inserindo o pedido principal
        const pedidoResult = await client.query(
          `INSERT INTO pedidos (external_id, customer_name, total, status, created_at, id_restaurante, id_usuario)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [pedido.externalId, pedido.customerName, pedido.total, pedido.status, pedido.createdAt, restaurantId, userId]
        );

        const pedidoId = pedidoResult.rows[0].id;

        // Inserindo os itens vinculados ao pedido
        for (const item of pedido.items) {
          await client.query(
            `INSERT INTO pedido_items (name, quantity, price, pedido_id)
             VALUES ($1, $2, $3, $4)`,
            [item.name, item.quantity, item.price, pedidoId]
          );
        }
      }
      await client.query('COMMIT'); // Finaliza a transação

      res.status(201).json({ message: 'Pedidos importados com sucesso!' });
    } catch (error) {
      await client.query('ROLLBACK'); // Desfaz a transação em caso de erro
      console.error('[ERRO AO IMPORTAR PEDIDOS]', error);
      next(error); // Passa o erro para o middleware de tratamento de erros
    } finally {
      client.release(); // Sempre libera o cliente de volta para o pool
    }
  },

  /**
   * Função que lista todos os pedidos cadastrados para o restaurante do usuário autenticado.
   * Inclui os dados dos pedidos e seus respectivos itens.
   */
  getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { userId } = req;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
      // Buscando todos os pedidos associados ao restaurante do usuário
      // Assumindo que a tabela de restaurantes tem uma coluna 'owner_id' que se refere ao 'id' do usuário
      const pedidosResult = await pool.query(
        `SELECT p.*, r.name as restaurant_name
         FROM pedidos p
         JOIN restaurants r ON r.id = p.id_restaurante
         WHERE r.owner_id = $1
         ORDER BY p.created_at DESC`,
        [userId]
      );

      // Para cada pedido, buscar os itens relacionados
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
      console.error('[ERRO AO BUSCAR PEDIDOS]', error);
      next(error); // Passa o erro para o middleware de tratamento de erros
    }
  },
};
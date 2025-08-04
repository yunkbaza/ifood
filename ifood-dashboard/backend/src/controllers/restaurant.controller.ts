// backend/src/controllers/restaurant.controller.ts

import { RequestHandler } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { pool } from '../lib/db';

export const RestaurantController = {
  create: (async (req: AuthenticatedRequest, res) => {
    const { name, externalId } = req.body;
    const ownerId = req.userId;

    if (!ownerId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
      const restaurantResult = await pool.query(
        `INSERT INTO restaurants (name, external_id, owner_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, externalId, ownerId]
      );
      const restaurant = restaurantResult.rows[0];
      res.status(201).json(restaurant);      
    } catch (err) {
      console.error('[ERRO AO CADASTRAR LOJA]', err);
      res.status(400).json({ message: 'Erro ao cadastrar loja', error: err });
    }
  }) as RequestHandler
};
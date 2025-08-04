// backend/src/services/restaurant.service.ts

import { pool } from '../lib/db'; // Importa a conexão do pool do PostgreSQL

export const RestaurantService = {
  /**
   * Cria um novo registro de restaurante no banco de dados.
   */
  async createRestaurant(name: string, externalId: string, ownerId: number) {
    try {
      const result = await pool.query(
        `INSERT INTO restaurants (name, external_id, owner_id)
         VALUES ($1, $2, $3)
         RETURNING id, name, external_id, owner_id`, // Retorna os dados inseridos
        [name, externalId, ownerId]
      );
      return result.rows[0]; // Retorna o primeiro (e único) registro inserido
    } catch (error) {
      console.error('Erro ao criar restaurante no serviço:', error);
      throw new Error('Não foi possível criar o restaurante.'); // Lança um erro para ser tratado no controller
    }
  },

  // Exemplo de como você adicionaria outro método, como buscar por ID
  // async getRestaurantById(id: number) {
  //   try {
  //     const result = await pool.query(
  //       `SELECT id, name, external_id, owner_id FROM restaurants WHERE id = $1`,
  //       [id]
  //     );
  //     return result.rows[0]; // Retorna o restaurante encontrado ou undefined
  //   } catch (error) {
  //     console.error('Erro ao buscar restaurante por ID no serviço:', error);
  //     throw new Error('Não foi possível buscar o restaurante.');
  //   }
  // },
};
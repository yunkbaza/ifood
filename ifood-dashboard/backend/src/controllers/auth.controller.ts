// backend/src/controllers/auth.controller.ts

// Importações
import { RequestHandler, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/generateToken';
import { pool } from '../lib/db';

export const AuthController = {
  register: (async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    try {
      // ANOTAÇÃO: Validação de email duplicado é uma boa prática para evitar erros de integridade.
      const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ message: 'Este email já está em uso.' });
      }

      // Hash da senha para segurança, garantindo que a senha não seja armazenada em texto simples
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
        [name, email, hashedPassword]
      );
      
      const userId = newUser.rows[0].id;
      // Gera o token de autenticação e o envia na resposta
      const token = generateToken(userId);
      
      res.status(201).json({ user: { id: userId, name, email }, token });
    } catch (error) {
      // ANOTAÇÃO: Erros são passados para o middleware global em index.ts
      next(error);
    }
  }) as RequestHandler,

  login: (async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    try {
      const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = userResult.rows[0];

      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }

      // Compara a senha fornecida com o hash armazenado no banco de dados
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }

      const token = generateToken(user.id);
      res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
    } catch (error) {
      next(error);
    }
  }) as RequestHandler
};
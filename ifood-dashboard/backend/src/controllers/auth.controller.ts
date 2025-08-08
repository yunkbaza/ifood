import { Request, Response, NextFunction } from 'express';
import { pool } from '../lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const AuthController = {
  // Lógica de registro para novos usuários
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
      return;
    }

    try {
      const existingUser = await pool.query('SELECT * FROM login WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        res.status(409).json({ message: 'Email já está em uso.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const result = await pool.query(
        'INSERT INTO login (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, passwordHash]
      );

      const newUser = result.rows[0];
      const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '1h' });

      res.status(201).json({ message: 'Usuário registrado com sucesso', user: newUser, token });
    } catch (error) {
      next(error);
    }
  },

  // Lógica de login
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    try {
      const userResult = await pool.query('SELECT * FROM login WHERE email = $1', [email]);
      const user = userResult.rows[0];

      if (!user) {
        res.status(401).json({ message: 'Credenciais inválidas.' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        res.status(401).json({ message: 'Credenciais inválidas.' });
        return;
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

      res.status(200).json({ user: { id: user.id, name: user.name, email: user.email }, token });
    } catch (error) {
      next(error);
    }
  },

  // Lógica para buscar o perfil do usuário logado
  getProfile: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ message: 'ID do usuário não encontrado no token.' });
        return;
      }

      const userResult = await pool.query('SELECT id, name, email FROM login WHERE id = $1', [userId]);

      if (userResult.rows.length === 0) {
        res.status(404).json({ message: 'Usuário não encontrado.' });
        return;
      }

      res.status(200).json(userResult.rows[0]);
    } catch (error) {
      next(error);
    }
  },
};
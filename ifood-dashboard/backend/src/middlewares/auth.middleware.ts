// backend/src/middlewares/auth.middleware.ts

// Importações de módulos e bibliotecas
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface customizada para adicionar 'userId' ao objeto de requisição
export interface AuthenticatedRequest extends Request {
  userId?: number;
}

// Middleware de autenticação
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Pega o cabeçalho de autorização da requisição
  const authHeader = req.headers.authorization;

  // Verifica se o token foi fornecido
  if (!authHeader) {
    res.status(401).json({ message: 'Token não fornecido' });
    return;
  }

  // Extrai o token do cabeçalho "Bearer [token]"
  const [, token] = authHeader.split(' ');

  // Tenta verificar o token
  try {
    // Decodifica o token usando a chave secreta do JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
    // Adiciona o ID do usuário à requisição para ser usado nas próximas rotas
    req.userId = decoded.id;
    next(); // Passa o controle para o próximo middleware ou rota
  } catch {
    // Se o token for inválido, retorna erro 401
    res.status(401).json({ message: 'Token inválido' });
  }
}
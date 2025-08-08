import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Rota para o registro de usuários
router.post('/register', AuthController.register);

// Rota para o login de usuários
router.post('/login', AuthController.login);

// Rota para obter o perfil do usuário autenticado
router.get('/me', authenticate, AuthController.getProfile);

// Exporta o roteador para ser usado no index.ts
export default router;
// Importações
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

// ANOTAÇÃO: Rotas para registro e login. Não precisam de middleware de autenticação.
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

export default router;
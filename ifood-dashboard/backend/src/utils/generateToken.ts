// Importações
import jwt from 'jsonwebtoken';

// ANOTAÇÃO: Função auxiliar para gerar tokens de autenticação.
// A chave secreta é carregada de forma segura do .env.
export function generateToken(userId: number) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: '7d' // Token expira em 7 dias
  });
}
# Manual Test Plan

Este documento descreve um roteiro básico para validar o funcionamento da aplicação web.

## Pré-requisitos

- Backend em execução: `uvicorn app.main:app --reload` no diretório `ifood-dashboard/backend`.
- Frontend em execução: `npm run dev` no diretório `ifood-dashboard/frontend`.

## Cenários de Teste

1. **Login**
   - Acesse `http://localhost:3000`.
   - Informe um e-mail e senha válidos.
   - Verifique se ocorre redirecionamento para o dashboard.

2. **Acesso negado**
   - Tente fazer login com credenciais inválidas.
   - Confirme que uma mensagem de erro é exibida.

3. **Dashboard**
   - Após autenticação, verifique se os dados principais da loja são exibidos.
   - Navegue pelos principais links e confirme se não há erros de carregamento.

Documente os resultados de cada passo para futura referência.


# iFood Dashboard Analítico

Ferramenta de visualização de dados que auxilia gestores a acompanhar as principais métricas de desempenho no iFood.

O projeto é composto por dois serviços:

- **Backend** – API em [FastAPI](https://fastapi.tiangolo.com/) (Python).
- **Frontend** – Aplicação [Next.js](https://nextjs.org/) (React).

---

## 🚀 Tecnologias Utilizadas

### Backend
- Python
- FastAPI
- SQLAlchemy
- PyJWT
- PostgreSQL (ou SQLite para testes locais)

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts
- Axios

---

## ✨ Funcionalidades
- Autenticação de usuário
- Painel de métricas (faturamento, pedidos, status etc.)
- Gráficos interativos
- Filtros por intervalo de datas
- Job de atualização automática das métricas
- Endpoints protegidos `/metricas` e `/relatorios` com limite de requisições

---

## 🛠️ Configuração e Setup

### Backend (FastAPI)
1. Acesse `ifood-dashboard/backend`.
2. Crie e ative um ambiente virtual e instale as dependências:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
   pip install -r requirements.txt
   ```
3. Crie um arquivo `.env` com as variáveis (a `SECRET_KEY` é obrigatória):
   ```
   DATABASE_URL=postgresql://usuario:senha@localhost:5432/nomedobanco
   SECRET_KEY=sua_chave_secreta
   ```
   A aplicação usa uma `SECRET_KEY` padrão apenas para desenvolvimento.
4. Execute os scripts SQL antes de iniciar o servidor:
   ```bash
   # PostgreSQL
   DATABASE_URL=postgresql://usuario:senha@localhost:5432/nomedobanco ../db/setup_db.sh

   # ou SQLite para testes locais
   sqlite3 ../ifood.db < app/schema.sql
   ```
5. Inicie o servidor de desenvolvimento:
   ```bash
   uvicorn app.main:app --reload
   ```

#### Documentação da API

Após iniciar o servidor, a documentação interativa estará disponível em `http://localhost:8000/docs` (Swagger) ou `http://localhost:8000/redoc`.

### Frontend (Next.js)
1. Acesse `ifood-dashboard/frontend`.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure a URL do backend em `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

A aplicação estará disponível em `http://localhost:3000`.

---

## 📂 Estrutura do Projeto

```
ifood-dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py          # Ponto de entrada da API FastAPI
│   │   ├── database.py      # Conexão e sessão com o banco
│   │   ├── models.py        # Definições ORM
│   │   └── schema.sql       # Script de criação do banco
│   └── requirements.txt
└── frontend/
    ├── public/              # Arquivos estáticos
    ├── src/
    │   ├── api/             # Comunicação com o backend
    │   ├── assets/          # Tipos e dados estáticos
    │   ├── components/      # Componentes reutilizáveis
    │   │   ├── Dashboard/
    │   │   ├── Graficos/
    │   │   └── Layout/
    │   ├── context/         # Gerenciamento de estado
    │   └── app/             # Rotas da aplicação
    └── package.json
```

---

## 📄 Licença

Este projeto é distribuído sob a licença MIT.


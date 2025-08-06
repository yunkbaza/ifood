iFood Dashboard Analítico
Bem-vindo ao iFood Dashboard Analítico, uma ferramenta de visualização de dados desenvolvida para auxiliar gerentes de restaurantes a acompanhar as principais métricas de desempenho de suas operações na plataforma iFood.

O projeto é dividido em dois serviços principais: um backend em Node.js (Express) e um frontend em Next.js (React), que se comunicam para exibir dados em tempo real e de forma interativa.

Tecnologias Utilizadas
Backend
Node.js: Ambiente de execução JavaScript.

Express: Framework web para criar a API REST.

TypeScript: Adiciona tipagem estática para um código mais robusto e fácil de manter.

PostgreSQL: Banco de dados relacional para armazenamento de dados.

pg: Biblioteca para conexão com o banco de dados PostgreSQL.

jsonwebtoken: Utilizado para autenticação de usuários via JWT.

bcrypt: Para hash seguro de senhas.

node-cron: Gerencia um job periódico para manter as métricas atualizadas.

Frontend
Next.js: Framework React para renderização do lado do servidor e otimizações de performance.

React: Biblioteca para construção da interface de usuário.

TypeScript: Garante a tipagem e a consistência dos componentes.

Tailwind CSS: Framework de estilização utilitário para um design rápido e moderno.

Recharts: Biblioteca para renderização de gráficos e visualização de dados.

Axios: Cliente HTTP para se comunicar com a API do backend.

Funcionalidades
O dashboard oferece as seguintes funcionalidades principais:

Autenticação de Usuário: Sistema de login seguro para acesso ao painel de controle.

Painel de Métricas (Dashboard): Exibição de KPIs (Key Performance Indicators) essenciais, como:

Faturamento Total

Total de Pedidos

Pedidos Entregues e Cancelados

Gráficos Interativos:

Gráfico de Pedidos por Status: Mostra a distribuição dos pedidos por status (entregue, cancelado, em andamento).

Gráfico de Faturamento Mensal: Exibe a evolução do faturamento ao longo do tempo.

Gráfico de Pedidos Semanais: Acompanha a tendência do número de pedidos por semana.

Gráfico de Avaliações Médias: Compara a média de notas de cada unidade.

Filtros de Dados: Permite filtrar todas as métricas por um intervalo de data personalizado.

Job de Atualização Automática: Um serviço em segundo plano que simula a ingestão e o processamento diário de dados, garantindo que o dashboard esteja sempre atualizado.

Configuração e Instalação
Para configurar e executar o projeto, siga os passos abaixo. Certifique-se de ter o Node.js, npm/yarn e o PostgreSQL instalados.

1. Backend
Navegue até a pasta backend.

Instale as dependências:

Bash

npm install
Crie um arquivo .env na pasta backend com as seguintes variáveis de ambiente:

PORT=3333
DATABASE_URL="postgres://usuario:senha@localhost:5432/nomedobanco"
JWT_SECRET="sua_chave_secreta_jwt"
Substitua os valores de DATABASE_URL com as credenciais do seu banco de dados.

Execute as migrations do banco de dados (assumindo que você tenha um script para isso).

Inicie o servidor de desenvolvimento:

Bash

npm run dev
2. Frontend
Navegue até a pasta frontend.

Instale as dependências:

Bash

npm install
Crie um arquivo .env.local na pasta frontend com a URL do seu backend:

NEXT_PUBLIC_API_URL=http://localhost:3333
Inicie o servidor de desenvolvimento:

Bash

npm run dev
Após seguir esses passos, a aplicação estará disponível em http://localhost:3000.

Estrutura do Projeto
O projeto é organizado da seguinte forma:

ifood-dashboard/
├── backend/
│   ├── src/
│   │   ├── controllers/         # Lógica dos endpoints da API
│   │   ├── jobs/                # Tarefas agendadas (job de atualização)
│   │   ├── middlewares/         # Middlewares (autenticação)
│   │   ├── routes/              # Definição das rotas da API
│   │   └── utils/               # Funções utilitárias
│   └── .env                     # Variáveis de ambiente
├── frontend/
│   ├── public/                  # Arquivos estáticos
│   ├── src/
│   │   ├── api/                 # Funções para chamadas à API
│   │   ├── assets/              # Tipos de dados
│   │   ├── components/
│   │   │   ├── Graficos/        # Componentes de gráficos
│   │   │   └── Layout/          # Componentes de layout
│   │   ├── context/             # Gerenciamento de estado (autenticação)
│   │   ├── pages/               # Páginas do projeto
│   │   └── app/                 # Arquivos de roteamento Next.js
│   └── .env.local               # Variáveis de ambiente
└── README.md
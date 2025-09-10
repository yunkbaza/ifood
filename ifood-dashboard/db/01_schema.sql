-- =========================================================
--  iFood Dashboard - Schema + Seeds (com inserts extras)
-- =========================================================

BEGIN;

-- 1) Limpeza ------------------------------------------------
DROP VIEW  IF EXISTS faturamento_mensal_unidades, pedidos_por_status, motivos_cancelamento CASCADE;
DROP TABLE IF EXISTS feedbacks, itens_pedido, pedidos, metricas_diarias, produtos, regioes_entrega, clientes, unidades, login CASCADE;

-- 2) Tabelas ----------------------------------------------

CREATE TABLE unidades (
  id            SERIAL PRIMARY KEY,
  nome          VARCHAR(100) NOT NULL UNIQUE,
  cidade        VARCHAR(100),
  estado        VARCHAR(2),
  data_abertura DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clientes (
  id            SERIAL PRIMARY KEY,
  nome          VARCHAR(100),
  email         VARCHAR(100),
  telefone      VARCHAR(20),
  data_cadastro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE regioes_entrega (
  id      SERIAL PRIMARY KEY,
  bairro  VARCHAR(100),
  cidade  VARCHAR(100),
  estado  VARCHAR(2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_regiao UNIQUE (bairro, cidade, estado)
);

CREATE TABLE produtos (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(100) NOT NULL,
  preco     NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
  categoria VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_produto_nome UNIQUE (nome)
);

CREATE TABLE pedidos (
  id                 SERIAL PRIMARY KEY,
  id_cliente         INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
  id_unidade         INTEGER NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  id_regiao_entrega  INTEGER REFERENCES regioes_entrega(id) ON DELETE SET NULL,
  data_pedido        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status             VARCHAR(50)  NOT NULL CHECK (status IN ('Entregue', 'Cancelado', 'Em andamento', 'Saiu para entrega')),
  valor_total        NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  motivo_cancelamento VARCHAR(50) CHECK (motivo_cancelamento IN ('Cliente não atendeu', 'Endereço incorreto', 'Pedido duplicado', 'Falta de produto', 'Outro')),
  origem_cancelamento VARCHAR(20) CHECK (origem_cancelamento IN ('cliente', 'loja', 'entregador', 'ifood', 'sistema', 'outro')),
  data_aceite        TIMESTAMPTZ,
  data_saida_entrega TIMESTAMPTZ,
  data_entrega       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE itens_pedido (
  id             SERIAL PRIMARY KEY,
  id_pedido      INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  id_produto     INTEGER NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade     INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario NUMERIC(10,2) NOT NULL CHECK (preco_unitario >= 0),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_item_por_produto UNIQUE (id_pedido, id_produto)
);

CREATE TABLE feedbacks (
  id            SERIAL PRIMARY KEY,
  id_pedido     INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  nota          INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario    TEXT,
  tipo_feedback VARCHAR(20) CHECK (tipo_feedback IN ('Elogio', 'Reclamação', 'Sugestão')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_feedback_por_pedido UNIQUE (id_pedido)
);

CREATE TABLE metricas_diarias (
  id                SERIAL PRIMARY KEY,
  id_unidade        INTEGER NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  data_referencia   DATE NOT NULL,
  total_faturamento NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_pedidos     INTEGER NOT NULL DEFAULT 0,
  total_cancelamentos INTEGER NOT NULL DEFAULT 0,
  media_nota        NUMERIC(4,2) NOT NULL DEFAULT 0.00,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_unidade, data_referencia)
);

CREATE TABLE login (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  id_unidade  INTEGER REFERENCES unidades(id) ON DELETE SET NULL,
  role        VARCHAR(20) NOT NULL DEFAULT 'user',
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) Triggers de updated_at -------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_upd_unidades        BEFORE UPDATE ON unidades        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_upd_clientes        BEFORE UPDATE ON clientes        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_upd_regioes         BEFORE UPDATE ON regioes_entrega FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_upd_produtos        BEFORE UPDATE ON produtos        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_upd_pedidos         BEFORE UPDATE ON pedidos         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_upd_itens           BEFORE UPDATE ON itens_pedido    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_upd_feedbacks       BEFORE UPDATE ON feedbacks       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_upd_metricas        BEFORE UPDATE ON metricas_diarias FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_upd_login           BEFORE UPDATE ON login           FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4) Índices alinhados ao app ------------------------------
CREATE INDEX idx_pedidos_unidade_data   ON pedidos (id_unidade, data_pedido);
CREATE INDEX idx_pedidos_unidade_status ON pedidos (id_unidade, status);
CREATE INDEX idx_pedidos_cliente        ON pedidos (id_cliente);
CREATE INDEX idx_pedidos_data           ON pedidos (data_pedido);
CREATE INDEX idx_itens_pedido_pedido    ON itens_pedido (id_pedido, id_produto);
CREATE INDEX idx_itens_pedido_produto   ON itens_pedido (id_produto);
CREATE INDEX idx_feedbacks_pedido       ON feedbacks (id_pedido);
CREATE INDEX idx_feedbacks_nota         ON feedbacks (nota);
CREATE INDEX idx_metricas_unid_data     ON metricas_diarias (id_unidade, data_referencia);
CREATE INDEX idx_login_email            ON login (LOWER(email));

-- 5) Seeds -------------------------------------------------

-- Unidades
INSERT INTO unidades (nome, cidade, estado, data_abertura) VALUES
('iFood Cangaíba', 'São Paulo', 'SP', '2022-03-10'),
('iFood Morumbi', 'São Paulo', 'SP', '2021-11-22'),
('iFood Bangu', 'Rio de Janeiro', 'RJ', '2023-01-17'),
('iFood Campinas', 'Campinas', 'SP', '2020-06-01'),
('iFood Mineiro', 'Belo Horizonte', 'MG', '2021-08-25'),
('iFood Pinheiros', 'São Paulo', 'SP', '2022-01-10'),
('iFood Moema', 'São Paulo', 'SP', '2021-08-15'),
('iFood Centro RJ', 'Rio de Janeiro', 'RJ', '2023-03-20'),
('iFood Savassi', 'Belo Horizonte', 'MG', '2022-06-05'),
('iFood Aldeota', 'Fortaleza', 'CE', '2023-01-12');

-- Clientes
INSERT INTO clientes (nome, email, telefone, data_cadastro) VALUES
('Eduardo Pires',   'eduardo.pires@email.com',   '(11) 92345-1234', '2024-05-20 10:00:00'),
('Marina Costa',    'marina.costa@email.com',    '(21) 93211-6789', '2024-06-01 11:30:00'),
('Lucas Rocha',     'lucas.rocha@email.com',     '(31) 99876-1122', '2024-06-02 15:00:00'),
('Fernanda Alves',  'fernanda.a@email.com',      '(11) 97754-0033', '2024-06-03 18:00:00'),
('Bruno Lima',      'bruno.lima@email.com',      '(19) 98654-5543', '2024-06-10 12:00:00'),
('Aline Menezes',   'aline.menezes@email.com',   '(11) 99988-4455', '2024-06-15 19:20:00'),
('Tiago Souza',     'tiago.souza@email.com',     '(11) 91123-3322', '2024-06-20 20:00:00'),
('Juliana Dias',    'juliana.dias@email.com',    '(21) 93456-7711', '2024-07-01 09:00:00'),
('Rafael Martins',  'rafael.martins@email.com',  '(85) 98877-6655', '2024-07-05 14:00:00'),
('Camila Santos',   'camila.santos@email.com',   '(31) 95544-3322', '2024-07-12 22:00:00'),
('Ricardo Almeida', 'ricardo.a@email.com',       '(11) 98888-1111', '2024-07-18 10:30:00'),
('Beatriz Gomes',   'beatriz.gomes@email.com',   '(21) 97777-2222', '2024-07-25 16:45:00'),
('Felipe Barros',   'felipe.b@email.com',        '(31) 96666-3333', '2024-08-02 08:00:00'),
('Larissa Cunha',   'larissa.c@email.com',       '(85) 95555-4444', '2024-08-08 11:00:00'),
('Vinicius Andrade','vinicius.a@email.com',      '(19) 94444-5555', '2024-08-15 13:20:00');

-- Produtos
INSERT INTO produtos (nome, preco, categoria) VALUES
('Hambúrguer Artesanal', 25.50, 'Lanches'),
('Pizza Margherita',     38.00, 'Pizzas'),
('Refrigerante Lata',     6.50, 'Bebidas'),
('Suco Natural de Laranja', 9.50, 'Bebidas'),
('Salada Caesar com Frango', 22.00, 'Saladas'),
('Batata Frita Grande',  15.00, 'Acompanhamentos'),
('Milkshake Chocolate',  16.00, 'Sobremesas'),
('Pudim de Leite',       10.00, 'Sobremesas'),
('Pizza Pepperoni',      42.00, 'Pizzas'),
('Água Mineral',          4.00, 'Bebidas');

-- Login (hash exemplo; troque via app)
INSERT INTO login (name, email, password_hash, id_unidade) VALUES
('Gerente Cangaíba', 'gerente.cangaiba@email.com', '$2b$12$Y.3uL7A8z.P9yMnp2Y2A/e.m2w3J6a.8j.6B7.J9g.9j.8k.7l.6m', 1),
('Gerente Morumbi',  'gerente.morumbi@email.com',  '$2b$12$Y.3uL7A8z.P9yMnp2Y2A/e.m2w3J6a.8j.6B7.J9g.9j.8k.7l.6m', 2),
('Gerente Bangu',    'gerente.bangu@email.com',    '$2b$12$Y.3uL7A8z.P9yMnp2Y2A/e.m2w3J6a.8j.6B7.J9g.9j.8k.7l.6m', 3),
('Gerente Campinas', 'gerente.campinas@email.com', '$2b$12$Y.3uL7A8z.P9yMnp2Y2A/e.m2w3J6a.8j.6B7.J9g.9j.8k.7l.6m', 4),
('Gerente Mineiro',  'gerente.mineiro@email.com',  '$2b$12$Y.3uL7A8z.P9yMnp2Y2A/e.m2w3J6a.8j.6B7.J9g.9j.8k.7l.6m', 5);

-- Pedidos / Itens / Feedbacks (IDs 1…19) ------------------
-- JUNHO 2024
INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (1, 1, '2024-06-05 19:30:00', '2024-06-05 19:32:00', '2024-06-05 19:50:00', '2024-06-05 20:10:00', 'Entregue', 40.50);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES
(1, 1, 1, 25.50), (1, 6, 1, 15.00);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (1, 5, 'Hambúrguer delicioso e entrega rápida!', 'Elogio');

INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, status, valor_total, motivo_cancelamento, origem_cancelamento)
VALUES (2, 2, '2024-06-06 20:00:00', '2024-06-06 20:03:00', 'Cancelado', 46.00, 'Falta de produto', 'loja');
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (2, 9, 1, 42.00), (2, 10, 1, 4.00);

INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (3, 3, '2024-06-10 12:00:00', '2024-06-10 12:01:00', '2024-06-10 12:15:00', '2024-06-10 12:35:00', 'Entregue', 28.50);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (3, 5, 1, 22.00), (3, 3, 1, 6.50);

INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, status, valor_total)
VALUES (4, 4, '2024-06-12 21:00:00', '2024-06-12 21:05:00', '2024-06-12 21:25:00', 'Saiu para entrega', 53.00);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (4, 2, 1, 38.00), (4, 7, 1, 15.00);

INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (5, 5, '2024-06-20 18:45:00', '2024-06-20 18:47:00', '2024-06-20 19:00:00', '2024-06-20 19:25:00', 'Entregue', 35.00);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (5, 1, 1, 25.50), (5, 4, 1, 9.50);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (5, 3, 'O sumo veio um pouco quente.', 'Reclamação');

INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (1, 2, '2024-06-25 15:00:00', '2024-06-25 15:02:00', '2024-06-25 15:20:00', '2024-06-25 15:45:00', 'Entregue', 57.00);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (6, 9, 1, 42.00), (6, 6, 1, 15.00);

-- JULHO 2024
INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (6, 1, '2024-07-01 13:00:00', '2024-07-01 13:03:00', '2024-07-01 13:20:00', '2024-07-01 13:40:00', 'Entregue', 63.50);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (7, 2, 1, 38.00), (7, 1, 1, 25.50);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (7, 5, 'Perfeito!', 'Elogio');

INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (7, 2, '2024-07-05 22:00:00', '2024-07-05 22:02:00', '2024-07-05 22:20:00', '2024-07-05 22:45:00', 'Entregue', 52.00);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (8, 9, 1, 42.00), (8, 8, 1, 10.00);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (8, 4, 'Poderia ter mais opções de sobremesa.', 'Sugestão');

INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, status, valor_total)
VALUES (8, 3, '2024-07-15 19:00:00', '2024-07-15 19:01:00', 'Em andamento', 25.50);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (9, 1, 1, 25.50);

INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, status, valor_total, motivo_cancelamento, origem_cancelamento)
VALUES (9, 4, '2024-07-22 12:30:00', '2024-07-22 12:35:00', 'Cancelado', 22.00, 'Endereço incorreto', 'cliente');
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (10, 5, 1, 22.00);

INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (2, 1, '2024-07-28 20:00:00', '2024-07-28 20:02:00', '2024-07-28 20:20:00', '2024-07-28 20:40:00', 'Entregue', 32.00);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (11, 1, 1, 25.50), (11, 3, 1, 6.50);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (11, 4, 'Tudo certo.', 'Elogio');

-- AGOSTO 2024
INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (10, 5, '2024-08-01 20:10:00', '2024-08-01 20:11:00', '2024-08-01 20:30:00', '2024-08-01 20:50:00', 'Entregue', 84.00);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (12, 9, 2, 42.00);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (12, 5, 'A melhor pizza da cidade!', 'Elogio');

INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (1, 2, '2024-08-03 14:00:00', '2024-08-03 14:02:00', '2024-08-03 14:15:00', '2024-08-03 14:40:00', 'Entregue', 40.50);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (13, 1, 1, 25.50), (13, 6, 1, 15.00);

INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (3, 4, '2024-08-10 21:30:00', '2024-08-10 21:33:00', '2024-08-10 21:55:00', '2024-08-10 22:15:00', 'Entregue', 26.00);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (14, 7, 1, 16.00), (14, 8, 1, 10.00);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (14, 2, 'O milkshake chegou derretido.', 'Reclamação');

INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (11, 1, '2024-08-11 19:00:00', '2024-08-11 19:02:00', '2024-08-11 19:20:00', '2024-08-11 19:45:00', 'Entregue', 48.00);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (15, 2, 1, 38.00), (15, 8, 1, 10.00);

INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (12, 2, '2024-08-12 20:30:00', '2024-08-12 20:31:00', '2024-08-12 20:50:00', '2024-08-12 21:10:00', 'Entregue', 41.50);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (16, 1, 1, 25.50), (16, 7, 1, 16.00);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (16, 5, 'Sempre impecável.', 'Elogio');

INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (13, 3, '2024-08-15 18:00:00', '2024-08-15 18:04:00', '2024-08-15 18:25:00', '2024-08-15 18:50:00', 'Entregue', 28.50);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (17, 5, 1, 22.00), (17, 3, 1, 6.50);

INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (14, 4, '2024-08-20 12:10:00', '2024-08-20 12:11:00', '2024-08-20 12:25:00', '2024-08-20 12:45:00', 'Entregue', 67.50);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (18, 1, 1, 25.50), (18, 9, 1, 42.00);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (18, 1, 'Pizza chegou fria e amassada. Péssimo.', 'Reclamação');

INSERT INTO pedidos (id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (15, 5, '2024-08-21 19:40:00', '2024-08-21 19:42:00', '2024-08-21 20:00:00', '2024-08-21 20:20:00', 'Entregue', 13.50);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (19, 4, 1, 9.50), (19, 10, 1, 4.00);

-- 6) VIEWS -------------------------------------------------

CREATE OR REPLACE VIEW faturamento_mensal_unidades AS
SELECT
  u.nome AS unidade,
  DATE_TRUNC('month', p.data_pedido) AS mes,
  SUM(p.valor_total) AS faturamento_total
FROM pedidos p
JOIN unidades u ON u.id = p.id_unidade
WHERE p.status = 'Entregue'
GROUP BY u.nome, DATE_TRUNC('month', p.data_pedido)
ORDER BY mes;

CREATE OR REPLACE VIEW pedidos_por_status AS
SELECT status, COUNT(*) AS total
FROM pedidos
GROUP BY status;

CREATE OR REPLACE VIEW motivos_cancelamento AS
SELECT motivo_cancelamento, COUNT(*) AS total_cancelados
FROM pedidos
WHERE status = 'Cancelado' AND motivo_cancelamento IS NOT NULL
GROUP BY motivo_cancelamento
ORDER BY total_cancelados DESC;

-- =========================================================
--  INSERÇÕES EXTRAS: IDs 20…39 (set/2024 a jan/2025)
-- =========================================================

-- SETEMBRO 2024
INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (20, 2, 1, '2024-09-02 12:05:00', '2024-09-02 12:07:00', '2024-09-02 12:25:00', '2024-09-02 12:45:00', 'Entregue', 47.00);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES
(20, 1, 1, 25.50), (20, 6, 1, 15.00), (20, 3, 1, 6.50);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (20, 5, 'Entrega rápida e tudo quentinho!', 'Elogio');

INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, status, valor_total, motivo_cancelamento, origem_cancelamento)
VALUES (21, 5, 2, '2024-09-03 20:10:00', '2024-09-03 20:12:00', 'Cancelado', 42.00, 'Falta de produto', 'loja');
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (21, 9, 1, 42.00);

INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (22, 8, 3, '2024-09-05 18:30:00', '2024-09-05 18:32:00', '2024-09-05 18:50:00', '2024-09-05 19:20:00', 'Entregue', 63.50);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (22, 2, 1, 38.00), (22, 1, 1, 25.50);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (22, 4, 'Muito bom, mas a pizza podia vir mais quente.', 'Sugestão');

INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, status, valor_total)
VALUES (23, 10, 4, '2024-09-07 21:05:00', '2024-09-07 21:07:00', '2024-09-07 21:25:00', 'Saiu para entrega', 31.50);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES
(23, 5, 1, 22.00), (23, 3, 1, 6.50), (23, 10, 1, 4.00);

INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, status, valor_total)
VALUES (24, 11, 5, '2024-09-09 11:50:00', '2024-09-09 11:52:00', 'Em andamento', 25.50);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES
(24, 1, 1, 25.50);

INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (25, 3, 2, '2024-09-12 19:10:00', '2024-09-12 19:13:00', '2024-09-12 19:35:00', '2024-09-12 20:00:00', 'Entregue', 99.00);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES
(25, 9, 2, 42.00), (25, 10, 3, 4.00), (25, 3, 1, 6.50);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (25, 5, 'Chegou perfeito para dividir com a família.', 'Elogio');

INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, status, valor_total, motivo_cancelamento, origem_cancelamento)
VALUES (26, 12, 3, '2024-09-15 22:30:00', '2024-09-15 22:31:00', 'Cancelado', 25.50, 'Pedido duplicado', 'cliente');
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (26, 1, 1, 25.50);

-- OUTUBRO 2024
INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (27, 7, 1, '2024-10-03 13:15:00', '2024-10-03 13:17:00', '2024-10-03 13:35:00', '2024-10-03 13:55:00', 'Entregue', 59.50);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES
(27, 2, 1, 38.00), (27, 6, 1, 15.00), (27, 3, 1, 6.50);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (27, 4, 'Boa combinação, só o refri veio morno.', 'Sugestão');

INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (28, 4, 2, '2024-10-05 12:00:00', '2024-10-05 12:02:00', '2024-10-05 12:18:00', '2024-10-05 12:40:00', 'Entregue', 58.50);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES
(28, 5, 2, 22.00), (28, 10, 2, 4.00), (28, 3, 1, 6.50);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (28, 5, 'Saladas frescas e entrega pontual.', 'Elogio');

INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, status, valor_total, motivo_cancelamento, origem_cancelamento)
VALUES (29, 9, 4, '2024-10-10 21:10:00', '2024-10-10 21:15:00', 'Cancelado', 38.00, 'Endereço incorreto', 'entregador');
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (29, 2, 1, 38.00);

INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, status, valor_total)
VALUES (30, 13, 5, '2024-10-12 16:05:00', '2024-10-12 16:07:00', 'Em andamento', 26.00);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (30, 7, 1, 16.00), (30, 8, 1, 10.00);

-- NOVEMBRO 2024
INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (31, 2, 1, '2024-11-03 19:20:00', '2024-11-03 19:22:00', '2024-11-03 19:45:00', '2024-11-03 20:10:00', 'Entregue', 143.00);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (31, 9, 2, 42.00), (31, 1, 2, 25.50), (31, 10, 2, 4.00);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (31, 5, 'Pedido grande, chegou tudo perfeito.', 'Elogio');

INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (32, 6, 2, '2024-11-06 12:30:00', '2024-11-06 12:31:00', '2024-11-06 12:45:00', '2024-11-06 13:05:00', 'Entregue', 41.50);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (32, 1, 1, 25.50), (32, 7, 1, 16.00);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (32, 3, 'Demorou um pouco além do esperado.', 'Reclamação');

INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, status, valor_total, motivo_cancelamento, origem_cancelamento)
VALUES (33, 10, 3, '2024-11-10 22:15:00', '2024-11-10 22:16:00', 'Cancelado', 25.50, 'Cliente não atendeu', 'cliente');
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (33, 1, 1, 25.50);

INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, status, valor_total)
VALUES (34, 12, 4, '2024-11-15 18:05:00', '2024-11-15 18:07:00', '2024-11-15 18:25:00', 'Saiu para entrega', 38.00);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (34, 2, 1, 38.00);

-- DEZEMBRO 2024
INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (35, 14, 5, '2024-12-02 21:30:00', '2024-12-02 21:33:00', '2024-12-02 21:50:00', '2024-12-02 22:15:00', 'Entregue', 31.50);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (35, 5, 1, 22.00), (35, 3, 1, 6.50), (35, 10, 1, 4.00);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (35, 4, 'Bom custo-benefício.', 'Sugestão');

INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (36, 15, 2, '2024-12-05 12:10:00', '2024-12-05 12:12:00', '2024-12-05 12:28:00', '2024-12-05 12:50:00', 'Entregue', 40.50);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (36, 1, 1, 25.50), (36, 6, 1, 15.00);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (36, 5, 'Tudo ótimo e rápido!', 'Elogio');

INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, status, valor_total, motivo_cancelamento, origem_cancelamento)
VALUES (37, 6, 1, '2024-12-12 20:00:00', '2024-12-12 20:03:00', 'Cancelado', 22.00, 'Falta de produto', 'ifood');
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (37, 5, 1, 22.00);

INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, status, valor_total)
VALUES (38, 9, 3, '2024-12-18 19:55:00', '2024-12-18 19:56:00', 'Em andamento', 46.00);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (38, 9, 1, 42.00), (38, 10, 1, 4.00);

-- JANEIRO 2025
INSERT INTO pedidos (id, id_cliente, id_unidade, data_pedido, data_aceite, data_saida_entrega, data_entrega, status, valor_total)
VALUES (39, 11, 4, '2025-01-07 13:05:00', '2025-01-07 13:08:00', '2025-01-07 13:25:00', '2025-01-07 13:50:00', 'Entregue', 60.50);
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
VALUES (39, 2, 1, 38.00), (39, 3, 1, 6.50), (39, 7, 1, 16.00);
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
VALUES (39, 2, 'Demorou e chegou frio.', 'Reclamação');

-- 7) Ajuste de SEQUENCES (importante se usamos IDs explícitos)
SELECT setval(pg_get_serial_sequence('pedidos','id'),        (SELECT MAX(id) FROM pedidos));
SELECT setval(pg_get_serial_sequence('itens_pedido','id'),   COALESCE((SELECT MAX(id) FROM itens_pedido), 1));
SELECT setval(pg_get_serial_sequence('feedbacks','id'),      COALESCE((SELECT MAX(id) FROM feedbacks), 1));
SELECT setval(pg_get_serial_sequence('clientes','id'),       (SELECT MAX(id) FROM clientes));
SELECT setval(pg_get_serial_sequence('unidades','id'),       (SELECT MAX(id) FROM unidades));
SELECT setval(pg_get_serial_sequence('produtos','id'),       (SELECT MAX(id) FROM produtos));
SELECT setval(pg_get_serial_sequence('login','id'),          (SELECT MAX(id) FROM login));
SELECT setval(pg_get_serial_sequence('regioes_entrega','id'), COALESCE((SELECT MAX(id) FROM regioes_entrega), 1));

-- 8) Otimização básica pós-carga ---------------------------
ANALYZE;

COMMIT;


UPDATE login SET password_hash = '$2b$12$Q6day627TEcbaxyA61KfPuANTeq3ZX9SkzriCHNLg31e1P4EQujz.'
WHERE email = 'gerente.morumbi@email.com';


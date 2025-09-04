-- #################################################
-- #           1. LIMPEZA DO BANCO DE DADOS        #
-- #################################################
-- Remove todas as views e tabelas existentes para uma implementaÃƒÂ§ÃƒÂ£o limpa.
-- A ordem ÃƒÂ© importante para evitar erros de dependÃƒÂªncia (tabelas com chaves estrangeiras).

-- Remove todas as views existentes.
DROP VIEW IF EXISTS faturamento_mensal_unidades, pedidos_por_status, motivos_cancelamento;

-- Remove todas as tabelas. O uso de CASCADE garante que dependÃƒÂªncias (chaves estrangeiras) tambÃƒÂ©m sejam removidas.
DROP TABLE IF EXISTS feedbacks, itens_pedido, pedidos, metricas_diarias, produtos, regioes_entrega, clientes, unidades CASCADE;

-- #################################################
-- #           2. CRIAÃƒâ€¡ÃƒÆ’O DAS TABELAS              #
-- #################################################
-- A modelagem de dados original foi mantida.

CREATE TABLE unidades (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  data_abertura DATE
);

CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100),
  email VARCHAR(100),
  telefone VARCHAR(20)
);

CREATE TABLE regioes_entrega (
  id SERIAL PRIMARY KEY,
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2)
);

CREATE TABLE produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100),
  preco DECIMAL(10,2),
  categoria VARCHAR(50)
);

CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  id_cliente INTEGER REFERENCES clientes(id),
  id_unidade INTEGER REFERENCES unidades(id),
  id_regiao_entrega INTEGER REFERENCES regioes_entrega(id),
  data_pedido TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) CHECK (status IN ('Entregue', 'Cancelado', 'Em andamento', 'Saiu para entrega')),
  valor_total DECIMAL(10,2),
  motivo_cancelamento TEXT,
  data_entrega TIMESTAMP
);

CREATE TABLE itens_pedido (
  id SERIAL PRIMARY KEY,
  id_pedido INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
  id_produto INTEGER REFERENCES produtos(id),
  quantidade INTEGER,
  preco_unitario DECIMAL(10,2)
);

CREATE TABLE feedbacks (
  id SERIAL PRIMARY KEY,
  id_pedido INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
  nota INTEGER CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  tipo_feedback VARCHAR(20) CHECK (tipo_feedback IN ('Elogio', 'ReclamaÃƒÂ§ÃƒÂ£o', 'SugestÃƒÂ£o'))
);

CREATE TABLE metricas_diarias (
    id SERIAL PRIMARY KEY,
    id_unidade INTEGER REFERENCES unidades(id) ON DELETE CASCADE,
    data_referencia DATE NOT NULL,
    total_faturamento DECIMAL(10, 2) DEFAULT 0.00,
    total_pedidos INTEGER DEFAULT 0,
    total_cancelamentos INTEGER DEFAULT 0,
    media_nota DECIMAL(3, 2) DEFAULT 0.00,
    media_tempo_entrega INTERVAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_unidade, data_referencia)
);

CREATE TABLE login(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE login ADD COLUMN id_unidade INTEGER REFERENCES unidades(id);
SELECT id, nome FROM unidades;

INSERT INTO login (name, email, password_hash, id_unidade) VALUES
('Allan', 'allan@ifood.com.br', '$2b$12$PLaihNwBkSfTvOy4KEylLOe5VDK5kNL.jHIJEbsIg4aL7r3jWByde', 1);

-- #################################################
-- #           3. INSERÃƒâ€¡ÃƒÆ’O DE DADOS                #
-- #################################################

-- Comandos INSERT originais
INSERT INTO unidades (nome, cidade, estado, data_abertura) VALUES
('iFood CangaÃƒÂ­ba', 'SÃƒÂ£o Paulo', 'SP', '2022-03-10'),
('iFood Morumbi', 'SÃƒÂ£o Paulo', 'SP', '2021-11-22'),
('iFood Bangu', 'Rio de Janeiro', 'RJ', '2023-01-17'),
('iFood Campinas', 'Campinas', 'SP', '2020-06-01'),
('iFood Mineiro', 'Belo Horizonte', 'MG', '2021-08-25'),
('iFood Pinheiros', 'SÃƒÂ£o Paulo', 'SP', '2022-01-10'),
('iFood Moema', 'SÃƒÂ£o Paulo', 'SP', '2021-08-15'),
('iFood Centro', 'Rio de Janeiro', 'RJ', '2023-03-20'),
('iFood Savassi', 'Belo Horizonte', 'MG', '2022-06-05'),
('iFood Aldeota', 'Fortaleza', 'CE', '2023-01-12'),
('iFood Express SÃƒÂ£o Paulo', 'SÃƒÂ£o Paulo', 'SP', '2022-03-15'),
('iFood Prime Campinas', 'Campinas', 'SP', '2023-01-10'),
('iFood Gourmet Salvador', 'Salvador', 'BA', '2021-07-23'),
('iFood Fast Curitiba', 'Curitiba', 'PR', '2022-11-05'),
('iFood Premium Recife', 'Recife', 'PE', '2020-08-17');

INSERT INTO clientes (nome, email, telefone) VALUES
('Eduardo Pires', 'eduardo.pires@gmail.com', '(11) 92345-1234'),
('Marina Costa', 'marina.costa@gmail.com', '(21) 93211-6789'),
('Lucas Rocha', 'lucas.rocha@yahoo.com', '(31) 99876-1122'),
('Fernanda Alves', 'fernanda.a@hotmail.com', '(11) 97754-0033'),
('Bruno Lima', 'bruno.lima@gmail.com', '(19) 98654-5543'),
('Aline Menezes', 'aline.menezes@gmail.com', '(11) 99988-4455'),
('Tiago Souza', 'tiago.souza@bol.com.br', '(11) 91123-3322'),
('Juliana Dias', 'juliana.dias@gmail.com', '(21) 93456-7711'),
('JoÃƒÂ£o Silva', 'joao@email.com', '(11) 99999-9999'),
('Maria Oliveira', 'maria@email.com', '(21) 98888-8888'),
('Carlos Souza', 'carlos@email.com', '3197777-7777'),
('Ana Lima', 'ana@email.com', '(85) 96666-6666'),
('Bruna Rocha', 'bruna@email.com', '(11) 95555-5555');

INSERT INTO regioes_entrega (bairro, cidade, estado) VALUES
('Centro', 'SÃƒÂ£o Paulo', 'SP'),
('Copacabana', 'Rio de Janeiro', 'RJ'),
('Savassi', 'Belo Horizonte', 'MG'),
('Jardins', 'SÃƒÂ£o Paulo', 'SP'),
('Botafogo', 'Rio de Janeiro', 'RJ'),
('Barro Preto', 'Belo Horizonte', 'MG'),
('Pinheiros', 'SÃƒÂ£o Paulo', 'SP'),
('Bangu', 'Rio de Janeiro', 'RJ'),
('Mineiro', 'Belo Horizonte', 'MG'),
('Aldeota', 'Fortaleza', 'CE'),
('Moema', 'SÃƒÂ£o Paulo', 'SP');

INSERT INTO produtos (nome, preco, categoria) VALUES
('HambÃƒÂºrguer Artesanal', 25.00, 'Lanches'),
('Pizza Margherita', 38.50, 'Pizzas'),
('Refrigerante Lata', 6.00, 'Bebidas'),
('Suco Natural', 9.50, 'Bebidas'),
('Salada Caesar', 18.00, 'Saladas'),
('Batata Frita', 12.00, 'Acompanhamentos'),
('Milkshake Chocolate', 15.00, 'Sobremesas'),
('Pudim', 10.00, 'Sobremesas');

-- Dados de exemplo para os pedidos
INSERT INTO pedidos (id_cliente, id_unidade, id_regiao_entrega, data_pedido, status, valor_total, motivo_cancelamento) VALUES
(1, 1, 1, '2024-06-01 12:34:56', 'Entregue', 50.00, NULL),
(2, 2, 2, '2024-06-02 18:22:33', 'Cancelado', 30.00, 'Cliente nÃƒÂ£o atendeu'),
(3, 1, 4, '2024-06-03 20:15:10', 'Entregue', 45.00, NULL),
(4, 3, 3, '2024-06-04 13:00:00', 'Saiu para entrega', 60.00, NULL),
(5, 4, 6, '2024-06-05 21:10:05', 'Em andamento', 25.00, NULL),
(6, 1, 1, '2024-06-06 19:45:20', 'Cancelado', 80.00, 'EndereÃƒÂ§o incorreto'),
(7, 2, 5, '2024-06-07 22:30:00', 'Entregue', 40.00, NULL),
(8, 5, 3, '2024-06-08 11:20:45', 'Entregue', 22.00, NULL);

-- Dados de exemplo para os itens de pedidos
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES
(1, 1, 2, 25.00),
(2, 3, 5, 6.00),
(3, 4, 3, 9.50),
(4, 2, 1, 38.50),
(4, 6, 1, 12.00),
(5, 5, 1, 18.00),
(5, 3, 1, 6.00),
(6, 1, 1, 25.00),
(6, 2, 1, 38.50),
(6, 6, 1, 12.00),
(7, 7, 2, 15.00),
(7, 8, 1, 10.00),
(8, 4, 2, 9.50);

-- Dados de exemplo para feedbacks
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback) VALUES
(1, 5, 'Entrega rÃƒÂ¡pida e tudo quentinho!', 'Elogio'),
(3, 4, 'Comida boa, mas poderia vir mais quente', 'SugestÃƒÂ£o'),
(7, 3, 'Demorou mais do que o previsto', 'ReclamaÃƒÂ§ÃƒÂ£o'),
(8, 5, 'Excelente como sempre!', 'Elogio'),
(4, 4, 'Acompanhamento delicioso, entrega um pouco atrasada', 'SugestÃƒÂ£o');

-- #################################################

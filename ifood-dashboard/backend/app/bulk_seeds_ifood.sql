
-- =========================================================
--  iFood Dashboard - Bulk Seeds (synthetic data generator)
--  Compatível com o seu schema atual (PostgreSQL)
--  Rodar APÓS criar o schema base que você enviou.
--  Seguro para rodar múltiplas vezes (usa UPSERTs/ON CONFLICT quando possível).
-- =========================================================

BEGIN;

-- ---------------------------------------------------------
-- 0) PARÂMETROS AJUSTÁVEIS
-- ---------------------------------------------------------
-- Quantos clientes extras criar
DO $$
DECLARE
    v_clientes_alvo  int := 1200;   -- total desejado de clientes
    v_produtos_alvo  int := 80;     -- total desejado de produtos
    v_dias_retro     int := 540;    -- quantos dias para trás gerar pedidos (~18 meses)
    v_itens_max      int := 4;      -- itens por pedido (máximo)
    v_prob_feedback  numeric := 0.55; -- % de pedidos entregues com feedback
BEGIN
    -- Guardar em tabela temporária de parâmetros para reuso
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'pg_temp' AND tablename = 'seed_params') THEN
        CREATE TEMP TABLE seed_params AS
        SELECT v_clientes_alvo AS clientes_alvo,
               v_produtos_alvo AS produtos_alvo,
               v_dias_retro   AS dias_retro,
               v_itens_max    AS itens_max,
               v_prob_feedback AS prob_feedback;
    END IF;
END $$;

-- ---------------------------------------------------------
-- 1) REGIÕES DE ENTREGA (seed base)
-- ---------------------------------------------------------
WITH base(bairro, cidade, estado) AS (
    VALUES
      ('Cangaíba','São Paulo','SP'), ('Pinheiros','São Paulo','SP'), ('Moema','São Paulo','SP'),
      ('Morumbi','São Paulo','SP'), ('Centro','Campinas','SP'), ('Savassi','Belo Horizonte','MG'),
      ('Aldeota','Fortaleza','CE'), ('Bangu','Rio de Janeiro','RJ'), ('Centro','Rio de Janeiro','RJ'),
      ('Barra','Rio de Janeiro','RJ'), ('Pampulha','Belo Horizonte','MG'), ('Ipiranga','São Paulo','SP'),
      ('Butantã','São Paulo','SP'), ('Jardins','São Paulo','SP'), ('Vila Mariana','São Paulo','SP'),
      ('Vila Madalena','São Paulo','SP'), ('Tatuapé','São Paulo','SP'), ('Paulista','São Paulo','SP'),
      ('Funcionários','Belo Horizonte','MG'), ('Meireles','Fortaleza','CE')
)
INSERT INTO regioes_entrega (bairro, cidade, estado)
SELECT b.bairro, b.cidade, b.estado
FROM base b
ON CONFLICT (bairro, cidade, estado) DO NOTHING;

-- ---------------------------------------------------------
-- 2) CLIENTES (sintéticos) até ~ N total
-- ---------------------------------------------------------
WITH params AS (SELECT clientes_alvo FROM seed_params),
     cur AS (SELECT COUNT(*) AS qtd FROM clientes),
     need AS (
       SELECT GREATEST(0, p.clientes_alvo - c.qtd) AS faltar
       FROM params p CROSS JOIN cur c
     ),
     novos AS (
       SELECT
         ('Cliente ' || gs)::varchar(100) AS nome,
         ('cliente' || gs || '@email.com')::varchar(100) AS email,
         ('(11) 9' || lpad((100000 + (random()*899999)::int)::text, 6, '0'))::varchar(20) AS telefone,
         NOW() - (random() * interval '540 days') AS data_cadastro
       FROM generate_series(1, (SELECT faltar FROM need)) gs
     )
INSERT INTO clientes (nome, email, telefone, data_cadastro)
SELECT nome, email, telefone, data_cadastro FROM novos
ON CONFLICT (email) DO NOTHING;

-- ---------------------------------------------------------
-- 3) PRODUTOS (catálogo ampliado) até ~ N total
-- ---------------------------------------------------------
WITH params AS (SELECT produtos_alvo FROM seed_params),
     cur AS (SELECT COUNT(*) AS qtd FROM produtos),
     need AS (SELECT GREATEST(0, p.produtos_alvo - c.qtd) AS faltar FROM params p CROSS JOIN cur c),
     base AS (
       SELECT *
       FROM (VALUES
         ('Hambúrguer Clássico','Lanches'),
         ('Hambúrguer Duplo','Lanches'),
         ('Cheeseburger','Lanches'),
         ('Wrap Frango','Lanches'),
         ('Wrap Veggie','Lanches'),
         ('Pizza 4 Queijos','Pizzas'),
         ('Pizza Calabresa','Pizzas'),
         ('Pizza Frango c/ Catupiry','Pizzas'),
         ('Pizza Portuguesa','Pizzas'),
         ('Pizza Napolitana','Pizzas'),
         ('Água com Gás','Bebidas'),
         ('Refrigerante 2L','Bebidas'),
         ('Cerveja Long Neck','Bebidas'),
         ('Suco Uva','Bebidas'),
         ('Suco Limão','Bebidas'),
         ('Salada Grega','Saladas'),
         ('Salada Tropical','Saladas'),
         ('Yakisoba','Pratos'),
         ('Parmegiana','Pratos'),
         ('Lasanha Bolonhesa','Pratos'),
         ('Batata Frita Média','Acompanhamentos'),
         ('Onion Rings','Acompanhamentos'),
         ('Nuggets 10un','Acompanhamentos'),
         ('Brownie','Sobremesas'),
         ('Tiramisù','Sobremesas'),
         ('Mousse Maracujá','Sobremesas')
       ) AS t(nome, categoria)
     ),
     add_auto AS (
       SELECT
         (b.nome || ' ' || gs)::varchar(100) AS nome,
         b.categoria,
         round((5 + random()*65)::numeric, 2) AS preco
       FROM base b
       CROSS JOIN generate_series(1, 5) gs  -- multiplica catálogo
     ),
     pool AS (
       SELECT * FROM add_auto
       LIMIT (SELECT faltar FROM need)
     )
INSERT INTO produtos (nome, preco, categoria)
SELECT nome, preco, categoria FROM pool
ON CONFLICT (nome) DO NOTHING;

-- ---------------------------------------------------------
-- 4) FUNÇÕES AUXILIARES (randômico com viés)
-- ---------------------------------------------------------
-- Distribuição de status com viés para 'Entregue'
CREATE OR REPLACE FUNCTION fx_status() RETURNS varchar LANGUAGE plpgsql AS $$
DECLARE
    r numeric := random();
BEGIN
    IF r < 0.78 THEN RETURN 'Entregue';
    ELSIF r < 0.86 THEN RETURN 'Cancelado';
    ELSIF r < 0.93 THEN RETURN 'Em andamento';
    ELSE RETURN 'Saiu para entrega';
    END IF;
END; $$;

-- Motivo cancelamento consistente com status=Cancelado
CREATE OR REPLACE FUNCTION fx_motivo_cancel(status_in varchar) RETURNS varchar LANGUAGE plpgsql AS $$
DECLARE
    arr text[] := ARRAY['Cliente não atendeu','Endereço incorreto','Pedido duplicado','Falta de produto','Outro'];
BEGIN
    IF status_in <> 'Cancelado' THEN
        RETURN NULL;
    END IF;
    RETURN arr[1 + floor(random()*array_length(arr,1))::int];
END; $$;

-- Origem cancelamento
CREATE OR REPLACE FUNCTION fx_origem_cancel(status_in varchar) RETURNS varchar LANGUAGE plpgsql AS $$
DECLARE
    arr text[] := ARRAY['cliente','loja','entregador','ifood','sistema','outro'];
BEGIN
    IF status_in <> 'Cancelado' THEN
        RETURN NULL;
    END IF;
    RETURN arr[1 + floor(random()*array_length(arr,1))::int];
END; $$;

-- Nota de 1..5 com leve viés positivo
CREATE OR REPLACE FUNCTION fx_nota() RETURNS int LANGUAGE plpgsql AS $$
DECLARE r numeric := random();
BEGIN
    IF r < 0.08 THEN RETURN 1;
    ELSIF r < 0.18 THEN RETURN 2;
    ELSIF r < 0.36 THEN RETURN 3;
    ELSIF r < 0.68 THEN RETURN 4;
    ELSE RETURN 5;
    END IF;
END; $$;

-- Tipo de feedback coerente com nota
CREATE OR REPLACE FUNCTION fx_tipo_feedback(n int) RETURNS varchar LANGUAGE plpgsql AS $$
BEGIN
    IF n >= 4 THEN RETURN 'Elogio';
    ELSIF n = 3 THEN RETURN 'Sugestão';
    ELSE RETURN 'Reclamação';
    END IF;
END; $$;

-- ---------------------------------------------------------
-- 5) GERAR PEDIDOS por dia/unidade (últimos N dias)
-- ---------------------------------------------------------
WITH params AS (SELECT dias_retro, itens_max, prob_feedback FROM seed_params),
     d AS (
       SELECT (CURRENT_DATE - gs)::date AS dia
       FROM generate_series(0, (SELECT dias_retro FROM params)) gs
     ),
     -- volume alvo por unidade/dia com variação por dia da semana
     cal AS (
       SELECT
         u.id   AS id_unidade,
         d.dia  AS dia,
         -- base por unidade + efeito de fim de semana
         (CASE EXTRACT(DOW FROM d.dia)
            WHEN 0 THEN 1.3  -- domingo
            WHEN 6 THEN 1.25 -- sábado
            WHEN 5 THEN 1.15 -- sexta
            ELSE 0.85        -- dias úteis mais fracos
          END) * (8 + (random()*10)) AS alvo_qtd
       FROM unidades u CROSS JOIN d
     ),
     -- cria N linhas por unidade/dia de acordo com alvo arredondado
     pedidos_base AS (
       SELECT
         id_unidade,
         dia,
         ceil(alvo_qtd)::int AS qtd_pedidos
       FROM cal
     ),
     expand AS (
       SELECT id_unidade, dia
       FROM pedidos_base pb,
            LATERAL generate_series(1, pb.qtd_pedidos)
     ),
     -- escolher cliente e regiao e horário
     pedidos_rand AS (
       SELECT
         e.id_unidade,
         (SELECT id FROM clientes ORDER BY random() LIMIT 1) AS id_cliente,
         (SELECT id FROM regioes_entrega ORDER BY random() LIMIT 1) AS id_regiao,
         -- horário aleatório no dia (entre 10h e 23h)
         (e.dia + time '10:00' + (random() * interval '13 hours'))::timestamptz AT TIME ZONE 'UTC' AS data_pedido,
         fx_status() AS status
       FROM expand e
     ),
     ins AS (
       INSERT INTO pedidos (id_cliente, id_unidade, id_regiao_entrega, data_pedido, status, valor_total)
       SELECT id_cliente, id_unidade, id_regiao, data_pedido, status, 0.00
       FROM pedidos_rand
       RETURNING id, id_unidade, data_pedido, status
     )
-- gerar datas de aceite/saída/entrega coerentes para entregues
UPDATE pedidos p
SET
  data_aceite        = CASE WHEN p.status IN ('Entregue','Cancelado','Em andamento','Saiu para entrega') THEN p.data_pedido + (random()*interval '8 minutes') ELSE NULL END,
  data_saida_entrega = CASE WHEN p.status IN ('Entregue','Saiu para entrega') THEN p.data_pedido + (interval '15 minutes' + random()*interval '25 minutes') ELSE NULL END,
  data_entrega       = CASE WHEN p.status = 'Entregue' THEN p.data_pedido + (interval '35 minutes' + random()*interval '55 minutes') ELSE NULL END,
  motivo_cancelamento = fx_motivo_cancel(p.status),
  origem_cancelamento = fx_origem_cancel(p.status);

-- ---------------------------------------------------------
-- 6) ITENS_Pedido (1..itens_max itens por pedido)
-- ---------------------------------------------------------
WITH params AS (SELECT itens_max FROM seed_params),
     pedidos_alvos AS (
       SELECT id FROM pedidos
       WHERE NOT EXISTS (SELECT 1 FROM itens_pedido ip WHERE ip.id_pedido = pedidos.id)
     ),
     exp AS (
       SELECT id AS id_pedido,
              (1 + floor(random()*(SELECT itens_max FROM params))::int) AS qtd_itens
       FROM pedidos_alvos
     ),
     linhas AS (
       SELECT e.id_pedido,
              (SELECT id FROM produtos ORDER BY random() LIMIT 1) AS id_produto,
              (1 + floor(random()*3)::int) AS quantidade
       FROM exp e, LATERAL generate_series(1, e.qtd_itens)
     )
INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
SELECT
  l.id_pedido,
  l.id_produto,
  l.quantidade,
  pr.preco
FROM linhas l
JOIN produtos pr ON pr.id = l.id_produto
ON CONFLICT (id_pedido, id_produto) DO NOTHING;

-- valor_total = soma itens
WITH tot AS (
  SELECT id_pedido, SUM(quantidade*preco_unitario)::numeric(12,2) AS total
  FROM itens_pedido
  GROUP BY id_pedido
)
UPDATE pedidos p
SET valor_total = t.total
FROM tot t
WHERE p.id = t.id_pedido;

-- ---------------------------------------------------------
-- 7) FEEDBACKS (para parte dos entregues)
-- ---------------------------------------------------------
WITH params AS (SELECT prob_feedback FROM seed_params),
     candidatos AS (
       SELECT id
       FROM pedidos
       WHERE status = 'Entregue'
         AND NOT EXISTS (SELECT 1 FROM feedbacks f WHERE f.id_pedido = pedidos.id)
     ),
     escolhidos AS (
       SELECT id
       FROM candidatos
       WHERE random() < (SELECT prob_feedback FROM params)
     ),
     notas AS (
       SELECT id AS id_pedido, fx_nota() AS nota FROM escolhidos
     )
INSERT INTO feedbacks (id_pedido, nota, comentario, tipo_feedback)
SELECT
  n.id_pedido,
  n.nota,
  CASE
    WHEN n.nota >= 4 THEN 'Ótima experiência.'
    WHEN n.nota = 3 THEN 'Bom, mas há pontos a melhorar.'
    WHEN n.nota = 2 THEN 'Abaixo do esperado.'
    ELSE 'Experiência ruim.'
  END,
  fx_tipo_feedback(n.nota)
FROM notas n
ON CONFLICT (id_pedido) DO NOTHING;

-- ---------------------------------------------------------
-- 8) MÉTRICAS_DIÁRIAS (derivadas dos pedidos/feedbacks)
-- ---------------------------------------------------------
-- Recria tudo baseado no que existe em pedidos/feedbacks
DELETE FROM metricas_diarias;

INSERT INTO metricas_diarias (id_unidade, data_referencia, total_faturamento, total_pedidos, total_cancelamentos, media_nota)
SELECT
  p.id_unidade,
  (p.data_pedido AT TIME ZONE 'UTC')::date AS data_ref,
  SUM(CASE WHEN p.status = 'Entregue' THEN p.valor_total ELSE 0 END)::numeric(12,2) AS total_faturamento,
  COUNT(*) AS total_pedidos,
  SUM(CASE WHEN p.status = 'Cancelado' THEN 1 ELSE 0 END) AS total_cancelamentos,
  COALESCE(AVG(NULLIF(f.nota,0))::numeric(4,2), 0.00) AS media_nota
FROM pedidos p
LEFT JOIN feedbacks f ON f.id_pedido = p.id
GROUP BY p.id_unidade, (p.data_pedido AT TIME ZONE 'UTC')::date;

-- ---------------------------------------------------------
-- 9) VIEWS DE INSIGHTS (extras)
-- ---------------------------------------------------------
CREATE OR REPLACE VIEW v_top_produtos_mes AS
SELECT
  DATE_TRUNC('month', p.data_pedido) AS mes,
  pr.nome,
  SUM(ip.quantidade) AS qtd_vendida,
  SUM(ip.quantidade * ip.preco_unitario)::numeric(12,2) AS faturamento
FROM pedidos p
JOIN itens_pedido ip ON ip.id_pedido = p.id
JOIN produtos pr ON pr.id = ip.id_produto
WHERE p.status = 'Entregue'
GROUP BY mes, pr.nome
ORDER BY mes DESC, faturamento DESC;

CREATE OR REPLACE VIEW v_tempo_medio_entrega AS
SELECT
  u.nome AS unidade,
  AVG(EXTRACT(EPOCH FROM (p.data_entrega - p.data_pedido))/60.0)::numeric(6,2) AS minutos_medio
FROM pedidos p
JOIN unidades u ON u.id = p.id_unidade
WHERE p.status = 'Entregue' AND p.data_entrega IS NOT NULL
GROUP BY u.nome
ORDER BY minutos_medio;

CREATE OR REPLACE VIEW v_cancelamento_por_origem AS
SELECT origem_cancelamento, COUNT(*) AS total
FROM pedidos
WHERE status='Cancelado' AND origem_cancelamento IS NOT NULL
GROUP BY origem_cancelamento
ORDER BY total DESC;

-- ---------------------------------------------------------
-- 10) AJUSTE DE SEQUENCES + ANALYZE
-- ---------------------------------------------------------
SELECT setval(pg_get_serial_sequence('pedidos','id'),        COALESCE((SELECT MAX(id) FROM pedidos), 1));
SELECT setval(pg_get_serial_sequence('itens_pedido','id'),   COALESCE((SELECT MAX(id) FROM itens_pedido), 1));
SELECT setval(pg_get_serial_sequence('feedbacks','id'),      COALESCE((SELECT MAX(id) FROM feedbacks), 1));
SELECT setval(pg_get_serial_sequence('clientes','id'),       COALESCE((SELECT MAX(id) FROM clientes), 1));
SELECT setval(pg_get_serial_sequence('unidades','id'),       COALESCE((SELECT MAX(id) FROM unidades), 1));
SELECT setval(pg_get_serial_sequence('produtos','id'),       COALESCE((SELECT MAX(id) FROM produtos), 1));
SELECT setval(pg_get_serial_sequence('login','id'),          COALESCE((SELECT MAX(id) FROM login), 1));
SELECT setval(pg_get_serial_sequence('regioes_entrega','id'),COALESCE((SELECT MAX(id) FROM regioes_entrega), 1));

ANALYZE;

COMMIT;

-- DICAS DE USO:
-- 1) Execute seu schema base (o que você enviou).
-- 2) Rode ESTE arquivo quantas vezes quiser (ele acrescenta dados e recalcula métricas).
-- 3) Ajuste os parâmetros no bloco 0 para controlar volume/densidade.

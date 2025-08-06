import { pool } from '../lib/db';

// ANOTAÇÃO: Esta é a lógica de simulação que será substituída
// pela integração real com a API do iFood no futuro.
async function simulateDataIngestion() {
  console.log('Simulando a ingestão de dados...');
  // Aqui, você faria as chamadas para a API do iFood e inseriria os dados
  // Por enquanto, vamos simular que a coleta aconteceu com sucesso.
}

// ANOTAÇÃO: Esta função recalcula e atualiza as métricas diárias
// com base nos dados brutos dos pedidos.
async function updateDailyMetrics() {
  console.log('Recalculando e atualizando métricas diárias...');
  
  // Limpa a tabela de métricas para garantir dados atualizados
  await pool.query('TRUNCATE TABLE metricas_diarias RESTART IDENTITY');

  // Insere as métricas agregadas na tabela 'metricas_diarias'
  const query = `
    INSERT INTO metricas_diarias (
      id_unidade,
      data_referencia,
      total_faturamento,
      total_pedidos,
      total_cancelamentos,
      media_nota
    )
    SELECT
      p.id_unidade,
      DATE(p.data_pedido) AS data_referencia,
      SUM(CASE WHEN p.status = 'Entregue' THEN p.valor_total ELSE 0 END) AS total_faturamento,
      COUNT(p.id) AS total_pedidos,
      SUM(CASE WHEN p.status = 'Cancelado' THEN 1 ELSE 0 END) AS total_cancelamentos,
      COALESCE(AVG(f.nota), 0) AS media_nota
    FROM pedidos p
    LEFT JOIN feedbacks f ON f.id_pedido = p.id
    GROUP BY p.id_unidade, DATE(p.data_pedido)
    ON CONFLICT (id_unidade, data_referencia) DO UPDATE
    SET
      total_faturamento = EXCLUDED.total_faturamento,
      total_pedidos = EXCLUDED.total_pedidos,
      total_cancelamentos = EXCLUDED.total_cancelamentos,
      media_nota = EXCLUDED.media_nota;
  `;

  await pool.query(query);
  console.log('Métricas diárias atualizadas com sucesso.');
}

// ANOTAÇÃO: A função principal do job
export const runUpdateJob = async () => {
  console.log('Iniciando job de atualização...');
  try {
    await simulateDataIngestion();
    await updateDailyMetrics();
    console.log('Job de atualização concluído.');
  } catch (error) {
    console.error('Erro no job de atualização:', error);
  }
};
const db = require('../config/db');

// "definida" diz se o aluno já escolheu alguma vez; sem escolha valem os padrões.
function buscarPreferencia(id, callback) {
  db.get(`
    SELECT
      CASE WHEN p.usuario_id IS NULL THEN 0 ELSE 1 END AS definida,
      COALESCE(p.exibir_card, 1) AS exibirCard,
      COALESCE(p.ocultar_numero, 0) AS ocultarNumero
    FROM usuarios u
    LEFT JOIN preferencias_contagem p ON p.usuario_id = u.id
    WHERE u.id = ?
  `, [id], callback);
}

// Cria ou atualiza. Campo não enviado (null) mantém o valor atual.
function salvarPreferencia(id, preferencia, callback) {
  const exibirCard = preferencia.exibirCard === undefined ? null : (preferencia.exibirCard ? 1 : 0);
  const ocultarNumero = preferencia.ocultarNumero === undefined ? null : (preferencia.ocultarNumero ? 1 : 0);

  db.run(`
    INSERT INTO preferencias_contagem (usuario_id, exibir_card, ocultar_numero)
    SELECT u.id, COALESCE(?, 1), COALESCE(?, 0) FROM usuarios u
    WHERE u.id = ?
    ON CONFLICT(usuario_id) DO UPDATE SET
      exibir_card = COALESCE(?, preferencias_contagem.exibir_card),
      ocultar_numero = COALESCE(?, preferencias_contagem.ocultar_numero)
  `, [exibirCard, ocultarNumero, id, exibirCard, ocultarNumero], function (erro) {
    callback(erro, this?.changes || 0);
  });
}

module.exports = { buscarPreferencia, salvarPreferencia };

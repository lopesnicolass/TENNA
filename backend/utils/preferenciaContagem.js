// Valida o corpo do PUT /usuarios/preferencias/contagem.
// Aceita só booleanos de verdade; campos ausentes ficam como estão no banco.
const CAMPOS = ['exibirCard', 'ocultarNumero'];

function normalizarAtualizacao(corpo) {
  if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) {
    throw new TypeError('Envie as preferências em formato JSON.');
  }

  const resultado = {};

  for (const campo of CAMPOS) {
    if (corpo[campo] === undefined) continue;
    if (typeof corpo[campo] !== 'boolean') {
      throw new TypeError(`Informe ${campo} como verdadeiro ou falso.`);
    }
    resultado[campo] = corpo[campo];
  }

  if (Object.keys(resultado).length === 0) {
    throw new TypeError('Informe exibirCard ou ocultarNumero.');
  }

  return resultado;
}

module.exports = { normalizarAtualizacao };

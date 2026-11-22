const { buscarPreferencia, salvarPreferencia } = require('../models/preferenciaContagemModel');
const { normalizarAtualizacao } = require('../utils/preferenciaContagem');

function responderErro(res, erro) {
  console.error('Erro nas preferências da contagem:', erro);
  return res.status(500).json({ mensagem: 'Não foi possível acessar sua preferência.' });
}

function formatar(dados) {
  return {
    definida: Boolean(dados.definida),
    exibirCard: Boolean(dados.exibirCard),
    ocultarNumero: Boolean(dados.ocultarNumero)
  };
}

function buscar(req, res) {
  buscarPreferencia(req.usuario.id, (erro, dados) => {
    if (erro) return responderErro(res, erro);
    if (!dados) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    return res.json(formatar(dados));
  });
}

function atualizar(req, res) {
  let preferencia;
  try {
    preferencia = normalizarAtualizacao(req.body);
  } catch (erro) {
    return res.status(400).json({ mensagem: erro.message });
  }

  salvarPreferencia(req.usuario.id, preferencia, (erro, alteracoes) => {
    if (erro) return responderErro(res, erro);
    if (!alteracoes) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });

    buscarPreferencia(req.usuario.id, (erroBusca, dados) => {
      if (erroBusca) return responderErro(res, erroBusca);
      return res.json(formatar(dados));
    });
  });
}

module.exports = { buscar, atualizar };

// Preferências do aluno sobre a contagem regressiva do Vestibulinho.
// Duas escolhas independentes, guardadas no navegador e separadas por usuário:
//  - exibirCard: se o card "Dias para o Vestibulinho" aparece na tela Início (Perfil);
//  - ocultarNumero: se o card aparece, mas com o número escondido (olhinho no card).
export const EVENTO_PREFERENCIA_CONTAGEM = 'tenna:contagem-vestibulinho';

export const PREFERENCIA_PADRAO = Object.freeze({
  exibirCard: true,
  ocultarNumero: false
});

function idNormalizado(usuarioId) {
  return Number(usuarioId) || 0;
}

export function chavePreferenciaContagem(usuarioId) {
  return `tenna_contagem_vestibulinho_${idNormalizado(usuarioId)}`;
}

function normalizar(valor) {
  return {
    exibirCard: valor?.exibirCard !== false,
    ocultarNumero: valor?.ocultarNumero === true
  };
}

export function lerPreferenciaContagem(usuarioId, storage = globalThis.localStorage) {
  try {
    const bruto = storage?.getItem(chavePreferenciaContagem(usuarioId));
    return bruto ? normalizar(JSON.parse(bruto)) : { ...PREFERENCIA_PADRAO };
  } catch {
    return { ...PREFERENCIA_PADRAO };
  }
}

export function salvarPreferenciaContagem(usuarioId, preferencia, storage = globalThis.localStorage) {
  const nova = normalizar(preferencia);

  try {
    storage?.setItem(chavePreferenciaContagem(usuarioId), JSON.stringify(nova));
  } catch {
    // Sem armazenamento disponível: a escolha vale só até recarregar a página.
  }

  if (typeof globalThis.dispatchEvent === 'function' && typeof globalThis.CustomEvent === 'function') {
    globalThis.dispatchEvent(
      new globalThis.CustomEvent(EVENTO_PREFERENCIA_CONTAGEM, {
        detail: { usuarioId: idNormalizado(usuarioId), preferencia: nova }
      })
    );
  }

  return nova;
}

/**
 * Relógio monotônico para medir intervalos sem depender do relógio do Windows.
 * performance.now() não sofre saltos quando a hora do sistema é ajustada.
 */
export function clockNow() {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

/**
 * Calcula o mostrador usando o prazo exato enviado pelo servidor.
 * O fallback mantém compatibilidade com respostas antigas da API.
 * A conclusão e as recompensas continuam sendo responsabilidade do backend.
 */
export function remainingFromServer(state, receivedAtMs, nowMs) {
  const sessao = state?.sessao;
  const seconds = Math.max(0, Number(sessao?.restanteSegundos) || 0);
  if (sessao?.estado !== 'em_andamento') return seconds;

  const elapsedMs = Math.max(0, (Number(nowMs) || 0) - (Number(receivedAtMs) || 0));
  const deadlineMs = Number(sessao?.terminaEmMs);
  const serverNowMs = Number(state?.agoraServidor);

  if (Number.isFinite(deadlineMs) && Number.isFinite(serverNowMs)) {
    const remainingMs = deadlineMs - serverNowMs - elapsedMs;
    return Math.max(0, Math.ceil(remainingMs / 1000));
  }

  return Math.max(0, Math.ceil(seconds - elapsedMs / 1000));
}

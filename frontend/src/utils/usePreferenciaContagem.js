import { useCallback, useEffect, useRef, useState } from 'react';
import { request } from '../services/api.js';
import {
  EVENTO_PREFERENCIA_CONTAGEM,
  PREFERENCIA_PADRAO,
  chavePreferenciaContagem,
  lerPreferenciaContagem,
  salvarPreferenciaContagem
} from './preferenciaContagem.js';

const ROTA = '/usuarios/preferencias/contagem';
const MENSAGEM_ERRO = 'Não foi possível salvar sua preferência. Tente novamente.';

function ehPadrao(preferencia) {
  return preferencia.exibirCard === PREFERENCIA_PADRAO.exibirCard
    && preferencia.ocultarNumero === PREFERENCIA_PADRAO.ocultarNumero;
}

// Usado pela Home (olhinho) e pelo Perfil (interruptor).
// A fonte da verdade é o servidor (a escolha acompanha o aluno em qualquer aparelho).
// O navegador guarda uma cópia só para a tela abrir já no estado certo, sem piscar,
// e para continuar funcionando se o servidor estiver fora do ar.
export function usePreferenciaContagem(usuarioId) {
  const id = Number(usuarioId) || 0;
  const [estado, setEstado] = useState(() => ({ id, preferencia: lerPreferenciaContagem(id) }));
  const [erro, setErro] = useState('');
  const alteracoes = useRef(0);
  // Se o usuário mudar, relê a cópia local em vez de reaproveitar o valor de outro usuário.
  const preferencia = estado.id === id ? estado.preferencia : lerPreferenciaContagem(id);

  // Mantém Home e Perfil iguais na mesma aba (evento) e em outras abas (evento "storage").
  useEffect(() => {
    function aoMudarNaAba(event) {
      if (event.detail?.usuarioId === id) {
        setEstado({ id, preferencia: event.detail.preferencia });
      }
    }

    function aoMudarEmOutraAba(event) {
      if (!event.key || event.key === chavePreferenciaContagem(id)) {
        setEstado({ id, preferencia: lerPreferenciaContagem(id) });
      }
    }

    window.addEventListener(EVENTO_PREFERENCIA_CONTAGEM, aoMudarNaAba);
    window.addEventListener('storage', aoMudarEmOutraAba);

    return () => {
      window.removeEventListener(EVENTO_PREFERENCIA_CONTAGEM, aoMudarNaAba);
      window.removeEventListener('storage', aoMudarEmOutraAba);
    };
  }, [id]);

  // Busca a escolha salva no servidor.
  useEffect(() => {
    if (!id) return undefined;

    let ativo = true;
    const alteracoesAoPedir = alteracoes.current;

    request(ROTA)
      .then((dados) => {
        // Se o aluno mexeu enquanto a resposta vinha, a escolha dele vale mais.
        if (!ativo || alteracoes.current !== alteracoesAoPedir) return;

        if (!dados.definida) {
          // O servidor ainda não tem escolha. Se existir uma só neste navegador
          // (da versão anterior), ela sobe para o servidor.
          const local = lerPreferenciaContagem(id);
          if (!ehPadrao(local)) {
            request(ROTA, { method: 'PUT', body: JSON.stringify(local) }).catch(() => {});
          }
          return;
        }

        setEstado({ id, preferencia: salvarPreferenciaContagem(id, dados) });
      })
      .catch(() => {
        // Sem conexão com o servidor: segue com a cópia guardada no navegador.
      });

    return () => {
      ativo = false;
    };
  }, [id]);

  const alterar = useCallback((mudanca) => {
    const anterior = preferencia;
    const nova = salvarPreferenciaContagem(id, { ...anterior, ...mudanca });
    setEstado({ id, preferencia: nova });
    setErro('');

    if (!id) return;

    const numero = ++alteracoes.current;
    request(ROTA, { method: 'PUT', body: JSON.stringify(nova) }, MENSAGEM_ERRO).catch(() => {
      // Se já houve outra alteração depois desta, ela é quem manda.
      if (alteracoes.current !== numero) return;
      setEstado({ id, preferencia: salvarPreferenciaContagem(id, anterior) });
      setErro(MENSAGEM_ERRO);
    });
  }, [id, preferencia]);

  const alternarCard = useCallback(() => {
    alterar({ exibirCard: !preferencia.exibirCard });
  }, [alterar, preferencia.exibirCard]);

  const alternarNumero = useCallback(() => {
    alterar({ ocultarNumero: !preferencia.ocultarNumero });
  }, [alterar, preferencia.ocultarNumero]);

  return {
    exibirCard: preferencia.exibirCard,
    ocultarNumero: preferencia.ocultarNumero,
    erro,
    alternarCard,
    alternarNumero
  };
}

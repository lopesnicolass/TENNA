import { useCallback, useEffect, useState } from 'react';
import {
  EVENTO_PREFERENCIA_CONTAGEM,
  chavePreferenciaContagem,
  lerMostrarContagem,
  salvarMostrarContagem
} from './preferenciaContagem.js';

// Mantém Home e Perfil sincronizados (mesma aba pelo evento, outras abas pelo "storage").
export function useMostrarContagem(usuarioId) {
  const [mostrar, setMostrar] = useState(() => lerMostrarContagem(usuarioId));

  useEffect(() => {
    setMostrar(lerMostrarContagem(usuarioId));

    function atualizar() {
      setMostrar(lerMostrarContagem(usuarioId));
    }

    function aoMudarStorage(event) {
      if (!event.key || event.key === chavePreferenciaContagem(usuarioId)) {
        atualizar();
      }
    }

    window.addEventListener(EVENTO_PREFERENCIA_CONTAGEM, atualizar);
    window.addEventListener('storage', aoMudarStorage);

    return () => {
      window.removeEventListener(EVENTO_PREFERENCIA_CONTAGEM, atualizar);
      window.removeEventListener('storage', aoMudarStorage);
    };
  }, [usuarioId]);

  const alternar = useCallback(() => {
    const proximo = !lerMostrarContagem(usuarioId);
    salvarMostrarContagem(usuarioId, proximo);
    setMostrar(proximo);
  }, [usuarioId]);

  return [mostrar, alternar];
}

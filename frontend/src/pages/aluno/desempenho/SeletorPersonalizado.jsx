import { useEffect, useId, useRef, useState } from 'react';

/**
 * Seletor personalizado (mesmo visual do filtro "Situação" dos Simulados).
 * Substitui o <select> nativo, que abre uma lista fora do padrão do site.
 */
export function SeletorPersonalizado({ rotulo, valor, opcoes, onChange, ariaLabel }) {
  const [aberto, setAberto] = useState(false);
  const raizRef = useRef(null);
  const idRotulo = useId();
  const selecionada = opcoes.find((opcao) => opcao.valor === valor) || opcoes[0];

  useEffect(() => {
    if (!aberto) return undefined;
    const fecharFora = (evento) => {
      if (raizRef.current && !raizRef.current.contains(evento.target)) setAberto(false);
    };
    const fecharEsc = (evento) => {
      if (evento.key === 'Escape') {
        evento.stopPropagation();
        setAberto(false);
      }
    };
    document.addEventListener('mousedown', fecharFora);
    document.addEventListener('keydown', fecharEsc, true);
    return () => {
      document.removeEventListener('mousedown', fecharFora);
      document.removeEventListener('keydown', fecharEsc, true);
    };
  }, [aberto]);

  return (
    <div className="desempenho-campo-filtro desempenho-seletor" ref={raizRef}>
      <span className="desempenho-seletor-rotulo" id={idRotulo}>{rotulo}</span>
      <button
        type="button"
        data-sem-ampliacao
        className={`desempenho-seletor-botao${aberto ? ' aberto' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-label={ariaLabel ? `${ariaLabel}: ${selecionada?.texto}` : undefined}
        aria-labelledby={ariaLabel ? undefined : `${idRotulo}`}
        onClick={() => setAberto((estado) => !estado)}
      >
        <span>{selecionada?.texto}</span>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {aberto && (
        <div className="desempenho-seletor-menu" role="listbox" aria-label={ariaLabel || rotulo}>
          {opcoes.map((opcao) => (
            <button
              type="button"
              key={opcao.valor}
              data-sem-ampliacao
              role="option"
              aria-selected={opcao.valor === valor}
              className={`desempenho-seletor-opcao${opcao.valor === valor ? ' selecionada' : ''}`}
              onClick={() => { onChange(opcao.valor); setAberto(false); }}
            >
              <span>{opcao.texto}</span>
              {opcao.valor === valor && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

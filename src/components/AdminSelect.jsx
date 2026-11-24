import { useEffect, useRef, useState } from 'react';
import '../styles/adm/AdminSelect.css';

/**
 * Caixa de seleção personalizada do painel administrativo.
 * Substitui o <select> nativo mantendo o mesmo visual das demais telas.
 * options: [{ value, label }]
 */
export function AdminSelect({ id, value, options, onChange, placeholder = 'Selecione', disabled = false, required = false, ariaLabel }) {
  const [aberto, setAberto] = useState(false);
  const raizRef = useRef(null);
  const atual = options.find((opcao) => String(opcao.value) === String(value));

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

  useEffect(() => { if (disabled) setAberto(false); }, [disabled]);

  return (
    <div className={`admin-select${aberto ? ' is-open' : ''}`} ref={raizRef}>
      <button
        id={id}
        type="button"
        className={`admin-select-trigger${atual ? '' : ' is-placeholder'}`}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setAberto((estado) => !estado)}
      >
        <span>{atual ? atual.label : placeholder}</span>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {required && (
        <input className="admin-select-required" tabIndex={-1} aria-hidden="true" required value={value || ''} onChange={() => {}} />
      )}
      {aberto && !disabled && (
        <div className="admin-select-menu" role="listbox">
          {options.length === 0 && <div className="admin-select-empty">Nenhuma opção disponível</div>}
          {options.map((opcao) => {
            const selecionada = String(opcao.value) === String(value);
            return (
              <button
                key={opcao.value}
                type="button"
                role="option"
                aria-selected={selecionada}
                className={`admin-select-option${selecionada ? ' is-selected' : ''}`}
                onClick={() => { onChange(String(opcao.value)); setAberto(false); }}
              >
                <span>{opcao.label}</span>
                {selecionada && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { CartaoAmpliavel } from './CartaoAmpliavel.jsx';
import { SeletorPersonalizado } from './SeletorPersonalizado.jsx';
import { useMemo, useState } from 'react';
import { normalizarMateriaDesempenho } from '../../../utils/desempenhoInsights.js';

const obterMateria = (resultado) => normalizarMateriaDesempenho(resultado?.materia) || 'Gerais / sem matéria';

export function Historico({ resultados, limitar, obterNomeSimulado, formatarData, porcentagem }) {
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [materia, setMateria] = useState('todas');
  const [periodo, setPeriodo] = useState('todos');
  const [detalheAberto, setDetalheAberto] = useState(null);
  const ordenados = useMemo(() => [...resultados].sort((a, b) => {
    const dataA = new Date(a.data_realizacao || 0).getTime();
    const dataB = new Date(b.data_realizacao || 0).getTime();
    if (Number.isFinite(dataA) && Number.isFinite(dataB) && dataA !== dataB) return dataB - dataA;
    return Number(b.id || 0) - Number(a.id || 0);
  }), [resultados]);
  const materias = useMemo(() => [...new Set(ordenados.map(obterMateria))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [ordenados]);
  const filtrados = useMemo(() => {
    const dias = periodo === 'todos' ? null : Number(periodo);
    const dataLimite = dias === null ? 0 : Date.now() - dias * 24 * 60 * 60 * 1000;
    return ordenados.filter((resultado) => {
      if (materia !== 'todas' && obterMateria(resultado) !== materia) return false;
      if (dias === null) return true;
      const data = new Date(resultado.data_realizacao || '').getTime();
      return Number.isFinite(data) && data >= dataLimite;
    });
  }, [ordenados, materia, periodo]);
  const visiveis = mostrarTodos ? filtrados : filtrados.slice(0, 6);

  const trocarMateria = (valor) => { setMateria(valor); setMostrarTodos(false); setDetalheAberto(null); };
  const trocarPeriodo = (valor) => { setPeriodo(valor); setMostrarTodos(false); setDetalheAberto(null); };

  return <CartaoAmpliavel titulo="Histórico de simulados" tamanho="extra">
    <section className="desempenho-painel desempenho-historico" aria-labelledby="desempenho-historico-titulo">
      <div className="desempenho-painel-cabecalho">
        <div><h2 id="desempenho-historico-titulo">Histórico de simulados</h2><p>Consulte suas tentativas anteriores e identifique o que vale reforçar.</p></div>
        <span className="desempenho-contador">{filtrados.length} {filtrados.length === 1 ? 'tentativa' : 'tentativas'}</span>
      </div>
      {resultados.length > 0 && <div className="desempenho-historico-filtros">
        <SeletorPersonalizado
          rotulo="Matéria"
          valor={materia}
          opcoes={[{ valor: 'todas', texto: 'Todas as matérias' }, ...materias.map((nome) => ({ valor: nome, texto: nome }))]}
          onChange={trocarMateria}
        />
        <SeletorPersonalizado
          rotulo="Período"
          valor={periodo}
          opcoes={[{ valor: 'todos', texto: 'Todo o período' }, { valor: '30', texto: 'Últimos 30 dias' }, { valor: '90', texto: 'Últimos 90 dias' }]}
          onChange={trocarPeriodo}
        />
      </div>}
      {!visiveis.length ? <p className="desempenho-vazio">{resultados.length ? 'Nenhuma tentativa corresponde aos filtros selecionados.' : 'Seu histórico aparecerá após finalizar o primeiro simulado.'}</p> : <>
        <div className="desempenho-historico-lista">
          {visiveis.map((resultado, index) => {
            const valor = limitar(resultado.porcentagem);
            const chave = resultado.id ?? `${resultado.data_realizacao}-${index}`;
            const expandido = detalheAberto === chave;
            const total = Number(resultado.total_questoes ?? resultado.totalQuestoes);
            const acertos = Number(resultado.acertos);
            const possuiQuestoes = Number.isFinite(total) && Number.isFinite(acertos) && total > 0 && acertos >= 0 && acertos <= total;
            return <div className={`desempenho-historico-entrada${expandido ? ' aberta' : ''}`} key={chave}>
              <button type="button" className="desempenho-historico-row desempenho-historico-row--botao" data-sem-ampliacao aria-expanded={expandido} onClick={() => setDetalheAberto(expandido ? null : chave)}>
                <div className="desempenho-historico-identificacao">
                  <strong>{obterNomeSimulado(resultado, index)}</strong>
                  <span>{formatarData(resultado.data_realizacao) || 'Data indisponível'} · {obterMateria(resultado)}</span>
                </div>
                <div className="desempenho-barra desempenho-historico-barra" aria-hidden="true"><span style={{ width: `${valor}%` }}/></div>
                <strong className="desempenho-historico-porcentagem">{porcentagem(valor)}</strong>
                <svg className="desempenho-historico-seta" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
              </button>
              {expandido && <div className="desempenho-historico-detalhe">
                <div className="desempenho-historico-stat"><small>Nota</small><strong>{porcentagem(valor)}</strong></div>
                {possuiQuestoes && <>
                  <div className="desempenho-historico-stat acertos"><small>Acertos</small><strong>{acertos} <em>de {total}</em></strong></div>
                  <div className="desempenho-historico-stat erros"><small>Erros</small><strong>{total - acertos}</strong></div>
                </>}
                <div className="desempenho-historico-stat materia"><small>Matéria</small><strong>{obterMateria(resultado)}</strong></div>
              </div>}
            </div>;
          })}
        </div>
        {filtrados.length > 6 && <div className="desempenho-historico-rodape"><button type="button" data-sem-ampliacao className="desempenho-botao-secundario" onClick={() => setMostrarTodos(!mostrarTodos)}>{mostrarTodos ? 'Mostrar apenas as 6 recentes' : `Ver todas as ${filtrados.length} tentativas`}</button></div>}
      </>}
    </section>
  </CartaoAmpliavel>;
}

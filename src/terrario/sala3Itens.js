import carteiraProva from './assets/sala3/carteira_vestibulinho.webp';
import lousa from './assets/sala3/lousa_instrucoes.webp';
import relogio from './assets/sala3/relogio_prova.webp';
import mochila from './assets/sala3/mochila_tenna.webp';
import calendario from './assets/sala3/calendario_vestibulinho.webp';
import painel from './assets/sala3/painel_desempenho.webp';
import tapete from './assets/sala3/tapete_desafio.webp';

// A carteira já reúne folha, lápis e porta-canetas; o catálogo mantém apenas
// os elementos que aparecem na composição aprovada da Sala da Prova.
export const ITEMS_SALA3 = [
  { id:'s3_mesa', name:'Carteira do Vestibulinho', price:10, img:carteiraProva, width:30, x:43, y:80, zone:'chao', subtitle:'Carteira com cadeira encaixada, folha de prova e materiais' },
  { id:'s3_lousa', name:'Quadro de Instruções', price:6, img:lousa, width:24, x:29, y:43, zone:'parede', subtitle:'Lembretes visuais para o dia da prova' },
  { id:'s3_relogio', name:'Relógio da Prova', price:2, img:relogio, width:9, x:51, y:29, zone:'parede', subtitle:'Marca o tempo do desafio final' },
  { id:'s3_mochila', name:'Mochila da Tenna', price:4, img:mochila, width:13, x:22, y:84, zone:'chao', subtitle:'Materiais preparados para o dia especial' },
  { id:'s3_calendario', name:'Calendário do Vestibulinho', price:2, img:calendario, width:9, x:86, y:54, zone:'parede', subtitle:'Calendário de madeira com a data da prova em destaque' },
  { id:'s3_painel', name:'Painel de Desempenho', price:6, img:painel, width:25, x:65, y:41, zone:'parede', subtitle:'Metas, simulados e evolução da jornada' },
  { id:'s3_tapete', name:'Tapete do Desafio', price:4, img:tapete, width:41, x:44, y:85, zone:'tapete', subtitle:'Tapete azul e dourado com as formiguinhas' },
];

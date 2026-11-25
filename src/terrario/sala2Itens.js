// Refúgio do Conhecimento: catálogo enxuto com os itens que aparecem no cenário aprovado.
import globo2 from './assets/sala2/globo2.webp';
import tapete2 from './assets/sala2/tapete_redondo2.webp';

export const ITEMS_SALA2 = [
  { id:'s2_globo', name:'Globo terrestre', price:6, img:globo2, width:14, x:26, y:84, zone:'chao', subtitle:'Aprenda sobre o mundo' },
  { id:'s2_tapete_redondo', name:'Tapete redondo', price:4, img:tapete2, width:30, x:58, y:82, zone:'tapete', subtitle:'Um cantinho aconchegante' },
];

export const DESTAQUES_SALA2 = Object.freeze([
  's2_globo', 's2_tapete_redondo',
]);

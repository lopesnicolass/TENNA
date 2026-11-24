import { API_URL } from '../services/api.js';

// Arquivos enviados pelo painel ficam no servidor com caminho relativo
// (ex.: /uploads/conteudos/abc.png). Links absolutos antigos continuam válidos.
export function urlDoArquivo(url) {
  const valor = String(url || '').trim();
  if (!valor) return '';
  return valor.startsWith('/uploads/') ? `${API_URL}${valor}` : valor;
}

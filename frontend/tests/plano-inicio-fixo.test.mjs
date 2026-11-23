import test from 'node:test';
import assert from 'node:assert/strict';
import { inicioFixoDoPlano, gerarPlanoProgramado, reagendarDatasPlano } from '../src/utils/planoProgramado.js';

const modelo = (meses) => ({
  id: 1, meses, frequencia_dias: 2,
  sessoes: [{ id: 1, mes: 1, semana: 1, dia_estudo: 1, sessao: 1, materia: 'Português', materia_id: 1, topico: 'Classes', topico_id: 1 }],
});

test('o período termina no mês anterior ao Vestibulinho, independente de quando o plano é aberto', () => {
  // Prova em 6 de dezembro de 2026
  assert.equal(inicioFixoDoPlano(2, '2026-12-06', new Date(2026, 9, 28)), '2026-10-01');
  assert.equal(inicioFixoDoPlano(2, '2026-12-06', new Date(2026, 10, 22)), '2026-10-01');
  assert.equal(inicioFixoDoPlano(1, '2026-12-06', new Date(2026, 10, 22)), '2026-11-01');
  assert.equal(inicioFixoDoPlano(3, '2026-12-06'), '2026-09-01');
});

test('virada de ano e prova em janeiro', () => {
  assert.equal(inicioFixoDoPlano(12, '2026-12-06'), '2025-12-01');
  assert.equal(inicioFixoDoPlano(2, '2027-01-10'), '2026-11-01');
});

test('sem data da prova mantém o mês atual', () => {
  assert.equal(inicioFixoDoPlano(2, null, new Date(2026, 10, 22)), '2026-11-01');
  assert.equal(inicioFixoDoPlano(2, 'data inválida', new Date(2026, 10, 22)), '2026-11-01');
});

test('plano de 2 meses vai de 1º de outubro a 30 de novembro', () => {
  const inicio = inicioFixoDoPlano(2, '2026-12-06');
  const plano = gerarPlanoProgramado(modelo(2), { inicio, diasSemana: [1, 3] });
  assert.equal(plano.length, 2);
  assert.equal(plano[0].inicio, '2026-10-01');
  assert.equal(plano[0].fim, '2026-10-31');
  assert.equal(plano[1].inicio, '2026-11-01');
  assert.equal(plano[1].fim, '2026-11-30');
});

test('realinhar um plano antigo (nov–dez) mantém sessões e vai para out–nov', () => {
  const antigo = gerarPlanoProgramado(modelo(2), { inicio: '2026-11-01', diasSemana: [1, 3] });
  const realinhado = reagendarDatasPlano(antigo, { inicio: inicioFixoDoPlano(2, '2026-12-06'), diasSemana: [1, 3] });
  assert.equal(realinhado[0].inicio, '2026-10-01');
  assert.equal(realinhado[1].fim, '2026-11-30');
  const itens = (p) => p.flatMap((m) => m.semanas.flatMap((s) => s.days.flatMap((d) => d.items))).length;
  assert.equal(itens(realinhado), itens(antigo));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { clockNow, remainingFromServer } from '../src/terrario/focusClock.js';

test('tempo de uma sessão ativa diminui a partir do último estado do servidor', () => {
  const server = { sessao: { estado: 'em_andamento', restanteSegundos: 60 } };
  assert.equal(remainingFromServer(server, 1000, 1000), 60);
  assert.equal(remainingFromServer(server, 1000, 2250), 59);
  assert.equal(remainingFromServer(server, 1000, 62000), 0);
});

test('usa o prazo exato do servidor e não acumula arredondamento entre consultas', () => {
  const server = {
    agoraServidor: 10_000,
    sessao: { estado: 'em_andamento', restanteSegundos: 10, terminaEmMs: 20_000 }
  };
  assert.equal(remainingFromServer(server, 500, 500), 10);
  assert.equal(remainingFromServer(server, 500, 1_500), 9);
  assert.equal(remainingFromServer(server, 500, 10_500), 0);
});

test('pausa mantém o tempo e não é possível ter segundos negativos', () => {
  const paused = { sessao: { estado: 'pausada', restanteSegundos: 32 } };
  assert.equal(remainingFromServer(paused, 1000, 100000), 32);
  assert.equal(remainingFromServer({ sessao: { estado: 'em_andamento', restanteSegundos: -10 } }, 2000, 1000), 0);
});

test('o relógio monotônico está disponível para medir os intervalos do navegador', () => {
  assert.equal(typeof clockNow(), 'number');
  assert.ok(Number.isFinite(clockNow()));
});

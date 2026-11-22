import test from 'node:test';
import assert from 'node:assert/strict';
import {
  chavePreferenciaContagem,
  lerPreferenciaContagem,
  salvarPreferenciaContagem
} from '../src/utils/preferenciaContagem.js';

function criarStorage() {
  const dados = new Map();
  return {
    getItem: (chave) => (dados.has(chave) ? dados.get(chave) : null),
    setItem: (chave, valor) => dados.set(chave, String(valor))
  };
}

test('por padrão o card aparece com o número visível', () => {
  assert.deepEqual(lerPreferenciaContagem(7, criarStorage()), { exibirCard: true, ocultarNumero: false });
});

test('ocultar só o número mantém o card na tela', () => {
  const storage = criarStorage();
  salvarPreferenciaContagem(7, { exibirCard: true, ocultarNumero: true }, storage);
  assert.deepEqual(lerPreferenciaContagem(7, storage), { exibirCard: true, ocultarNumero: true });
});

test('desativar o card pelo Perfil é lembrado e dá para reativar', () => {
  const storage = criarStorage();
  salvarPreferenciaContagem(7, { exibirCard: false, ocultarNumero: false }, storage);
  assert.equal(lerPreferenciaContagem(7, storage).exibirCard, false);
  salvarPreferenciaContagem(7, { exibirCard: true, ocultarNumero: false }, storage);
  assert.equal(lerPreferenciaContagem(7, storage).exibirCard, true);
});

test('a preferência é separada por usuário', () => {
  const storage = criarStorage();
  salvarPreferenciaContagem(7, { exibirCard: false, ocultarNumero: true }, storage);
  assert.deepEqual(lerPreferenciaContagem(8, storage), { exibirCard: true, ocultarNumero: false });
  assert.notEqual(chavePreferenciaContagem(7), chavePreferenciaContagem(8));
});

test('valor salvo corrompido volta ao padrão sem quebrar', () => {
  const storage = criarStorage();
  storage.setItem(chavePreferenciaContagem(7), '{não é json');
  assert.deepEqual(lerPreferenciaContagem(7, storage), { exibirCard: true, ocultarNumero: false });
  storage.setItem(chavePreferenciaContagem(7), '"texto"');
  assert.deepEqual(lerPreferenciaContagem(7, storage), { exibirCard: true, ocultarNumero: false });
});

test('sem armazenamento disponível, usa o padrão e devolve a escolha feita', () => {
  const quebrado = {
    getItem() { throw new Error('bloqueado'); },
    setItem() { throw new Error('bloqueado'); }
  };
  assert.deepEqual(lerPreferenciaContagem(7, quebrado), { exibirCard: true, ocultarNumero: false });
  assert.deepEqual(
    salvarPreferenciaContagem(7, { exibirCard: false, ocultarNumero: true }, quebrado),
    { exibirCard: false, ocultarNumero: true }
  );
});

// Testes das consultas SQL da preferência da contagem sem acessar o banco de usuários.
const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { normalizarAtualizacao } = require('../utils/preferenciaContagem');

const source = fs.readFileSync(path.join(__dirname, '..', 'models', 'preferenciaContagemModel.js'), 'utf8');

function sqlDaFuncao(nome) {
  const inicio = source.indexOf(`function ${nome}(`);
  assert.ok(inicio >= 0, `Função ${nome} deve existir no modelo.`);
  const consulta = source.slice(inicio).match(/db\.(?:all|get|run)\(\s*`([\s\S]*?)`/);
  assert.ok(consulta, `Consulta SQL não localizada em ${nome}.`);
  return consulta[1];
}

let db;
beforeEach(() => {
  db = new DatabaseSync(':memory:');
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE usuarios (id INTEGER PRIMARY KEY, nome TEXT NOT NULL);
    CREATE TABLE preferencias_contagem (
      usuario_id INTEGER PRIMARY KEY,
      exibir_card INTEGER NOT NULL DEFAULT 1 CHECK (exibir_card IN (0, 1)),
      ocultar_numero INTEGER NOT NULL DEFAULT 0 CHECK (ocultar_numero IN (0, 1)),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );
    INSERT INTO usuarios (id, nome) VALUES (1, 'Aluno A'), (2, 'Aluno B');
  `);
});
afterEach(() => db.close());

function buscar(id) {
  return db.prepare(sqlDaFuncao('buscarPreferencia')).get(id);
}

// Mesmo mapeamento do modelo: undefined vira null e mantém o valor atual.
function salvar(id, { exibirCard, ocultarNumero }) {
  const e = exibirCard === undefined ? null : (exibirCard ? 1 : 0);
  const o = ocultarNumero === undefined ? null : (ocultarNumero ? 1 : 0);
  return db.prepare(sqlDaFuncao('salvarPreferencia')).run(e, o, id, e, o).changes;
}

test('sem escolha, vale o padrão e a preferência aparece como não definida', () => {
  assert.deepEqual({ ...buscar(1) }, { definida: 0, exibirCard: 1, ocultarNumero: 0 });
});

test('usuário inexistente não retorna preferência nem cria linha', () => {
  assert.equal(buscar(99), undefined);
  assert.equal(salvar(99, { exibirCard: false }), 0);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM preferencias_contagem').get().n, 0);
});

test('desativar o card não mexe no número, e o contrário também', () => {
  salvar(1, { exibirCard: false });
  assert.deepEqual({ ...buscar(1) }, { definida: 1, exibirCard: 0, ocultarNumero: 0 });
  salvar(1, { ocultarNumero: true });
  assert.deepEqual({ ...buscar(1) }, { definida: 1, exibirCard: 0, ocultarNumero: 1 });
  salvar(1, { exibirCard: true });
  assert.deepEqual({ ...buscar(1) }, { definida: 1, exibirCard: 1, ocultarNumero: 1 });
});

test('a primeira gravação parcial usa o padrão no outro campo', () => {
  salvar(1, { ocultarNumero: true });
  assert.deepEqual({ ...buscar(1) }, { definida: 1, exibirCard: 1, ocultarNumero: 1 });
});

test('cada aluno tem a sua preferência', () => {
  salvar(1, { exibirCard: false, ocultarNumero: true });
  assert.deepEqual({ ...buscar(2) }, { definida: 0, exibirCard: 1, ocultarNumero: 0 });
});

test('excluir o usuário apaga a preferência', () => {
  salvar(1, { exibirCard: false });
  db.prepare('DELETE FROM usuarios WHERE id = 1').run();
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM preferencias_contagem').get().n, 0);
});

test('validação aceita só booleanos e ao menos um campo', () => {
  assert.deepEqual(normalizarAtualizacao({ exibirCard: false, outro: 1 }), { exibirCard: false });
  assert.deepEqual(normalizarAtualizacao({ exibirCard: true, ocultarNumero: false }), { exibirCard: true, ocultarNumero: false });
  for (const entrada of [undefined, null, [], 'x', {}, { exibirCard: 'false' }, { ocultarNumero: 0 }, { exibirCard: null }]) {
    assert.throws(() => normalizarAtualizacao(entrada), TypeError);
  }
});

'use strict';

/**
 * Remove exclusivamente a conta de demonstração do Terrário criada para
 * revisar o catálogo. Não apaga nem altera outros estudantes.
 *
 * Execute com o backend parado:
 *   node scripts/removerAlunoDemoTerrario.js
 */
const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '..', '..', 'banco', 'vestibulinho.sqlite');
const EMAIL_DEMO = 'demo.terrario@tenna.local';

function abrirBanco() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (error) => {
      if (error) reject(error);
      else resolve(db);
    });
  });
}

function executar(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) reject(error);
      else resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

function obter(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => error ? reject(error) : resolve(row));
  });
}

function listar(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows || []));
  });
}

function fechar(db) {
  return new Promise((resolve, reject) => {
    db.close((error) => error ? reject(error) : resolve());
  });
}

function perguntar(mensagem) {
  const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => terminal.question(mensagem, (resposta) => {
    terminal.close();
    resolve(resposta);
  }));
}

function escaparIdentificador(valor) {
  return `"${String(valor).replace(/"/g, '""')}"`;
}

function nomeBackup() {
  const data = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(path.dirname(DB_PATH), `vestibulinho.antes-remover-demo-${data}.sqlite`);
}

async function listarReferenciasDiretas(db, usuarioId) {
  const tabelas = await listar(db,
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  const referencias = [];

  for (const { name: tabela } of tabelas) {
    const chaves = await listar(db, `PRAGMA foreign_key_list(${escaparIdentificador(tabela)})`);
    for (const chave of chaves) {
      if (String(chave.table).toLowerCase() !== 'usuarios') continue;
      const coluna = escaparIdentificador(chave.from);
      const tabelaSql = escaparIdentificador(tabela);
      const contagem = await obter(db,
        `SELECT COUNT(*) AS total FROM ${tabelaSql} WHERE ${coluna} = ?`, [usuarioId]);
      referencias.push({
        tabela,
        coluna: chave.from,
        acao: String(chave.on_delete || 'NO ACTION').toUpperCase(),
        quantidade: contagem?.total || 0,
      });
    }
  }
  return referencias;
}

async function main() {
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Banco não encontrado: ${DB_PATH}`);
  }

  // Primeiro abre apenas para localizar a conta e exibir o impacto previsto.
  let db = await abrirBanco();
  let backupPath;
  try {
    await executar(db, 'PRAGMA busy_timeout = 10000');
    await executar(db, 'PRAGMA foreign_keys = ON');

    const usuario = await obter(db,
      `SELECT id, nome, email, tipo FROM usuarios
       WHERE lower(trim(email)) = lower(trim(?))`, [EMAIL_DEMO]);

    if (!usuario) {
      console.log(`A conta ${EMAIL_DEMO} não foi encontrada. Nenhum dado foi alterado.`);
      return;
    }
    if (String(usuario.tipo).toLowerCase() !== 'aluno') {
      throw new Error(`O e-mail encontrado não está marcado como estudante (tipo: ${usuario.tipo}). Nada foi removido.`);
    }

    const referencias = await listarReferenciasDiretas(db, usuario.id);
    console.log('\nConta que será removida:');
    console.log(`  Nome:  ${usuario.nome}`);
    console.log(`  E-mail: ${usuario.email}`);
    console.log('\nDados associados encontrados:');
    const comDados = referencias.filter((item) => item.quantidade > 0);
    if (comDados.length) {
      for (const item of comDados) {
        console.log(`  ${item.tabela}: ${item.quantidade}`);
      }
    } else {
      console.log('  Nenhum registro associado nas tabelas com chave estrangeira direta.');
    }

    const confirmacao = await perguntar(
      `\nPara remover somente essa conta e seus dados, digite REMOVER: `);
    if (confirmacao.trim().toUpperCase() !== 'REMOVER') {
      console.log('Operação cancelada. Nenhum dado foi alterado.');
      return;
    }

    // Consolida o WAL antes de criar o backup. O backend deve estar parado.
    const checkpoint = await obter(db, 'PRAGMA wal_checkpoint(FULL)');
    if (checkpoint && Number(checkpoint.busy) > 0) {
      throw new Error('O banco está em uso por outro processo. Feche o backend e tente novamente.');
    }
  } finally {
    await fechar(db);
  }

  // Backup do banco original antes de qualquer exclusão.
  backupPath = nomeBackup();
  fs.copyFileSync(DB_PATH, backupPath);
  for (const sufixo of ['-wal', '-shm']) {
    const origem = `${DB_PATH}${sufixo}`;
    if (fs.existsSync(origem)) fs.copyFileSync(origem, `${backupPath}${sufixo}`);
  }

  db = await abrirBanco();
  try {
    await executar(db, 'PRAGMA busy_timeout = 10000');
    await executar(db, 'PRAGMA foreign_keys = ON');
    await executar(db, 'BEGIN IMMEDIATE');

    const usuario = await obter(db,
      `SELECT id, tipo FROM usuarios
       WHERE lower(trim(email)) = lower(trim(?))`, [EMAIL_DEMO]);
    if (!usuario || String(usuario.tipo).toLowerCase() !== 'aluno') {
      throw new Error('A conta mudou desde a confirmação. Nenhuma exclusão foi realizada.');
    }

    // Apaga primeiro somente referências que não possuem ON DELETE CASCADE
    // nem ON DELETE SET NULL (ex.: postits, no esquema atual).
    const referencias = await listarReferenciasDiretas(db, usuario.id);
    for (const item of referencias) {
      if (item.acao === 'CASCADE' || item.acao === 'SET NULL' || item.quantidade === 0) continue;
      await executar(db,
        `DELETE FROM ${escaparIdentificador(item.tabela)} WHERE ${escaparIdentificador(item.coluna)} = ?`,
        [usuario.id]);
    }

    const resultado = await executar(db, 'DELETE FROM usuarios WHERE id = ?', [usuario.id]);
    if (resultado.changes !== 1) {
      throw new Error(`Esperava remover uma conta, mas o SQLite informou ${resultado.changes} alterações.`);
    }

    const violacoes = await listar(db, 'PRAGMA foreign_key_check');
    if (violacoes.length) {
      throw new Error(`A verificação de integridade encontrou ${violacoes.length} violação(ões) de chave estrangeira.`);
    }

    await executar(db, 'COMMIT');
    console.log('\nConta de demonstração removida com sucesso.');
    console.log('Os demais estudantes e os dados gerais do projeto foram preservados.');
  } catch (error) {
    await executar(db, 'ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await fechar(db);
  }

  console.log(`\nBackup criado em:\n${backupPath}`);
  console.log('Depois de conferir o projeto, você pode guardar ou apagar esse backup manualmente.');
}

main().catch((error) => {
  console.error('\nNão foi possível remover a conta de demonstração:');
  console.error(error.message);
  process.exitCode = 1;
});

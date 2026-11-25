/*
 * Cria/atualiza uma conta local de demonstração para revisar o catálogo inteiro
 * do Terrário. Não modifica contas de estudantes reais nem altera as regras
 * de desbloqueio do jogo.
 *
 * Executar em backend/: npm run demo:terrario
 */
const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '..', 'banco', 'vestibulinho.sqlite');
const DEMO = Object.freeze({
  nome: 'Estudante Demonstração',
  email: 'demo.terrario@tenna.local',
  senha: 'TennaDemo#2026',
  sementes: 99999,
});

// IDs atualmente exibidos no catálogo das três salas.
const ITENS_ATUAIS = [
  'vasinho', 'mesa', 'banquinho', 'luminaria', 'cama', 'prateleira', 'quadro',
  'estante', 'lampiao', 'bau', 'tapete', 'mesa_redonda', 'almofada',
  'banquinho_tronco', 'guarda_roupa',
  's2_globo', 's2_tapete_redondo',
  's3_mesa', 's3_lousa', 's3_relogio', 's3_mochila',
  's3_calendario', 's3_painel', 's3_tapete',
];

// Móveis legados: ficam marcados como adquiridos para continuarem visíveis
// nas salas, mas todos os itens atuais continuam disponíveis para compra.
const ITENS_LEGADOS = [
  'mesa', 'banquinho', 'prateleira', 'quadro', 'estante',
];
const ITENS_INICIAIS = [...new Set(['vasinho', ...ITENS_LEGADOS])];

function executar(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) {
    if (error) reject(error);
    else resolve({ changes: this.changes, lastID: this.lastID });
  }));
}
function obter(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => {
    if (error) reject(error);
    else resolve(row);
  }));
}
function listar(db, sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => {
    if (error) reject(error);
    else resolve(rows || []);
  }));
}
function fechar(db) {
  return new Promise((resolve, reject) => db.close((error) => error ? reject(error) : resolve()));
}

async function main() {
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Banco não encontrado em: ${DB_PATH}`);
  }
  const db = new sqlite3.Database(DB_PATH);
  db.configure('busyTimeout', 7000);
  try {
    await executar(db, 'PRAGMA foreign_keys = ON');
    const tabelas = await listar(db,
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('usuarios','terrario_usuario','terrario_inventario','terrario_catalogo')");
    const nomes = new Set(tabelas.map((tabela) => tabela.name));
    const faltantes = ['usuarios', 'terrario_usuario', 'terrario_inventario', 'terrario_catalogo']
      .filter((nome) => !nomes.has(nome));
    if (faltantes.length) {
      throw new Error(`Tabelas ainda não criadas: ${faltantes.join(', ')}. Inicie o backend uma vez e execute o comando novamente.`);
    }

    const usuarioExistente = await obter(db,
      'SELECT id, tipo FROM usuarios WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))', [DEMO.email]);
    if (usuarioExistente && usuarioExistente.tipo !== 'aluno') {
      throw new Error(`O e-mail reservado ${DEMO.email} já pertence a uma conta que não é estudante. Nada foi alterado.`);
    }

    const catalogo = await listar(db, 'SELECT item_id FROM terrario_catalogo');
    const idsCatalogo = new Set(catalogo.map((item) => item.item_id));
    const itensSemCadastro = ITENS_ATUAIS.filter((id) => !idsCatalogo.has(id));
    if (itensSemCadastro.length) {
      throw new Error(`O catálogo do Terrário está desatualizado. Itens ausentes: ${itensSemCadastro.join(', ')}. Inicie o backend para aplicar as atualizações e tente novamente.`);
    }
    const legadosSemCadastro = ITENS_LEGADOS.filter((id) => !idsCatalogo.has(id));
    if (legadosSemCadastro.length) {
      throw new Error(`O catálogo não contém alguns móveis antigos: ${legadosSemCadastro.join(', ')}.`);
    }

    const senhaHash = await bcrypt.hash(DEMO.senha, 12);
    await executar(db, 'BEGIN IMMEDIATE');
    try {
      await executar(db, `INSERT INTO usuarios (nome, email, senha, tipo, xp, streak)
        VALUES (?, ?, ?, 'aluno', 100, 0)
        ON CONFLICT(email) DO UPDATE SET
          nome=excluded.nome, senha=excluded.senha, tipo='aluno', xp=100, streak=0,
          last_active_date=NULL, reset_senha_token_hash=NULL, reset_senha_expira_em=NULL`,
      [DEMO.nome, DEMO.email, senhaHash]);
      const usuario = await obter(db, 'SELECT id FROM usuarios WHERE email=?', [DEMO.email]);

      // Dez sessões válidas sintéticas deixam coerentes os indicadores da conta
      // com o desbloqueio direto das três salas. Nenhuma sessão de foco é criada.
      await executar(db, `INSERT INTO terrario_usuario
        (usuario_id, sementes, sala_desbloqueada, sala_ativa, total_sessoes_concluidas, tempo_total_foco_segundos)
        VALUES (?, ?, 3, 1, 10, 9000)
        ON CONFLICT(usuario_id) DO UPDATE SET
          sementes=excluded.sementes, sala_desbloqueada=3, sala_ativa=1,
          total_sessoes_concluidas=10, tempo_total_foco_segundos=9000`,
      [usuario.id, DEMO.sementes]);

      for (const itemId of ITENS_INICIAIS) {
        await executar(db, `INSERT OR IGNORE INTO terrario_inventario
          (usuario_id, item_id, equipado, posicao_x, posicao_y)
          VALUES (?, ?, ?, NULL, NULL)`,
        [usuario.id, itemId, itemId === 'vasinho' ? 1 : 0]);
      }

      // Compras legadas podem acionar o gatilho de débito de sementes; fixa-se
      // o saldo de demonstração após a preparação do inventário.
      await executar(db, 'UPDATE terrario_usuario SET sementes=? WHERE usuario_id=?',
        [DEMO.sementes, usuario.id]);
      await executar(db, 'COMMIT');

      console.log('\nConta de demonstração pronta!');
      console.log(`Nome:  ${DEMO.nome}`);
      console.log(`E-mail: ${DEMO.email}`);
      console.log(`Senha: ${DEMO.senha}`);
      console.log('Terrário: 3 salas liberadas · 99.999 sementes · catálogo atual disponível para compra.');
      console.log('Móveis antigos foram preservados no inventário para continuarem visíveis.\n');
    } catch (error) {
      await executar(db, 'ROLLBACK').catch(() => {});
      throw error;
    }
  } finally {
    await fechar(db);
  }
}

main().catch((error) => {
  console.error('\nNão foi possível preparar a conta de demonstração:');
  console.error(error.message);
  process.exitCode = 1;
});

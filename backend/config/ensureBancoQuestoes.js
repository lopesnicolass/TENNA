const db = require('./db');

const CAMPOS_QUESTOES = {
  materia_id: 'INTEGER',
  topico_id: 'INTEGER',
  dificuldade: "TEXT NOT NULL DEFAULT 'Não classificada'",
  habilidade: "TEXT NOT NULL DEFAULT ''"
};

function normalizarTexto(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

function all(sql, parametros = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, parametros, (erro, linhas) => erro ? reject(erro) : resolve(linhas || []));
  });
}

function run(sql, parametros = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, parametros, function (erro) {
      if (erro) return reject(erro);
      resolve(this);
    });
  });
}

async function garantirBancoQuestoes() {
  // Adiciona campos à tabela existente; nenhuma questão ou vínculo é removido.
  const colunasQuestoes = await all('PRAGMA table_info(questoes)');
  const existentes = new Set(colunasQuestoes.map((coluna) => coluna.name));
  for (const [nome, tipo] of Object.entries(CAMPOS_QUESTOES)) {
    if (!existentes.has(nome)) {
      await run(`ALTER TABLE questoes ADD COLUMN ${nome} ${tipo}`);
    }
  }

  // Relaciona a matéria textual antiga ao cadastro central de matérias.
  const materias = await all('SELECT id, nome FROM materias');
  const materiaPorNome = new Map(materias.map((materia) => [normalizarTexto(materia.nome), materia.id]));
  const questoesSemMateria = await all('SELECT id, materia FROM questoes WHERE materia_id IS NULL');
  for (const questao of questoesSemMateria) {
    const materiaId = materiaPorNome.get(normalizarTexto(questao.materia));
    if (!materiaId) continue;
    await run(
      'UPDATE questoes SET materia_id = ?, materia = (SELECT nome FROM materias WHERE id = ?) WHERE id = ?',
      [materiaId, materiaId, questao.id]
    );
  }

  // O tipo padrão preserva todos os simulados antigos como provas de disciplina.
  const colunasSimulados = await all('PRAGMA table_info(simulados)');
  if (!colunasSimulados.some((coluna) => coluna.name === 'tipo')) {
    await run("ALTER TABLE simulados ADD COLUMN tipo TEXT NOT NULL DEFAULT 'disciplina'");
  }
  await run("UPDATE simulados SET tipo = 'disciplina' WHERE tipo IS NULL OR TRIM(tipo) = ''");

  // Reaproveita o conteúdo antigo apenas quando a associação é inequívoca:
  // a questão aparece em provas de uma única matéria/conteúdo.
  try {
    await run(`
      UPDATE questoes
      SET topico_id = (
        SELECT MIN(s.topico_id)
        FROM simulado_questoes sq
        INNER JOIN simulados s ON s.id = sq.simulado_id
        WHERE sq.questao_id = questoes.id
          AND s.topico_id IS NOT NULL
          AND s.tipo = 'disciplina'
        GROUP BY sq.questao_id
        HAVING COUNT(DISTINCT s.topico_id) = 1
      )
      WHERE topico_id IS NULL
        AND (
          SELECT COUNT(DISTINCT s.topico_id)
          FROM simulado_questoes sq
          INNER JOIN simulados s ON s.id = sq.simulado_id
          WHERE sq.questao_id = questoes.id
            AND s.topico_id IS NOT NULL
            AND s.tipo = 'disciplina'
        ) = 1
    `);
  } catch (erro) {
    // Falha na classificação antiga não impede o sistema de iniciar: o
    // administrador pode completar essas classificações pelo banco de questões.
    console.error('Não foi possível aproveitar todos os conteúdos dos simulados antigos:', erro.message);
  }

  await run('CREATE INDEX IF NOT EXISTS idx_questoes_materia_topico_dificuldade ON questoes(materia_id, topico_id, dificuldade)');

  // O servidor registra a lista e a ordem das questões antes de mostrar a prova.
  await run(`
    CREATE TABLE IF NOT EXISTS simulado_tentativas (
      id TEXT PRIMARY KEY,
      usuario_id INTEGER NOT NULL,
      simulado_id INTEGER NOT NULL,
      questoes_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'em_andamento' CHECK(status IN ('em_andamento', 'concluida')),
      criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      concluida_em DATETIME,
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY(simulado_id) REFERENCES simulados(id) ON DELETE CASCADE
    )
  `);
  await run('CREATE INDEX IF NOT EXISTS idx_simulado_tentativas_usuario ON simulado_tentativas(usuario_id, simulado_id, status)');

  console.log('Estrutura do banco de questões e tentativas verificada.');
}

module.exports = garantirBancoQuestoes().catch((erro) => {
  console.error('Falha ao preparar o banco de questões:', erro);
  throw erro;
});

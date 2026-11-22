const db = require("../config/db");

// =====================================================
// CRIAR QUESTÃO
// =====================================================

function criarQuestao(
    pergunta, alternativaA, alternativaB, alternativaC, alternativaD,
    alternativaE, correta, materia, imagem, classificacao, callback
) {
    const meta = classificacao || {};
    const inserir = (materiaNome, materiaId, topicoId) => {
        db.run(`
            INSERT INTO questoes
              (pergunta, alternativa_a, alternativa_b, alternativa_c, alternativa_d,
               alternativa_e, correta, materia, imagem, materia_id, topico_id, dificuldade, habilidade)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [pergunta, alternativaA, alternativaB, alternativaC, alternativaD,
            alternativaE, correta, materiaNome, imagem, materiaId || null,
            topicoId || null, meta.dificuldade || 'Não classificada', meta.habilidade || ''],
        function (erro) {
            if (erro) return callback(erro);
            callback(null, this);
        });
    };

    if (!meta.materiaId) return inserir(materia, null, null);
    db.get(`
        SELECT m.id, m.nome, t.id AS topico_id
        FROM materias m
        LEFT JOIN topicos t ON t.id = ? AND t.materia_id = m.id AND t.ativo = 1
        WHERE m.id = ? AND m.ativa = 1
    `, [meta.topicoId || null, meta.materiaId], (erro, registro) => {
        if (erro) return callback(erro);
        if (!registro || (meta.topicoId && !registro.topico_id)) {
            const falha = new Error('A matéria ou o conteúdo selecionado não é válido.');
            falha.code = 'CLASSIFICACAO_INVALIDA';
            return callback(falha);
        }
        inserir(registro.nome, registro.id, registro.topico_id || null);
    });
}

// =====================================================
// BANCO DE QUESTÕES — ADMIN
// =====================================================

const SELECT_QUESTOES_CLASSIFICADAS = `
    SELECT q.*, m.nome AS materia_nome, t.nome AS topico
    FROM questoes q
    LEFT JOIN materias m ON m.id = q.materia_id
    LEFT JOIN topicos t ON t.id = q.topico_id
`;



// Confere a origem das questões exibidas em um bloco publicado.
// O aluno não pode escolher IDs arbitrários para consultar ou corrigir gabaritos.
function buscarBlocoQuestoesPorId(blocoId, callback) {
    db.get(`
        SELECT b.id, b.tipo, b.dados, b.ativo, p.publicado
        FROM blocos_conteudo b
        INNER JOIN paginas_conteudo p ON p.id = b.pagina_id
        WHERE b.id = ? AND b.tipo = 'questoes' AND b.ativo = 1
    `, [blocoId], callback);
}

function listarQuestoes(callback) {
    db.all(`${SELECT_QUESTOES_CLASSIFICADAS} ORDER BY q.id DESC`, [], callback);
}

function buscarQuestaoPorId(id, callback) {
    db.get(`${SELECT_QUESTOES_CLASSIFICADAS} WHERE q.id = ?`, [id], callback);
}


// =====================================================
// NORMALIZAR IDS
// =====================================================

function normalizarIds(ids) {

    if (!Array.isArray(ids)) {
        return [];
    }

    return ids
        .map(Number)
        .filter(
            id =>
                Number.isInteger(id) &&
                id > 0
        );
}


// =====================================================
// LISTAR QUESTÕES PARA O ALUNO
//
// IMPORTANTE:
// A resposta correta NÃO é enviada.
// =====================================================

function listarQuestoesPorIds(
    ids,
    callback
) {

    const idsNumericos =
        normalizarIds(ids);

    if (
        idsNumericos.length === 0
    ) {

        return callback(
            null,
            []
        );
    }

    const placeholders =
        idsNumericos
            .map(() => "?")
            .join(",");

    const sql = `
        SELECT
            id,
            pergunta,
            alternativa_a,
            alternativa_b,
            alternativa_c,
            alternativa_d,
            alternativa_e,
            materia,
            materia_id,
            topico_id,
            dificuldade,
            habilidade,
            (SELECT nome FROM topicos WHERE id = questoes.topico_id) AS topico,
            imagem
        FROM questoes
        WHERE id IN (${placeholders})
    `;

    db.all(
        sql,
        idsNumericos,
        (
            erro,
            questoes
        ) => {

            if (erro) {
                return callback(
                    erro
                );
            }

            /*
             * O banco pode devolver as questões
             * em uma ordem diferente da enviada.
             *
             * Aqui restauramos a ordem original.
             */

            const mapa =
                new Map(
                    (questoes || []).map(
                        questao => [
                            Number(
                                questao.id
                            ),
                            questao
                        ]
                    )
                );

            const ordenadas =
                idsNumericos
                    .map(
                        id =>
                            mapa.get(id)
                    )
                    .filter(Boolean);

            callback(
                null,
                ordenadas
            );
        }
    );
}


// =====================================================
// CORRIGIR QUESTÕES
//
// A resposta correta é consultada SOMENTE
// no backend.
// =====================================================

function corrigirQuestoesPorIds(
    ids,
    respostas,
    callback
) {

    const idsNumericos =
        normalizarIds(ids);

    if (
        idsNumericos.length === 0
    ) {

        return callback(
            null,
            []
        );
    }

    const placeholders =
        idsNumericos
            .map(() => "?")
            .join(",");

    const sql = `
        SELECT
            id,
            correta
        FROM questoes
        WHERE id IN (${placeholders})
    `;

    db.all(
        sql,
        idsNumericos,
        (
            erro,
            questoes
        ) => {

            if (erro) {
                return callback(
                    erro
                );
            }

            const mapa =
                new Map(
                    (questoes || []).map(
                        questao => [
                            Number(
                                questao.id
                            ),
                            questao
                        ]
                    )
                );

            const detalhes =
                idsNumericos
                    .map(
                        id =>
                            mapa.get(id)
                    )
                    .filter(Boolean)
                    .map(
                        questao => {

                            const respostaUsuario =
                                respostas &&
                                respostas[
                                    String(
                                        questao.id
                                    )
                                ] != null
                                    ? String(
                                          respostas[
                                              String(
                                                  questao.id
                                              )
                                          ]
                                      ).trim().toUpperCase()
                                    : "";

                            const respostaCorreta =
                                String(
                                    questao.correta || ""
                                )
                                    .trim()
                                    .toUpperCase();

                            return {

                                questaoId:
                                    Number(
                                        questao.id
                                    ),

                                respostaUsuario,

                                respostaCorreta,

                                acertou:
                                    respostaUsuario !== "" &&
                                    respostaUsuario ===
                                        respostaCorreta
                            };
                        }
                    );

            callback(
                null,
                detalhes
            );
        }
    );
}


// =====================================================
// ATUALIZAR QUESTÃO
// =====================================================

function atualizarQuestao(
    id, pergunta, alternativaA, alternativaB, alternativaC, alternativaD,
    alternativaE, correta, materia, imagem, classificacao, callback
) {
    const meta = classificacao || {};
    const atualizar = (materiaNome, materiaId, topicoId) => {
        db.run(`
            UPDATE questoes SET
              pergunta = ?, alternativa_a = ?, alternativa_b = ?, alternativa_c = ?,
              alternativa_d = ?, alternativa_e = ?, correta = ?, materia = ?, imagem = ?,
              materia_id = ?, topico_id = ?, dificuldade = ?, habilidade = ?
            WHERE id = ?
        `, [pergunta, alternativaA, alternativaB, alternativaC, alternativaD,
            alternativaE, correta, materiaNome, imagem, materiaId || null,
            topicoId || null, meta.dificuldade || 'Não classificada', meta.habilidade || '', id],
        function (erro) {
            if (erro) return callback(erro);
            callback(null, this);
        });
    };

    if (!meta.materiaId) return atualizar(materia, null, null);
    db.get(`
        SELECT m.id, m.nome, t.id AS topico_id
        FROM materias m
        LEFT JOIN topicos t ON t.id = ? AND t.materia_id = m.id AND t.ativo = 1
        WHERE m.id = ? AND m.ativa = 1
    `, [meta.topicoId || null, meta.materiaId], (erro, registro) => {
        if (erro) return callback(erro);
        if (!registro || (meta.topicoId && !registro.topico_id)) {
            const falha = new Error('A matéria ou o conteúdo selecionado não é válido.');
            falha.code = 'CLASSIFICACAO_INVALIDA';
            return callback(falha);
        }
        atualizar(registro.nome, registro.id, registro.topico_id || null);
    });
}


// =====================================================
// EXCLUIR QUESTÃO
// =====================================================

function excluirQuestao(
    id,
    callback
) {

    db.run(
        `
        DELETE FROM questoes
        WHERE id = ?
        `,
        [id],
        function (erro) {

            if (erro) {
                return callback(
                    erro
                );
            }

            callback(
                null,
                this
            );
        }
    );
}


// =====================================================
// EXPORTAÇÕES
// =====================================================

module.exports = {

    criarQuestao,

    listarQuestoes,

    buscarQuestaoPorId,

    buscarBlocoQuestoesPorId,

    listarQuestoesPorIds,

    corrigirQuestoesPorIds,

    atualizarQuestao,

    excluirQuestao

};
const {
    criarQuestao,
    listarQuestoes,
    buscarQuestaoPorId,
    atualizarQuestao,
    excluirQuestao,
    listarQuestoesPorIds,
    corrigirQuestoesPorIds,
    buscarBlocoQuestoesPorId
} = require("../models/questaoModel");

// =====================================================
// UTILITÁRIO
// =====================================================

function alternativasValidas() {
    return [
        "A",
        "B",
        "C",
        "D",
        "E"
    ];
}

function imagemDaQuestao(valor) {
    if (valor == null || valor === '') return null;
    if (typeof valor !== 'string' || !/^\/uploads\/questoes\/[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp|gif)$/.test(valor)) {
        throw new TypeError('Imagem inválida. Envie a imagem pelo upload de questões.');
    }
    return valor;
}

function normalizarIds(valor) {
    let valores = [];

    if (Array.isArray(valor)) {
        valores = valor;
    } else if (
        typeof valor === "string"
    ) {
        valores =
            valor.split(",");
    }

    return [
        ...new Set(
            valores
                .map(
                    (item) =>
                        Number(
                            String(item).trim()
                        )
                )
                .filter(
                    (item) =>
                        Number.isInteger(item) &&
                        item > 0
                )
        )
    ];
}


// =====================================================
// CADASTRAR QUESTÃO — ADMIN
// =====================================================

function cadastrarQuestao(
    req,
    res
) {
    const {
        pergunta,

        alternativaA,
        alternativaB,
        alternativaC,
        alternativaD,
        alternativaE,

        alternativa_a,
        alternativa_b,
        alternativa_c,
        alternativa_d,
        alternativa_e,

        correta,
        materia,
        materiaId,
        topicoId,
        dificuldade,
        habilidade,
        imagem
    } = req.body || {};


    const a =
        alternativaA ??
        alternativa_a;

    const b =
        alternativaB ??
        alternativa_b;

    const c =
        alternativaC ??
        alternativa_c;

    const d =
        alternativaD ??
        alternativa_d;

    const e =
        alternativaE ??
        alternativa_e;


    if (
        !pergunta ||
        !a ||
        !b ||
        !c ||
        !d ||
        !e ||
        !correta ||
        !Number.isInteger(Number(materiaId)) || Number(materiaId) <= 0 ||
        !Number.isInteger(Number(topicoId)) || Number(topicoId) <= 0
    ) {
        return res.status(400).json({
            mensagem:
                "Preencha todos os campos."
        });
    }


    const respostaCorreta =
        String(
            correta
        ).toUpperCase();


    if (
        !alternativasValidas().includes(
            respostaCorreta
        )
    ) {
        return res.status(400).json({
            mensagem:
                "A resposta correta deve ser A, B, C, D ou E."
        });
    }


    const dificuldadeNormalizada = String(dificuldade || 'Não classificada').trim();
    if (!['Fácil', 'Média', 'Difícil', 'Não classificada'].includes(dificuldadeNormalizada)) {
        return res.status(400).json({ mensagem: 'Selecione uma dificuldade válida.' });
    }

    const classificacao = {
        materiaId: Number(materiaId),
        topicoId: Number(topicoId),
        dificuldade: dificuldadeNormalizada,
        habilidade: String(habilidade || '').trim().slice(0, 160)
    };

    let caminhoImagem;
    try { caminhoImagem = imagemDaQuestao(imagem); }
    catch (erro) { return res.status(400).json({ mensagem: erro.message }); }

    criarQuestao(
        pergunta.trim(),
        a.trim(),
        b.trim(),
        c.trim(),
        d.trim(),
        e.trim(),
        respostaCorreta,
        materia || '',
        caminhoImagem,
        classificacao,
        (
            erro,
            resultado
        ) => {
            if (erro) {
                if (erro.code === 'CLASSIFICACAO_INVALIDA') {
                    return res.status(400).json({ mensagem: erro.message });
                }
                console.error(
                    "Erro ao cadastrar questão:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao cadastrar questão."
                });
            }

            return res.status(201).json({
                mensagem:
                    "Questão cadastrada com sucesso!",

                questao: {
                    id: resultado.lastID,

                    pergunta:
                        pergunta.trim(),

                    alternativaA:
                        a.trim(),

                    alternativaB:
                        b.trim(),

                    alternativaC:
                        c.trim(),

                    alternativaD:
                        d.trim(),

                    alternativaE:
                        e.trim(),

                    correta:
                        respostaCorreta,

                    materia: materia || '',
                    materia_id: classificacao.materiaId,
                    topico_id: classificacao.topicoId,
                    dificuldade: classificacao.dificuldade,
                    habilidade: classificacao.habilidade,
                    imagem: caminhoImagem
                }
            });
        }
    );
}


// =====================================================
// LISTAR QUESTÕES — ADMIN
// =====================================================

function listarTodasQuestoes(
    req,
    res
) {
    listarQuestoes(
        (
            erro,
            questoes
        ) => {
            if (erro) {
                console.error(
                    "Erro ao buscar questões:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao buscar questões."
                });
            }

            return res.status(200).json({
                questoes:
                    questoes || []
            });
        }
    );
}


// =====================================================
// BUSCAR QUESTÃO — ADMIN
// =====================================================

function buscarQuestao(
    req,
    res
) {
    const id =
        Number(
            req.params.id
        );

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        return res.status(400).json({
            mensagem:
                "ID da questão inválido."
        });
    }


    buscarQuestaoPorId(
        id,
        (
            erro,
            questao
        ) => {
            if (erro) {
                console.error(
                    "Erro ao buscar questão:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao buscar questão."
                });
            }

            if (!questao) {
                return res.status(404).json({
                    mensagem:
                        "Questão não encontrada."
                });
            }

            return res.status(200).json({
                questao
            });
        }
    );
}


// =====================================================
// QUESTÕES DO CONTEÚDO — ALUNO
// IDs precisam pertencer ao bloco de questões publicado solicitado.
// =====================================================

function validarQuestoesDoBloco(req, blocoIdBruto, ids, callback) {
    const blocoId = Number(blocoIdBruto);
    if (!Number.isInteger(blocoId) || blocoId <= 0) {
        return callback({ status: 400, mensagem: 'Bloco de questões inválido.' });
    }

    buscarBlocoQuestoesPorId(blocoId, (erro, bloco) => {
        if (erro) return callback({ status: 500, mensagem: 'Não foi possível validar o bloco de questões.', erro });
        const ehAdmin = req.usuario?.tipo === 'admin';
        if (!bloco || (!ehAdmin && Number(bloco.publicado) !== 1)) {
            return callback({ status: 404, mensagem: 'Bloco de questões não encontrado ou não publicado.' });
        }

        let dados;
        try { dados = typeof bloco.dados === 'string' ? JSON.parse(bloco.dados) : (bloco.dados || {}); }
        catch { dados = {}; }
        const idsDoBloco = normalizarIds(dados.questaoIds ?? dados.ids);
        const enviados = new Set(ids.map(Number));
        const correspondem = idsDoBloco.length > 0 &&
            idsDoBloco.length === enviados.size &&
            idsDoBloco.every((id) => enviados.has(id));

        if (!correspondem) {
            return callback({ status: 403, mensagem: 'As questões solicitadas não pertencem a este bloco.' });
        }
        return callback(null, idsDoBloco);
    });
}

function listarQuestoesDoConteudo(req, res) {
    const ids = normalizarIds(req.query.ids);
    if (ids.length === 0) return res.json({ questoes: [] });

    validarQuestoesDoBloco(req, req.query.blocoId, ids, (falha, idsPermitidos) => {
        if (falha) {
            if (falha.erro) console.error('Erro ao validar bloco de questões:', falha.erro);
            return res.status(falha.status).json({ mensagem: falha.mensagem });
        }

        listarQuestoesPorIds(idsPermitidos, (erro, questoes) => {
            if (erro) {
                console.error('Erro ao carregar questões do conteúdo:', erro);
                return res.status(500).json({ mensagem: 'Erro ao carregar questões.' });
            }
            if (!questoes || questoes.length !== idsPermitidos.length) {
                return res.status(409).json({ mensagem: 'Uma ou mais questões deste bloco não estão mais disponíveis.' });
            }
            return res.json({ questoes: questoes || [] });
        });
    });
}

// =====================================================
// CORRIGIR QUESTÕES DO CONTEÚDO — ALUNO
// =====================================================

function corrigirQuestoesDoConteudo(req, res) {
    const ids = normalizarIds(req.body?.questaoIds);
    const respostas = req.body?.respostas;

    if (ids.length === 0) {
        return res.status(400).json({ mensagem: 'Nenhuma questão foi informada.' });
    }
    if (!respostas || typeof respostas !== 'object' || Array.isArray(respostas)) {
        return res.status(400).json({ mensagem: 'As respostas precisam ser informadas.' });
    }
    if (Object.keys(respostas).some((id) => !ids.includes(Number(id)))) {
        return res.status(400).json({ mensagem: 'Foram enviadas respostas para questões que não pertencem a este bloco.' });
    }
    for (const resposta of Object.values(respostas)) {
        if (resposta != null && !['A', 'B', 'C', 'D', 'E'].includes(String(resposta).trim().toUpperCase())) {
            return res.status(400).json({ mensagem: 'Uma ou mais alternativas enviadas são inválidas.' });
        }
    }

    validarQuestoesDoBloco(req, req.body?.blocoId, ids, (falha) => {
        if (falha) {
            if (falha.erro) console.error('Erro ao validar bloco para correção:', falha.erro);
            return res.status(falha.status).json({ mensagem: falha.mensagem });
        }

        corrigirQuestoesPorIds(ids, respostas, (erro, detalhes) => {
            if (erro) {
                console.error('Erro ao corrigir questões:', erro);
                return res.status(500).json({ mensagem: 'Erro ao corrigir questões.' });
            }

            const lista = detalhes || [];
            if (lista.length !== ids.length) {
                return res.status(409).json({ mensagem: 'Uma ou mais questões deste bloco não estão mais disponíveis.' });
            }
            const acertos = lista.filter((item) => item.acertou).length;
            const totalQuestoes = lista.length;
            const erros = totalQuestoes - acertos;
            const porcentagem = totalQuestoes > 0 ? Number(((acertos / totalQuestoes) * 100).toFixed(2)) : 0;

            return res.json({
                resultado: { acertos, erros, totalQuestoes, porcentagem },
                detalhes: lista
            });
        });
    });
}


// =====================================================
// EDITAR QUESTÃO — ADMIN
// =====================================================

function editarQuestao(
    req,
    res
) {
    const id =
        Number(
            req.params.id
        );

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        return res.status(400).json({
            mensagem:
                "ID da questão inválido."
        });
    }


    const {
        pergunta,

        alternativaA,
        alternativaB,
        alternativaC,
        alternativaD,
        alternativaE,

        alternativa_a,
        alternativa_b,
        alternativa_c,
        alternativa_d,
        alternativa_e,

        correta,
        materia,
        materiaId,
        topicoId,
        dificuldade,
        habilidade,
        imagem
    } = req.body || {};


    const a =
        alternativaA ??
        alternativa_a;

    const b =
        alternativaB ??
        alternativa_b;

    const c =
        alternativaC ??
        alternativa_c;

    const d =
        alternativaD ??
        alternativa_d;

    const e =
        alternativaE ??
        alternativa_e;


    if (
        !pergunta ||
        !a ||
        !b ||
        !c ||
        !d ||
        !e ||
        !correta ||
        !Number.isInteger(Number(materiaId)) || Number(materiaId) <= 0 ||
        !Number.isInteger(Number(topicoId)) || Number(topicoId) <= 0
    ) {
        return res.status(400).json({
            mensagem:
                "Preencha todos os campos."
        });
    }


    const respostaCorreta =
        String(
            correta
        ).toUpperCase();


    if (
        !alternativasValidas().includes(
            respostaCorreta
        )
    ) {
        return res.status(400).json({
            mensagem:
                "A resposta correta deve ser A, B, C, D ou E."
        });
    }


    const dificuldadeNormalizada = String(dificuldade || 'Não classificada').trim();
    if (!['Fácil', 'Média', 'Difícil', 'Não classificada'].includes(dificuldadeNormalizada)) {
        return res.status(400).json({ mensagem: 'Selecione uma dificuldade válida.' });
    }

    const classificacao = {
        materiaId: Number(materiaId),
        topicoId: Number(topicoId),
        dificuldade: dificuldadeNormalizada,
        habilidade: String(habilidade || '').trim().slice(0, 160)
    };

    let caminhoImagem;
    try { caminhoImagem = imagemDaQuestao(imagem); }
    catch (erro) { return res.status(400).json({ mensagem: erro.message }); }

    atualizarQuestao(
        id,
        pergunta.trim(),
        a.trim(),
        b.trim(),
        c.trim(),
        d.trim(),
        e.trim(),
        respostaCorreta,
        materia || '',
        caminhoImagem,
        classificacao,
        (
            erro,
            resultado
        ) => {
            if (erro) {
                if (erro.code === 'CLASSIFICACAO_INVALIDA') {
                    return res.status(400).json({ mensagem: erro.message });
                }
                console.error(
                    "Erro ao atualizar questão:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao atualizar questão."
                });
            }


            if (
                !resultado ||
                resultado.changes === 0
            ) {
                return res.status(404).json({
                    mensagem:
                        "Questão não encontrada."
                });
            }


            return res.json({
                mensagem:
                    "Questão atualizada com sucesso!"
            });
        }
    );
}


// =====================================================
// EXCLUIR QUESTÃO — ADMIN
// =====================================================

function deletarQuestao(
    req,
    res
) {
    const id =
        Number(
            req.params.id
        );

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        return res.status(400).json({
            mensagem:
                "ID da questão inválido."
        });
    }


    excluirQuestao(
        id,
        (
            erro,
            resultado
        ) => {
            if (erro) {
                console.error(
                    "Erro ao excluir questão:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao excluir questão."
                });
            }


            if (
                !resultado ||
                resultado.changes === 0
            ) {
                return res.status(404).json({
                    mensagem:
                        "Questão não encontrada."
                });
            }


            return res.json({
                mensagem:
                    "Questão excluída com sucesso!"
            });
        }
    );
}
module.exports = {
    cadastrarQuestao,
    listarTodasQuestoes,
    buscarQuestao,
    editarQuestao,
    deletarQuestao,
    listarQuestoesDoConteudo,
    corrigirQuestoesDoConteudo
};
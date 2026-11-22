const {
    MIN_QUESTOES_SIMULADO,
    DIFICULDADES_VALIDAS,

    criarSimulado,
    listarSimulados,
    buscarSimuladoPorId,
    atualizarSimulado,
    excluirSimulado,

    adicionarQuestao,

    listarQuestoesDoSimulado,
    listarQuestoesDoSimuladoParaResponder,

    buscarGabaritoDoSimulado,
    buscarTentativa,
    buscarTentativaEmAndamento,
    criarTentativa,
    listarQuestoesPorIdsParaTentativa,
    buscarGabaritoPorIds,
    concluirTentativa,

    removerQuestao,
    atualizarOrdemQuestao
} = require("../models/simuladoModel");


const {
    criarResultado
} = require("../models/resultadoModel");
const { concederXPVerificado } = require('../services/xpService');
const crypto = require('crypto');


// =====================================================
// AUXILIAR
// =====================================================

function numeroInteiroPositivo(
    valor
) {

    const numero =
        Number(valor);

    return (
        Number.isInteger(
            numero
        ) &&
        numero > 0
    )
        ? numero
        : null;
}


// =====================================================
// CADASTRAR SIMULADO
// =====================================================

function cadastrarSimulado(
    req,
    res
) {

    const {
        titulo,
        descricao,
        materia,
        dificuldade,
        tipo,

        tempoLimite,
        tempo_limite,

        quantidadeQuestoes,
        quantidade_questoes,

        topicoId,
        topico_id
    } = req.body || {};


    const tempo =
        tempoLimite ??
        tempo_limite;


    const quantidade =
        quantidadeQuestoes ??
        quantidade_questoes;


    const idTopico =
        topicoId ??
        topico_id;


    const tempoNumero =
        numeroInteiroPositivo(
            tempo
        );


    const quantidadeNumero =
        numeroInteiroPositivo(
            quantidade
        );


    const topicoNumero =
        numeroInteiroPositivo(
            idTopico
        );


    if (
        !String(
            titulo || ""
        ).trim() ||

        (tipo !== 'geral' && !String(materia || "").trim()) ||

        !['disciplina', 'geral', undefined].includes(tipo) ||

        !DIFICULDADES_VALIDAS.includes(
            String(
                dificuldade || ""
            )
        ) ||

        !tempoNumero ||

        !quantidadeNumero ||

        (tipo !== 'geral' && !topicoNumero)
    ) {

        return res.status(400).json({
            mensagem:
                "Preencha todos os campos obrigatórios corretamente."
        });
    }


    if (
        quantidadeNumero <
        MIN_QUESTOES_SIMULADO
    ) {

        return res.status(400).json({
            mensagem:
                `Um simulado precisa ter no mínimo ${MIN_QUESTOES_SIMULADO} questões.`
        });
    }


    criarSimulado(
        String(
            titulo
        ).trim(),

        String(
            descricao || ""
        ).trim(),

        tipo === 'geral' ? 'Simulados Gerais' : String(materia).trim(),

        String(
            dificuldade
        ),

        tempoNumero,

        quantidadeNumero,

        tipo === 'geral' ? null : topicoNumero,
        tipo === 'geral' ? 'geral' : 'disciplina',

        (
            erro,
            resultado
        ) => {

            if (erro) {

                console.error(
                    "❌ Erro ao cadastrar simulado:",
                    erro
                );


                if (
                    erro.code ===
                    "TOPICO_NOT_FOUND"
                ) {

                    return res.status(400).json({
                        mensagem:
                            "O conteúdo selecionado não existe para a matéria escolhida."
                    });
                }


                return res.status(500).json({
                    mensagem:
                        "Erro ao cadastrar simulado."
                });
            }


            return res.status(201).json({

                mensagem:
                    "Simulado criado com sucesso!",

                simulado: {

                    id:
                        resultado.lastID,

                    titulo:
                        String(
                            titulo
                        ).trim(),

                    descricao:
                        String(
                            descricao || ""
                        ).trim(),

                    materia: tipo === 'geral' ? 'Simulados Gerais' : String(materia).trim(),
                    tipo: tipo === 'geral' ? 'geral' : 'disciplina',

                    dificuldade:
                        String(
                            dificuldade
                        ),

                    tempo_limite:
                        tempoNumero,

                    quantidade_questoes:
                        quantidadeNumero,

                    topico_id:
                        tipo === 'geral' ? null : topicoNumero,

                    ativo:
                        1
                }

            });

        }
    );
}


// =====================================================
// LISTAR SIMULADOS
// =====================================================

function listarTodosSimulados(
    req,
    res
) {

    listarSimulados(
        (
            erro,
            simulados
        ) => {

            if (erro) {

                console.error(
                    "❌ Erro ao buscar simulados:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao buscar simulados."
                });
            }


            return res.status(200).json({
                simulados:
                    simulados || []
            });

        }
    );
}


// =====================================================
// BUSCAR SIMULADO PARA O ALUNO
// =====================================================

function buscarSimulado(
    req,
    res
) {

    const id =
        numeroInteiroPositivo(
            req.params.id
        );


    if (!id) {

        return res.status(400).json({
            mensagem:
                "ID do simulado inválido."
        });
    }


    buscarSimuladoPorId(
        id,
        (
            erro,
            simulado
        ) => {

            if (erro) {

                console.error(
                    "❌ Erro ao buscar simulado:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao buscar simulado."
                });
            }


            if (!simulado) {

                return res.status(404).json({
                    mensagem:
                        "Simulado não encontrado."
                });
            }


            listarQuestoesDoSimuladoParaResponder(
                id,
                (
                    erroQuestoes,
                    questoes
                ) => {

                    if (
                        erroQuestoes
                    ) {

                        console.error(
                            "❌ Erro ao buscar questões:",
                            erroQuestoes
                        );

                        return res.status(500).json({
                            mensagem:
                                "Erro ao buscar questões do simulado."
                        });
                    }


                    if (
                        !questoes ||
                        questoes.length === 0
                    ) {

                        return res.status(409).json({
                            mensagem:
                                "Este simulado ainda não possui questões disponíveis."
                        });
                    }


                    return res.status(200).json({
                        simulado,
                        questoes
                    });

                }
            );

        }
    );
}


// =====================================================
// EDITAR SIMULADO
// =====================================================

function editarSimulado(
    req,
    res
) {

    const id =
        numeroInteiroPositivo(
            req.params.id
        );


    const {
        titulo,
        descricao,
        materia,
        dificuldade,
        tipo,

        tempoLimite,
        tempo_limite,

        quantidadeQuestoes,
        quantidade_questoes,

        topicoId,
        topico_id
    } = req.body || {};


    const tempo =
        tempoLimite ??
        tempo_limite;


    const quantidade =
        quantidadeQuestoes ??
        quantidade_questoes;


    const idTopico =
        topicoId ??
        topico_id;


    const tempoNumero =
        numeroInteiroPositivo(
            tempo
        );


    const quantidadeNumero =
        numeroInteiroPositivo(
            quantidade
        );


    const topicoNumero =
        numeroInteiroPositivo(
            idTopico
        );


    if (
        !id ||

        !String(
            titulo || ""
        ).trim() ||

        (tipo !== 'geral' && !String(materia || "").trim()) ||

        !['disciplina', 'geral', undefined].includes(tipo) ||

        !DIFICULDADES_VALIDAS.includes(
            String(
                dificuldade || ""
            )
        ) ||

        !tempoNumero ||

        !quantidadeNumero ||

        (tipo !== 'geral' && !topicoNumero)
    ) {

        return res.status(400).json({
            mensagem:
                "Preencha todos os campos obrigatórios corretamente."
        });
    }


    if (
        quantidadeNumero <
        MIN_QUESTOES_SIMULADO
    ) {

        return res.status(400).json({
            mensagem:
                `Um simulado precisa ter no mínimo ${MIN_QUESTOES_SIMULADO} questões.`
        });
    }


    atualizarSimulado(
        id,

        String(
            titulo
        ).trim(),

        String(
            descricao || ""
        ).trim(),

        tipo === 'geral' ? 'Simulados Gerais' : String(materia).trim(),

        String(
            dificuldade
        ),

        tempoNumero,

        quantidadeNumero,

        tipo === 'geral' ? null : topicoNumero,
        tipo === 'geral' ? 'geral' : 'disciplina',

        (
            erro,
            resultado,
            status
        ) => {

            if (erro) {

                console.error(
                    "❌ Erro ao atualizar simulado:",
                    erro
                );


                if (
                    erro.code ===
                    "TOPICO_NOT_FOUND"
                ) {

                    return res.status(400).json({
                        mensagem:
                            "O conteúdo selecionado não existe para a matéria escolhida."
                    });
                }


                return res.status(500).json({
                    mensagem:
                        "Erro ao atualizar simulado."
                });
            }


            if (
                status ===
                    "NOT_FOUND" ||

                !resultado ||

                resultado.changes ===
                    0
            ) {

                return res.status(404).json({
                    mensagem:
                        "Simulado não encontrado."
                });
            }


            return res.status(200).json({
                mensagem:
                    "Simulado atualizado com sucesso!"
            });

        }
    );
}


// =====================================================
// EXCLUIR SIMULADO
// =====================================================
//
// Exclusão lógica: ativo = 0.
//

function deletarSimulado(
    req,
    res
) {

    const id =
        numeroInteiroPositivo(
            req.params.id
        );


    if (!id) {

        return res.status(400).json({
            mensagem:
                "ID do simulado inválido."
        });
    }


    excluirSimulado(
        id,
        (
            erro,
            resultado
        ) => {

            if (erro) {

                console.error(
                    "❌ Erro ao desativar simulado:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao excluir simulado."
                });
            }


            if (
                resultado.changes ===
                0
            ) {

                return res.status(404).json({
                    mensagem:
                        "Simulado não encontrado."
                });
            }


            return res.status(200).json({
                mensagem:
                    "Simulado excluído com sucesso!"
            });

        }
    );
}


// =====================================================
// ADICIONAR QUESTÃO
// =====================================================

function adicionarQuestaoAoSimulado(
    req,
    res
) {

    const simuladoId =
        numeroInteiroPositivo(
            req.params.id
        );


    const {
        questaoId,
        questao_id,
        ordem
    } = req.body || {};


    const idQuestao =
        numeroInteiroPositivo(
            questaoId ??
            questao_id
        );


    const ordemNumero =
        numeroInteiroPositivo(
            ordem
        );


    if (
        !simuladoId ||
        !idQuestao ||
        !ordemNumero
    ) {

        return res.status(400).json({
            mensagem:
                "Informe uma questão e uma ordem válidas."
        });
    }


    adicionarQuestao(
        simuladoId,
        idQuestao,
        ordemNumero,
        (
            erro,
            resultado
        ) => {

            if (erro) {

                console.error(
                    "❌ Erro ao adicionar questão:",
                    erro
                );


                switch (
                    erro.code
                ) {

                    case "SIMULADO_NOT_FOUND":

                    case "QUESTAO_NOT_FOUND":

                        return res.status(404).json({
                            mensagem:
                                erro.message
                        });


                    case "QUESTAO_MATERIA_INVALIDA":

                    case "QUESTAO_CLASSIFICACAO_INVALIDA":

                    case "QUESTAO_DUPLICADA":

                    case "QUESTOES_LIMITE_ATINGIDO":

                    case "ORDEM_INVALIDA":

                        return res.status(400).json({
                            mensagem:
                                erro.message
                        });


                    default:

                        return res.status(500).json({
                            mensagem:
                                "Erro ao adicionar questão ao simulado."
                        });
                }
            }


            return res.status(201).json({

                mensagem:
                    "Questão adicionada ao simulado!",

                id:
                    resultado.lastID

            });

        }
    );
}


// =====================================================
// LISTAR QUESTÕES — ADMIN
// =====================================================

function listarQuestoes(
    req,
    res
) {

    const id =
        numeroInteiroPositivo(
            req.params.id
        );


    if (!id) {

        return res.status(400).json({
            mensagem:
                "ID do simulado inválido."
        });
    }


    listarQuestoesDoSimulado(
        id,
        (
            erro,
            questoes
        ) => {

            if (erro) {

                console.error(
                    "❌ Erro ao buscar questões:",
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
// REMOVER QUESTÃO
// =====================================================

function removerQuestaoDoSimulado(
    req,
    res
) {

    const simuladoId =
        numeroInteiroPositivo(
            req.params.id
        );


    const questaoId =
        numeroInteiroPositivo(
            req.params.questaoId
        );


    if (
        !simuladoId ||
        !questaoId
    ) {

        return res.status(400).json({
            mensagem:
                "IDs inválidos."
        });
    }


    removerQuestao(
        simuladoId,
        questaoId,
        (
            erro,
            resultado
        ) => {

            if (erro) {

                console.error(
                    "❌ Erro ao remover questão:",
                    erro
                );

                return res.status(500).json({
                    mensagem:
                        "Erro ao remover questão do simulado."
                });
            }


            if (
                resultado.changes ===
                0
            ) {

                return res.status(404).json({
                    mensagem:
                        "Questão não encontrada neste simulado."
                });
            }


            return res.status(200).json({
                mensagem:
                    "Questão removida do simulado!"
            });

        }
    );
}


// =====================================================
// ATUALIZAR ORDEM
// =====================================================

function editarOrdemQuestao(
    req,
    res
) {

    const simuladoId =
        numeroInteiroPositivo(
            req.params.id
        );


    const questaoId =
        numeroInteiroPositivo(
            req.params.questaoId
        );


    const ordem =
        numeroInteiroPositivo(
            req.body?.ordem
        );


    if (
        !simuladoId ||
        !questaoId ||
        !ordem
    ) {

        return res.status(400).json({
            mensagem:
                "Informe uma ordem válida."
        });
    }


    atualizarOrdemQuestao(
        simuladoId,
        questaoId,
        ordem,
        (
            erro,
            resultado
        ) => {

            if (erro) {

                console.error(
                    "❌ Erro ao atualizar ordem:",
                    erro
                );


                if (
                    erro.code ===
                    "ORDEM_INVALIDA"
                ) {

                    return res.status(400).json({
                        mensagem:
                            erro.message
                    });
                }


                if (
                    erro.code ===
                    "QUESTAO_SIMULADO_NOT_FOUND"
                ) {

                    return res.status(404).json({
                        mensagem:
                            erro.message
                    });
                }


                return res.status(500).json({
                    mensagem:
                        "Erro ao atualizar a ordem da questão."
                });
            }


            if (
                resultado.changes ===
                0
            ) {

                return res.status(404).json({
                    mensagem:
                        "Questão não encontrada neste simulado."
                });
            }


            return res.status(200).json({
                mensagem:
                    "Ordem atualizada com sucesso!"
            });

        }
    );
}


// =====================================================
// CORRIGIR SIMULADO
// =====================================================

function embaralhar(questoes) {
    const resultado = [...questoes];
    for (let indice = resultado.length - 1; indice > 0; indice -= 1) {
        const destino = crypto.randomInt(indice + 1);
        [resultado[indice], resultado[destino]] = [resultado[destino], resultado[indice]];
    }
    return resultado;
}

// =====================================================
// INICIAR TENTATIVA — O SERVIDOR ESCOLHE E REGISTRA A ORDEM
// =====================================================

function iniciarTentativa(req, res) {
    const simuladoId = numeroInteiroPositivo(req.params.id);
    const usuarioId = numeroInteiroPositivo(req.usuario?.id || req.usuario?.usuarioId);
    const tentativaSolicitada = typeof req.body?.tentativaId === 'string' ? req.body.tentativaId : null;

    if (!usuarioId) return res.status(401).json({ mensagem: 'Usuário não autenticado.' });
    if (!simuladoId) return res.status(400).json({ mensagem: 'ID do simulado inválido.' });

    const responderComTentativa = (tentativaId, ids, nova) => {
        listarQuestoesPorIdsParaTentativa(ids, (erroQuestoes, questoes) => {
            if (erroQuestoes) {
                console.error('Erro ao carregar questões da tentativa:', erroQuestoes);
                return res.status(500).json({ mensagem: 'Não foi possível carregar as questões.' });
            }
            if (!questoes || questoes.length !== ids.length) {
                return res.status(409).json({ mensagem: 'Uma ou mais questões desta tentativa não estão mais disponíveis.' });
            }
            return res.status(nova ? 201 : 200).json({ tentativaId, questoes });
        });
    };

    const retomarTentativa = (tentativa) => {
        let ids;
        try { ids = JSON.parse(tentativa.questoes_json); }
        catch { return res.status(409).json({ mensagem: 'A ordem desta tentativa está inválida.' }); }
        if (!Array.isArray(ids) || !ids.length) return res.status(409).json({ mensagem: 'Esta tentativa não possui questões válidas.' });
        return responderComTentativa(tentativa.id, ids, false);
    };

    const criarNovaTentativa = () => {
        buscarSimuladoPorId(simuladoId, (erroSimulado, simulado) => {
            if (erroSimulado) {
                console.error('Erro ao buscar simulado para iniciar:', erroSimulado);
                return res.status(500).json({ mensagem: 'Não foi possível iniciar o simulado.' });
            }
            if (!simulado) return res.status(404).json({ mensagem: 'Simulado não encontrado.' });
            listarQuestoesDoSimuladoParaResponder(simuladoId, (erroQuestoes, pool) => {
                if (erroQuestoes) {
                    console.error('Erro ao buscar banco do simulado:', erroQuestoes);
                    return res.status(500).json({ mensagem: 'Não foi possível selecionar as questões.' });
                }
                const quantidade = Number(simulado.quantidade_questoes) || 0;
                if (!Array.isArray(pool) || pool.length < quantidade || quantidade < MIN_QUESTOES_SIMULADO) {
                    return res.status(409).json({ mensagem: 'Este simulado ainda não possui questões suficientes para uma tentativa.' });
                }
                const selecionadas = embaralhar(pool).slice(0, quantidade);
                const ids = selecionadas.map((questao) => Number(questao.id));
                const tentativaId = crypto.randomUUID();
                criarTentativa(tentativaId, usuarioId, simuladoId, ids, (erroCriacao) => {
                    if (erroCriacao) {
                        console.error('Erro ao registrar tentativa:', erroCriacao);
                        return res.status(500).json({ mensagem: 'Não foi possível registrar sua tentativa.' });
                    }
                    responderComTentativa(tentativaId, ids, true);
                });
            });
        });
    };

    const retomarOuCriarTentativa = () => {
        buscarTentativaEmAndamento(usuarioId, simuladoId, (erro, tentativaAtiva) => {
            if (erro) {
                console.error('Erro ao procurar tentativa em andamento:', erro);
                return res.status(500).json({ mensagem: 'Não foi possível recuperar sua tentativa.' });
            }
            if (tentativaAtiva) return retomarTentativa(tentativaAtiva);
            return criarNovaTentativa();
        });
    };

    if (tentativaSolicitada && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tentativaSolicitada)) {
        return buscarTentativa(tentativaSolicitada, usuarioId, simuladoId, (erro, tentativa) => {
            if (erro) {
                console.error('Erro ao recuperar tentativa:', erro);
                return res.status(500).json({ mensagem: 'Não foi possível recuperar sua tentativa.' });
            }
            if (tentativa && tentativa.status === 'em_andamento') return retomarTentativa(tentativa);
            return retomarOuCriarTentativa();
        });
    }
    return retomarOuCriarTentativa();
}

// =====================================================
// CORRIGIR SIMULADO — APENAS QUESTÕES REGISTRADAS NA TENTATIVA
// =====================================================

function corrigirSimulado(req, res) {
    const simuladoId = numeroInteiroPositivo(req.params.id);
    const { respostas, tentativaId } = req.body || {};
    const usuarioId = numeroInteiroPositivo(req.usuario?.id || req.usuario?.usuarioId);

    if (!usuarioId) return res.status(401).json({ mensagem: 'Usuário não autenticado.' });
    if (!simuladoId) return res.status(400).json({ mensagem: 'ID do simulado inválido.' });
    if (typeof tentativaId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tentativaId)) {
        return res.status(400).json({ mensagem: 'Identificador da tentativa inválido. Inicie o simulado novamente.' });
    }
    if (!respostas || typeof respostas !== 'object' || Array.isArray(respostas)) {
        return res.status(400).json({ mensagem: 'Informe as respostas no formato { questaoId: alternativa }.' });
    }

    buscarTentativa(tentativaId, usuarioId, simuladoId, (erroTentativa, tentativa) => {
        if (erroTentativa) {
            console.error('Erro ao verificar tentativa:', erroTentativa);
            return res.status(500).json({ mensagem: 'Não foi possível validar a tentativa.' });
        }
        if (!tentativa) return res.status(403).json({ mensagem: 'Tentativa não encontrada ou não pertence a este usuário.' });

        let ids;
        try { ids = JSON.parse(tentativa.questoes_json); }
        catch { return res.status(409).json({ mensagem: 'A seleção de questões desta tentativa está inválida.' }); }
        if (!Array.isArray(ids) || !ids.length || ids.some((id) => !Number.isInteger(Number(id)) || Number(id) <= 0)) {
            return res.status(409).json({ mensagem: 'A seleção de questões desta tentativa está inválida.' });
        }

        const idsPermitidos = new Set(ids.map(String));
        const idsEnviados = Object.keys(respostas);
        if (idsEnviados.some((id) => !idsPermitidos.has(String(id)))) {
            return res.status(400).json({ mensagem: 'Foram enviadas respostas para questões que não pertencem a esta tentativa.' });
        }
        for (const resposta of Object.values(respostas)) {
            if (resposta != null && !['A', 'B', 'C', 'D', 'E'].includes(String(resposta).trim().toUpperCase())) {
                return res.status(400).json({ mensagem: 'Uma ou mais alternativas enviadas são inválidas.' });
            }
        }

        buscarGabaritoPorIds(ids, (erroGabarito, gabarito) => {
            if (erroGabarito) {
                console.error('Erro ao buscar gabarito da tentativa:', erroGabarito);
                return res.status(500).json({ mensagem: 'Erro ao corrigir o simulado.' });
            }
            if (!Array.isArray(gabarito) || gabarito.length !== ids.length) {
                return res.status(409).json({ mensagem: 'Não foi possível localizar todas as questões desta tentativa.' });
            }

            let acertos = 0;
            const detalhes = gabarito.map((questao, index) => {
                const respostaBruta = respostas[String(questao.id)];
                const respostaUsuario = respostaBruta == null ? null : String(respostaBruta).trim().toUpperCase();
                const respostaCorreta = String(questao.correta || '').trim().toUpperCase();
                const acertou = Boolean(respostaUsuario && respostaUsuario === respostaCorreta);
                if (acertou) acertos += 1;
                return {
                    questaoId: Number(questao.id),
                    ordem: index + 1,
                    materia: questao.materia,
                    materiaId: questao.materia_id,
                    topico: questao.topico || null,
                    topicoId: questao.topico_id || null,
                    dificuldade: questao.dificuldade || 'Não classificada',
                    habilidade: questao.habilidade || '',
                    respostaUsuario,
                    respostaCorreta,
                    acertou
                };
            });

            const totalQuestoes = gabarito.length;
            const erros = totalQuestoes - acertos;
            const porcentagem = Number(((acertos / totalQuestoes) * 100).toFixed(2));
            criarResultado(usuarioId, simuladoId, acertos, erros, totalQuestoes, porcentagem,
                { tentativaId, detalhes }, (erroResultado, resultadoSalvo) => {
                    if (erroResultado) {
                        console.error('Erro ao salvar resultado do simulado:', erroResultado);
                        return res.status(500).json({ mensagem: 'Não foi possível salvar o resultado.' });
                    }

                    const original = resultadoSalvo.registro;
                    if (resultadoSalvo.duplicado) {
                        const mesmasRespostas = (original.detalhes || []).length === detalhes.length &&
                            original.detalhes.every((item, indice) =>
                                Number(item.questaoId) === Number(detalhes[indice].questaoId) &&
                                item.respostaUsuario === detalhes[indice].respostaUsuario);
                        if (Number(original.simulado_id) !== simuladoId || !mesmasRespostas) {
                            return res.status(409).json({ mensagem: 'Esta tentativa já foi finalizada com outras respostas.' });
                        }
                    }

                    concederXPVerificado(usuarioId, 'simulado_concluido', resultadoSalvo.lastID, (erroXP) => {
                        if (erroXP) {
                            console.error('Falha ao registrar XP do simulado:', erroXP);
                            return res.status(503).json({ mensagem: 'Resultado salvo, mas não foi possível confirmar o XP. Tente finalizar novamente.' });
                        }
                        concluirTentativa(tentativaId, usuarioId, (erroFinalizacao) => {
                            if (erroFinalizacao) console.error('Não foi possível marcar tentativa como concluída:', erroFinalizacao);
                            return res.status(200).json({
                                resultado: {
                                    id: resultadoSalvo.lastID,
                                    acertos: original ? original.acertos : acertos,
                                    erros: original ? original.erros : erros,
                                    totalQuestoes: original ? original.total_questoes : totalQuestoes,
                                    porcentagem: original ? original.porcentagem : porcentagem
                                },
                                detalhes: original ? original.detalhes : detalhes
                            });
                        });
                    });
                });
        });
    });
}


// =====================================================
// EXPORTAÇÕES
// =====================================================

module.exports = {

    cadastrarSimulado,

    listarTodosSimulados,

    buscarSimulado,

    editarSimulado,

    deletarSimulado,

    adicionarQuestao:
        adicionarQuestaoAoSimulado,

    listarQuestoes,

    removerQuestao:
        removerQuestaoDoSimulado,

    editarOrdemQuestao,

    iniciarTentativa,
    corrigirSimulado

};
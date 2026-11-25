-- =====================================================================
-- Tenna — Esquema do banco de dados (SQLite)
-- Gerado a partir do banco entregue (backend/banco/vestibulinho.sqlite),
-- criado e atualizado pelas rotinas de backend/config/*.js.
-- Uso: sqlite3 vestibulinho.sqlite < database/schema.sql
-- (o backend também cria/atualiza estas tabelas sozinho na inicialização)
-- =====================================================================

PRAGMA foreign_keys = ON;

-- Tabela: usuarios
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'aluno'
, foto_perfil TEXT, xp INTEGER NOT NULL DEFAULT 0, streak INTEGER NOT NULL DEFAULT 0, last_active_date TEXT DEFAULT NULL, foto_perfil_dados BLOB, foto_perfil_tipo TEXT, reset_senha_expira_em INTEGER DEFAULT NULL, reset_senha_token_hash TEXT DEFAULT NULL);

-- Tabela: questoes
CREATE TABLE questoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pergunta TEXT NOT NULL,
            alternativa_a TEXT NOT NULL,
            alternativa_b TEXT NOT NULL,
            alternativa_c TEXT NOT NULL,
            alternativa_d TEXT NOT NULL,
            correta TEXT NOT NULL,
            materia TEXT NOT NULL
        , alternativa_e TEXT, imagem TEXT DEFAULT NULL, materia_id INTEGER, topico_id INTEGER, dificuldade TEXT NOT NULL DEFAULT 'Não classificada', habilidade TEXT NOT NULL DEFAULT '');

-- Tabela: simulados
CREATE TABLE simulados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descricao TEXT,
            tempo_limite INTEGER NOT NULL,
            quantidade_questoes INTEGER NOT NULL,
            ativo INTEGER NOT NULL DEFAULT 1,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
        , materia TEXT NOT NULL DEFAULT 'Português', dificuldade TEXT NOT NULL DEFAULT 'Média', topico_id INTEGER, tipo TEXT NOT NULL DEFAULT 'disciplina');

-- Tabela: postits
CREATE TABLE postits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        usuario_id INTEGER NOT NULL,

        titulo TEXT NOT NULL,

        conteudo TEXT NOT NULL,

        cor TEXT NOT NULL DEFAULT '#FFF3A3',

        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,

        data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
    );

-- Tabela: provas
CREATE TABLE provas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        ano INTEGER NOT NULL,

        titulo TEXT NOT NULL,

        arquivo_prova TEXT NOT NULL,

        arquivo_gabarito TEXT NOT NULL,

        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- Tabela: materias
CREATE TABLE materias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            nome TEXT NOT NULL,

            slug TEXT NOT NULL UNIQUE,

            icone TEXT DEFAULT 'book',

            cor TEXT DEFAULT '#2196F3',

            descricao TEXT DEFAULT '',

            ativa INTEGER NOT NULL DEFAULT 1,

            ordem INTEGER NOT NULL DEFAULT 0,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

-- Tabela: topicos
CREATE TABLE topicos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,

                materia_id INTEGER NOT NULL,

                nome TEXT NOT NULL,

                descricao TEXT DEFAULT '',

                ordem INTEGER NOT NULL DEFAULT 0,

                ativo INTEGER NOT NULL DEFAULT 1,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (materia_id)
                    REFERENCES materias(id)
                    ON DELETE CASCADE
            );

-- Tabela: flashcards
CREATE TABLE flashcards (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        primario TEXT NOT NULL,

        secundario TEXT NOT NULL,

        materia TEXT NOT NULL,

        ativo INTEGER NOT NULL DEFAULT 1,

        created_at DATETIME
            DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME
            DEFAULT CURRENT_TIMESTAMP
    , topico_id INTEGER REFERENCES topicos(id) ON DELETE SET NULL);

-- Tabela: conteudos_estudados
CREATE TABLE conteudos_estudados (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        usuario_id INTEGER NOT NULL,

        topico_id INTEGER NOT NULL,

        estudado INTEGER NOT NULL DEFAULT 1,

        data_estudo DATETIME
            DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (usuario_id)
            REFERENCES usuarios(id)
            ON DELETE CASCADE,

        FOREIGN KEY (topico_id)
            REFERENCES topicos(id)
            ON DELETE CASCADE,

        UNIQUE (
            usuario_id,
            topico_id
        )
    );

-- Tabela: planos_automaticos
CREATE TABLE planos_automaticos (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            usuario_id INTEGER NOT NULL,

            meses INTEGER NOT NULL,

            dias_semana INTEGER NOT NULL,

            data_criacao DATETIME
                DEFAULT CURRENT_TIMESTAMP,

            atualizado_em DATETIME
                DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (usuario_id)
                REFERENCES usuarios(id)
                ON DELETE CASCADE
        );

-- Tabela: plano_atividades
CREATE TABLE plano_atividades (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            plano_id INTEGER NOT NULL,

            mes_numero INTEGER NOT NULL,

            semana_numero INTEGER NOT NULL,

            dia_semana TEXT NOT NULL,

            data_estudo TEXT,

            materia_id INTEGER,

            materia TEXT NOT NULL,

            topico_id INTEGER,

            topico TEXT NOT NULL,

            descricao TEXT DEFAULT '',

            horario TEXT DEFAULT '08:00',

            concluida INTEGER NOT NULL DEFAULT 0,

            FOREIGN KEY (plano_id)
                REFERENCES planos_automaticos(id)
                ON DELETE CASCADE,

            FOREIGN KEY (materia_id)
                REFERENCES materias(id)
                ON DELETE SET NULL,

            FOREIGN KEY (topico_id)
                REFERENCES topicos(id)
                ON DELETE SET NULL
        );

-- Tabela: resultados
CREATE TABLE resultados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            acertos INTEGER NOT NULL,
            erros INTEGER NOT NULL,
            total_questoes INTEGER NOT NULL,
            porcentagem REAL NOT NULL,
            data_realizacao DATETIME DEFAULT CURRENT_TIMESTAMP, simulado_id INTEGER, tentativa_id TEXT, detalhes_json TEXT,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );

-- Tabela: sessoes
CREATE TABLE sessoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            login_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            logout_em DATETIME,
            ativo INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );

-- Tabela: mural_postits
CREATE TABLE mural_postits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            materia TEXT NOT NULL,
            texto TEXT NOT NULL,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );

-- Tabela: simulado_questoes
CREATE TABLE simulado_questoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            simulado_id INTEGER NOT NULL,
            questao_id INTEGER NOT NULL,
            ordem INTEGER NOT NULL,
            FOREIGN KEY (simulado_id) REFERENCES simulados(id) ON DELETE CASCADE,
            FOREIGN KEY (questao_id) REFERENCES questoes(id) ON DELETE CASCADE,
            UNIQUE (simulado_id, questao_id)
        );

-- Tabela: sessoes_flashcards
CREATE TABLE sessoes_flashcards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        total_cards INTEGER NOT NULL DEFAULT 0,
        acertos INTEGER NOT NULL DEFAULT 0,
        erros INTEGER NOT NULL DEFAULT 0,
        data_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
        data_fim DATETIME DEFAULT NULL,
        FOREIGN KEY (usuario_id)
            REFERENCES usuarios(id)
            ON DELETE CASCADE
    );

-- Tabela: respostas_flashcards
CREATE TABLE respostas_flashcards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sessao_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        flashcard_id INTEGER NOT NULL,
        materia TEXT NOT NULL,
        acertou INTEGER NOT NULL,
        data_resposta DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sessao_id)
            REFERENCES sessoes_flashcards(id)
            ON DELETE CASCADE,
        FOREIGN KEY (usuario_id)
            REFERENCES usuarios(id)
            ON DELETE CASCADE,
        FOREIGN KEY (flashcard_id)
            REFERENCES flashcards(id)
            ON DELETE CASCADE
    );

-- Tabela: cronograma_atividades
CREATE TABLE cronograma_atividades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            data TEXT NOT NULL,
            horario TEXT NOT NULL DEFAULT '08:00',
            nome TEXT NOT NULL,
            materia TEXT NOT NULL,
            concluida INTEGER NOT NULL DEFAULT 0,
            origem TEXT DEFAULT NULL,
            topico_id INTEGER DEFAULT NULL,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (topico_id) REFERENCES topicos(id) ON DELETE SET NULL
        );

-- Tabela: paginas_conteudo
CREATE TABLE paginas_conteudo (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            topico_id INTEGER NOT NULL,

            titulo TEXT NOT NULL,

            descricao TEXT DEFAULT '',

            publicado INTEGER NOT NULL DEFAULT 1,

            created_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME
                DEFAULT CURRENT_TIMESTAMP, aparencia TEXT NOT NULL DEFAULT '{}',

            FOREIGN KEY (topico_id)
                REFERENCES topicos(id)
                ON DELETE CASCADE,

            UNIQUE (topico_id)
        );

-- Tabela: blocos_conteudo
CREATE TABLE blocos_conteudo (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            pagina_id INTEGER NOT NULL,

            tipo TEXT NOT NULL,

            ordem INTEGER NOT NULL DEFAULT 0,

            dados TEXT NOT NULL DEFAULT '{}',

            ativo INTEGER NOT NULL DEFAULT 1,

            created_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (pagina_id)
                REFERENCES paginas_conteudo(id)
                ON DELETE CASCADE
        );

-- Tabela: checklist_progresso
CREATE TABLE checklist_progresso (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            usuario_id INTEGER NOT NULL,

            bloco_id INTEGER NOT NULL,

            item_indice INTEGER NOT NULL,

            concluido INTEGER NOT NULL DEFAULT 0,

            updated_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (usuario_id)
                REFERENCES usuarios(id)
                ON DELETE CASCADE,

            FOREIGN KEY (bloco_id)
                REFERENCES blocos_conteudo(id)
                ON DELETE CASCADE,

            UNIQUE (
                usuario_id,
                bloco_id,
                item_indice
            )
        );

-- Tabela: datas_importantes
CREATE TABLE datas_importantes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            tipo TEXT NOT NULL DEFAULT 'Outro',
            data TEXT NOT NULL,
            descricao TEXT DEFAULT '',
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        , horario TEXT DEFAULT '', link TEXT DEFAULT '');

-- Tabela: cronogramas_modelos
CREATE TABLE cronogramas_modelos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT DEFAULT '',
      ativo INTEGER NOT NULL DEFAULT 0,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- Tabela: cronogramas_modelo_itens
CREATE TABLE cronogramas_modelo_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cronograma_id INTEGER NOT NULL,
      ordem INTEGER NOT NULL DEFAULT 0,
      materia_id INTEGER NOT NULL,
      topico_id INTEGER NOT NULL,
      FOREIGN KEY (cronograma_id)
        REFERENCES cronogramas_modelos(id)
        ON DELETE CASCADE,
      FOREIGN KEY (materia_id)
        REFERENCES materias(id)
        ON DELETE CASCADE,
      FOREIGN KEY (topico_id)
        REFERENCES topicos(id)
        ON DELETE CASCADE,
      UNIQUE (cronograma_id, ordem)
    );

-- Tabela: cronogramas_programados
CREATE TABLE cronogramas_programados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      frequencia_dias INTEGER NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      descricao TEXT DEFAULT '',
      ativo INTEGER NOT NULL DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- Tabela: cronogramas_programados_sessoes
CREATE TABLE cronogramas_programados_sessoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      programacao_id INTEGER NOT NULL,
      mes INTEGER NOT NULL,
      semana INTEGER NOT NULL,
      sessao INTEGER NOT NULL,
      materia_id INTEGER NOT NULL,
      topico_id INTEGER NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP, dia_estudo INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (programacao_id)
        REFERENCES cronogramas_programados(id)
        ON DELETE CASCADE,
      FOREIGN KEY (materia_id)
        REFERENCES materias(id)
        ON DELETE CASCADE,
      FOREIGN KEY (topico_id)
        REFERENCES topicos(id)
        ON DELETE CASCADE,
      UNIQUE (programacao_id, mes, semana, sessao)
    );

-- Tabela: cronogramas_programados_config
CREATE TABLE cronogramas_programados_config (
        programacao_id INTEGER PRIMARY KEY,
        meses INTEGER NOT NULL DEFAULT 12,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      );

-- Tabela: xp_eventos
CREATE TABLE xp_eventos (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            usuario_id INTEGER NOT NULL,

            action TEXT NOT NULL,

            data TEXT NOT NULL,

            quantidade INTEGER NOT NULL,

            criado_em DATETIME
                DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (usuario_id)
                REFERENCES usuarios(id)
                ON DELETE CASCADE
        );

-- Tabela: ranking_participantes
CREATE TABLE ranking_participantes (
    usuario_id INTEGER PRIMARY KEY,
    participando INTEGER NOT NULL DEFAULT 0 CHECK (participando IN (0, 1)),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

-- Tabela: xp_eventos_verificados
CREATE TABLE xp_eventos_verificados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    referencia TEXT NOT NULL,
    data TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    UNIQUE (usuario_id, action, referencia),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela: integridade_orfaos_arquivados
CREATE TABLE integridade_orfaos_arquivados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tabela TEXT NOT NULL,
        rowid_original INTEGER NOT NULL,
        dados_json TEXT NOT NULL,
        arquivado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

-- Tabela: terrario_usuario
CREATE TABLE terrario_usuario (
    usuario_id INTEGER PRIMARY KEY,
    sementes INTEGER NOT NULL DEFAULT 0 CHECK(sementes >= 0),
    sala_desbloqueada INTEGER NOT NULL DEFAULT 1,
    sala_ativa INTEGER NOT NULL DEFAULT 1,
    total_sessoes_concluidas INTEGER NOT NULL DEFAULT 0,
    tempo_total_foco_segundos INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

-- Tabela: terrario_inventario
CREATE TABLE terrario_inventario (
    usuario_id INTEGER NOT NULL,
    item_id TEXT NOT NULL,
    equipado INTEGER NOT NULL DEFAULT 0 CHECK(equipado IN (0, 1)),
    posicao_x REAL,
    posicao_y REAL,
    PRIMARY KEY(usuario_id, item_id),
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

-- Tabela: terrario_catalogo
CREATE TABLE terrario_catalogo (
    item_id TEXT PRIMARY KEY,
    preco INTEGER NOT NULL CHECK(preco>=0)
  );

-- Tabela: terrario_item_escalas
CREATE TABLE terrario_item_escalas (
    usuario_id INTEGER NOT NULL,
    item_id TEXT NOT NULL,
    escala REAL NOT NULL DEFAULT 1 CHECK(escala >= 0.6 AND escala <= 1.5),
    PRIMARY KEY(usuario_id,item_id),
    FOREIGN KEY(usuario_id,item_id) REFERENCES terrario_inventario(usuario_id,item_id) ON DELETE CASCADE
  );

-- Tabela: terrario_sessoes
CREATE TABLE "terrario_sessoes" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    materia TEXT NOT NULL,
    duracao_minutos INTEGER NOT NULL CHECK(duracao_minutos BETWEEN 1 AND 120),
    restante_segundos INTEGER NOT NULL,
    estado TEXT NOT NULL DEFAULT 'em_andamento'
      CHECK(estado IN ('em_andamento', 'pausada', 'concluida', 'cancelada')),
    iniciada_em_ms INTEGER NOT NULL,
    ativo_desde_ms INTEGER,
    concluida_em_ms INTEGER,
    sementes_recebidas INTEGER NOT NULL DEFAULT 0,
    xp_recebido INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

-- Tabela: planos_pessoais
CREATE TABLE planos_pessoais (
    usuario_id INTEGER PRIMARY KEY,
    configuracao TEXT NOT NULL,
    salvo_em INTEGER NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

-- Tabela: cronogramas_programados_versoes
CREATE TABLE cronogramas_programados_versoes (programacao_id INTEGER PRIMARY KEY, versao INTEGER NOT NULL DEFAULT 1, FOREIGN KEY(programacao_id) REFERENCES cronogramas_programados(id) ON DELETE CASCADE);

-- Tabela: cronogramas_programados_publicados
CREATE TABLE cronogramas_programados_publicados (
    programacao_id INTEGER PRIMARY KEY, modelo_json TEXT NOT NULL,
    versao INTEGER NOT NULL, publicado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (programacao_id) REFERENCES cronogramas_programados(id) ON DELETE CASCADE
  );

-- Tabela: preferencias_contagem
CREATE TABLE preferencias_contagem (
    usuario_id INTEGER PRIMARY KEY,
    exibir_card INTEGER NOT NULL DEFAULT 1 CHECK (exibir_card IN (0, 1)),
    ocultar_numero INTEGER NOT NULL DEFAULT 0 CHECK (ocultar_numero IN (0, 1)),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

-- Tabela: simulado_tentativas
CREATE TABLE simulado_tentativas (
      id TEXT PRIMARY KEY,
      usuario_id INTEGER NOT NULL,
      simulado_id INTEGER NOT NULL,
      questoes_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'em_andamento' CHECK(status IN ('em_andamento', 'concluida')),
      criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      concluida_em DATETIME,
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY(simulado_id) REFERENCES simulados(id) ON DELETE CASCADE
    );

-- Índices
CREATE INDEX idx_topicos_materia
                ON topicos(materia_id);
CREATE INDEX idx_materias_ordem
                ON materias(ordem);
CREATE INDEX idx_flashcards_materia
        ON flashcards(materia);
CREATE INDEX idx_conteudos_estudados_usuario
    ON conteudos_estudados(usuario_id);
CREATE INDEX idx_planos_automaticos_usuario
        ON planos_automaticos(usuario_id);
CREATE INDEX idx_plano_atividades_plano
        ON plano_atividades(plano_id);
CREATE INDEX idx_plano_atividades_data
        ON plano_atividades(data_estudo);
CREATE INDEX idx_sessoes_flashcards_usuario
    ON sessoes_flashcards(usuario_id);
CREATE INDEX idx_respostas_flashcards_usuario
    ON respostas_flashcards(usuario_id);
CREATE INDEX idx_respostas_flashcards_materia
    ON respostas_flashcards(usuario_id, materia);
CREATE INDEX idx_cronograma_usuario ON cronograma_atividades(usuario_id);
CREATE INDEX idx_cronograma_usuario_data ON cronograma_atividades(usuario_id, data);
CREATE INDEX idx_paginas_conteudo_topico
        ON paginas_conteudo(topico_id);
CREATE INDEX idx_blocos_conteudo_pagina
        ON blocos_conteudo(pagina_id);
CREATE INDEX idx_blocos_conteudo_ordem
        ON blocos_conteudo(pagina_id, ordem);
CREATE INDEX idx_checklist_progresso_usuario

        ON checklist_progresso(
            usuario_id
        );
CREATE INDEX idx_checklist_progresso_bloco

        ON checklist_progresso(
            bloco_id
        );
CREATE INDEX idx_flashcards_topico ON flashcards(topico_id);
CREATE INDEX idx_simulados_topico ON simulados(topico_id);
CREATE INDEX idx_simulados_materia
        ON simulados(materia);
CREATE INDEX idx_datas_importantes_data
        ON datas_importantes(data);
CREATE INDEX idx_cronogramas_modelos_ativo
    ON cronogramas_modelos(ativo);
CREATE INDEX idx_cronogramas_modelo_itens_cronograma
    ON cronogramas_modelo_itens(cronograma_id, ordem);
CREATE INDEX idx_cronogramas_programados_frequencia
    ON cronogramas_programados(frequencia_dias);
CREATE INDEX idx_cronogramas_programados_sessoes_programacao
    ON cronogramas_programados_sessoes(programacao_id, mes, semana, sessao);
CREATE INDEX idx_cronogramas_programados_ativo
    ON cronogramas_programados(ativo);
CREATE INDEX idx_cronogramas_programados_config_meses
    ON cronogramas_programados_config(meses);
CREATE INDEX idx_cronogramas_programados_sessoes_topico
    ON cronogramas_programados_sessoes(topico_id);
CREATE INDEX idx_resultados_usuario
            ON resultados(usuario_id);
CREATE INDEX idx_resultados_simulado
                    ON resultados(simulado_id);
CREATE INDEX idx_xp_eventos_usuario_acao_data

        ON xp_eventos(
            usuario_id,
            action,
            data
        );
CREATE INDEX idx_xp_verificados_diario
        ON xp_eventos_verificados(usuario_id, action, data);
CREATE UNIQUE INDEX idx_resultados_tentativa_unica
                ON resultados(usuario_id, tentativa_id);
CREATE UNIQUE INDEX idx_terrario_sessao_ativa
    ON terrario_sessoes(usuario_id)
    WHERE estado IN ('em_andamento', 'pausada');
CREATE INDEX idx_terrario_sessoes_usuario
    ON terrario_sessoes(usuario_id, id DESC);
CREATE INDEX idx_questoes_materia_topico_dificuldade ON questoes(materia_id, topico_id, dificuldade);
CREATE INDEX idx_simulado_tentativas_usuario ON simulado_tentativas(usuario_id, simulado_id, status);

-- Gatilhos (triggers)
CREATE TRIGGER trg_xp_verificado_saldo
        AFTER INSERT ON xp_eventos_verificados
        BEGIN
            UPDATE usuarios SET
                xp = COALESCE(xp, 0) + NEW.quantidade,
                streak = CASE
                    WHEN last_active_date = NEW.data THEN COALESCE(streak, 0)
                    WHEN last_active_date = date(NEW.data, '-1 day') THEN COALESCE(streak, 0) + 1
                    ELSE 1
                END,
                last_active_date = NEW.data
            WHERE id = NEW.usuario_id;
        END;

CREATE TRIGGER trg_terrario_comprar_item
    AFTER INSERT ON terrario_inventario
    WHEN NEW.item_id <> 'vasinho'
    BEGIN
      UPDATE terrario_usuario SET sementes = sementes -
        (SELECT preco FROM terrario_catalogo WHERE item_id=NEW.item_id)
      WHERE usuario_id=NEW.usuario_id;
    END;

CREATE TRIGGER trg_terrario_conclusao
    AFTER UPDATE OF estado ON terrario_sessoes
    WHEN OLD.estado != 'concluida' AND NEW.estado = 'concluida'
    BEGIN
      INSERT OR IGNORE INTO terrario_usuario(usuario_id) VALUES(NEW.usuario_id);
      UPDATE terrario_usuario SET
        sementes = sementes + NEW.sementes_recebidas,
        total_sessoes_concluidas = total_sessoes_concluidas +
          CASE WHEN NEW.duracao_minutos >= 15 THEN 1 ELSE 0 END,
        tempo_total_foco_segundos = tempo_total_foco_segundos +
          NEW.duracao_minutos * 60,
        sala_desbloqueada = CASE
          WHEN total_sessoes_concluidas +
            CASE WHEN NEW.duracao_minutos >= 15 THEN 1 ELSE 0 END >= 5
          THEN MAX(sala_desbloqueada, 2) ELSE sala_desbloqueada END
      WHERE usuario_id = NEW.usuario_id;
      INSERT INTO xp_eventos_verificados(usuario_id, action, referencia, data, quantidade)
        SELECT NEW.usuario_id, 'foco_concluido', CAST(NEW.id AS TEXT),
               date('now'), NEW.xp_recebido
        WHERE NEW.xp_recebido > 0
        ON CONFLICT(usuario_id, action, referencia) DO NOTHING;
    END;

CREATE TRIGGER trg_terrario_liberar_sala3
    AFTER UPDATE OF total_sessoes_concluidas ON terrario_usuario
    WHEN NEW.total_sessoes_concluidas >= 10 AND NEW.sala_desbloqueada < 3
    BEGIN
      UPDATE terrario_usuario SET sala_desbloqueada=3 WHERE usuario_id=NEW.usuario_id;
    END;

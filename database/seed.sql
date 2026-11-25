-- =====================================================================
-- Tenna — Dados iniciais (seed): matérias fixas e catálogo do terrário
-- Executar depois de schema.sql
-- =====================================================================

-- materias
INSERT OR IGNORE INTO materias (id, nome, slug, icone, cor, descricao, ativa, ordem, created_at, updated_at) VALUES (1, 'Português', 'portugues', 'book', '#51A9E5', '', 1, 1, '2026-11-24 12:33:47', '2026-11-24 12:33:47');
INSERT OR IGNORE INTO materias (id, nome, slug, icone, cor, descricao, ativa, ordem, created_at, updated_at) VALUES (2, 'Matemática', 'matematica', 'calculator', '#E8565B', '', 1, 2, '2026-11-24 12:33:47', '2026-11-24 12:33:47');
INSERT OR IGNORE INTO materias (id, nome, slug, icone, cor, descricao, ativa, ordem, created_at, updated_at) VALUES (3, 'História', 'historia', 'landmark', '#AA7541', '', 1, 3, '2026-11-24 12:33:47', '2026-11-24 12:33:47');
INSERT OR IGNORE INTO materias (id, nome, slug, icone, cor, descricao, ativa, ordem, created_at, updated_at) VALUES (4, 'Geografia', 'geografia', 'globe', '#55A75B', '', 1, 4, '2026-11-24 12:33:47', '2026-11-24 12:33:47');
INSERT OR IGNORE INTO materias (id, nome, slug, icone, cor, descricao, ativa, ordem, created_at, updated_at) VALUES (5, 'Ciências', 'ciencias', 'flask', '#8C5AD0', '', 1, 5, '2026-11-24 12:33:47', '2026-11-24 12:33:47');

-- terrario_catalogo
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('vasinho', 0);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('mesa', 6);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('banquinho', 2);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('luminaria', 4);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('cama', 8);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('prateleira', 6);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('quadro', 4);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('estante', 8);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('lampiao', 4);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('bau', 6);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('tapete', 2);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('mesa_redonda', 8);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('almofada', 2);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('banquinho_tronco', 2);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('s2_globo', 6);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('s2_tapete_redondo', 4);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('s3_mesa', 10);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('s3_lousa', 6);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('s3_relogio', 2);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('s3_mochila', 4);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('s3_calendario', 2);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('s3_painel', 6);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('s3_tapete', 4);
INSERT OR IGNORE INTO terrario_catalogo (item_id, preco) VALUES ('guarda_roupa', 8);


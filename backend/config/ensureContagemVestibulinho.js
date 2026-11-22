const db = require('./db');

// Preferências do aluno sobre a contagem regressiva do Vestibulinho:
//  - exibir_card: 1 mostra o card na tela Início, 0 remove o card (opção do Perfil);
//  - ocultar_numero: 1 mantém o card, mas esconde o número (olhinho do card).
// Sem linha na tabela vale o padrão: card visível e número visível.
db.run(`
  CREATE TABLE IF NOT EXISTS preferencias_contagem (
    usuario_id INTEGER PRIMARY KEY,
    exibir_card INTEGER NOT NULL DEFAULT 1 CHECK (exibir_card IN (0, 1)),
    ocultar_numero INTEGER NOT NULL DEFAULT 0 CHECK (ocultar_numero IN (0, 1)),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )
`);

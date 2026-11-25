// Troca o e-mail e a senha do administrador no banco atual.
// Uso (dentro da pasta backend, com o back-end parado):  node trocarAdmin.js
// Depois de rodar, pode apagar este arquivo.
const path = require('node:path');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3');

const NOVO_EMAIL = 'admin@tenna.com';
const NOVA_SENHA = 'MNRtenna26';

const db = new sqlite3.Database(path.join(__dirname, 'banco', 'vestibulinho.sqlite'));

bcrypt.hash(NOVA_SENHA, 10).then((hash) => {
  db.run(
    "UPDATE usuarios SET email = ?, senha = ?, reset_senha_token_hash = NULL, reset_senha_expira_em = NULL WHERE tipo = 'admin'",
    [NOVO_EMAIL, hash],
    function (erro) {
      if (erro) {
        console.error('Erro:', erro.message);
        process.exit(1);
      }
      console.log(`${this.changes} administrador atualizado: ${NOVO_EMAIL}`);
      db.close();
    }
  );
});

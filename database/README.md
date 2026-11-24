# Banco de dados

O sistema usa **SQLite 3**. O banco que acompanha o repositório fica em `backend/banco/vestibulinho.sqlite`: contém o conteúdo da plataforma (matérias, conteúdos, questões, simulados, provas, flashcards, catálogo do terrário) e apenas a conta de administrador, sem dados de alunos.

- `schema.sql` — estrutura completa do banco (tabelas e índices), sem dados.
- `seed.sql` — dados iniciais (matérias e catálogo do terrário). Executar depois do `schema.sql`.

Para criar um banco vazio:

```bash
sqlite3 vestibulinho.sqlite < database/schema.sql
sqlite3 vestibulinho.sqlite < database/seed.sql
```

O back-end também cria e atualiza as tabelas automaticamente ao iniciar (`backend/config/ensure*.js`).

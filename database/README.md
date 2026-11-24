# Banco de dados

O sistema usa **SQLite 3**. O banco de desenvolvimento fica em `backend/banco/vestibulinho.sqlite`.

- `schema.sql` — estrutura completa do banco (tabelas e índices), sem dados.

Para criar um banco vazio:

```bash
sqlite3 vestibulinho.sqlite < database/schema.sql
```

O back-end também cria e atualiza as tabelas automaticamente ao iniciar (`backend/config/ensure*.js`).

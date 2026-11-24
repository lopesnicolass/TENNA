# Tenna — Plataforma de estudos para o Vestibulinho

O **Tenna** é uma aplicação web educacional desenvolvida como Trabalho de Conclusão de Curso (TCC). Reúne conteúdos de estudo, cronograma, calendário, mural, flashcards, banco de questões, simulados, indicadores de desempenho, ranking e área administrativa.

## Tecnologias e estrutura

- `frontend/`: React 19 e Vite — interface do estudante e da administração.
- `backend/`: Node.js, Express e SQLite — API, autenticação e persistência.
- `backend/banco/vestibulinho.sqlite`: banco de dados do projeto. É versionado no Git de propósito, para o mesmo banco acompanhar o projeto entre computadores. Pode conter contas e dados de estudantes; por isso mantenha o repositório **privado** e faça backup antes de qualquer atualização.
- `backend/uploads/`: arquivos enviados (conteúdos, questões e provas). Também são versionados, pois o banco faz referência a eles.
- `frontend/tests/` e `backend/tests/`: testes automatizados.

## Pré-requisitos

- Node.js 22.23.4 ou superior na linha 22 (ou uma versão LTS posterior compatível) e npm.
- Dois terminais para executar frontend e backend separadamente.

## Configuração do backend

O arquivo `backend/.env` é versionado junto com o projeto, para funcionar em qualquer computador sem configuração extra. Ele contém o `JWT_SECRET` (mínimo de 32 caracteres) e pode ter também `PORT`, `FRONTEND_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`.

Como o `.env`, o banco SQLite e a pasta `backend/uploads/` ficam no repositório, mantenha-o **privado**. Antes de enviar o projeto para a banca ou torná-lo público, remova o `.env` do versionamento, gere um novo `JWT_SECRET` e use uma cópia anonimizada do banco.

## Como executar

Abra um terminal na pasta `backend`:

```bash
cd backend
npm ci
npm start
```

Abra outro terminal na pasta `frontend`:

```bash
cd frontend
npm ci
npm run dev
```

Acesse o endereço exibido pelo Vite, normalmente **http://localhost:5173**. Mantenha os dois terminais abertos enquanto usa a aplicação.

## Banco de questões e simulados

O projeto utiliza a tabela `questoes` existente como banco central. Na inicialização, uma migração não destrutiva complementa os registros com disciplina, conteúdo, dificuldade e habilidade, e cria o registro de tentativas dos simulados. Os simulados antigos permanecem como provas por disciplina. Questões antigas cuja associação ao conteúdo não pode ser deduzida com segurança devem ser classificadas pelo administrador na tela **Simulados → Banco de questões**.

Os simulados gerais permitem misturar questões de diferentes disciplinas. A seleção e a ordem de cada tentativa são registradas pelo servidor; a matéria e o conteúdo continuam identificados durante a prova e na correção.

## Testes e compilação

No terminal da pasta `backend`:

```bash
npm test
npm audit
```

No terminal da pasta `frontend`:

```bash
npm test
npm run lint
npm run build
npm audit
```

O build é criado em `frontend/dist/` e pode ser regenerado. As pastas `node_modules/` são recriadas com `npm ci`.

## Integridade do banco

Para verificar o SQLite, a partir da pasta `backend`:

```bash
node scripts/verificar_integridade_banco.cjs
```

A verificação não altera os dados. **Não execute scripts de reparo sem identificar um problema e fazer backup.**

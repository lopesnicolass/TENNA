# TENNA — Plataforma de Estudos para o Vestibulinho

![Logo da TENNA](src/assets/tenna_logo.webp)

## Descrição

A TENNA é uma plataforma web educacional desenvolvida como Trabalho de Conclusão de Curso (TCC), com o objetivo de auxiliar estudantes na organização e no acompanhamento de sua preparação para o Vestibulinho.

O sistema reúne funcionalidades como cronograma de estudos, calendário, conteúdos, flashcards, banco de questões, simulados e acompanhamento de desempenho. Também conta com recursos de gamificação para incentivar a continuidade dos estudos.

## Equipe

- Maria Luiza Duarte de Moura — Documentação 
- Nícolas da Silva — Back-end
- Ruan Pablo dela Penha Banho — Front-end

## Tecnologias Utilizadas

- HTML5, CSS3 e JavaScript (ES Modules)
- React (19.2.8), React Router DOM (7.18.2) e Vite (8.2.1)
- Node.js (22.19.0) e Express (5.2.1)
- SQLite (3), por meio do pacote `sqlite3` (6.0.1)
- Autenticação com JWT (`jsonwebtoken` 9.0.3) e `bcrypt` (6.0.0)

## Estrutura do repositório

```
📁 docs       → Documentação do TCC (questionário, fichamentos, teste de usabilidade)
📁 src        → Código-fonte do front-end (React)
📁 backend    → Código-fonte do back-end (Node.js + Express)
📁 design     → Protótipo, diagrama de casos de uso, DER, identidade visual e telas
📁 database   → Script SQL (schema.sql) e informações do banco
📁 tests      → Testes automatizados do front-end
📄 README.md  → Apresentação do projeto
```

## Imagens do Projeto

### Cronograma de estudos

![Cronograma da TENNA](design/telas/cronograma.png)

### Simulados

![Simulados da TENNA](design/telas/simulados.png)

Mais telas estão na pasta [`design/telas`](design/telas).

## Como executar o projeto

### Pré-requisitos

- Node.js instalado
- npm instalado

### 1. Clonar o repositório

```bash
git clone https://github.com/lopesnicolass/tcc.git
cd tcc
```

### 2. Configurar o back-end

```bash
cd backend
npm install
```

Crie o arquivo `.env` a partir do exemplo e preencha os valores (principalmente `JWT_SECRET`):

```bash
cp .env.example .env
```

(No Windows, copie o arquivo `.env.example` e renomeie a cópia para `.env`.)

Inicie o servidor (por padrão, em `http://localhost:3000`):

```bash
npm start
```

Opcional: para criar uma conta de administrador, preencha `ADMIN_EMAIL` e `ADMIN_PASSWORD` (mínimo de 12 caracteres) no `.env` e execute:

```bash
node criarAdmin.js
```

### 3. Configurar o front-end

Abra outro terminal na pasta principal do projeto:

```bash
npm install
npm run dev
```

Acesse o endereço disponibilizado pelo Vite no terminal (normalmente `http://localhost:5173`).

### 4. Testes (opcional)

```bash
npm test                  # front-end (pasta tests)
cd backend && npm test    # back-end
```

## Como citar o projeto

DE MOURA, Maria Luiza Duarte; DA SILVA, Nícolas; BANHO, Ruan Pablo dela Penha. TENNA: Plataforma de Estudos para o Vestibulinho. 2026. [Número de páginas] p.

Em caso de dúvidas, entre em contato com [e-mail do integrante 1] ou com [e-mail do integrante 2].

## Trabalho escrito

O trabalho escrito poderá ser consultado pelo Repositório Institucional do Centro Paula Souza:

https://ric.cps.sp.gov.br/
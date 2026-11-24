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

### Página inicial (Home)

![Página inicial da TENNA](design/telas/home.png)

### Página de destino

![Página de destino da TENNA](design/telas/PaginaDestino.png)

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

O banco de dados já acompanha o repositório (`backend/banco/vestibulinho.sqlite`) com a conta de administrador pronta, então não é necessário criar o admin. O script `node criarAdmin.js` só é usado se o banco for recriado do zero com os arquivos da pasta `database`.

### 3. Configurar o front-end

Abra outro terminal na pasta principal do projeto:

```bash
npm install
npm run dev
```

Acesse o endereço disponibilizado pelo Vite no terminal (normalmente `http://localhost:5173`).

### 4. Acesso para avaliação

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | admin@vestibulinho.com | Admin123 |
| Aluno | crie uma conta na tela de cadastro | a senha escolhida (mínimo de 6 caracteres) |

### 5. Testes (opcional)

```bash
npm test                  # front-end (pasta tests)
cd backend && npm test    # back-end
```

## Como citar o projeto

MOURA, Maria Luiza; SILVA, Nícolas; BANHO, Ruan Pablo. TENNA: Plataforma de Estudos para o Vestibulinho. 2026. 51 p.

Em caso de dúvidas, entre em contato com nicolaslopessilva2008@gmail.com ou com ruanpablodelapenha@gmail.com.

## Trabalho escrito

O trabalho escrito poderá ser consultado pelo Repositório Institucional do Centro Paula Souza:

https://ric.cps.sp.gov.br/
#!/usr/bin/env node
// Instala o banco de DEMONSTRAÇÃO em backend/banco/vestibulinho.sqlite.
//
// O banco de demonstração tem todo o conteúdo do Tenna (matérias, conteúdos,
// questões, simulados, flashcards, provas...) e NENHUM dado de usuário real:
// só um administrador e um aluno de demonstração.
//
// Uso (na pasta backend):
//   npm run demo               -> instala, se ainda não existir um banco
//   npm run demo -- --forcar   -> substitui o banco atual (faz backup antes)
//
// Segurança: sem --forcar, este script NUNCA altera um banco já existente.
const fs = require('fs');
const path = require('path');

const pastaBanco = path.join(__dirname, '..', 'banco');
const modelo = path.join(pastaBanco, 'demo', 'vestibulinho-demo.sqlite');
const destino = path.join(pastaBanco, 'vestibulinho.sqlite');
const forcar = process.argv.includes('--forcar');
const SUFIXOS = ['', '-wal', '-shm', '-journal'];

if (!fs.existsSync(modelo)) {
    console.error(`Banco de demonstração não encontrado em:\n  ${modelo}`);
    process.exit(1);
}

if (fs.existsSync(destino)) {
    if (!forcar) {
        console.log('Já existe um banco em backend/banco/vestibulinho.sqlite. Nada foi alterado.');
        console.log('Para substituí-lo pelo de demonstração (com backup automático), rode:');
        console.log('  npm run demo -- --forcar');
        process.exit(0);
    }

    const carimbo = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const base = path.join(pastaBanco, `vestibulinho-backup-${carimbo}.sqlite`);
    for (const sufixo of SUFIXOS) {
        const origem = destino + sufixo;
        if (fs.existsSync(origem)) {
            fs.copyFileSync(origem, base + sufixo);
            fs.unlinkSync(origem);
        }
    }
    console.log(`Backup do banco anterior salvo em:\n  ${base}`);
}

fs.mkdirSync(pastaBanco, { recursive: true });
fs.copyFileSync(modelo, destino);

console.log('\nBanco de demonstração instalado.');
console.log('Contas de demonstração (use somente para avaliar o sistema):');
console.log('  Administrador:  admin@tenna.demo  /  AdminDemo#2026');
console.log('  Aluno:          aluno@tenna.demo  /  AlunoDemo#2026');
console.log('\nPróximo passo: npm start');

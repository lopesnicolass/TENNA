#!/usr/bin/env bash
# Remove do HISTÓRICO do Git o banco SQLite, os uploads e qualquer .env.
# Não altera este repositório: cria um clone limpo em ../TENNA-limpo.
# Uso (na raiz do projeto):  bash limpar-historico.sh
set -euo pipefail

ORIGEM="$(git rev-parse --show-toplevel)"
DESTINO="${ORIGEM}-limpo"
URL="$(git -C "$ORIGEM" config --get remote.origin.url || true)"

[ -e "$DESTINO" ] && { echo "Já existe $DESTINO. Apague ou renomeie e rode de novo."; exit 1; }

echo "1/4 Clonando (só o que está commitado) em $DESTINO ..."
git clone --no-local --quiet "$ORIGEM" "$DESTINO"
cd "$DESTINO"
ANTES=$(du -sh .git | cut -f1)

echo "2/4 Reescrevendo o histórico (pode levar alguns minutos) ..."
export FILTER_BRANCH_SQUELCH_WARNING=1
git filter-branch --force --tag-name-filter cat \
  --index-filter '
    git ls-files -z -- "backend/banco/*" "backend/uploads/*" "*.sqlite" "*.sqlite3" "*.db" "*.env" ".env*" \
      | grep -zv -e "\.gitkeep$" -e "\.env\.example$" \
      | xargs -0 -r git rm --cached --ignore-unmatch -q --
  ' -- --all >/dev/null 2>&1

echo "3/4 Apagando restos e compactando ..."
rm -rf .git/refs/original
git reflog expire --expire=now --all
git gc --prune=now --aggressive --quiet
DEPOIS=$(du -sh .git | cut -f1)

echo "4/4 Verificando ..."
RESTOS=$(git log --all --oneline -- backend/banco/vestibulinho.sqlite 'backend/uploads/provas/*.pdf' | wc -l)
if [ "$RESTOS" -ne 0 ]; then echo "ERRO: ainda há $RESTOS commits com arquivos sensíveis."; exit 1; fi
[ -n "$URL" ] && git remote set-url origin "$URL" || git remote remove origin 2>/dev/null || true

echo
echo "Pronto. .git: $ANTES -> $DEPOIS | commits: $(git rev-list --all --count)"
echo "Confira o clone em: $DESTINO"
echo "Se estiver tudo certo, publique (ISSO SUBSTITUI o histórico remoto):"
echo "    cd \"$DESTINO\" && git push --force --all origin && git push --force --tags origin"
echo "Depois: redefina as senhas dos usuários que estavam no banco e peça que clones antigos sejam descartados."

// Guarda no navegador só os dados leves do usuário.
// Os bytes da foto de perfil NUNCA devem ir para o localStorage: várias telas
// leem esse valor com JSON.parse e ele ficaria com vários MB, travando a navegação.
export function serializarUsuarioLocal(usuario) {
  if (!usuario || typeof usuario !== 'object') return JSON.stringify(usuario ?? null);
  const copia = { ...usuario };
  delete copia.foto_perfil_dados;
  delete copia.foto_perfil_tipo;
  copia.foto_perfil = null;
  return JSON.stringify(copia);
}

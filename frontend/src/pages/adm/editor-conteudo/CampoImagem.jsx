import { useRef, useState } from 'react';
import { request } from './api.js';
import { Icon } from './icons.jsx';
import { urlDoArquivo } from '../../../utils/urlUpload.js';

const FORMATOS = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const LIMITE = 5 * 1024 * 1024;

// Envio de imagem do bloco: o administrador escolhe um arquivo do computador
// (PNG, JPG, WEBP ou GIF, até 5 MB). Não há campo para colar links.
export function CampoImagem({ url, alt, onEnviada, onRemover }) {
  const inputRef = useRef(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function aoEscolher(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!arquivo) return;

    if (!FORMATOS.includes(arquivo.type)) {
      setErro('Selecione uma imagem PNG, JPG, WEBP ou GIF.');
      return;
    }
    if (arquivo.size > LIMITE) {
      setErro('A imagem deve ter no máximo 5 MB.');
      return;
    }

    setEnviando(true);
    setErro('');
    try {
      const dados = new FormData();
      dados.append('imagem', arquivo);
      const resposta = await request(
        '/paginas-conteudo/imagem',
        { method: 'POST', body: dados },
        'Não foi possível enviar a imagem.'
      );
      onEnviada(resposta.imagem, arquivo.name);
    } catch (falha) {
      setErro(falha?.message || 'Não foi possível enviar a imagem.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="editor-field tenna-imagem-upload">
      <span className="editor-field-label">Imagem</span>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={aoEscolher}
        hidden
      />

      {url ? (
        <div className="tenna-imagem-upload-atual">
          <img src={urlDoArquivo(url)} alt={alt || 'Prévia da imagem'} />
          <div className="tenna-imagem-upload-acoes">
            <button
              type="button"
              className="editor-small-button"
              onClick={() => inputRef.current?.click()}
              disabled={enviando}
            >
              <Icon name="image" size={14} />
              {enviando ? 'Enviando...' : 'Trocar imagem'}
            </button>
            <button
              type="button"
              className="editor-small-button danger"
              onClick={onRemover}
              disabled={enviando}
            >
              Remover
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="tenna-imagem-upload-area"
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
        >
          <Icon name="image" size={22} />
          <strong>{enviando ? 'Enviando imagem...' : 'Escolher imagem do computador'}</strong>
          <small>PNG, JPG, WEBP ou GIF · até 5 MB</small>
        </button>
      )}

      {erro && <small className="tenna-imagem-upload-erro" role="alert">{erro}</small>}
    </div>
  );
}

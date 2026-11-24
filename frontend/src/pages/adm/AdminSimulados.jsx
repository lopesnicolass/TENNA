
import '../../styles/adm/AdminSimulados.css';
import '../../styles/adm/AdminSimuladosModal.css';
import { useEffect, useState } from 'react';
import { API_URL, obterToken } from '../../services/api.js';
import { Icon } from './admin-conteudos/icons.jsx';
import { AdminSelect } from '../../components/AdminSelect.jsx';

function headerAuth(comJson = false) {
  const headers = {
    Authorization: `Bearer ${obterToken()}`
  };

  if (comJson) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

const MIN_QUESTOES = 10;

const emptySimulado = {
  nome: '',
  limiteTempo: '',
  tipo: 'disciplina',
  materiaId: '',
  topicoId: ''
};

const emptyQuestao = {
  enunciado: '',
  a: '',
  b: '',
  c: '',
  d: '',
  e: '',
  correta: 'A',
  imagem: null,
  materiaId: '',
  topicoId: '',
  dificuldade: 'Média',
  habilidade: ''
};

export default function AdminSimulados() {
  const [simulados, setSimulados] = useState([]);
  const [materiasConteudos, setMateriasConteudos] = useState([]);
  const [bancoQuestoes, setBancoQuestoes] = useState([]);
  const [mostrarBancoQuestoes, setMostrarBancoQuestoes] = useState(false);
  const [filtroBancoMateria, setFiltroBancoMateria] = useState('');
  const [filtroBancoDificuldade, setFiltroBancoDificuldade] = useState('');
  const [filtroBancoTopico, setFiltroBancoTopico] = useState('');
  const [buscaBanco, setBuscaBanco] = useState('');
  const [mostrarGerenciadorBanco, setMostrarGerenciadorBanco] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptySimulado);
  const [conteudosAbertos, setConteudosAbertos] = useState(false);

  const [questoes, setQuestoes] = useState([]);
  const [questoesOriginais, setQuestoesOriginais] = useState([]);

  const [showQuestaoModal, setShowQuestaoModal] = useState(false);

  // Impede a rolagem da página de fundo enquanto qualquer modal estiver aberto.
  useEffect(() => {
    if (!showModal && !showQuestaoModal) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = anterior; };
  }, [showModal, showQuestaoModal]);
  const [questaoForm, setQuestaoForm] = useState(emptyQuestao);

  const [questaoEditando, setQuestaoEditando] = useState(null);
  const [questaoBancoMode, setQuestaoBancoMode] = useState(false);
  const [questaoBancoId, setQuestaoBancoId] = useState(null);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [erroImagem, setErroImagem] = useState('');

  const [simuladoEditando, setSimuladoEditando] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [carregandoQuestoes, setCarregandoQuestoes] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const [erro, setErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  useEffect(() => {
    if (!mensagemSucesso) return;
    const timer = setTimeout(() => setMensagemSucesso(''), 3500);
    return () => clearTimeout(timer);
  }, [mensagemSucesso]);

  useEffect(() => {
    carregarSimulados();
    carregarMateriasConteudos();
    carregarBancoQuestoes();
  }, []);

  // =====================================================
  // CARREGAR SIMULADOS
  // =====================================================

  async function carregarSimulados() {
    try {
      setCarregando(true);
      setErro('');

      const resposta = await fetch(`${API_URL}/simulados`, {
        headers: headerAuth()
      });

      if (!resposta.ok) {
        throw new Error('Erro ao carregar simulados.');
      }

      const dados = await resposta.json();

      setSimulados(dados.simulados || []);
    } catch (error) {
      console.error(error);

      setErro(
        'Não foi possível carregar os simulados. Verifique se o backend está rodando.'
      );
    } finally {
      setCarregando(false);
    }
  }

  // =====================================================
  // CARREGAR MATÉRIAS E CONTEÚDOS
  // =====================================================

  async function carregarMateriasConteudos() {
    try {
      const resposta = await fetch(
        `${API_URL}/conteudos`,
        {
          headers: headerAuth()
        }
      );

      if (!resposta.ok) {
        throw new Error(
          'Erro ao carregar matérias e conteúdos.'
        );
      }

      const dados = await resposta.json();

      setMateriasConteudos(
        Array.isArray(dados.materias)
          ? dados.materias
          : []
      );
    } catch (error) {
      console.error(error);

      setErro(
        'Não foi possível carregar as matérias e conteúdos.'
      );
    }
  }

  async function carregarBancoQuestoes() {
    try {
      const resposta = await fetch(`${API_URL}/questoes`, { headers: headerAuth() });
      if (!resposta.ok) throw new Error('Não foi possível carregar o banco de questões.');
      const dados = await resposta.json();
      setBancoQuestoes(Array.isArray(dados.questoes) ? dados.questoes : []);
    } catch (error) {
      console.error(error);
      setBancoQuestoes([]);
    }
  }

  // =====================================================
  // ABRIR MODAL PARA CRIAR
  // =====================================================

  function openCreate() {
    setSimuladoEditando(null);

    setForm({
      ...emptySimulado
    });
    setMostrarBancoQuestoes(false);
    setFiltroBancoMateria('');
    setFiltroBancoDificuldade('');
    setFiltroBancoTopico('');

    setQuestoes([]);
    setQuestoesOriginais([]);

    setQuestaoForm({
      ...emptyQuestao
    });

    setQuestaoEditando(null);

    setErro('');
    setShowModal(true);
  }

  // =====================================================
  // ABRIR MODAL PARA EDITAR
  // =====================================================

  async function abrirEditar(simulado) {
    try {
      setCarregandoQuestoes(true);
      setErro('');

      const resposta = await fetch(
        `${API_URL}/simulados/${simulado.id}`,
        { headers: headerAuth() }
      );

      if (!resposta.ok) {
        throw new Error('Não foi possível carregar o simulado.');
      }

      const dados = await resposta.json();

      const dadosSimulado =
        dados.simulado || simulado;

      // Aqui usamos a rota de admin (/simulados/:id/questoes),
      // que inclui o gabarito — a rota /simulados/:id (usada
      // pelo aluno) nunca traz o campo "correta".
      const respostaQuestoes = await fetch(
        `${API_URL}/simulados/${simulado.id}/questoes`,
        { headers: headerAuth() }
      );

      if (!respostaQuestoes.ok) {
        throw new Error('Não foi possível carregar as questões do simulado.');
      }

      const dadosQuestoes = await respostaQuestoes.json();

      const listaQuestoes =
        dadosQuestoes.questoes || [];

      setSimuladoEditando(simulado.id);

      const materiaEncontrada =
        materiasConteudos.find(
          (materia) =>
            String(materia.nome) ===
            String(dadosSimulado.materia)
        );

      setForm({
        nome: dadosSimulado.titulo || '',
        limiteTempo:
          dadosSimulado.tempo_limite || '',
        tipo: dadosSimulado.tipo === 'geral' ? 'geral' : 'disciplina',
        materiaId:
          materiaEncontrada
            ? String(materiaEncontrada.id)
            : '',
        topicoId:
          dadosSimulado.topico_id != null
            ? String(dadosSimulado.topico_id)
            : ''
      });

      const questoesFormatadas =
        listaQuestoes.map((questao) => ({
          id: questao.id,
          enunciado:
            questao.pergunta || '',
          a:
            questao.alternativa_a || '',
          b:
            questao.alternativa_b || '',
          c:
            questao.alternativa_c || '',
          d:
            questao.alternativa_d || '',
          e:
            questao.alternativa_e || '',
          correta:
            questao.correta || 'A',
          imagem: questao.imagem || null,
          materiaId: questao.materia_id != null ? String(questao.materia_id) : '',
          topicoId: questao.topico_id != null ? String(questao.topico_id) : '',
          dificuldade: questao.dificuldade || 'Não classificada',
          habilidade: questao.habilidade || '',
          materia: questao.materia || ''
        }));

      setQuestoes(questoesFormatadas);
      setQuestoesOriginais(questoesFormatadas);
      setMostrarBancoQuestoes(false);

      setQuestaoForm({
        ...emptyQuestao
      });

      setQuestaoEditando(null);

      setShowModal(true);
    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
        'Não foi possível abrir o simulado.'
      );

      alert(
        error.message ||
        'Não foi possível abrir o simulado.'
      );
    } finally {
      setCarregandoQuestoes(false);
    }
  }

  // =====================================================
  // ALTERAR FORMULÁRIO
  // =====================================================

  function alterarForm(campo, valor) {
    if (campo === 'materiaId' || campo === 'topicoId') setConteudosAbertos(false);
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
      ...(campo === 'materiaId'
        ? { topicoId: '' }
        : {})
    }));
  }

  // =====================================================
  // ABRIR MODAL DE QUESTÃO
  // =====================================================

  function abrirCriarQuestao() {
    setErroImagem('');
    setQuestaoBancoMode(false);
    setQuestaoBancoId(null);
    setQuestaoEditando(null);

    setQuestaoForm({
      ...emptyQuestao,
      materiaId: form.tipo === 'disciplina' ? form.materiaId : '',
      topicoId: form.tipo === 'disciplina' ? form.topicoId : ''
    });

    setShowQuestaoModal(true);
  }

  // =====================================================
  // ABRIR QUESTÃO PARA EDIÇÃO
  // =====================================================

  function abrirEditarQuestao(index) {
    setErroImagem('');
    setQuestaoBancoMode(false);
    setQuestaoBancoId(null);
    const questao = questoes[index];

    setQuestaoEditando(index);

    setQuestaoForm({
      ...questao
    });

    setShowQuestaoModal(true);
  }

  function abrirNovaQuestaoBanco() {
    setErroImagem('');
    setQuestaoBancoMode(true);
    setQuestaoBancoId(null);
    setQuestaoEditando(null);
    setQuestaoForm({ ...emptyQuestao });
    setShowQuestaoModal(true);
  }

  function abrirEditarQuestaoBanco(questao) {
    setErroImagem('');
    setQuestaoBancoMode(true);
    setQuestaoBancoId(Number(questao.id));
    setQuestaoEditando(null);
    setQuestaoForm({
      enunciado: questao.pergunta || '',
      a: questao.alternativa_a || '',
      b: questao.alternativa_b || '',
      c: questao.alternativa_c || '',
      d: questao.alternativa_d || '',
      e: questao.alternativa_e || '',
      correta: questao.correta || 'A',
      imagem: questao.imagem || null,
      materiaId: questao.materia_id != null ? String(questao.materia_id) : '',
      topicoId: questao.topico_id != null ? String(questao.topico_id) : '',
      dificuldade: questao.dificuldade || 'Não classificada',
      habilidade: questao.habilidade || ''
    });
    setShowQuestaoModal(true);
  }

  // =====================================================
  // ALTERAR QUESTÃO
  // =====================================================

  function alterarQuestao(campo, valor) {
    setQuestaoForm((prev) => ({
      ...prev,
      [campo]: valor
    }));
  }

  // Imagem é opcional e pertence apenas à questão editada.
  async function enviarImagemQuestao(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!arquivo) return;

    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(arquivo.type)) {
      setErroImagem('Selecione uma imagem PNG, JPG, WEBP ou GIF.');
      return;
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      setErroImagem('A imagem deve ter no máximo 5 MB.');
      return;
    }

    setEnviandoImagem(true);
    setErroImagem('');
    try {
      const dados = new FormData();
      dados.append('imagem', arquivo);
      const resposta = await fetch(`${API_URL}/questoes/imagem`, {
        method: 'POST',
        headers: headerAuth(),
        body: dados
      });
      const corpo = await resposta.json();
      if (!resposta.ok) throw new Error(corpo.mensagem || 'Falha ao enviar imagem.');
      setQuestaoForm(anterior => ({ ...anterior, imagem: corpo.imagem }));
    } catch (error) {
      setErroImagem(error.message || 'Não foi possível enviar a imagem.');
    } finally {
      setEnviandoImagem(false);
    }
  }

  function adicionarQuestaoDoBanco(questao) {
    if (questoes.some((item) => Number(item.id) === Number(questao.id))) {
      alert('Esta questão já está neste simulado.');
      return;
    }
    if (form.tipo === 'disciplina' && Number(questao.materia_id) !== Number(form.materiaId)) {
      alert('Este simulado aceita somente questões da matéria selecionada.');
      return;
    }
    if (!questao.materia_id || !questao.topico_id) {
      alert('Esta questão ainda não está classificada por disciplina e conteúdo. Edite-a no banco antes de adicioná-la.');
      return;
    }
    setQuestoes((atuais) => [...atuais, {
      id: questao.id,
      enunciado: questao.pergunta || '',
      a: questao.alternativa_a || '',
      b: questao.alternativa_b || '',
      c: questao.alternativa_c || '',
      d: questao.alternativa_d || '',
      e: questao.alternativa_e || '',
      correta: questao.correta || 'A',
      imagem: questao.imagem || null,
      materiaId: String(questao.materia_id),
      topicoId: questao.topico_id != null ? String(questao.topico_id) : '',
      dificuldade: questao.dificuldade || 'Não classificada',
      habilidade: questao.habilidade || '',
      materia: questao.materia_nome || questao.materia || ''
    }]);
  }

  // =====================================================
  // SALVAR QUESTÃO NO FORMULÁRIO
  // =====================================================

  async function handleAddQuestao(e) {
    e.preventDefault();
    if (enviandoImagem || salvando) return;

    if (
      !questaoForm.enunciado.trim() ||
      !questaoForm.a.trim() ||
      !questaoForm.b.trim() ||
      !questaoForm.c.trim() ||
      !questaoForm.d.trim() ||
      !questaoForm.e.trim() ||
      !questaoForm.correta ||
      !questaoForm.materiaId ||
      !questaoForm.topicoId
    ) {
      alert('Preencha o enunciado, as alternativas, o gabarito e a classificação da questão.');
      return;
    }

    if (!questaoBancoMode && form.tipo === 'disciplina' && Number(questaoForm.materiaId) !== Number(form.materiaId)) {
      alert('A questão precisa pertencer à matéria selecionada para este simulado.');
      return;
    }

    if (questaoBancoMode) {
      try {
        setSalvando(true);
        const resposta = await fetch(
          questaoBancoId ? `${API_URL}/questoes/${questaoBancoId}` : `${API_URL}/questoes`,
          {
            method: questaoBancoId ? 'PUT' : 'POST',
            headers: headerAuth(true),
            body: JSON.stringify({
              pergunta: questaoForm.enunciado.trim(),
              alternativaA: questaoForm.a.trim(),
              alternativaB: questaoForm.b.trim(),
              alternativaC: questaoForm.c.trim(),
              alternativaD: questaoForm.d.trim(),
              alternativaE: questaoForm.e.trim(),
              correta: questaoForm.correta,
              materiaId: Number(questaoForm.materiaId),
              topicoId: Number(questaoForm.topicoId),
              dificuldade: questaoForm.dificuldade,
              habilidade: questaoForm.habilidade || '',
              imagem: questaoForm.imagem || null
            })
          }
        );
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.mensagem || 'Não foi possível salvar a questão no banco.');
        await carregarBancoQuestoes();
        setMostrarGerenciadorBanco(true);
        setShowQuestaoModal(false);
        setQuestaoBancoMode(false);
        setQuestaoBancoId(null);
        setQuestaoEditando(null);
        setQuestaoForm({ ...emptyQuestao });
        alert(questaoBancoId ? 'Questão atualizada no banco.' : 'Questão cadastrada no banco.');
      } catch (error) {
        console.error(error);
        alert(error.message || 'Não foi possível salvar a questão.');
      } finally {
        setSalvando(false);
      }
      return;
    }

    if (questaoEditando !== null) {
      setQuestoes((prev) =>
        prev.map((questao, index) =>
          index === questaoEditando
            ? { ...questaoForm, id: questao.id }
            : questao
        )
      );
    } else {
      setQuestoes((prev) => [...prev, { ...questaoForm }]);
    }

    setQuestaoForm({ ...emptyQuestao });
    setQuestaoEditando(null);
    setShowQuestaoModal(false);
  }

  // =====================================================
  // REMOVER QUESTÃO DA LISTA
  // =====================================================

  function removerQuestao(index) {
    const confirmar = window.confirm(
      'Deseja realmente remover esta questão?'
    );

    if (!confirmar) {
      return;
    }

    setQuestoes((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  // =====================================================
  // EXCLUIR SIMULADO
  // =====================================================

  async function excluirSimulado() {
    if (!simuladoEditando) {
      return;
    }

    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este simulado?\n\n' +
      'O simulado e os vínculos das questões serão excluídos permanentemente.'
    );

    if (!confirmar) {
      return;
    }

    try {
      setExcluindo(true);
      setErro('');

      const resposta = await fetch(
        `${API_URL}/simulados/${simuladoEditando}`,
        {
          method: 'DELETE',
          headers: headerAuth()
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem ||
          dados.erro ||
          'Erro ao excluir o simulado.'
        );
      }

      alert(
        dados.mensagem ||
        'Simulado excluído com sucesso!'
      );

      setShowModal(false);

      setSimuladoEditando(null);

      setForm({
        ...emptySimulado
      });

      setQuestoes([]);
      setQuestoesOriginais([]);

      setQuestaoForm({
        ...emptyQuestao
      });

      setQuestaoEditando(null);

      await carregarSimulados();

    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
        'Não foi possível excluir o simulado.'
      );

      alert(
        error.message ||
        'Não foi possível excluir o simulado.'
      );
    } finally {
      setExcluindo(false);
    }
  }

  // =====================================================
  // VALIDAR SIMULADO
  // =====================================================

  function validarSimulado() {
    if (!form.nome.trim()) {
      alert('Preencha o nome do simulado.');
      return false;
    }

    if (
      form.limiteTempo === '' ||
      Number(form.limiteTempo) <= 0
    ) {
      alert('Informe um limite de tempo válido.');
      return false;
    }

    if (form.tipo === 'disciplina') {
      if (!form.materiaId) {
        alert('Selecione uma matéria.');
        return false;
      }
      if (!form.topicoId) {
        alert('Selecione um conteúdo.');
        return false;
      }
      const materiaSelecionada = materiasConteudos.find((materia) => String(materia.id) === String(form.materiaId));
      const topicoSelecionado = materiaSelecionada?.topicos?.find((topico) => String(topico.id) === String(form.topicoId));
      if (!materiaSelecionada || !topicoSelecionado) {
        alert('Selecione um conteúdo existente na matéria escolhida.');
        return false;
      }
    }

    if (questoes.some((questao) => !questao.materiaId || !questao.topicoId)) {
      alert('Classifique cada questão do banco com matéria e conteúdo antes de salvar o simulado.');
      return false;
    }
    if (form.tipo === 'disciplina' && questoes.some((questao) => Number(questao.materiaId) !== Number(form.materiaId))) {
      alert('Os simulados por disciplina só podem conter questões da matéria selecionada.');
      return false;
    }

    if (questoes.length < MIN_QUESTOES) {
      alert(
        `É necessário adicionar no mínimo ${MIN_QUESTOES} questões.`
      );
      return false;
    }

    return true;
  }

  // =====================================================
  // CRIAR NOVO SIMULADO
  // =====================================================

  async function criarSimulado() {
    const materiaSelecionada = form.tipo === 'disciplina'
      ? materiasConteudos.find((materia) => String(materia.id) === String(form.materiaId))
      : null;

    const respostaSimulado = await fetch(
      `${API_URL}/simulados`,
      {
        method: 'POST',
        headers: headerAuth(true),
        body: JSON.stringify({
          titulo: form.nome.trim(),
          descricao: '',
          tempoLimite: Number(form.limiteTempo),
          quantidadeQuestoes: questoes.length,
          tipo: form.tipo,
          materia: materiaSelecionada?.nome || 'Simulados Gerais',
          topicoId: form.tipo === 'disciplina' ? Number(form.topicoId) : null,
          dificuldade: simuladoEditando ? (simulados.find(item => item.id === simuladoEditando)?.dificuldade || 'Média') : 'Média',
          ativo: 1
        })
      }
    );

    const dadosSimulado =
      await respostaSimulado.json();

    if (!respostaSimulado.ok) {
      throw new Error(
        dadosSimulado.mensagem ||
        dadosSimulado.erro ||
        'Erro ao cadastrar simulado.'
      );
    }

    const simuladoCriado =
      dadosSimulado.simulado ||
      dadosSimulado;

    const simuladoId =
      simuladoCriado.id ||
      dadosSimulado.id;

    if (!simuladoId) {
      throw new Error(
        'O backend não retornou o ID do simulado.'
      );
    }

    // Questões novas são cadastradas; questões já existentes no banco apenas recebem o vínculo.
    for (let i = 0; i < questoes.length; i++) {
      const questao = questoes[i];
      let questaoId = questao.id;

      if (!questaoId) {
        const respostaQuestao = await fetch(`${API_URL}/questoes`, {
          method: 'POST',
          headers: headerAuth(true),
          body: JSON.stringify({
            pergunta: questao.enunciado.trim(),
            alternativaA: questao.a.trim(), alternativaB: questao.b.trim(),
            alternativaC: questao.c.trim(), alternativaD: questao.d.trim(),
            alternativaE: questao.e.trim(), correta: questao.correta,
            materiaId: Number(questao.materiaId),
            topicoId: Number(questao.topicoId),
            dificuldade: questao.dificuldade,
            habilidade: questao.habilidade || '',
            imagem: questao.imagem || null
          })
        });
        const dadosQuestao = await respostaQuestao.json();
        if (!respostaQuestao.ok) throw new Error(dadosQuestao.mensagem || `Erro ao cadastrar a questão ${i + 1}.`);
        questaoId = dadosQuestao.questao?.id || dadosQuestao.id;
        if (!questaoId) throw new Error(`O backend não retornou o ID da questão ${i + 1}.`);
      }

      const respostaVinculo = await fetch(`${API_URL}/simulados/${simuladoId}/questoes`, {
        method: 'POST',
        headers: headerAuth(true),
        body: JSON.stringify({ questaoId, ordem: i + 1 })
      });
      const dadosVinculo = await respostaVinculo.json();
      if (!respostaVinculo.ok) throw new Error(dadosVinculo.mensagem || `Erro ao vincular a questão ${i + 1}.`);
    }
  }

  // =====================================================
  // EDITAR SIMULADO
  // =====================================================

  async function editarSimulado() {
    const simuladoId = simuladoEditando;

    if (!simuladoId) {
      throw new Error(
        'ID do simulado não encontrado.'
      );
    }

    // Remover do banco as questões que existiam quando o
    // simulado foi aberto, mas não fazem mais parte da lista atual.
    const idsAtuais = new Set(
      questoes
        .filter((questao) => questao.id)
        .map((questao) => Number(questao.id))
    );

    const idsRemovidos = questoesOriginais
      .filter((questao) => {
        const id = Number(questao.id);
        return id && !idsAtuais.has(id);
      })
      .map((questao) => Number(questao.id));

    for (const questaoId of idsRemovidos) {
      const respostaRemocao = await fetch(
        `${API_URL}/simulados/${simuladoId}/questoes/${questaoId}`,
        {
          method: 'DELETE',
          headers: headerAuth()
        }
      );

      const dadosRemocao =
        await respostaRemocao.json();

      if (!respostaRemocao.ok) {
        throw new Error(
          dadosRemocao.mensagem ||
          dadosRemocao.erro ||
          'Erro ao remover uma questão do simulado.'
        );
      }
    }

    // Atualizar informações do simulado
    const materiaSelecionada = form.tipo === 'disciplina'
      ? materiasConteudos.find((materia) => String(materia.id) === String(form.materiaId))
      : null;

    const respostaSimulado = await fetch(
      `${API_URL}/simulados/${simuladoId}`,
      {
        method: 'PUT',
        headers: headerAuth(true),
        body: JSON.stringify({
          titulo: form.nome.trim(),
          descricao: '',
          tempoLimite: Number(form.limiteTempo),
          quantidadeQuestoes: questoes.length,
          tipo: form.tipo,
          materia: materiaSelecionada?.nome || 'Simulados Gerais',
          topicoId: form.tipo === 'disciplina' ? Number(form.topicoId) : null,
          dificuldade: simulados.find(item => String(item.id) === String(simuladoId))?.dificuldade || 'Média',
          ativo: 1
        })
      }
    );

    const dadosSimulado =
      await respostaSimulado.json();

    if (!respostaSimulado.ok) {
      throw new Error(
        dadosSimulado.mensagem ||
        dadosSimulado.erro ||
        'Erro ao atualizar o simulado.'
      );
    }

    // Processar questões
    for (let i = 0; i < questoes.length; i++) {
      const questao = questoes[i];

      // Questão que já existe
      if (questao.id) {
        const respostaQuestao =
          await fetch(
            `${API_URL}/questoes/${questao.id}`,
            {
              method: 'PUT',
              headers: headerAuth(true),
              body: JSON.stringify({
                pergunta:
                  questao.enunciado.trim(),

                alternativaA:
                  questao.a.trim(),

                alternativaB:
                  questao.b.trim(),

                alternativaC:
                  questao.c.trim(),

                alternativaD:
                  questao.d.trim(),

                alternativaE:
                  questao.e.trim(),

                correta:
                  questao.correta,

                materiaId: Number(questao.materiaId),
                topicoId: Number(questao.topicoId),
                dificuldade: questao.dificuldade,
                habilidade: questao.habilidade || '',
                imagem: questao.imagem || null
              })
            }
          );

        const dadosQuestao =
          await respostaQuestao.json();

        if (!respostaQuestao.ok) {
          throw new Error(
            dadosQuestao.mensagem ||
            dadosQuestao.erro ||
            `Erro ao atualizar a questão ${i + 1}.`
          );
        }

        // Atualizar ordem
        const respostaOrdem =
          await fetch(
            `${API_URL}/simulados/${simuladoId}/questoes/${questao.id}`,
            {
              method: 'PUT',
              headers: headerAuth(true),
              body: JSON.stringify({
                ordem: i + 1
              })
            }
          );

        if (!respostaOrdem.ok) {
          const dadosOrdem =
            await respostaOrdem.json();

          throw new Error(
            dadosOrdem.mensagem ||
            'Erro ao atualizar a ordem da questão.'
          );
        }
      }

      // Questão nova adicionada durante edição
      else {
        const respostaQuestao =
          await fetch(
            `${API_URL}/questoes`,
            {
              method: 'POST',
              headers: headerAuth(true),
              body: JSON.stringify({
                pergunta:
                  questao.enunciado.trim(),

                alternativaA:
                  questao.a.trim(),

                alternativaB:
                  questao.b.trim(),

                alternativaC:
                  questao.c.trim(),

                alternativaD:
                  questao.d.trim(),

                alternativaE:
                  questao.e.trim(),

                correta:
                  questao.correta,

                materiaId: Number(questao.materiaId),
                topicoId: Number(questao.topicoId),
                dificuldade: questao.dificuldade,
                habilidade: questao.habilidade || '',
                imagem: questao.imagem || null
              })
            }
          );

        const dadosQuestao =
          await respostaQuestao.json();

        if (!respostaQuestao.ok) {
          throw new Error(
            dadosQuestao.mensagem ||
            dadosQuestao.erro ||
            `Erro ao cadastrar a questão ${i + 1}.`
          );
        }

        const questaoCriada =
          dadosQuestao.questao ||
          dadosQuestao;

        const questaoId =
          questaoCriada.id ||
          dadosQuestao.id;

        if (!questaoId) {
          throw new Error(
            `O backend não retornou o ID da questão ${i + 1}.`
          );
        }

        const respostaVinculo =
          await fetch(
            `${API_URL}/simulados/${simuladoId}/questoes`,
            {
              method: 'POST',
              headers: headerAuth(true),
              body: JSON.stringify({
                questaoId: questaoId,
                ordem: i + 1
              })
            }
          );

        const dadosVinculo =
          await respostaVinculo.json();

        if (!respostaVinculo.ok) {
          throw new Error(
            dadosVinculo.mensagem ||
            dadosVinculo.erro ||
            `Erro ao vincular a questão ${i + 1}.`
          );
        }
      }
    }
  }

  // =====================================================
  // POSTAR / SALVAR
  // =====================================================

  async function handlePostar(e) {
    e.preventDefault();

    if (!validarSimulado()) {
      return;
    }

    try {
      setSalvando(true);
      setErro('');

      if (simuladoEditando) {
        await editarSimulado();

        setMensagemSucesso('Simulado atualizado com sucesso!');
      } else {
        await criarSimulado();

        setMensagemSucesso('Simulado cadastrado com sucesso!');
      }

      setShowModal(false);

      setSimuladoEditando(null);

      setForm({
        ...emptySimulado
      });

      setQuestoes([]);
      setQuestoesOriginais([]);

      await carregarSimulados();

    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
        'Não foi possível salvar o simulado.'
      );

      // O erro é exibido na área de feedback da página, sem alerta nativo.
    } finally {
      setSalvando(false);
    }
  }

  const gruposSimulados = Object.entries(
    simulados.reduce((materias, simulado) => {
      const materia = simulado.tipo === 'geral' ? 'Simulados Gerais' : (simulado.materia || 'Sem matéria');
      const conteudo = simulado.tipo === 'geral' ? 'Provas com disciplinas misturadas' : (simulado.topico || 'Sem conteúdo');
      if (!materias[materia]) materias[materia] = {};
      if (!materias[materia][conteudo]) materias[materia][conteudo] = [];
      materias[materia][conteudo].push(simulado);
      return materias;
    }, {})
  ).sort(([a], [b]) => a.localeCompare(b, 'pt-BR'));

  const topicosBanco = materiasConteudos.flatMap((materia) =>
    (materia.topicos || []).map((topico) => ({ ...topico, materiaNome: materia.nome }))
  );
  const textoBuscaBanco = buscaBanco.trim().toLocaleLowerCase('pt-BR');
  const questoesBancoFiltradas = bancoQuestoes.filter((questao) => {
    if (filtroBancoMateria === 'sem-classificacao' && questao.materia_id != null) return false;
    if (filtroBancoMateria && filtroBancoMateria !== 'sem-classificacao' && String(questao.materia_id) !== filtroBancoMateria) return false;
    if (filtroBancoTopico === 'sem-classificacao' && questao.topico_id != null) return false;
    if (filtroBancoTopico && filtroBancoTopico !== 'sem-classificacao' && String(questao.topico_id) !== filtroBancoTopico) return false;
    if (filtroBancoDificuldade && (questao.dificuldade || 'Não classificada') !== filtroBancoDificuldade) return false;
    if (!textoBuscaBanco) return true;
    return [questao.pergunta, questao.materia_nome, questao.materia, questao.topico, questao.habilidade]
      .some((valor) => String(valor || '').toLocaleLowerCase('pt-BR').includes(textoBuscaBanco));
  });

  // =====================================================
  // RENDER
  // =====================================================

  function fecharModalSimulado() {
    if (salvando || excluindo) return;
    setShowModal(false);
    setMostrarBancoQuestoes(false);
  }

  function fecharModalQuestao() {
    setShowQuestaoModal(false);
    setQuestaoEditando(null);
    setQuestaoBancoMode(false);
    setQuestaoBancoId(null);
  }

  return (
    <div className="admin-simulados-page">
      {mensagemSucesso && <div className="admin-simulados-toast" role="status">{mensagemSucesso}</div>}
      <div className="page-header admin-simulados-heading">
        <div><h1>Simulados</h1><p>Gerencie simulados e mantenha um banco centralizado de questões por disciplina, conteúdo e dificuldade.</p></div>
        <div className="admin-simulados-heading-actions">
          <button className="admin-banco-toggle" type="button" onClick={() => setMostrarGerenciadorBanco((aberto) => !aberto)} aria-expanded={mostrarGerenciadorBanco}>
            {mostrarGerenciadorBanco ? 'Fechar banco' : `Banco de questões (${bancoQuestoes.length})`}
          </button>
          <button className="admin-simulados-new" type="button" onClick={openCreate}>+ Novo simulado</button>
        </div>
      </div>

      {mostrarGerenciadorBanco && (
        <section className="admin-banco-questoes" aria-labelledby="admin-banco-titulo">
          <div className="admin-banco-questoes-heading">
            <div>
              <h2 id="admin-banco-titulo">Banco de questões</h2>
              <p>Cadastre, classifique e reutilize questões sem precisar criar um simulado primeiro.</p>
            </div>
            <button type="button" className="admin-simulados-new" onClick={abrirNovaQuestaoBanco}>+ Nova questão</button>
          </div>
          <div className="admin-banco-filtros">
            <div className="admin-banco-campo admin-banco-campo-busca">
              <span className="admin-banco-rotulo">Pesquisar questão</span>
              <div className="admin-banco-busca">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                <input type="search" value={buscaBanco} onChange={(e) => setBuscaBanco(e.target.value)} placeholder="Enunciado, habilidade ou conteúdo" aria-label="Pesquisar questão" />
              </div>
            </div>
            <div className="admin-banco-campo">
              <span className="admin-banco-rotulo">Disciplina</span>
              <AdminSelect
                ariaLabel="Filtrar por disciplina"
                value={filtroBancoMateria}
                onChange={(valor) => { setFiltroBancoMateria(valor); setFiltroBancoTopico(''); }}
                options={[
                  { value: '', label: 'Todas as disciplinas' },
                  { value: 'sem-classificacao', label: 'Sem disciplina' },
                  ...materiasConteudos.map((materia) => ({ value: String(materia.id), label: materia.nome })),
                ]}
              />
            </div>
            <div className="admin-banco-campo">
              <span className="admin-banco-rotulo">Conteúdo</span>
              <AdminSelect
                ariaLabel="Filtrar por conteúdo"
                value={filtroBancoTopico}
                onChange={setFiltroBancoTopico}
                options={[
                  { value: '', label: 'Todos os conteúdos' },
                  { value: 'sem-classificacao', label: 'Sem conteúdo' },
                  ...topicosBanco
                    .filter((topico) => !filtroBancoMateria || filtroBancoMateria === 'sem-classificacao' || String(topico.materia_id) === filtroBancoMateria)
                    .map((topico) => ({ value: String(topico.id), label: `${topico.materiaNome} · ${topico.nome}` })),
                ]}
              />
            </div>
            <div className="admin-banco-campo">
              <span className="admin-banco-rotulo">Dificuldade</span>
              <AdminSelect
                ariaLabel="Filtrar por dificuldade"
                value={filtroBancoDificuldade}
                onChange={setFiltroBancoDificuldade}
                options={[
                  { value: '', label: 'Todas' },
                  ...['Fácil', 'Média', 'Difícil', 'Não classificada'].map((valor) => ({ value: valor, label: valor })),
                ]}
              />
            </div>
          </div>
          <div className="admin-banco-questoes-resumo">{questoesBancoFiltradas.length} questão(ões) encontradas</div>
          <div className="admin-banco-questoes-lista">
            {questoesBancoFiltradas.map((questao) => (
              <article className="admin-banco-questao-card" key={questao.id}>
                <div className="admin-banco-questao-conteudo">
                  <div className="admin-banco-questao-meta">
                    <strong>Questão #{questao.id}</strong>
                    <span>{questao.materia_nome || questao.materia || 'Sem disciplina'}</span>
                    <span>{questao.topico || 'Sem conteúdo'}</span>
                    <span className="admin-chip-dificuldade" data-dificuldade={questao.dificuldade || 'Não classificada'}>{questao.dificuldade || 'Não classificada'}</span>
                  </div>
                  <p>{questao.pergunta}</p>
                  {questao.habilidade && <small>Habilidade: {questao.habilidade}</small>}
                </div>
                <button type="button" className="admin-edit-btn" onClick={() => abrirEditarQuestaoBanco(questao)}>Editar classificação/questão</button>
              </article>
            ))}
            {questoesBancoFiltradas.length === 0 && <p className="admin-banco-vazio">Nenhuma questão corresponde aos filtros selecionados.</p>}
          </div>
        </section>
      )}

      {erro && (
        <div className="stat-card simulado-error">
          <p>{erro}</p>
        </div>
      )}

      <div className="admin-list">
        {carregando ? (
          <div className="stat-card">
            Carregando simulados...
          </div>
        ) : simulados.length === 0 ? (
          <div className="stat-card">
            <h2>
              Nenhum simulado cadastrado.
            </h2>

            <p>
              Clique em Novo simulado para criar o
              primeiro simulado.
            </p>
          </div>
        ) : (
          gruposSimulados.map(([materia, conteudos]) => (
            <section className="admin-simulados-materia" key={materia} style={{ '--materia-cor': materiasConteudos.find((item) => item.nome === materia)?.cor || '#2783d3' }}>
              <header className="admin-simulados-materia-header">
                {(() => {
                  const dadosMateria = materiasConteudos.find(item => item.nome === materia);
                  const iconesPermitidos = ['book', 'calculator', 'globe', 'flask', 'target', 'landmark'];
                  return (
                    <span
                      className="admin-simulados-materia-icon"
                      aria-hidden="true"
                      style={{ background: dadosMateria?.cor || '#2783d3' }}
                    >
                      <Icon name={dadosMateria ? (iconesPermitidos.includes(dadosMateria.icone) ? dadosMateria.icone : 'book') : 'layers'} size={22} />
                    </span>
                  );
                })()}
                <div><h2>{materia}</h2><span>{Object.values(conteudos).flat().length} simulado(s)</span></div>
              </header>
              {Object.entries(conteudos).sort(([a], [b]) => a.localeCompare(b, 'pt-BR')).map(([conteudo, itens]) => (
                <div className="admin-simulados-conteudo" key={conteudo}>
                  <div className="admin-simulados-conteudo-heading">
                    <h3>{conteudo}</h3><span>{itens.length} simulado(s)</span>
                  </div>
                  <div className="admin-simulados-items">
                    {itens.map((s) => (
                      <article className="admin-simulado-card" key={s.id}>
                        <div className="admin-simulado-card-main">
                          <strong>{s.titulo}</strong>
                          <div className="admin-simulado-details">
                            
                            <span>{s.quantidade_questoes || 0} questões</span>
                            <span>{s.tempo_limite || 0} minutos</span>
                          </div>
                        </div>
                        <button className="admin-edit-btn" type="button" onClick={() => abrirEditar(s)} disabled={carregandoQuestoes || salvando || excluindo}>Editar simulado</button>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))
        )}
      </div>


      {/* Modal de criação / edição de simulado */}
      {showModal && (
        <div
          className="modal-overlay simulado-overlay sim-overlay"
          onClick={() => {
            if (!salvando && !excluindo && !showQuestaoModal) fecharModalSimulado();
          }}
        >
          <div className="sim-dialog" role="dialog" aria-modal={!showQuestaoModal} aria-labelledby="simulado-modal-title" onClick={e => e.stopPropagation()}>
            <header className="sim-dialog-header">
              <div className="sim-dialog-heading">
                <span className="sim-dialog-badge" aria-hidden="true"><Icon name="book" size={22} /></span>
                <div>
                  <h2 id="simulado-modal-title">{simuladoEditando ? 'Editar Simulado' : 'Criar Simulado'}</h2>
                  <p>Preencha as informações e adicione no mínimo {MIN_QUESTOES} questões para postar.</p>
                </div>
              </div>
              <button type="button" className="sim-close" aria-label="Fechar" onClick={fecharModalSimulado} disabled={salvando || excluindo}>
                <Icon name="close" size={20} />
              </button>
            </header>
            <form className="sim-form" onSubmit={handlePostar}>
              <div className="sim-body">
                <section className="sim-section" aria-labelledby="simulado-info-title">
                  <h3 className="sim-section-title" id="simulado-info-title"><span className="sim-step" aria-hidden="true">1</span>Informações básicas</h3>
                  <div className="sim-grid">
                    <div className="sim-field sim-span-2">
                      <label htmlFor="simulado-nome">Nome do simulado</label>
                      <input
                        id="simulado-nome"
                        type="text"
                        placeholder="Ex.: Classes gramaticais"
                        value={form.nome}
                        onChange={e => alterarForm('nome', e.target.value)}
                        autoFocus
                        disabled={salvando || excluindo}
                      />
                    </div>
                    <div className="sim-field">
                      <label htmlFor="simulado-tempo">Limite de tempo <span className="sim-hint">(minutos)</span></label>
                      <input
                        id="simulado-tempo"
                        type="number"
                        min="1"
                        placeholder="Ex.: 60"
                        value={form.limiteTempo}
                        onChange={e => alterarForm('limiteTempo', e.target.value)}
                        disabled={salvando || excluindo}
                      />
                    </div>
                    <div className="sim-field sim-span-3">
                      <span className="sim-label" id="simulado-tipo-label">Tipo de simulado</span>
                      <div className="sim-segmented" role="group" aria-labelledby="simulado-tipo-label">
                        {[
                          ['disciplina', 'Por disciplina', 'Questões de uma única matéria e conteúdo'],
                          ['geral', 'Geral', 'Mistura questões de matérias diferentes']
                        ].map(([valor, titulo, descricao]) => (
                          <button
                            type="button"
                            key={valor}
                            className={`sim-segment ${form.tipo === valor ? 'is-active' : ''}`}
                            aria-pressed={form.tipo === valor}
                            disabled={salvando || excluindo}
                            onClick={() => {
                              if (form.tipo === valor) return;
                              alterarForm('tipo', valor);
                              setForm((atual) => ({ ...atual, tipo: valor, materiaId: '', topicoId: '' }));
                            }}
                          >
                            <strong>{titulo}</strong>
                            <span>{descricao}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {form.tipo === 'disciplina' && (
                  <section className="sim-section" aria-labelledby="simulado-classificacao-title">
                    <h3 className="sim-section-title" id="simulado-classificacao-title"><span className="sim-step" aria-hidden="true">2</span>Matéria e conteúdo</h3>
                    <div className="sim-field">
                      <span className="sim-label" id="simulado-materia-label">Matéria</span>
                      {materiasConteudos.length === 0 ? (
                        <p className="sim-note">Cadastre uma matéria e pelo menos um conteúdo antes de criar um simulado.</p>
                      ) : (
                        <div className="sim-chip-group" role="group" aria-labelledby="simulado-materia-label">
                          {materiasConteudos.map(materia => (
                            <button
                              type="button"
                              key={materia.id}
                              className={`sim-chip ${String(form.materiaId) === String(materia.id) ? 'is-selected' : ''}`}
                              aria-pressed={String(form.materiaId) === String(materia.id)}
                              onClick={() => alterarForm('materiaId', String(materia.id))}
                              disabled={salvando || excluindo}
                            >{materia.nome}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="sim-field sim-field-conteudo">
                      <label htmlFor="simulado-conteudo">Conteúdo</label>
                      {(() => {
                        const conteudosDisponiveis = (materiasConteudos.find(materia => String(materia.id) === String(form.materiaId))?.topicos || [])
                          .filter(topico => Number(topico.ativo) !== 0);
                        const selecionado = conteudosDisponiveis.find(topico => String(topico.id) === String(form.topicoId));
                        const desabilitado = salvando || excluindo || !form.materiaId || conteudosDisponiveis.length === 0;
                        return (
                          <div className="simulado-conteudo-select sim-select" onBlur={e => {
                            if (!e.currentTarget.contains(e.relatedTarget)) setConteudosAbertos(false);
                          }} onKeyDown={e => {
                            if (e.key === 'Escape') setConteudosAbertos(false);
                          }}>
                            <button
                              id="simulado-conteudo"
                              type="button"
                              className={`sim-select-trigger ${conteudosAbertos ? 'is-open' : ''} ${!selecionado ? 'is-placeholder' : ''}`}
                              aria-haspopup="listbox"
                              aria-expanded={conteudosAbertos && !desabilitado}
                              aria-controls="simulado-conteudo-opcoes"
                              disabled={desabilitado}
                              onClick={() => setConteudosAbertos(aberto => !aberto)}
                            >
                              <span>{selecionado?.nome || (form.materiaId ? 'Selecione um conteúdo' : 'Selecione uma matéria primeiro')}</span>
                              <span className="sim-select-chevron" aria-hidden="true" />
                            </button>
                            {conteudosAbertos && !desabilitado && (
                              <div id="simulado-conteudo-opcoes" className="sim-select-options" role="listbox" aria-label="Conteúdos disponíveis">
                                {conteudosDisponiveis.map(topico => (
                                  <button
                                    type="button"
                                    role="option"
                                    aria-selected={String(form.topicoId) === String(topico.id)}
                                    key={topico.id}
                                    className={`sim-select-option ${String(form.topicoId) === String(topico.id) ? 'is-selected' : ''}`}
                                    onClick={() => alterarForm('topicoId', String(topico.id))}
                                  >
                                    <span>{topico.nome}</span>
                                    {String(form.topicoId) === String(topico.id) && <span aria-hidden="true">✓</span>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      {form.materiaId && (materiasConteudos.find(materia => String(materia.id) === String(form.materiaId))?.topicos || [])
                        .filter(topico => Number(topico.ativo) !== 0).length === 0 && (
                        <small className="sim-note">Esta matéria ainda não possui conteúdos cadastrados.</small>
                      )}
                    </div>
                  </section>
                )}

                <section className="sim-section" aria-labelledby="simulado-questoes-title">
                  <div className="sim-section-head">
                    <h3 className="sim-section-title" id="simulado-questoes-title"><span className="sim-step" aria-hidden="true">{form.tipo === 'disciplina' ? 3 : 2}</span>Questões do simulado</h3>
                    <div className="sim-inline-actions">
                      <button type="button" className="sim-btn sim-btn-soft" onClick={() => setMostrarBancoQuestoes((aberto) => !aberto)} disabled={salvando || excluindo} aria-expanded={mostrarBancoQuestoes}>
                        {mostrarBancoQuestoes ? 'Fechar banco' : 'Adicionar do banco'}
                      </button>
                      <button type="button" className="sim-btn sim-btn-primary" onClick={abrirCriarQuestao} disabled={salvando || excluindo}>
                        <Icon name="plus" size={16} /> Criar questão
                      </button>
                    </div>
                  </div>

                  <div className="sim-progress">
                    <div className="sim-progress-text">
                      <span><strong>{questoes.length}</strong> de {MIN_QUESTOES} questões mínimas</span>
                      <span className={`sim-pill ${questoes.length >= MIN_QUESTOES ? 'is-ok' : 'is-warn'}`}>
                        {questoes.length >= MIN_QUESTOES ? 'Pronto para postar' : `Faltam ${MIN_QUESTOES - questoes.length}`}
                      </span>
                    </div>
                    <div
                      className="sim-progress-bar"
                      role="progressbar"
                      aria-label="Questões adicionadas"
                      aria-valuemin={0}
                      aria-valuemax={MIN_QUESTOES}
                      aria-valuenow={Math.min(questoes.length, MIN_QUESTOES)}
                    >
                      <span style={{ width: `${Math.min(100, (questoes.length / MIN_QUESTOES) * 100)}%` }} />
                    </div>
                  </div>

                  {mostrarBancoQuestoes && (
                    <div className="sim-banco">
                      <div className="sim-banco-head">
                        <strong>Banco de questões</strong>
                        <span>{questoesBancoFiltradas.length} disponível(is)</span>
                      </div>
                      <div className="sim-banco-filtros">
                        <div className="sim-field">
                          <label htmlFor="simulado-banco-materia">Matéria</label>
                          <AdminSelect
                            id="simulado-banco-materia"
                            value={filtroBancoMateria}
                            onChange={setFiltroBancoMateria}
                            options={[
                              { value: '', label: 'Todas as matérias' },
                              { value: 'sem-classificacao', label: 'Sem matéria' },
                              ...materiasConteudos.map((materia) => ({ value: String(materia.id), label: materia.nome })),
                            ]}
                          />
                        </div>
                        <div className="sim-field">
                          <label htmlFor="simulado-banco-conteudo">Conteúdo</label>
                          <AdminSelect
                            id="simulado-banco-conteudo"
                            value={filtroBancoTopico}
                            onChange={setFiltroBancoTopico}
                            options={[
                              { value: '', label: 'Todos' },
                              { value: 'sem-classificacao', label: 'Sem conteúdo' },
                              ...topicosBanco.map((topico) => ({ value: String(topico.id), label: `${topico.materiaNome} · ${topico.nome}` })),
                            ]}
                          />
                        </div>
                        <div className="sim-field">
                          <label htmlFor="simulado-banco-dificuldade">Dificuldade</label>
                          <AdminSelect
                            id="simulado-banco-dificuldade"
                            value={filtroBancoDificuldade}
                            onChange={setFiltroBancoDificuldade}
                            options={[
                              { value: '', label: 'Todas' },
                              ...['Fácil', 'Média', 'Difícil', 'Não classificada'].map((valor) => ({ value: valor, label: valor })),
                            ]}
                          />
                        </div>
                      </div>
                      <div className="sim-banco-lista">
                        {questoesBancoFiltradas.map((q) => {
                          const jaAdicionada = questoes.some((item) => Number(item.id) === Number(q.id));
                          return (
                            <article key={q.id} className="sim-banco-item">
                              <div className="sim-banco-info">
                                <div className="sim-chips">
                                  <span className="sim-tag sim-tag-id">#{q.id}</span>
                                  <span className="sim-tag">{q.materia_nome || q.materia || 'Sem matéria'}</span>
                                  <span className="sim-tag">{q.topico || 'Conteúdo não classificado'}</span>
                                  <span className="sim-tag">{q.dificuldade || 'Não classificada'}</span>
                                </div>
                                <p>{q.pergunta}</p>
                              </div>
                              <button type="button" className="sim-btn sim-btn-soft sim-btn-sm" onClick={() => adicionarQuestaoDoBanco(q)} disabled={jaAdicionada || salvando || excluindo}>
                                {jaAdicionada ? 'Adicionada' : 'Adicionar'}
                              </button>
                            </article>
                          );
                        })}
                        {bancoQuestoes.length === 0 && <p className="sim-empty-small">O banco ainda não possui questões cadastradas.</p>}
                        {bancoQuestoes.length > 0 && questoesBancoFiltradas.length === 0 && <p className="sim-empty-small">Nenhuma questão corresponde aos filtros selecionados.</p>}
                      </div>
                    </div>
                  )}

                  {questoes.length === 0 ? (
                    <div className="sim-empty">
                      <strong>Nenhuma questão adicionada</strong>
                      <span>Crie a primeira questão ou reaproveite uma do banco para começar.</span>
                    </div>
                  ) : (
                    <ol className="sim-question-list">
                      {questoes.map((questao, index) => (
                        <li key={questao.id || `nova-${index}`} className="sim-question-card">
                          <span className="sim-question-num" aria-hidden="true">{index + 1}</span>
                          <div className="sim-question-main">
                            <p className="sim-question-text"><span className="sim-sr-only">Questão {index + 1}: </span>{questao.enunciado || questao.pergunta || 'Questão sem enunciado'}</p>
                            <div className="sim-chips">
                              <span className="sim-tag">{materiasConteudos.find((item) => String(item.id) === String(questao.materiaId))?.nome || questao.materia || 'Matéria não definida'}</span>
                              <span className="sim-tag">{materiasConteudos.flatMap((item) => item.topicos || []).find((item) => String(item.id) === String(questao.topicoId))?.nome || 'Conteúdo não definido'}</span>
                              <span className="sim-tag">{questao.dificuldade || 'Não classificada'}</span>
                              <span className="sim-tag sim-tag-ok">Correta: {questao.correta}</span>
                              {questao.imagem && <span className="sim-tag">Com imagem</span>}
                            </div>
                          </div>
                          <div className="sim-question-actions">
                            <button type="button" className="sim-icon-btn" onClick={() => abrirEditarQuestao(index)} disabled={salvando || excluindo} aria-label={`Editar questão ${index + 1}`} title="Editar">
                              <Icon name="edit" size={17} />
                            </button>
                            <button type="button" className="sim-icon-btn is-danger" onClick={() => removerQuestao(index)} disabled={salvando || excluindo} aria-label={`Remover questão ${index + 1}`} title="Remover">
                              <Icon name="trash" size={17} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </div>

              <footer className="sim-footer">
                <div className="sim-footer-start">
                  {simuladoEditando ? (
                    <button type="button" className="sim-btn sim-btn-danger" onClick={excluirSimulado} disabled={salvando || excluindo}>
                      {excluindo ? 'Excluindo...' : 'Excluir simulado'}
                    </button>
                  ) : (
                    <span className="sim-footer-hint" role="status">
                      {questoes.length >= MIN_QUESTOES ? 'Tudo certo para postar.' : `Adicione mais ${MIN_QUESTOES - questoes.length} questão(ões) para liberar o botão Postar.`}
                    </span>
                  )}
                </div>
                <div className="sim-footer-actions">
                  <button type="button" className="sim-btn sim-btn-ghost" disabled={salvando || excluindo} onClick={fecharModalSimulado}>Cancelar</button>
                  <button type="submit" className="sim-btn sim-btn-primary" disabled={salvando || excluindo || questoes.length < MIN_QUESTOES}>
                    {salvando ? 'Salvando...' : simuladoEditando ? 'Salvar alterações' : 'Postar'}
                  </button>
                </div>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Modal de criação / edição de questão */}
      {showQuestaoModal && (
        <div className="modal-overlay simulado-questao-overlay sim-overlay sim-overlay-questao" onClick={() => { if (!enviandoImagem) fecharModalQuestao(); }}>
          <div className="sim-dialog sim-dialog-questao" role="dialog" aria-modal="true" aria-labelledby="simulado-questao-title" onClick={e => e.stopPropagation()}>
            <header className="sim-dialog-header">
              <div className="sim-dialog-heading">
                <span className="sim-dialog-badge" aria-hidden="true"><Icon name="edit" size={22} /></span>
                <div>
                  <h2 id="simulado-questao-title">{questaoBancoMode ? (questaoBancoId ? 'Editar questão do banco' : 'Nova questão no banco') : questaoEditando !== null ? 'Editar Questão' : 'Criar Questão'}</h2>
                  <p>Classifique a questão, escreva o enunciado e marque a alternativa correta.</p>
                </div>
              </div>
              <button type="button" className="sim-close" aria-label="Fechar" onClick={fecharModalQuestao} disabled={enviandoImagem || salvando}>
                <Icon name="close" size={20} />
              </button>
            </header>
            <form className="sim-form" onSubmit={handleAddQuestao}>
              <div className="sim-body">
                <section className="sim-section" aria-labelledby="questao-classificacao-title">
                  <h3 className="sim-section-title" id="questao-classificacao-title"><span className="sim-step" aria-hidden="true">1</span>Classificação</h3>
                  <div className="sim-grid sim-grid-2">
                    <div className="sim-field">
                      <label htmlFor="questao-materia">Disciplina</label>
                      <AdminSelect
                        id="questao-materia"
                        required
                        placeholder="Selecione a disciplina"
                        value={questaoForm.materiaId}
                        onChange={(valor) => setQuestaoForm((atual) => ({ ...atual, materiaId: valor, topicoId: '' }))}
                        options={materiasConteudos.map((materia) => ({ value: String(materia.id), label: materia.nome }))}
                      />
                    </div>
                    <div className="sim-field">
                      <label htmlFor="questao-topico">Conteúdo / assunto</label>
                      <AdminSelect
                        id="questao-topico"
                        required
                        placeholder="Selecione o conteúdo"
                        disabled={!questaoForm.materiaId}
                        value={questaoForm.topicoId}
                        onChange={(valor) => alterarQuestao('topicoId', valor)}
                        options={(materiasConteudos.find((materia) => String(materia.id) === String(questaoForm.materiaId))?.topicos || [])
                          .filter((topico) => Number(topico.ativo) !== 0)
                          .map((topico) => ({ value: String(topico.id), label: topico.nome }))}
                      />
                    </div>
                    <div className="sim-field">
                      <label htmlFor="questao-dificuldade">Dificuldade</label>
                      <AdminSelect
                        id="questao-dificuldade"
                        value={questaoForm.dificuldade}
                        onChange={(valor) => alterarQuestao('dificuldade', valor)}
                        options={['Fácil', 'Média', 'Difícil', 'Não classificada'].map((valor) => ({ value: valor, label: valor }))}
                      />
                    </div>
                    <div className="sim-field">
                      <label htmlFor="questao-habilidade">Habilidade <span className="sim-hint">(opcional)</span></label>
                      <input id="questao-habilidade" type="text" maxLength={160} value={questaoForm.habilidade || ''} onChange={(e) => alterarQuestao('habilidade', e.target.value)} placeholder="Ex.: interpretação, raciocínio lógico..." />
                    </div>
                  </div>
                </section>

                <section className="sim-section" aria-labelledby="questao-enunciado-title">
                  <h3 className="sim-section-title" id="questao-enunciado-title"><span className="sim-step" aria-hidden="true">2</span>Enunciado</h3>
                  <div className="sim-field">
                    <label htmlFor="simulado-enunciado" className="sim-sr-only">Enunciado</label>
                    <textarea
                      id="simulado-enunciado"
                      className="sim-textarea"
                      placeholder="Escreva o enunciado da questão"
                      value={questaoForm.enunciado}
                      onChange={e => alterarQuestao('enunciado', e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="sim-upload">
                    <div className="sim-upload-head">
                      <label htmlFor="imagem-da-questao">Imagem da questão <span className="sim-hint">(opcional)</span></label>
                      <p>Mapas, gráficos ou ilustrações. PNG, JPG, WEBP ou GIF, até 5 MB.</p>
                    </div>
                    {questaoForm.imagem && (
                      <div className="sim-upload-preview">
                        <img src={`${API_URL}${questaoForm.imagem}`} alt="Prévia da imagem da questão" />
                        <button type="button" className="sim-btn sim-btn-danger sim-btn-sm" onClick={() => alterarQuestao('imagem', null)} disabled={enviandoImagem}>Remover imagem</button>
                      </div>
                    )}
                    <input id="imagem-da-questao" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={enviarImagemQuestao} disabled={enviandoImagem} aria-describedby="simulado-imagem-estado" />
                    <small id="simulado-imagem-estado" role={erroImagem ? 'alert' : 'status'} className={erroImagem ? 'is-error' : ''}>
                      {enviandoImagem ? 'Enviando imagem...' : erroImagem || (questaoForm.imagem ? 'Imagem adicionada à questão.' : 'Questões sem imagem também são permitidas.')}
                    </small>
                  </div>
                </section>

                <section className="sim-section" aria-labelledby="questao-alternativas-title">
                  <h3 className="sim-section-title" id="questao-alternativas-title"><span className="sim-step" aria-hidden="true">3</span>Alternativas</h3>
                  <fieldset className="sim-alternativas">
                    <legend>Escreva as alternativas e selecione a letra da <strong>correta</strong>.</legend>
                    {[
                      ['A', 'a'], ['B', 'b'], ['C', 'c'], ['D', 'd'], ['E', 'e']
                    ].map(([letra, campo]) => (
                      <div className={`sim-alt ${questaoForm.correta === letra ? 'is-correct' : ''}`} key={campo}>
                        <label className="sim-alt-radio" title={`Marcar a alternativa ${letra} como correta`}>
                          <input type="radio" name="simulado-alternativa-correta" value={letra} checked={questaoForm.correta === letra} onChange={() => alterarQuestao('correta', letra)} />
                          <span aria-hidden="true">{letra}</span>
                          <span className="sim-sr-only">Marcar a alternativa {letra} como correta</span>
                        </label>
                        <input id={`simulado-alt-${campo}`} type="text" aria-label={`Texto da alternativa ${letra}`} placeholder={`Texto da alternativa ${letra}`} value={questaoForm[campo]} onChange={e => alterarQuestao(campo, e.target.value)} />
                        {questaoForm.correta === letra && <span className="sim-alt-tag">Correta</span>}
                      </div>
                    ))}
                  </fieldset>
                </section>
              </div>

              <footer className="sim-footer">
                <div className="sim-footer-start" />
                <div className="sim-footer-actions">
                  <button type="button" className="sim-btn sim-btn-ghost" onClick={fecharModalQuestao} disabled={enviandoImagem || salvando}>Cancelar</button>
                  <button type="submit" className="sim-btn sim-btn-primary" disabled={enviandoImagem || salvando}>
                    {enviandoImagem ? 'Enviando imagem...' : salvando ? 'Salvando...' : questaoBancoMode ? (questaoBancoId ? 'Salvar questão' : 'Cadastrar no banco') : questaoEditando !== null ? 'Salvar questão' : 'Adicionar ao simulado'}
                  </button>
                </div>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

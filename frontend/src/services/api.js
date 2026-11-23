// =====================================================
// CLIENTE CENTRAL DA API
// =====================================================

export const API_URL =
    import.meta.env.VITE_API_URL ||
    'http://localhost:3000';


// =====================================================
// OBTER TOKEN
// =====================================================

const CHAVE_TOKEN = 'tenna_token';
// Chaves usadas em versões anteriores. Lidas uma única vez e migradas.
const CHAVES_LEGADAS = ['etecamp_token', 'token', 'accessToken', 'authToken'];

export function obterToken() {
    const atual = localStorage.getItem(CHAVE_TOKEN);
    if (atual) return atual;

    for (const chave of CHAVES_LEGADAS) {
        const antigo = localStorage.getItem(chave);
        if (antigo) {
            salvarToken(antigo);
            return antigo;
        }
    }
    return '';
}

export function salvarToken(token) {
    localStorage.setItem(CHAVE_TOKEN, token);
    CHAVES_LEGADAS.forEach(chave => localStorage.removeItem(chave));
}

export function removerToken() {
    localStorage.removeItem(CHAVE_TOKEN);
    CHAVES_LEGADAS.forEach(chave => localStorage.removeItem(chave));
}


// =====================================================
// LIMPAR SESSÃO
// =====================================================

export function limparSessao() {
    removerToken();
    localStorage.removeItem('etecamp_usuario');
    sessionStorage.removeItem('etecamp_admin_preview');
    window.dispatchEvent(new Event('etecamp-logout'));
}


// =====================================================
// REQUEST
// =====================================================

export async function request(
    url,
    options = {},
    mensagemPadrao =
        'Não foi possível completar a operação.'
) {

    const token =
        obterToken();

    const ehFormData =
        options.body instanceof FormData;


    const resposta =
        await fetch(
            `${API_URL}${url}`,
            {
                ...options,

                headers: {

                    ...(ehFormData
                        ? {}
                        : {
                            'Content-Type':
                                'application/json'
                        }),

                    ...(token
                        ? {
                            Authorization:
                                `Bearer ${token}`
                        }
                        : {}),

                    ...(options.headers || {})
                }
            }
        );


    const texto =
        await resposta.text();


    let dados;


    try {

        dados =
            texto
                ? JSON.parse(texto)
                : {};

    } catch {

        dados = {};

    }


    if (!resposta.ok) {

        const erro =
            new Error(
                dados.erro ||
                dados.mensagem ||
                dados.message ||
                mensagemPadrao
            );


        erro.dados =
            dados;

        erro.status =
            resposta.status;


        throw erro;
    }


    return dados;
}
/**
 * Função para fazer fetch com o usuário logado automaticamente incluído no header
 * @param {string} url - URL para fazer a requisição
 * @param {object} options - Opções para a requisição fetch
 * @returns {Promise} - Promise com a resposta da requisição
 */
export async function fetchWithUser(url, options = {}) {
  // Recupera o usuário logado do localStorage
  const usuarioLogado = JSON.parse(localStorage.getItem('user'));

  // Adiciona o usuário logado no cabeçalho de autorização
  const headers = {
    'Content-Type': 'application/json',
    ...(usuarioLogado && { Authorization: btoa(JSON.stringify(usuarioLogado)) }),
    ...options.headers,
  };

  // Faz a requisição com os headers atualizados
  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}

/**
 * Hook para tentar novamente a requisição em caso de erro
 * @param {string} url - URL para fazer a requisição
 * @param {object} options - Opções para a requisição fetch
 * @param {number} retries - Número de tentativas (padrão: 3)
 * @returns {Promise} - Promise com a resposta da requisição
 */
export async function fetchWithRetry(url, options = {}, retries = 3) {
  try {
    return await fetchWithUser(url, options);
  } catch (error) {
    if (retries > 0) {
      console.log(`Tentando novamente... (${retries} tentativas restantes)`);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
} 
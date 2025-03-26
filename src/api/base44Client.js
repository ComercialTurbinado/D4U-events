import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

const appId = import.meta.env.VITE_BASE44_APP_ID;
const apiKey = import.meta.env.VITE_BASE44_API_KEY;

if (!appId || !apiKey) {
  console.error('As variáveis de ambiente VITE_BASE44_APP_ID e VITE_BASE44_API_KEY são obrigatórias');
}

// Create a client without authentication
export const base44 = createClient({
  requiresAuth: false // Desabilita a autenticação
});

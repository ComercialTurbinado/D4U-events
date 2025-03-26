import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

const appId = import.meta.env.VITE_BASE44_APP_ID;
const apiKey = import.meta.env.VITE_BASE44_API_KEY;

if (!appId || !apiKey) {
  console.error('As variáveis de ambiente VITE_BASE44_APP_ID e VITE_BASE44_API_KEY são obrigatórias');
}

// Create a client with authentication required
export const base44 = createClient({
  appId,
  apiKey,
  requiresAuth: true // Ensure authentication is required for all operations
});

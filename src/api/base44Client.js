import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client without authentication
export const base44 = createClient({
  appId: "67e33cab1ce88cc9dc322208", // AppId fixo para desenvolvimento
  requiresAuth: false // Desabilita a autenticação
});

import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID,
  apiKey: import.meta.env.VITE_BASE44_API_KEY,
  requiresAuth: true // Ensure authentication is required for all operations
});

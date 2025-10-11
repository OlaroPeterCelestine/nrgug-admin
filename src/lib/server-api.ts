// Server-side API configuration - this file should never be exposed to the client
export const SERVER_API_CONFIG = {
  BASE_URL: process.env.BACKEND_URL || 'https://nrgug-api-production.up.railway.app',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'User-Agent': 'NRGUG-Admin-Server/1.0',
  },
};

// Helper function to get the full API URL
export function getApiUrl(endpoint: string): string {
  const baseUrl = SERVER_API_CONFIG.BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

// Server-side fetch wrapper
export async function serverFetch(endpoint: string, options: RequestInit = {}) {
  const url = getApiUrl(endpoint);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...SERVER_API_CONFIG.HEADERS,
      ...options.headers,
    },
    timeout: SERVER_API_CONFIG.TIMEOUT,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response;
}

// Client-side API configuration - uses proxy to hide the real API URL
export const CLIENT_API_CONFIG = {
  BASE_URL: '/api/proxy', // This will be proxied to the real API
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Helper function to get the full API URL for client-side requests
export function getClientApiUrl(endpoint: string): string {
  const baseUrl = CLIENT_API_CONFIG.BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

// Client-side fetch wrapper
export async function clientFetch(endpoint: string, options: RequestInit = {}) {
  const url = getClientApiUrl(endpoint);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...CLIENT_API_CONFIG.HEADERS,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response;
}

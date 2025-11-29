// API Configuration using environment variables
export const API_CONFIG = {
  // Base API URL for REST endpoints
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',

  // Socket.io URL for WebSocket connections
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000',

  // OAuth configuration
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
};

// Helper to get full API endpoint URL
export const getApiUrl = (endpoint: string) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.apiUrl}/${cleanEndpoint}`;
};

// Helper to get full Socket.io URL
export const getSocketUrl = (namespace: string = '') => {
  return namespace ? `${API_CONFIG.socketUrl}/${namespace}` : API_CONFIG.socketUrl;
};

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: "ttps://voleyapi.weiv.ar/api", // Cambiado a localhost
  TIMEOUT: 10000,
} as const;

// Configuración de autenticación
export const AUTH_CONFIG = {
  TOKEN_KEY: import.meta.env.VITE_TOKEN_STORAGE_KEY || 'easyvoley_token',
  USER_KEY: import.meta.env.VITE_USER_STORAGE_KEY || 'easyvoley_user',
} as const;

// URLs de endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/users/me',
  },
  USERS: '/users',
  CATEGORIES: '/categories', 
  PLAYERS: '/players',
  PAYMENTS: '/payments',
  FAMILIES: '/families',
  CONFIGURATION: '/configuration',
  ASSIGNMENTS: '/assignments',

  STATS: {
    DASHBOARD: '/stats/dashboard',
    MONTHLY_INCOME: '/stats/monthly-income',
  },
} as const;

// Helper para construir URLs completas
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Debug: Log de la configuración actual (solo en desarrollo)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    NODE_ENV: import.meta.env.NODE_ENV,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  });
} 
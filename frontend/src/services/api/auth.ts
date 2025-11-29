import axios from 'axios';
import { API_CONFIG } from '@/config/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_CONFIG.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para acceder a localStorage de forma segura
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const removeAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeAuthData();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  // Configurar token
  setToken(token: string | null) {
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.Authorization;
    }
  },

  // Login
  async login(credentials: { email: string; password: string }) {
    return api.post('/auth/login', credentials);
  },

  // Registro
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) {
    return api.post('/auth/register', userData);
  },

  // Login con Google
  async googleLogin(credential: string) {
    return api.post('/auth/google', { credential });
  },

  // Login con Facebook
  async facebookLogin(accessToken: string) {
    return api.post('/auth/facebook', { accessToken });
  },

  // Verificar token
  async verifyToken(token: string) {
    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return !!response.data;
    } catch {
      return false;
    }
  },

  // Obtener perfil actual
  async getProfile() {
    return api.get('/auth/me');
  },

  // Cambiar contraseña
  async changePassword(oldPassword: string, newPassword: string) {
    return api.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
  },

  // Refresh token
  async refreshToken() {
    return api.post('/auth/refresh');
  },
};
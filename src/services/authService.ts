import apiClient from '../lib/axios';
import { API_ENDPOINTS, AUTH_CONFIG } from '../config/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  // Login del usuario
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    // Guardar token y usuario en localStorage
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, response.data.token);
    localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.data.user));
    
    return response.data;
  }

  // Registro de usuario
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    
    // Guardar token y usuario en localStorage
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, response.data.token);
    localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.data.user));
    
    return response.data;
  }

  // Obtener usuario actual
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  }

  // Logout
  logout(): void {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    return !!token;
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  }

  // Obtener usuario desde localStorage
  getStoredUser(): User | null {
    const userStr = localStorage.getItem(AUTH_CONFIG.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
}

export default new AuthService(); 
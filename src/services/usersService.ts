import ApiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'administrador' | 'tesorero' | 'cobrador';
  category?: {
    _id: string;
    name: string;
    gender: string;
  } | null;
  createdAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'administrador' | 'tesorero' | 'cobrador';
  categoryId?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'administrador' | 'tesorero' | 'cobrador';
  categoryId?: string | null;
}

class UsersService {
  // Obtener todos los usuarios
  async getUsers(): Promise<User[]> {
    const response = await ApiClient.get(API_ENDPOINTS.USERS);
    return response;
  }

  // Crear un nuevo usuario
  async createUser(userData: CreateUserData): Promise<User> {
    const response = await ApiClient.post(API_ENDPOINTS.USERS, userData);
    return response;
  }

  // Actualizar un usuario existente
  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    const response = await ApiClient.put(`${API_ENDPOINTS.USERS}/${id}`, userData);
    return response;
  }

  // Eliminar un usuario
  async deleteUser(id: string): Promise<{ msg: string }> {
    const response = await ApiClient.delete(`${API_ENDPOINTS.USERS}/${id}`);
    return response;
  }

  // Obtener un usuario por ID
  async getUserById(id: string): Promise<User> {
    const response = await ApiClient.get(`${API_ENDPOINTS.USERS}/${id}`);
    return response;
  }

  // Cambiar rol de usuario
  async updateUserRole(id: string, role: 'administrador' | 'tesorero' | 'cobrador'): Promise<User> {
    const response = await ApiClient.put(`${API_ENDPOINTS.USERS}/${id}/role`, { role });
    return response;
  }
}

export default new UsersService(); 
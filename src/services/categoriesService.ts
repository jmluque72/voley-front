import apiClient from '../lib/axios';
import { API_ENDPOINTS } from '../config/api';

export interface Category {
  _id: string;
  name: string;
  gender: 'masculino' | 'femenino';
  cuota: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  gender: 'masculino' | 'femenino';
  cuota: number;
}

export interface UpdateCategoryData {
  name: string;
  gender: 'masculino' | 'femenino';
  cuota: number;
}

class CategoriesService {
  // Obtener todas las categorías
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES);
    return response.data;
  }

  // Crear una nueva categoría
  async createCategory(categoryData: CreateCategoryData): Promise<Category> {
    const response = await apiClient.post(API_ENDPOINTS.CATEGORIES, categoryData);
    return response.data;
  }

  // Actualizar una categoría existente
  async updateCategory(id: string, categoryData: UpdateCategoryData): Promise<Category> {
    const response = await apiClient.put(`${API_ENDPOINTS.CATEGORIES}/${id}`, categoryData);
    return response.data;
  }

  // Eliminar una categoría
  async deleteCategory(id: string): Promise<{ msg: string }> {
    const response = await apiClient.delete(`${API_ENDPOINTS.CATEGORIES}/${id}`);
    return response.data;
  }

  // Obtener una categoría por ID
  async getCategoryById(id: string): Promise<Category> {
    const response = await apiClient.get(`${API_ENDPOINTS.CATEGORIES}/${id}`);
    return response.data;
  }
}

export default new CategoriesService(); 
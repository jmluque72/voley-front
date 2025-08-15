import ApiClient from '../utils/apiClient';
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
    const response = await ApiClient.get(API_ENDPOINTS.CATEGORIES);
    return response;
  }

  // Crear una nueva categoría
  async createCategory(categoryData: CreateCategoryData): Promise<Category> {
    const response = await ApiClient.post(API_ENDPOINTS.CATEGORIES, categoryData);
    return response;
  }

  // Actualizar una categoría existente
  async updateCategory(id: string, categoryData: UpdateCategoryData): Promise<Category> {
    const response = await ApiClient.put(`${API_ENDPOINTS.CATEGORIES}/${id}`, categoryData);
    return response;
  }

  // Eliminar una categoría
  async deleteCategory(id: string): Promise<{ msg: string }> {
    const response = await ApiClient.delete(`${API_ENDPOINTS.CATEGORIES}/${id}`);
    return response;
  }

  // Obtener una categoría por ID
  async getCategoryById(id: string): Promise<Category> {
    const response = await ApiClient.get(`${API_ENDPOINTS.CATEGORIES}/${id}`);
    return response;
  }
}

export default new CategoriesService(); 
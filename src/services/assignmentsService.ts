import ApiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';

// Interfaces
export interface Collector {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface Category {
  _id: string;
  name: string;
  gender: string;
  cuota: number;
}

export interface Assignment {
  id: string;
  collector: Collector;
  category: Category;
  assignedAt: string;
  createdAt: string;
}

export interface AssignmentsResponse {
  assignments: Assignment[];
  summary: {
    totalCollectors: number;
    totalCategories: number;
    totalAssignments: number;
    unassignedCategories: number;
  };
}

export interface CreateAssignmentData {
  collectorId: string;
  categoryId: string;
}

class AssignmentsService {
  // Obtener todas las asignaciones
  async getAssignments(): Promise<AssignmentsResponse> {
    try {
      console.log('🔍 Obteniendo asignaciones...');
      const response = await ApiClient.get<AssignmentsResponse>('/assignments');
      console.log('✅ Asignaciones obtenidas:', response.summary);
      return response;
    } catch (error: any) {
      console.error('❌ Error obteniendo asignaciones:', error);
      throw new Error(error.message || 'Error al cargar las asignaciones');
    }
  }

  // Obtener cobradores disponibles
  async getCollectors(): Promise<Collector[]> {
    try {
      console.log('🔍 Obteniendo cobradores...');
      const response = await ApiClient.get<Collector[]>('/assignments/collectors');
      console.log('✅ Cobradores obtenidos:', response.length);
      return response;
    } catch (error: any) {
      console.error('❌ Error obteniendo cobradores:', error);
      throw new Error(error.message || 'Error al cargar los cobradores');
    }
  }

  // Obtener categorías disponibles
  async getCategories(): Promise<Category[]> {
    try {
      console.log('🔍 Obteniendo categorías...');
      const response = await ApiClient.get<Category[]>('/assignments/categories');
      console.log('✅ Categorías obtenidas:', response.length);
      return response;
    } catch (error: any) {
      console.error('❌ Error obteniendo categorías:', error);
      throw new Error(error.message || 'Error al cargar las categorías');
    }
  }

  // Crear nueva asignación
  async createAssignment(data: CreateAssignmentData): Promise<{ msg: string; assignment: Assignment }> {
    try {
      console.log('🔍 Creando asignación:', data);
      const response = await ApiClient.post<{ msg: string; assignment: Assignment }>('/assignments', data);
      console.log('✅ Asignación creada exitosamente');
      return response;
    } catch (error: any) {
      console.error('❌ Error creando asignación:', error);
      throw new Error(error.message || 'Error al crear la asignación');
    }
  }

  // Eliminar asignación
  async deleteAssignment(id: string): Promise<{ msg: string }> {
    try {
      console.log('🔍 Eliminando asignación:', id);
      const response = await ApiClient.delete<{ msg: string }>(`/assignments/${id}`);
      console.log('✅ Asignación eliminada exitosamente');
      return response;
    } catch (error: any) {
      console.error('❌ Error eliminando asignación:', error);
      throw new Error(error.message || 'Error al eliminar la asignación');
    }
  }

  // Obtener asignaciones de un cobrador
  async getCollectorAssignments(collectorId: string): Promise<Assignment[]> {
    try {
      console.log('🔍 Obteniendo asignaciones del cobrador:', collectorId);
      const response = await ApiClient.get<Assignment[]>(`/assignments/collector/${collectorId}`);
      console.log('✅ Asignaciones del cobrador obtenidas:', response.length);
      return response;
    } catch (error: any) {
      console.error('❌ Error obteniendo asignaciones del cobrador:', error);
      throw new Error(error.message || 'Error al cargar las asignaciones del cobrador');
    }
  }

  // Obtener cobradores de una categoría
  async getCategoryCollectors(categoryId: string): Promise<Assignment[]> {
    try {
      console.log('🔍 Obteniendo cobradores de la categoría:', categoryId);
      const response = await ApiClient.get<Assignment[]>(`/assignments/category/${categoryId}`);
      console.log('✅ Cobradores de la categoría obtenidos:', response.length);
      return response;
    } catch (error: any) {
      console.error('❌ Error obteniendo cobradores de la categoría:', error);
      throw new Error(error.message || 'Error al cargar los cobradores de la categoría');
    }
  }
}

export default new AssignmentsService();

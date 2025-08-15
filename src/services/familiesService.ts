import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import ApiClient from '../utils/apiClient';

export interface FamilyMember {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  category?: {
    _id: string;
    name: string;
    gender: string;
    cuota: number;
  };
}

export interface FamilyContactInfo {
  phone?: string;
  email?: string;
  address?: string;
}

export interface Family {
  _id: string;
  name: string;
  primaryPlayer: FamilyMember;
  members: FamilyMember[];
  contactInfo: FamilyContactInfo;
  familyDiscount: number;
  isActive: boolean;
  notes?: string;
  totalQuota?: number;
  discountedTotal?: number;
  discountAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFamilyData {
  name: string;
  primaryPlayerId: string;
  memberIds?: string[];
  contactInfo?: FamilyContactInfo;
  familyDiscount?: number;
  notes?: string;
}

export interface UpdateFamilyData {
  name?: string;
  primaryPlayerId?: string;
  memberIds?: string[];
  contactInfo?: FamilyContactInfo;
  familyDiscount?: number;
  notes?: string;
  isActive?: boolean;
}

class FamiliesService {
  // Obtener todas las familias
  async getAllFamilies(): Promise<Family[]> {
    try {
      console.log('👨‍👩‍👧‍👦 Fetching all families...');
      const families = await ApiClient.get<Family[]>(API_ENDPOINTS.FAMILIES);
      console.log(`✅ Fetched ${families.length} families`);
      return families;
    } catch (error: any) {
      console.error('❌ Failed to fetch families:', error);
      throw error;
    }
  }

  // Obtener una familia por ID
  async getFamilyById(id: string): Promise<Family> {
    try {
      console.log('👨‍👩‍👧‍👦 Fetching family:', id);
      const family = await ApiClient.get<Family>(`${API_ENDPOINTS.FAMILIES}/${id}`);
      console.log('✅ Family fetched successfully');
      return family;
    } catch (error: any) {
      console.error('❌ Failed to fetch family:', error);
      throw error;
    }
  }

  // Crear una nueva familia
  async createFamily(data: CreateFamilyData): Promise<Family> {
    try {
      console.log('👨‍👩‍👧‍👦 Creating new family:', data.name);
      const family = await ApiClient.post<Family>(API_ENDPOINTS.FAMILIES, data);
      console.log('✅ Family created successfully');
      return family;
    } catch (error: any) {
      console.error('❌ Failed to create family:', error);
      throw error;
    }
  }

  // Actualizar una familia
  async updateFamily(id: string, data: UpdateFamilyData): Promise<Family> {
    try {
      console.log('👨‍👩‍👧‍👦 Updating family:', id);
      const family = await ApiClient.put<Family>(`${API_ENDPOINTS.FAMILIES}/${id}`, data);
      console.log('✅ Family updated successfully');
      return family;
    } catch (error: any) {
      console.error('❌ Failed to update family:', error);
      throw error;
    }
  }

  // Eliminar (desactivar) una familia
  async deleteFamily(id: string): Promise<void> {
    try {
      console.log('👨‍👩‍👧‍👦 Deleting family:', id);
      await ApiClient.delete(`${API_ENDPOINTS.FAMILIES}/${id}`);
      console.log('✅ Family deleted successfully');
    } catch (error: any) {
      console.error('❌ Failed to delete family:', error);
      throw error;
    }
  }

  // Agregar miembro a una familia
  async addMemberToFamily(familyId: string, playerId: string): Promise<Family> {
    try {
      console.log('👨‍👩‍👧‍👦 Adding member to family:', familyId, playerId);
      const family = await ApiClient.post<Family>(`${API_ENDPOINTS.FAMILIES}/${familyId}/members`, { playerId });
      console.log('✅ Member added successfully');
      return family;
    } catch (error: any) {
      console.error('❌ Failed to add member to family:', error);
      throw error;
    }
  }

  // Remover miembro de una familia
  async removeMemberFromFamily(familyId: string, playerId: string): Promise<Family> {
    try {
      console.log('👨‍👩‍👧‍👦 Removing member from family:', familyId, playerId);
      const family = await ApiClient.delete<Family>(`${API_ENDPOINTS.FAMILIES}/${familyId}/members/${playerId}`);
      console.log('✅ Member removed successfully');
      return family;
    } catch (error: any) {
      console.error('❌ Failed to remove member from family:', error);
      throw error;
    }
  }

  // Buscar familias
  async searchFamilies(query: string): Promise<Family[]> {
    try {
      console.log('🔍 Searching families:', query);
      const families = await ApiClient.get<Family[]>(`${API_ENDPOINTS.FAMILIES}/search/${encodeURIComponent(query)}`);
      console.log(`✅ Found ${families.length} families`);
      return families;
    } catch (error: any) {
      console.error('❌ Failed to search families:', error);
      throw error;
    }
  }

  // Validar datos de familia antes de enviar
  validateFamilyData(data: CreateFamilyData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name?.trim()) errors.push('Nombre de la familia es requerido');
    // primaryPlayerId ya no es requerido en el nuevo sistema simplificado
    if (data.familyDiscount && (data.familyDiscount < 0 || data.familyDiscount > 100)) {
      errors.push('El descuento debe estar entre 0 y 100%');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Formatear información de la familia para mostrar
  formatFamilyInfo(family: Family): string {
    const memberCount = family.members.length;
    const discountText = family.familyDiscount > 0 ? ` (${family.familyDiscount}% desc.)` : '';
    return `${family.name} - ${memberCount} miembro${memberCount !== 1 ? 's' : ''}${discountText}`;
  }

  // Calcular total de cuotas de la familia
  calculateFamilyTotal(family: Family): number {
    if (family.totalQuota !== undefined) {
      return family.discountedTotal || family.totalQuota;
    }
    
    let total = 0;
    family.members.forEach(member => {
      if (member.category) {
        total += member.category.cuota;
      }
    });
    
    const discount = (total * family.familyDiscount) / 100;
    return total - discount;
  }
}

export default new FamiliesService(); 
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import ApiClient from '../utils/apiClient';

export interface FamilyDiscount {
  _id?: string;
  memberCount: number;
  discountPercentage: number;
  description: string;
}

export interface FamilyDiscounts {
  byMemberCount: FamilyDiscount[];
  maxDiscount: number;
  autoDiscountEnabled: boolean;
}

export interface SystemReceipts {
  footerText: string;
  logoUrl: string;
}

export interface SystemConfig {
  clubName: string;
  currency: string;
  receipts: SystemReceipts;
}

export interface NotificationsConfig {
  contactEmail: string;
  enabled: boolean;
}

export interface Configuration {
  _id: string;
  familyDiscounts: FamilyDiscounts;
  system: SystemConfig;
  notifications: NotificationsConfig;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateConfigurationData {
  familyDiscounts?: Partial<FamilyDiscounts>;
  system?: Partial<SystemConfig>;
  notifications?: Partial<NotificationsConfig>;
}

class ConfigurationService {
  // Obtener la configuración actual
  async getConfiguration(): Promise<Configuration> {
    try {
      console.log('⚙️ Fetching configuration...');
      const config = await ApiClient.get<Configuration>(API_ENDPOINTS.CONFIGURATION);
      console.log('✅ Configuration fetched successfully');
      return config;
    } catch (error: any) {
      console.error('❌ Failed to fetch configuration:', error);
      throw error;
    }
  }

  // Actualizar la configuración
  async updateConfiguration(data: Configuration): Promise<Configuration> {
    try {
      console.log('⚙️ Updating configuration...');
      const config = await ApiClient.put<Configuration>(API_ENDPOINTS.CONFIGURATION, data);
      console.log('✅ Configuration updated successfully');
      return config;
    } catch (error: any) {
      console.error('❌ Failed to update configuration:', error);
      throw error;
    }
  }

  // Resetear configuración a valores por defecto
  async resetConfiguration(): Promise<Configuration> {
    try {
      console.log('⚙️ Resetting configuration...');
      const config = await ApiClient.post<Configuration>(`${API_ENDPOINTS.CONFIGURATION}/reset`);
      console.log('✅ Configuration reset successfully');
      return config;
    } catch (error: any) {
      console.error('❌ Failed to reset configuration:', error);
      throw error;
    }
  }

  // Obtener descuento para una cantidad específica de miembros
  async getFamilyDiscount(memberCount: number): Promise<{
    memberCount: number;
    discount: number;
    description: string;
    autoDiscountEnabled: boolean;
  }> {
    try {
      console.log(`💰 Getting family discount for ${memberCount} members...`);
      const result = await ApiClient.get(`${API_ENDPOINTS.CONFIGURATION}/family-discount/${memberCount}`);
      console.log('✅ Family discount fetched successfully');
      return result;
    } catch (error: any) {
      console.error('❌ Failed to get family discount:', error);
      throw error;
    }
  }

  // Calcular descuento automático para una familia
  async calculateFamilyDiscount(memberCount: number, currentDiscount?: number): Promise<{
    memberCount: number;
    currentDiscount: number;
    autoDiscount: number;
    suggestedDiscount: number;
    autoDiscountEnabled: boolean;
    maxDiscount: number;
  }> {
    try {
      console.log(`💰 Calculating family discount for ${memberCount} members...`);
      const result = await ApiClient.post(`${API_ENDPOINTS.CONFIGURATION}/calculate-family-discount`, {
        memberCount,
        currentDiscount
      });
      console.log('✅ Family discount calculated successfully');
      return result;
    } catch (error: any) {
      console.error('❌ Failed to calculate family discount:', error);
      throw error;
    }
  }

  // Obtener configuración de descuentos familiares
  async getFamilyDiscounts(): Promise<{
    autoDiscountEnabled: boolean;
    maxDiscount: number;
    discounts: FamilyDiscount[];
  }> {
    try {
      console.log('💰 Getting family discounts configuration...');
      const result = await ApiClient.get(`${API_ENDPOINTS.CONFIGURATION}/family-discounts`);
      console.log('✅ Family discounts configuration fetched successfully');
      return result;
    } catch (error: any) {
      console.error('❌ Failed to get family discounts configuration:', error);
      throw error;
    }
  }

  // Validar datos de descuento
  validateDiscountData(discount: FamilyDiscount): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!discount.memberCount || discount.memberCount < 2) {
      errors.push('La cantidad de integrantes debe ser al menos 2');
    }

    if (!discount.discountPercentage || discount.discountPercentage < 0 || discount.discountPercentage > 100) {
      errors.push('El porcentaje de descuento debe estar entre 0 y 100');
    }

    if (!discount.description?.trim()) {
      errors.push('La descripción es requerida');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Formatear descuento para mostrar
  formatDiscount(discount: FamilyDiscount): string {
    return `${discount.memberCount} integrante${discount.memberCount > 1 ? 's' : ''}: ${discount.discountPercentage}%`;
  }

  // Calcular descuento sugerido para una familia
  async suggestFamilyDiscount(memberCount: number, currentDiscount: number = 0): Promise<number> {
    try {
      const result = await this.calculateFamilyDiscount(memberCount, currentDiscount);
      return result.suggestedDiscount;
    } catch (error) {
      console.error('Error suggesting family discount:', error);
      return currentDiscount;
    }
  }
}

export default new ConfigurationService();

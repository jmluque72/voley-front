import apiClient from '../lib/axios';
import { API_ENDPOINTS } from '../config/api';

export interface PaymentCategory {
  _id: string;
  name: string;
  gender: string;
}

export interface PaymentPlayer {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  birthDate: string;
  phone?: string;
  category: PaymentCategory;
}

export interface Payment {
  _id: string;
  playerId: string;
  month: number;
  year: number;
  amount: number;
  paymentMethod: 'banco' | 'efectivo';
  categoryId: string;
  player: PaymentPlayer;
  category: PaymentCategory; // Categoría histórica del payment
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentData {
  playerId: string;
  month: number;
  year: number;
  amount: number;
  paymentMethod: 'banco' | 'efectivo';
  categoryId: string; // Categoría del jugador al momento del pago
}

export interface UpdatePaymentData {
  playerId?: string;
  month?: number;
  year?: number;
  amount?: number;
  paymentMethod?: 'banco' | 'efectivo';
  categoryId?: string; // Permite cambiar la categoría histórica
}

export interface PaymentFilters {
  playerId?: string;
  month?: number;
  year?: number;
}

export const PAYMENT_METHODS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'banco', label: 'Transferencia Bancaria' }
] as const;

export const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' }
] as const;

class PaymentsService {
  // Obtener todos los pagos con filtros opcionales
  async getPayments(filters?: PaymentFilters): Promise<Payment[]> {
    const params = new URLSearchParams();
    
    if (filters?.playerId) params.append('playerId', filters.playerId);
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    
    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.PAYMENTS}?${queryString}` : API_ENDPOINTS.PAYMENTS;
    
    const response = await apiClient.get(url);
    return response.data;
  }

  // Crear un nuevo pago
  async createPayment(paymentData: CreatePaymentData): Promise<Payment> {
    const response = await apiClient.post(API_ENDPOINTS.PAYMENTS, paymentData);
    return response.data;
  }

  // Actualizar un pago existente
  async updatePayment(id: string, paymentData: UpdatePaymentData): Promise<Payment> {
    const response = await apiClient.put(`${API_ENDPOINTS.PAYMENTS}/${id}`, paymentData);
    return response.data;
  }

  // Eliminar un pago
  async deletePayment(id: string): Promise<{ msg: string }> {
    const response = await apiClient.delete(`${API_ENDPOINTS.PAYMENTS}/${id}`);
    return response.data;
  }

  // Obtener un pago por ID
  async getPaymentById(id: string): Promise<Payment> {
    const response = await apiClient.get(`${API_ENDPOINTS.PAYMENTS}/${id}`);
    return response.data;
  }

  // Obtener pagos por jugador
  async getPaymentsByPlayer(playerId: string): Promise<Payment[]> {
    return this.getPayments({ playerId });
  }

  // Obtener pagos por mes/año
  async getPaymentsByMonthYear(month: number, year: number): Promise<Payment[]> {
    return this.getPayments({ month, year });
  }

  // Verificar si ya existe un pago para un jugador en un mes/año específico
  async checkPaymentExists(playerId: string, month: number, year: number, excludeId?: string): Promise<boolean> {
    try {
      const payments = await this.getPayments({ playerId, month, year });
      return payments.some(payment => 
        payment.playerId === playerId && 
        payment.month === month && 
        payment.year === year &&
        (!excludeId || payment._id !== excludeId)
      );
    } catch (error) {
      console.error('Error verificando pago existente:', error);
      return false;
    }
  }

  // Calcular estadísticas de pagos
  async getPaymentStats(year?: number): Promise<{
    totalAmount: number;
    totalPayments: number;
    effectivoAmount: number;
    bancoAmount: number;
    monthlyStats: Array<{ month: number; amount: number; count: number }>;
  }> {
    try {
      const filters = year ? { year } : undefined;
      const payments = await this.getPayments(filters);
      
      const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const totalPayments = payments.length;
      const effectivoAmount = payments
        .filter(p => p.paymentMethod === 'efectivo')
        .reduce((sum, payment) => sum + payment.amount, 0);
      const bancoAmount = payments
        .filter(p => p.paymentMethod === 'banco')
        .reduce((sum, payment) => sum + payment.amount, 0);

      // Estadísticas mensuales
      const monthlyMap = new Map<number, { amount: number; count: number }>();
      payments.forEach(payment => {
        const month = payment.month;
        const current = monthlyMap.get(month) || { amount: 0, count: 0 };
        monthlyMap.set(month, {
          amount: current.amount + payment.amount,
          count: current.count + 1
        });
      });

      const monthlyStats = Array.from(monthlyMap.entries()).map(([month, stats]) => ({
        month,
        amount: stats.amount,
        count: stats.count
      }));

      return {
        totalAmount,
        totalPayments,
        effectivoAmount,
        bancoAmount,
        monthlyStats
      };
    } catch (error) {
      console.error('Error calculando estadísticas:', error);
      throw new Error('Error calculando estadísticas de pagos');
    }
  }

  // Helper para obtener el nombre del mes
  getMonthName(month: number): string {
    const monthObj = MONTHS.find(m => m.value === month);
    return monthObj ? monthObj.label : `Mes ${month}`;
  }

  // Helper para obtener el nombre del método de pago
  getPaymentMethodName(method: 'banco' | 'efectivo'): string {
    const methodObj = PAYMENT_METHODS.find(m => m.value === method);
    return methodObj ? methodObj.label : method;
  }
}

export default new PaymentsService(); 
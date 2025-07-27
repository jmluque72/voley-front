import apiClient from '../lib/axios';
import { API_ENDPOINTS } from '../config/api';

export interface DashboardStats {
  totalPlayers: number;
  totalCategories: number;
  paymentsThisMonth: number;
  monthlyIncome: number;
  yearlyIncome: number;
  currentMonth: number;
  currentYear: number;
  recentPayments: Array<{
    _id: string;
    player: {
      _id: string;
      firstName: string;
      lastName: string;
      fullName: string;
    };
    month: number;
    year: number;
    amount: number;
    paymentMethod: string;
    createdAt: string;
  }>;
  categoriesStats: Array<{
    _id: string;
    name: string;
    gender: string;
    cuota: number;
    playersCount: number;
  }>;
}

export interface MonthlyIncomeData {
  month: number;
  monthName: string;
  total: number;
  paymentsCount: number;
}

export interface MonthlyIncomeResponse {
  year: number;
  monthsData: MonthlyIncomeData[];
  totalYearly: number;
  totalPayments: number;
  averageMonthly: number;
}

class StatsService {
  // Obtener estadísticas del dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get(API_ENDPOINTS.STATS.DASHBOARD);
    return response.data;
  }

  // Obtener datos de ingresos mensuales por categoría
  async getMonthlyIncomeData(year?: number): Promise<MonthlyIncomeResponse> {
    const params = year ? { year: year.toString() } : {};
    const response = await apiClient.get(API_ENDPOINTS.STATS.MONTHLY_INCOME, { params });
    return response.data;
  }
}

export default new StatsService(); 
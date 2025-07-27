import { useState, useEffect } from 'react';
import statsService, { DashboardStats, MonthlyIncomeResponse } from '../services/statsService';

export const useStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState<MonthlyIncomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState<string>('');
  const [chartError, setChartError] = useState<string>('');

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      const dashboardStats = await statsService.getDashboardStats();
      setStats(dashboardStats);
    } catch (err: any) {
      console.error('Error cargando estadísticas:', err);
      setError(err.response?.data?.msg || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyIncome = async (year?: number) => {
    try {
      setLoadingChart(true);
      setChartError('');
      const monthlyIncomeData = await statsService.getMonthlyIncomeData(year);
      setMonthlyIncome(monthlyIncomeData);
    } catch (err: any) {
      console.error('Error cargando datos del gráfico:', err);
      setChartError(err.response?.data?.msg || 'Error al cargar datos del gráfico');
    } finally {
      setLoadingChart(false);
    }
  };

  const refreshStats = () => {
    loadStats();
    if (monthlyIncome) {
      loadMonthlyIncome(monthlyIncome.year);
    }
  };

  useEffect(() => {
    loadStats();
    loadMonthlyIncome(); // Cargar gráfico por defecto
  }, []);

  return {
    stats,
    monthlyIncome,
    loading,
    loadingChart,
    error,
    chartError,
    refreshStats,
    loadMonthlyIncome
  };
}; 
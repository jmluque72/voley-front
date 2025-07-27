import { useState, useEffect } from 'react';
import paymentsService, { Payment, CreatePaymentData, UpdatePaymentData, PaymentFilters } from '../services/paymentsService';

interface UsePaymentsReturn {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  filteredPayments: Payment[];
  stats: {
    totalAmount: number;
    totalPayments: number;
    effectivoAmount: number;
    bancoAmount: number;
    monthlyStats: Array<{ month: number; amount: number; count: number }>;
  } | null;
  createPayment: (data: CreatePaymentData) => Promise<void>;
  updatePayment: (id: string, data: UpdatePaymentData) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  filterPayments: (filters: PaymentFilters) => void;
  clearFilters: () => void;
  refreshPayments: () => Promise<void>;
  calculateStats: (year?: number) => Promise<void>;
  getMonthName: (month: number) => string;
  getPaymentMethodName: (method: 'banco' | 'efectivo') => string;
}

export const usePayments = (): UsePaymentsReturn => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [activeFilters, setActiveFilters] = useState<PaymentFilters>({});
  const [stats, setStats] = useState<{
    totalAmount: number;
    totalPayments: number;
    effectivoAmount: number;
    bancoAmount: number;
    monthlyStats: Array<{ month: number; amount: number; count: number }>;
  } | null>(null);

  const loadPayments = async (filters?: PaymentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const paymentsData = await paymentsService.getPayments(filters);
      setPayments(paymentsData);
      setFilteredPayments(paymentsData);
    } catch (err: any) {
      console.error('Error cargando pagos:', err);
      setError(err.response?.data?.msg || 'Error cargando pagos. Verifique que esté autenticado.');
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (data: CreatePaymentData): Promise<void> => {
    try {
      const newPayment = await paymentsService.createPayment(data);
      setPayments(prev => [newPayment, ...prev]); // Agregar al inicio (más reciente)
      
      // Actualizar filteredPayments si el nuevo pago coincide con los filtros activos
      const matchesFilters = (
        (!activeFilters.playerId || newPayment.playerId === activeFilters.playerId) &&
        (!activeFilters.month || newPayment.month === activeFilters.month) &&
        (!activeFilters.year || newPayment.year === activeFilters.year)
      );
      
      if (matchesFilters) {
        setFilteredPayments(prev => [newPayment, ...prev]);
      }
    } catch (err: any) {
      console.error('Error creando pago:', err);
      throw new Error(err.response?.data?.msg || 'Error creando pago');
    }
  };

  const updatePayment = async (id: string, data: UpdatePaymentData): Promise<void> => {
    try {
      const updatedPayment = await paymentsService.updatePayment(id, data);
      
      setPayments(prev => 
        prev.map(payment => 
          payment._id === id ? updatedPayment : payment
        )
      );
      
      setFilteredPayments(prev => 
        prev.map(payment => 
          payment._id === id ? updatedPayment : payment
        )
      );
    } catch (err: any) {
      console.error('Error actualizando pago:', err);
      throw new Error(err.response?.data?.msg || 'Error actualizando pago');
    }
  };

  const deletePayment = async (id: string): Promise<void> => {
    try {
      await paymentsService.deletePayment(id);
      setPayments(prev => prev.filter(payment => payment._id !== id));
      setFilteredPayments(prev => prev.filter(payment => payment._id !== id));
    } catch (err: any) {
      console.error('Error eliminando pago:', err);
      throw new Error(err.response?.data?.msg || 'Error eliminando pago');
    }
  };

  const filterPayments = (filters: PaymentFilters) => {
    setActiveFilters(filters);
    
    let filtered = payments;
    
    if (filters.playerId) {
      filtered = filtered.filter(payment => payment.playerId === filters.playerId);
    }
    
    if (filters.month) {
      filtered = filtered.filter(payment => payment.month === filters.month);
    }
    
    if (filters.year) {
      filtered = filtered.filter(payment => payment.year === filters.year);
    }
    
    setFilteredPayments(filtered);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setFilteredPayments(payments);
  };

  const calculateStats = async (year?: number): Promise<void> => {
    try {
      const statsData = await paymentsService.getPaymentStats(year);
      setStats(statsData);
    } catch (error) {
      console.error('Error calculando estadísticas:', error);
    }
  };

  const refreshPayments = async (): Promise<void> => {
    await loadPayments();
    setActiveFilters({});
  };

  const getMonthName = (month: number): string => {
    return paymentsService.getMonthName(month);
  };

  const getPaymentMethodName = (method: 'banco' | 'efectivo'): string => {
    return paymentsService.getPaymentMethodName(method);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  // Recalcular estadísticas cuando cambien los payments
  useEffect(() => {
    if (payments.length > 0) {
      calculateStats();
    }
  }, [payments]);

  return {
    payments,
    loading,
    error,
    filteredPayments,
    stats,
    createPayment,
    updatePayment,
    deletePayment,
    filterPayments,
    clearFilters,
    refreshPayments,
    calculateStats,
    getMonthName,
    getPaymentMethodName,
  };
}; 
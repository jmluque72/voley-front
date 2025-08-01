import { useState, useEffect } from 'react';
import apiClient from '../lib/axios';

interface DebtorMonth {
  month: number;
  year: number;
  monthName: string;
  amount: number;
}

interface DebtorData {
  playerId: string;
  playerName: string;
  playerEmail: string;
  category: string;
  categoryQuota: number;
  unpaidMonthsCount: number;
  unpaidMonths: DebtorMonth[];
  totalOwed: number;
  lastPaymentDate: string | null;
  lastPaymentMonth: string | null;
  monthsSinceLastPayment: number | null;
}

interface DebtorsSummary {
  totalDebtors: number;
  totalOwed: number;
  averageMonthsUnpaid: number;
  currentYear: number;
  currentMonth: number;
  monthsChecked: number;
}

interface DebtorsResponse {
  debtors: DebtorData[];
  summary: DebtorsSummary;
  currentDate: string;
}

export const useDebtors = () => {
  const [debtors, setDebtors] = useState<DebtorData[]>([]);
  const [summary, setSummary] = useState<DebtorsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebtors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching debtors from API...');
      
      const response = await apiClient.get<DebtorsResponse>('/stats/debtors');
      
      console.log('✅ Debtors data received:', response.data);
      
      setDebtors(response.data.debtors);
      setSummary(response.data.summary);
    } catch (err: any) {
      console.error('❌ Error fetching debtors:', err);
      setError(err.response?.data?.msg || 'Error al cargar los deudores');
    } finally {
      setLoading(false);
    }
  };

  const refreshDebtors = async () => {
    console.log('🔄 Refreshing debtors data...');
    await fetchDebtors();
  };

  useEffect(() => {
    fetchDebtors();
  }, []);

  return {
    debtors,
    summary,
    loading,
    error,
    refreshDebtors
  };
}; 
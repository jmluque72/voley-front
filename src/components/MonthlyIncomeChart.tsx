import React from 'react';
import { BarChart3 } from 'lucide-react';
import { MonthlyIncomeResponse } from '../services/statsService';

interface MonthlyIncomeChartProps {
  data: MonthlyIncomeResponse | null;
  loading: boolean;
  error: string;
}

const MonthlyIncomeChart: React.FC<MonthlyIncomeChartProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-500">Cargando datos del gráfico...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 bg-red-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error al cargar datos</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.monthsData || data.monthsData.length === 0) {
    return (
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No hay datos disponibles</p>
          <p className="text-gray-400 text-sm">Ingresos mensuales aparecerán aquí</p>
        </div>
      </div>
    );
  }

  // Encontrar el valor máximo para escalar las barras
  const maxValue = Math.max(...data.monthsData.map(month => month.total));
  const chartHeight = 200; // Altura en pixels

  // Formatear números como moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Resumen del año */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Anual</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(data.totalYearly)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Pagos Totales</p>
          <p className="text-lg font-bold text-gray-900">{data.totalPayments}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Promedio Mensual</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(data.averageMonthly)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Año</p>
          <p className="text-lg font-bold text-gray-900">{data.year}</p>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="relative" style={{ height: chartHeight + 40 }}>
        <div className="flex items-end justify-between h-full px-2">
          {data.monthsData.map((month) => {
            const barHeight = maxValue > 0 ? (month.total / maxValue) * chartHeight : 0;
            const hasPayments = month.total > 0;
            
            return (
              <div key={month.month} className="flex flex-col items-center flex-1 group">
                {/* Valor encima de la barra */}
                <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    <div>{formatCurrency(month.total)}</div>
                    <div>{month.paymentsCount} pagos</div>
                  </div>
                </div>
                
                {/* Barra */}
                <div 
                  className={`w-8 rounded-t transition-all duration-300 ${
                    hasPayments 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-gray-200'
                  }`}
                  style={{ height: Math.max(barHeight, 2) }}
                ></div>
                
                {/* Etiqueta del mes */}
                <div className="mt-2 text-xs text-gray-600 text-center transform -rotate-45 origin-center">
                  {month.monthName.substring(0, 3)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda adicional */}
      <div className="text-center text-sm text-gray-500">
        <p>Hover sobre las barras para ver detalles • Total del año: {formatCurrency(data.totalYearly)}</p>
      </div>
    </div>
  );
};

export default MonthlyIncomeChart; 
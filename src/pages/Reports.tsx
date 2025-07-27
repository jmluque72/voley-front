import React, { useState } from 'react';
import { BarChart3, Users, DollarSign, TrendingUp, Download, AlertTriangle, Target, Calendar, RefreshCcw } from 'lucide-react';
import { useStats } from '../hooks/useStats';
import MonthlyIncomeChart from '../components/MonthlyIncomeChart';

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2025');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { 
    stats, 
    monthlyIncome, 
    loading, 
    loadingChart, 
    error, 
    chartError, 
    refreshStats, 
    loadMonthlyIncome 
  } = useStats();

  const handleExport = () => {
    // Mock export functionality
    alert('Report export functionality would be implemented here');
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    loadMonthlyIncome(year);
  };

  // Formatear números como moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Calcular porcentaje de cambio (simulado)
  const getChangePercentage = (current: number, estimated: number) => {
    if (estimated === 0) return '0%';
    return ((current / estimated) * 100).toFixed(1) + '%';
  };

  // Calcular estadísticas derivadas
  const calculateDerivedStats = () => {
    if (!stats) return null;
    
    // Calcular total esperado basado en jugadores activos y promedio de cuota
    const averageCuota = stats.categoriesStats.length > 0 
      ? stats.categoriesStats.reduce((sum, cat) => sum + cat.cuota, 0) / stats.categoriesStats.length
      : 0;
    
    const estimatedYearly = stats.totalPlayers * averageCuota * 12;
    const collectionPercentage = estimatedYearly > 0 
      ? ((stats.yearlyIncome / estimatedYearly) * 100).toFixed(1)
      : '0';
    
    // Calcular pagos "vencidos" (simulado - meses sin pagos)
    const currentMonthsExpected = stats.currentMonth * stats.totalPlayers;
    const actualPayments = stats.recentPayments.length;
    const overduePayments = Math.max(0, currentMonthsExpected - actualPayments);
    
    return {
      estimatedYearly,
      collectionPercentage,
      overduePayments
    };
  };

  const derivedStats = calculateDerivedStats();

  // Estadísticas principales del volleyball
  const volleyballStats = stats && derivedStats ? [
    {
      name: 'Total Players Activos',
      value: stats.totalPlayers.toString(),
      change: `${stats.totalPlayers} jugadores`,
      changeType: 'neutral' as const,
      icon: Users,
      description: 'Jugadores registrados en el sistema'
    },
    {
      name: `Pagos Recaudados ${stats.currentYear}`,
      value: formatCurrency(stats.yearlyIncome),
      change: `${derivedStats.collectionPercentage}% del estimado`,
      changeType: parseFloat(derivedStats.collectionPercentage) >= 70 ? 'positive' as const : parseFloat(derivedStats.collectionPercentage) >= 40 ? 'neutral' as const : 'negative' as const,
      icon: DollarSign,
      description: `${stats.recentPayments.length} pagos recibidos`
    },
    {
      name: `Pagos Vencidos ${stats.currentYear}`,
      value: derivedStats.overduePayments.toString(),
      change: derivedStats.overduePayments === 0 ? 'Todo al día' : `${derivedStats.overduePayments} meses vencidos`,
      changeType: derivedStats.overduePayments === 0 ? 'positive' as const : derivedStats.overduePayments <= 3 ? 'neutral' as const : 'negative' as const,
      icon: AlertTriangle,
      description: 'Cuotas pendientes de meses anteriores'
    },
    {
      name: 'Estimado Final de Año',
      value: formatCurrency(derivedStats.estimatedYearly),
      change: getChangePercentage(stats.yearlyIncome, derivedStats.estimatedYearly),
      changeType: 'neutral' as const,
      icon: Target,
      description: 'Proyección total anual'
    }
  ] : [];

  const recentActivity = stats?.recentPayments.map((payment, index) => ({
    id: payment._id,
    action: 'Pago registrado',
    user: `${payment.player.fullName} - ${payment.paymentMethod}`,
    time: new Date(payment.createdAt).toLocaleDateString('es-ES')
  })) || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard - Volleyball Club</h1>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="2025">Año 2025</option>
            <option value="2024">Año 2024</option>
            <option value="2023">Año 2023</option>
          </select>
          <button
            onClick={refreshStats}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={refreshStats}
            className="text-sm underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Stats Grid - Las 4 cajas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {volleyballStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${
                  stat.changeType === 'positive' ? 'bg-green-50' :
                  stat.changeType === 'negative' ? 'bg-red-50' : 'bg-blue-50'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-blue-600'
                  }`} />
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Información adicional */}
      {stats && derivedStats && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Resumen del Año {stats.currentYear}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-blue-800">Mes Actual:</p>
              <p className="text-blue-700">{new Date(stats.currentYear, stats.currentMonth - 1).toLocaleDateString('es-ES', { month: 'long' }).charAt(0).toUpperCase() + new Date(stats.currentYear, stats.currentMonth - 1).toLocaleDateString('es-ES', { month: 'long' }).slice(1)}</p>
            </div>
            <div>
              <p className="font-medium text-blue-800">Progreso de Recaudación:</p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(parseFloat(derivedStats.collectionPercentage), 100)}%` }}
                ></div>
              </div>
              <p className="text-blue-700 mt-1">{derivedStats.collectionPercentage}% completado</p>
            </div>
            <div>
              <p className="font-medium text-blue-800">Pagos Pendientes:</p>
              <p className="text-blue-700">
                {derivedStats.overduePayments === 0 ? '¡Todos al día!' : `${derivedStats.overduePayments} cuotas pendientes`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Income Chart - Full Width */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Ingresos Mensuales por Categoría</h3>
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Año:</label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
            </select>
            <button
              onClick={() => loadMonthlyIncome(selectedYear)}
              className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <MonthlyIncomeChart 
          data={monthlyIncome}
          loading={loadingChart}
          error={chartError}
        />
      </div>

      {/* Player Growth Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Crecimiento de Jugadores</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Evolución de membresías</p>
            <p className="text-sm text-gray-400">Gráfico de crecimiento mensual - Próximamente</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.user}</p>
                </div>
                <span className="text-sm text-gray-400">{activity.time}</span>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
            )}
          </div>
        </div>
      </div>

      {/* Export Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-2">Exportar Reportes</h3>
        <p className="text-green-700 mb-4">
          Genera reportes detallados del año {stats?.currentYear || '2025'} incluyendo análisis de pagos, 
          estadísticas de jugadores y proyecciones financieras.
        </p>
        <div className="flex flex-wrap gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
            Reporte PDF Completo
          </button>
          <button className="bg-white text-green-600 border border-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors text-sm">
            Excel - Pagos
          </button>
          <button className="bg-white text-green-600 border border-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors text-sm">
            CSV - Jugadores
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
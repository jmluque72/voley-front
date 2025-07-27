import React, { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, User, CreditCard, Filter, X, RefreshCw } from 'lucide-react';
import DataTable from '../components/DataTable';
import { usePlayers } from '../hooks/usePlayers';
import { usePayments } from '../hooks/usePayments';
import { useCategories } from '../hooks/useCategories';

interface MorosoData {
  playerId: string;
  playerName: string;
  playerEmail: string;
  category: string;
  monthsOwed: number;
  lastPaymentDate: string | null;
  totalOwed: number;
  owedMonths: Array<{
    month: number;
    year: number;
    amount: number;
  }>;
}

const Morosos: React.FC = () => {
  const { players, loading: playersLoading } = usePlayers();
  const { payments, loading: paymentsLoading, getMonthName } = usePayments();
  const { categories, loading: categoriesLoading } = useCategories();
  const [morososData, setMorososData] = useState<MorosoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMinMonths, setFilterMinMonths] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const calculateMorosos = () => {
    if (!players || !payments || !categories) return;
    
    setLoading(true);
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    console.log('🔍 Calculando morosos para:', { currentMonth, currentYear });
    console.log('📊 Total payments:', payments.length);
    
    const morosos: MorosoData[] = [];
    
    players.forEach(player => {
      const playerPayments = payments.filter(p => p.playerId === player._id);
      const owedMonths: Array<{ month: number; year: number; amount: number; }> = [];
      
      console.log(`👤 Checking player: ${player.firstName} ${player.lastName}`);
      console.log(`💰 Player payments (${playerPayments.length}):`, playerPayments.map(p => ({ month: p.month, year: p.year })));
      
      // Verificar los últimos 12 meses (empezando desde el mes anterior)
      for (let i = 1; i <= 12; i++) {
        let checkMonth = currentMonth - i;
        let checkYear = currentYear;
        
        if (checkMonth <= 0) {
          checkMonth += 12;
          checkYear -= 1;
        }
        
        console.log(`🔎 Checking month: ${checkMonth}/${checkYear}`);
        
        const paymentExists = playerPayments.some(
          p => p.month === checkMonth && p.year === checkYear
        );
        
        console.log(`💸 Payment exists for ${checkMonth}/${checkYear}:`, paymentExists);
        
        if (!paymentExists) {
          const playerCategory = categories.find(cat => cat._id === player.category._id);
          const categoryQuota = playerCategory?.cuota || 0;
          console.log(`❌ Adding owed month: ${checkMonth}/${checkYear} - $${categoryQuota}`);
          owedMonths.push({
            month: checkMonth,
            year: checkYear,
            amount: categoryQuota
          });
        }
      }
      
      if (owedMonths.length > 0) {
        const lastPayment = playerPayments
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
        const totalOwed = owedMonths.reduce((sum, month) => sum + month.amount, 0);
        
        morosos.push({
          playerId: player._id,
          playerName: `${player.firstName} ${player.lastName}`,
          playerEmail: player.email,
          category: player.category?.name || 'Sin categoría',
          monthsOwed: owedMonths.length,
          lastPaymentDate: lastPayment ? lastPayment.createdAt : null,
          totalOwed,
          owedMonths: owedMonths.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
          })
        });
      }
    });
    
    // Ordenar por cantidad de meses adeudados (descendente)
    morosos.sort((a, b) => b.monthsOwed - a.monthsOwed);
    
    setMorososData(morosos);
    setLoading(false);
  };

  useEffect(() => {
    if (!playersLoading && !paymentsLoading && !categoriesLoading && players && payments && categories) {
      calculateMorosos();
    }
  }, [players, payments, categories, playersLoading, paymentsLoading, categoriesLoading]);

  const renderCellValue = (column: any, moroso: MorosoData) => {
    if (column.render) {
      return column.render(moroso[column.key as keyof MorosoData], moroso);
    }
    const value = moroso[column.key as keyof MorosoData];
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return '';
    return String(value);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    console.log('🔄 Refreshing morosos data...');
    
    // Recalculate immediately with current data
    setTimeout(() => {
      calculateMorosos();
      setRefreshing(false);
      console.log('✅ Morosos data refreshed');
    }, 500);
  };

  const filteredMorosos = morososData.filter(moroso => {
    if (filterCategory && moroso.category !== filterCategory) return false;
    if (moroso.monthsOwed < filterMinMonths) return false;
    return true;
  });

  const clearFilters = () => {
    setFilterCategory('');
    setFilterMinMonths(1);
  };

  const stats = {
    totalMorosos: morososData.length,
    totalOwed: morososData.reduce((sum, m) => sum + m.totalOwed, 0),
    averageMonthsOwed: morososData.length > 0 
      ? (morososData.reduce((sum, m) => sum + m.monthsOwed, 0) / morososData.length).toFixed(1)
      : '0'
  };

  const columns = [
    {
      key: 'playerName',
      label: 'Jugador',
      render: (value: string, row: MorosoData) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.playerEmail}</div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Categoría',
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value}
        </span>
      )
    },
    {
      key: 'monthsOwed',
      label: 'Meses Adeudados',
      render: (value: number) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value >= 6 ? 'bg-red-100 text-red-800' :
          value >= 3 ? 'bg-yellow-100 text-yellow-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          {value} {value === 1 ? 'mes' : 'meses'}
        </span>
      )
    },
    {
      key: 'totalOwed',
      label: 'Total Adeudado',
      render: (value: number) => (
        <span className="font-medium text-gray-900">
          ${value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'lastPaymentDate',
      label: 'Último Pago',
      render: (value: string | null) => (
        <span className="text-sm text-gray-500">
          {value ? new Date(value).toLocaleDateString('es-ES') : 'Nunca'}
        </span>
      )
    },
    {
      key: 'owedMonths',
      label: 'Detalle Meses',
      render: (value: Array<{ month: number; year: number; amount: number; }>) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 3).map((month, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-50 text-red-700 border border-red-200"
            >
              {getMonthName(month.month)} {month.year}
            </span>
          ))}
          {value.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
              +{value.length - 3} más
            </span>
          )}
        </div>
      )
    }
  ];

  if (playersLoading || paymentsLoading || categoriesLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Calculando usuarios morosos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuarios Morosos</h1>
            <p className="text-gray-600">Jugadores con pagos pendientes</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <User className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Morosos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMorosos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Adeudado</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalOwed.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Promedio Meses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageMonthsOwed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las categorías</option>
                {Array.from(new Set(morososData.map(m => m.category))).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mínimo meses adeudados
              </label>
              <select
                value={filterMinMonths}
                onChange={(e) => setFilterMinMonths(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1}>1 mes o más</option>
                <option value={2}>2 meses o más</option>
                <option value={3}>3 meses o más</option>
                <option value={6}>6 meses o más</option>
                <option value={12}>12 meses o más</option>
              </select>
            </div>
          </div>
          
          {(filterCategory || filterMinMonths > 1) && (
            <div className="flex items-center space-x-2">
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Limpiar filtros</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Lista de Morosos ({filteredMorosos.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMorosos.map((moroso, index) => (
                <tr key={moroso.playerId} className="hover:bg-gray-50">
                  {columns.map((column) => (
                                       <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                     {renderCellValue(column, moroso)}
                   </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredMorosos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron usuarios morosos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Morosos; 
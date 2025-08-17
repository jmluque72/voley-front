import React, { useState } from 'react';
import { AlertTriangle, Calendar, User, CreditCard, Filter, X, RefreshCw, Download } from 'lucide-react';
import { useDebtors } from '../hooks/useDebtors';
import exportService, { ExportOptions } from '../services/exportService';

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

// Nueva interfaz para las filas detalladas
interface DebtorRow {
  playerId: string;
  playerName: string;
  playerEmail: string;
  category: string;
  categoryQuota: number;
  month: number;
  year: number;
  monthName: string;
  amount: number;
  totalOwed: number;
  lastPaymentDate: string | null;
  lastPaymentMonth: string | null;
  monthsSinceLastPayment: number | null;
}

const Morosos: React.FC = () => {
  const { debtors, summary, loading, error, refreshDebtors } = useDebtors();
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMinMonths, setFilterMinMonths] = useState(1);
  const [filterMonth, setFilterMonth] = useState<number | ''>('');
  const [filterYear, setFilterYear] = useState<number | ''>('');
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('detailed');

  const handleRefresh = async () => {
    setRefreshing(true);
    console.log('🔄 Refreshing debtors data...');
    
    await refreshDebtors();
    setRefreshing(false);
    console.log('✅ Debtors data refreshed');
  };

  // Convertir datos agrupados a filas detalladas
  const detailedRows: DebtorRow[] = debtors.flatMap(debtor => 
    debtor.unpaidMonths.map(month => ({
      playerId: debtor.playerId,
      playerName: debtor.playerName,
      playerEmail: debtor.playerEmail,
      category: debtor.category,
      categoryQuota: debtor.categoryQuota,
      month: month.month,
      year: month.year,
      monthName: month.monthName,
      amount: month.amount,
      totalOwed: debtor.totalOwed,
      lastPaymentDate: debtor.lastPaymentDate,
      lastPaymentMonth: debtor.lastPaymentMonth,
      monthsSinceLastPayment: debtor.monthsSinceLastPayment
    }))
  );

  const filteredDetailedRows = detailedRows.filter(row => {
    if (filterCategory && row.category !== filterCategory) return false;
    if (filterMonth && row.month !== filterMonth) return false;
    if (filterYear && row.year !== filterYear) return false;
    return true;
  });

  // Filtrar jugadores que cumplan con el mínimo de meses
  const playersWithMinMonths = debtors.filter(debtor => 
    debtor.unpaidMonthsCount >= filterMinMonths
  );

  const finalFilteredRows = filteredDetailedRows.filter(row => 
    playersWithMinMonths.some(player => player.playerId === row.playerId)
  );

  const clearFilters = () => {
    setFilterCategory('');
    setFilterMinMonths(1);
    setFilterMonth('');
    setFilterYear('');
  };

  const handleExportToExcel = async () => {
    try {
      setExporting(true);
      console.log('📊 Iniciando exportación a Excel...');
      
      const exportOptions: ExportOptions = {
        category: filterCategory || undefined,
        minMonths: filterMinMonths > 1 ? filterMinMonths : undefined,
        month: filterMonth || undefined,
        year: filterYear || undefined,
        detailed: true
      };
      
      await exportService.exportDebtorsToExcel(finalFilteredRows, exportOptions, summary || undefined);
      
      console.log('✅ Exportación completada exitosamente');
    } catch (error) {
      console.error('❌ Error en la exportación:', error);
      alert('Error al exportar el archivo Excel. Por favor, inténtalo de nuevo.');
    } finally {
      setExporting(false);
    }
  };

  const getMonthName = (month: number): string => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1] || '';
  };

  const renderCellValue = (column: any, row: DebtorRow) => {
    if (column.render) {
      return column.render(row[column.key as keyof DebtorRow], row);
    }
    const value = row[column.key as keyof DebtorRow];
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return '';
    return String(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Calculando usuarios morosos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const columns = [
    {
      key: 'playerName',
      label: 'Jugador',
      render: (value: string, row: DebtorRow) => (
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
      key: 'monthName',
      label: 'Mes',
      render: (value: string, row: DebtorRow) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.year}</div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Monto del Mes',
      render: (value: number) => (
        <span className="font-medium text-gray-900">
          ${value.toLocaleString()}
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
      key: 'lastPaymentMonth',
      label: 'Último Pago',
      render: (value: string | null) => (
        <span className="text-sm text-gray-500">
          {value || 'Nunca'}
        </span>
      )
    },
    {
      key: 'monthsSinceLastPayment',
      label: 'Meses Sin Pagar',
      render: (value: number | null) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value && value >= 6 ? 'bg-red-100 text-red-800' :
          value && value >= 3 ? 'bg-yellow-100 text-yellow-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          {value || 0} {value === 1 ? 'mes' : 'meses'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Informe de Morosos</h1>
            <p className="text-gray-600">Detalle mensual de pagos pendientes por jugador</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportToExcel}
            disabled={exporting || finalFilteredRows.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${exporting ? 'animate-spin' : ''}`} />
            <span>{exporting ? 'Exportando...' : 'Exportar Excel'}</span>
          </button>
          
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
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <User className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Deudores</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalDebtors}</p>
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
                <p className="text-2xl font-bold text-gray-900">${summary.totalOwed.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Registros</p>
                <p className="text-2xl font-bold text-gray-900">{finalFilteredRows.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Período Analizado</p>
                <p className="text-2xl font-bold text-gray-900">{summary.monthsChecked} meses</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                {Array.from(new Set(debtors.map(d => d.category))).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mínimo meses sin pagar
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mes específico
              </label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value ? parseInt(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los meses</option>
                <option value={1}>Enero</option>
                <option value={2}>Febrero</option>
                <option value={3}>Marzo</option>
                <option value={4}>Abril</option>
                <option value={5}>Mayo</option>
                <option value={6}>Junio</option>
                <option value={7}>Julio</option>
                <option value={8}>Agosto</option>
                <option value={9}>Septiembre</option>
                <option value={10}>Octubre</option>
                <option value={11}>Noviembre</option>
                <option value={12}>Diciembre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año específico
              </label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value ? parseInt(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los años</option>
                <option value={2023}>2023</option>
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>
          </div>
          
          {(filterCategory || filterMinMonths > 1 || filterMonth || filterYear) && (
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
            Detalle Mensual de Morosos ({finalFilteredRows.length} registros)
          </h2>
          {summary && (
            <p className="text-sm text-gray-600 mt-1">
              Período: {summary.currentYear} (Enero - {getMonthName(summary.currentMonth)})
            </p>
          )}
          {(filterCategory || filterMinMonths > 1 || filterMonth || filterYear) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {filterCategory && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Categoría: {filterCategory}
                </span>
              )}
              {filterMinMonths > 1 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Mínimo {filterMinMonths} meses
                </span>
              )}
              {filterMonth && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Mes: {getMonthName(filterMonth)}
                </span>
              )}
              {filterYear && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Año: {filterYear}
                </span>
              )}
            </div>
          )}
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
              {finalFilteredRows.map((row, index) => (
                <tr key={`${row.playerId}-${row.month}-${row.year}`} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderCellValue(column, row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {finalFilteredRows.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron registros de morosos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Morosos; 
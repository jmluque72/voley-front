import React, { useState } from 'react';
import { Plus, Filter, X, FileText, Download } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { usePayments } from '../hooks/usePayments';
import { Payment, CreatePaymentData, UpdatePaymentData, PAYMENT_METHODS, MONTHS } from '../services/paymentsService';
import { usePlayers } from '../hooks/usePlayers';
import { useCategories } from '../hooks/useCategories';
import receiptService from '../services/receiptService';

const Payments: React.FC = () => {
  const {
    filteredPayments,
    loading,
    error,
    stats,
    createPayment,
    updatePayment,
    deletePayment,
    filterPayments,
    clearFilters,
    refreshPayments,
    getMonthName,
    getPaymentMethodName,
  } = usePayments();

  const { players } = usePlayers();
  const { categories } = useCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState<CreatePaymentData>({
    playerId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 0,
    paymentMethod: 'efectivo',
    categoryId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [selectedPlayerCategory, setSelectedPlayerCategory] = useState<string>('');

  const columns = [
    { 
      key: 'player', 
      label: 'Jugador',
      render: (value: any) => {
        if (!value) return 'Sin jugador';
        return value.fullName;
      }
    },
    { 
      key: 'category', 
      label: 'Categoría (Histórica)',
      render: (value: any) => {
        if (!value) return 'Sin categoría';
        return `${value.name} - ${value.gender}`;
      }
    },
    { 
      key: 'player', 
      label: 'Categoría Actual',
      render: (value: any) => {
        if (!value || !value.category) return 'Sin categoría';
        return `${value.category.name} - ${value.category.gender}`;
      }
    },
    { 
      key: 'month', 
      label: 'Mes/Año',
      render: (value: number, item: Payment) => {
        return `${getMonthName(value)} ${item.year}`;
      }
    },
    { 
      key: 'amount', 
      label: 'Importe',
      render: (value: number) => {
        return `$${value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
      }
    },
    { 
      key: 'paymentMethod', 
      label: 'Forma de Pago',
      render: (value: 'banco' | 'efectivo') => {
        return getPaymentMethodName(value);
      }
    },
    { 
      key: 'createdAt', 
      label: 'Fecha de Registro',
      render: (value: string) => {
        if (!value) return '';
        const date = new Date(value);
        return date.toLocaleDateString('es-ES');
      }
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (value: any, payment: Payment) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGenerateReceipt(payment);
            }}
            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center space-x-1"
            title="Generar recibo PDF"
          >
            <FileText className="w-3 h-3" />
            <span>PDF</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGenerateSimpleReceipt(payment);
            }}
            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center space-x-1"
            title="Generar recibo simple"
          >
            <Download className="w-3 h-3" />
            <span>Simple</span>
          </button>
        </div>
      )
    }
  ];

  const filteredData = filteredPayments.filter(payment =>
    payment.player.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.player.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getPaymentMethodName(payment.paymentMethod).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getMonthName(payment.month).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingPayment(null);
    setFormData({
      playerId: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amount: 0,
      paymentMethod: 'efectivo',
      categoryId: ''
    });
    setSelectedPlayerCategory('');
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      playerId: payment.playerId,
      month: payment.month,
      year: payment.year,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      categoryId: payment.categoryId
    });
    setSelectedPlayerCategory(payment.categoryId);
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (payment: Payment) => {
    const playerName = payment.player?.fullName || 'este jugador';
    const monthYear = `${getMonthName(payment.month)} ${payment.year}`;
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar el pago de ${playerName} (${monthYear})?`)) {
      try {
        await deletePayment(payment._id);
      } catch (error: any) {
        console.error('Error eliminando pago:', error);
      }
    }
  };

  const handlePlayerChange = (playerId: string) => {
    setFormData({ ...formData, playerId });
    
    if (playerId) {
      // Buscar el jugador seleccionado y traer su categoría actual
      const selectedPlayer = players.find(p => p._id === playerId);
      if (selectedPlayer && selectedPlayer.category) {
        setSelectedPlayerCategory(selectedPlayer.category._id);
        setFormData(prev => ({ ...prev, categoryId: selectedPlayer.category._id }));
      } else {
        setSelectedPlayerCategory('');
        setFormData(prev => ({ ...prev, categoryId: '' }));
      }
    } else {
      setSelectedPlayerCategory('');
      setFormData(prev => ({ ...prev, categoryId: '' }));
    }
    
    if (validationError) setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setValidationError('');
    
    // Validación básica
    if (!formData.playerId) {
      setValidationError('Debe seleccionar un jugador');
      return;
    }
    
    if (!formData.categoryId) {
      setValidationError('Debe seleccionar una categoría');
      return;
    }
    
    if (!formData.amount || formData.amount <= 0) {
      setValidationError('El importe debe ser mayor a 0');
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (editingPayment) {
        // Editar pago
        const updateData: UpdatePaymentData = {
          playerId: formData.playerId,
          month: formData.month,
          year: formData.year,
          amount: formData.amount,
          paymentMethod: formData.paymentMethod,
          categoryId: formData.categoryId
        };
        
        await updatePayment(editingPayment._id, updateData);
      } else {
        // Crear pago
        await createPayment(formData);
      }
      
      setIsModalOpen(false);
      setFormData({
        playerId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: 0,
        paymentMethod: 'efectivo',
        categoryId: ''
      });
      setSelectedPlayerCategory('');
    } catch (error: any) {
      console.error('Error guardando pago:', error);
      setValidationError(error.message || 'Error al guardar el pago');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      playerId: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amount: 0,
      paymentMethod: 'efectivo',
      categoryId: ''
    });
    setEditingPayment(null);
    setSelectedPlayerCategory('');
    setValidationError('');
  };

  const handleFilter = (playerId?: string, month?: number, year?: number) => {
    const filters: any = {};
    if (playerId) filters.playerId = playerId;
    if (month) filters.month = month;
    if (year) filters.year = year;
    
    if (Object.keys(filters).length > 0) {
      filterPayments(filters);
    } else {
      clearFilters();
    }
  };

  const handleGenerateReceipt = (payment: Payment) => {
    try {
      receiptService.generateReceiptPDF({ payment });
      // Opcional: mostrar notificación de éxito
      console.log('Recibo generado exitosamente');
    } catch (error) {
      console.error('Error generando recibo:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const handleGenerateSimpleReceipt = (payment: Payment) => {
    try {
      receiptService.generateSimpleReceipt(payment);
      console.log('Recibo simple generado exitosamente');
    } catch (error) {
      console.error('Error generando recibo simple:', error);
    }
  };

  const handleGenerateBulkReceipts = () => {
    if (filteredData.length === 0) return;
    
    try {
      const title = `Recibos_${new Date().toISOString().split('T')[0]}`;
      receiptService.generateBulkReceipts(filteredData, title);
      console.log(`${filteredData.length} recibos generados en un solo PDF`);
    } catch (error) {
      console.error('Error generando recibos múltiples:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
          {stats && (
            <p className="text-sm text-gray-600 mt-1">
              Total: ${stats.totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })} 
              ({stats.totalPayments} pagos)
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
          {filteredData.length > 0 && (
            <button
              onClick={handleGenerateBulkReceipts}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              title="Generar PDF con todos los recibos mostrados"
            >
              <FileText className="w-4 h-4" />
              <span>PDFs ({filteredData.length})</span>
            </button>
          )}
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Pago</span>
          </button>
        </div>
      </div>

      {/* Panel de Filtros */}
      {showFilters && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Filtrar por Jugador:
              </label>
              <select
                onChange={(e) => handleFilter(e.target.value || undefined)}
                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todos los jugadores</option>
                {players.map(player => (
                  <option key={player._id} value={player._id}>
                    {player.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Filtrar por Mes:
              </label>
              <select
                onChange={(e) => handleFilter(undefined, e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todos los meses</option>
                {MONTHS.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Filtrar por Año:
              </label>
              <select
                onChange={(e) => handleFilter(undefined, undefined, e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todos los años</option>
                {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                clearFilters();
                setShowFilters(false);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Limpiar Filtros</span>
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={refreshPayments}
            className="text-sm underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando pagos...</p>
        </div>
      ) : (
        <DataTable
          data={filteredData}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPayment ? 'Editar Pago' : 'Registrar Pago'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {validationError}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jugador *
            </label>
            <select
              value={formData.playerId}
              onChange={(e) => handlePlayerChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={submitting}
            >
              <option value="">Seleccionar jugador</option>
              {players.map(player => (
                <option key={player._id} value={player._id}>
                  {player.fullName} - {player.category?.name} {player.category?.gender}
                </option>
              ))}
            </select>
          </div>

          {/* Mostrar categoría del jugador y permitir cambiarla */}
          {formData.playerId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría para este Pago *
                <span className="text-sm text-gray-500 block mt-1">
                  (Se trae automáticamente del jugador, pero puedes cambiarla para mantener el histórico)
                </span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => {
                  setFormData({ ...formData, categoryId: e.target.value });
                  if (validationError) setValidationError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={submitting}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name} - {category.gender}
                  </option>
                ))}
              </select>
              {selectedPlayerCategory && formData.categoryId !== selectedPlayerCategory && (
                <p className="text-sm text-amber-600 mt-1">
                  ⚠️ Has cambiado la categoría. La categoría actual del jugador es diferente a la seleccionada para este pago.
                </p>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mes *
              </label>
              <select
                value={formData.month}
                onChange={(e) => {
                  setFormData({ ...formData, month: parseInt(e.target.value) });
                  if (validationError) setValidationError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={submitting}
              >
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año *
              </label>
              <select
                value={formData.year}
                onChange={(e) => {
                  setFormData({ ...formData, year: parseInt(e.target.value) });
                  if (validationError) setValidationError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={submitting}
              >
                {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Importe *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount || ''}
              onChange={(e) => {
                setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 });
                if (validationError) setValidationError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={submitting}
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forma de Pago *
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'banco' | 'efectivo' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={submitting}
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingPayment ? 'Actualizando...' : 'Registrando...'}
                </span>
              ) : (
                editingPayment ? 'Actualizar' : 'Registrar'
              )}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={submitting}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;
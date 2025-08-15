import React, { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { usePlayers } from '../hooks/usePlayers';
import { Player, CreatePlayerData, UpdatePlayerData } from '../services/playersService';
import { useCategories } from '../hooks/useCategories';

const Players: React.FC = () => {
  const {
    players,
    loading,
    error,
    searchResults,
    searching,
    createPlayer,
    updatePlayer,
    deletePlayer,
    searchPlayerByEmail,
    refreshPlayers,
    clearSearch
  } = usePlayers();

  const { categories } = useCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const [showEmailSearch, setShowEmailSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [formData, setFormData] = useState<CreatePlayerData>({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    phone: '',
    categoryId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const columns = [
    { key: 'fullName', label: 'Nombre Completo' },
    { key: 'email', label: 'Email' },
    { 
      key: 'birthDate', 
      label: 'Fecha de Nacimiento',
      render: (value: string) => {
        if (!value) return '';
        const date = new Date(value);
        return date.toLocaleDateString('es-ES');
      }
    },
    { 
      key: 'phone', 
      label: 'Teléfono',
      render: (value: string) => value || 'No especificado'
    },
    { 
      key: 'category', 
      label: 'Categoría',
      render: (value: any) => {
        if (!value) return 'Sin categoría';
        return `${value.name} - ${value.gender}`;
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
    }
  ];

  // Determinar qué datos mostrar (búsqueda por email o lista filtrada normal)
  const displayPlayers = searchResults.length > 0 ? searchResults : players;
  
  // Filtrar por categoría y término de búsqueda
  const filteredPlayers = displayPlayers.filter(player => {
    // Filtro por categoría
    if (selectedCategory && player.category._id !== selectedCategory) {
      return false;
    }
    
    // Filtro por término de búsqueda
    return (
      player.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.phone && player.phone.includes(searchTerm))
    );
  });

  const handleAdd = () => {
    setEditingPlayer(null);
    setFormData({ 
      firstName: '', 
      lastName: '', 
      email: '', 
      birthDate: '', 
      phone: '', 
      categoryId: '' 
    });
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      firstName: player.firstName,
      lastName: player.lastName,
      email: player.email,
      birthDate: player.birthDate.split('T')[0], // Convertir a formato YYYY-MM-DD
      phone: player.phone || '',
      categoryId: player.category._id
    });
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (player: Player) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al jugador "${player.fullName}"?`)) {
      try {
        await deletePlayer(player._id);
      } catch (error: any) {
        console.error('Error eliminando jugador:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setValidationError('');
    
    // Validación básica
    if (!formData.firstName.trim()) {
      setValidationError('El nombre es obligatorio');
      return;
    }
    
    if (!formData.lastName.trim()) {
      setValidationError('El apellido es obligatorio');
      return;
    }
    
    if (!formData.email.trim()) {
      setValidationError('El email es obligatorio');
      return;
    }
    
    if (!formData.birthDate) {
      setValidationError('La fecha de nacimiento es obligatoria');
      return;
    }
    
    if (!formData.categoryId) {
      setValidationError('La categoría es obligatoria');
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (editingPlayer) {
        // Editar jugador
        const updateData: UpdatePlayerData = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          birthDate: formData.birthDate,
          categoryId: formData.categoryId
        };
        
        // Solo incluir teléfono si se proporcionó, o null para removerlo
        if (formData.phone?.trim()) {
          updateData.phone = formData.phone.trim();
        } else {
          updateData.phone = null;
        }
        
        await updatePlayer(editingPlayer._id, updateData);
      } else {
        // Crear jugador
        const createData: CreatePlayerData = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          birthDate: formData.birthDate,
          categoryId: formData.categoryId
        };
        
        // Solo incluir teléfono si se proporcionó
        if (formData.phone?.trim()) {
          createData.phone = formData.phone.trim();
        }
        
        await createPlayer(createData);
      }
      
      setIsModalOpen(false);
      setFormData({ 
        firstName: '', 
        lastName: '', 
        email: '', 
        birthDate: '', 
        phone: '', 
        categoryId: '' 
      });
    } catch (error: any) {
      console.error('Error guardando jugador:', error);
      setValidationError(error.message || 'Error al guardar el jugador');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ 
      firstName: '', 
      lastName: '', 
      email: '', 
      birthDate: '', 
      phone: '', 
      categoryId: '' 
    });
    setEditingPlayer(null);
    setValidationError('');
  };

  const handleEmailSearch = async () => {
    if (!emailSearch.trim()) {
      clearSearch();
      return;
    }
    
    try {
      await searchPlayerByEmail(emailSearch);
    } catch (error: any) {
      console.error('Error en búsqueda:', error);
    }
  };

  const handleClearEmailSearch = () => {
    setEmailSearch('');
    clearSearch();
    setShowEmailSearch(false);
  };

  const handleClearCategoryFilter = () => {
    setSelectedCategory('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Jugadores</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowEmailSearch(!showEmailSearch)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Buscar por Email</span>
          </button>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Jugador</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="space-y-4">
        {/* Filtro por Categoría */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <label htmlFor="category-filter" className="block text-sm font-medium text-green-700 mb-2">
                Filtrar por Categoría:
              </label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name} - {category.gender}
                  </option>
                ))}
              </select>
            </div>
            {selectedCategory && (
              <button
                onClick={handleClearCategoryFilter}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Limpiar</span>
              </button>
            )}
          </div>
          {selectedCategory && (
            <div className="mt-3 text-sm text-green-600">
              Mostrando {filteredPlayers.length} jugador(es) de la categoría seleccionada
            </div>
          )}
        </div>

        {/* Buscador por Email */}
        {showEmailSearch && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <label htmlFor="email-search" className="block text-sm font-medium text-blue-700 mb-2">
                  Buscar jugador por email:
                </label>
                <input
                  id="email-search"
                  type="email"
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEmailSearch()}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ejemplo: juan@email.com"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleEmailSearch}
                  disabled={searching}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-1"
                >
                  {searching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>Buscar</span>
                </button>
                {(searchResults.length > 0 || emailSearch) && (
                  <button
                    onClick={handleClearEmailSearch}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Limpiar</span>
                  </button>
                )}
              </div>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-3 text-sm text-blue-600">
                Se encontraron {searchResults.length} jugador(es) con el email "{emailSearch}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Información de resultados */}
      {!selectedCategory && !emailSearch && searchResults.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm text-gray-600">
            Mostrando {filteredPlayers.length} jugador(es) de {players.length} total
          </p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={refreshPlayers}
            className="text-sm underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando jugadores...</p>
        </div>
      ) : (
        <DataTable
          data={filteredPlayers}
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
        title={editingPlayer ? 'Editar Jugador' : 'Agregar Jugador'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {validationError}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => {
                  setFormData({ ...formData, firstName: e.target.value });
                  if (validationError) setValidationError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={submitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => {
                  setFormData({ ...formData, lastName: e.target.value });
                  if (validationError) setValidationError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={submitting}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (validationError) setValidationError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={submitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => {
                setFormData({ ...formData, birthDate: e.target.value });
                if (validationError) setValidationError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={submitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono (Opcional)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+54 9 11 1234-5678"
              disabled={submitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
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
                  {editingPlayer ? 'Actualizando...' : 'Creando...'}
                </span>
              ) : (
                editingPlayer ? 'Actualizar' : 'Crear'
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

export default Players;
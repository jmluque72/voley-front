import React, { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import BulkUploadModal from '../components/BulkUploadModal';
import { useCategories } from '../hooks/useCategories';
import { usePlayers } from '../hooks/usePlayers';
import { Category, CreateCategoryData } from '../services/categoriesService';

const Categories: React.FC = () => {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories
  } = useCategories();

  const { bulkCreatePlayers } = usePlayers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    gender: 'masculino',
    cuota: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const columns = [
    { key: 'name', label: 'Nombre' },
    { 
      key: 'gender', 
      label: 'Género',
      render: (value: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : ''
    },
    { 
      key: 'cuota', 
      label: 'Cuota',
      render: (value: number) => {
        // Validar que value sea un número válido
        const numValue = Number(value);
        return !isNaN(numValue) && value !== null && value !== undefined 
          ? `$${numValue.toFixed(2)}` 
          : '$0.00';
      }
    },
    { 
      key: 'createdAt', 
      label: 'Fecha de Creación',
      render: (value: string) => {
        if (!value) return '';
        try {
          const date = new Date(value);
          return date.toLocaleDateString('es-ES');
        } catch (error) {
          return '';
        }
      }
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (value: any, row: Category) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleBulkUpload(row)}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
            title="Cargar jugadores masivamente"
          >
            <Upload className="w-3 h-3" />
            <span>Cargar Jugadores</span>
          </button>
        </div>
      )
    }
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.gender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', gender: 'masculino', cuota: 0 });
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      gender: category.gender,
      cuota: category.cuota
    });
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${category.name} - ${category.gender}"?`)) {
      try {
        await deleteCategory(category._id);
      } catch (error: any) {
        console.error('Error eliminando categoría:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setValidationError('');
    
    // Validación básica
    if (!formData.name.trim()) {
      setValidationError('El nombre es obligatorio');
      return;
    }
    
    if (formData.cuota < 0) {
      setValidationError('La cuota debe ser mayor o igual a 0');
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, formData);
      } else {
        await createCategory(formData);
      }
      
      setIsModalOpen(false);
      setFormData({ name: '', gender: 'masculino', cuota: 0 });
    } catch (error: any) {
      console.error('Error guardando categoría:', error);
      setValidationError(error.message || 'Error al guardar la categoría');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', gender: 'masculino', cuota: 0 });
    setEditingCategory(null);
    setValidationError('');
  };

  const handleBulkUpload = (category: Category) => {
    setSelectedCategory(category);
    setIsBulkUploadOpen(true);
  };

  const handleBulkUploadSubmit = async (data: any[]) => {
    try {
      await bulkCreatePlayers(data);
    } catch (error) {
      console.error('Error en carga masiva:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Categoría</span>
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={refreshCategories}
            className="text-sm underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando categorías...</p>
        </div>
      ) : (
        <DataTable
          data={filteredCategories}
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
        title={editingCategory ? 'Editar Categoría' : 'Agregar Categoría'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {validationError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (validationError) setValidationError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={submitting}
              placeholder="Ej: Sub-15, Sub-18, Adultos"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Género *
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'masculino' | 'femenino' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={submitting}
            >
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuota Mensual ($) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.cuota}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setFormData({ ...formData, cuota: value });
                if (validationError) setValidationError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={submitting}
              placeholder="75.00"
            />
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
                  {editingCategory ? 'Actualizando...' : 'Creando...'}
                </span>
              ) : (
                editingCategory ? 'Actualizar' : 'Crear'
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

      {/* Modal de carga masiva */}
      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        category={selectedCategory}
        onUpload={handleBulkUploadSubmit}
      />
    </div>
  );
};

export default Categories;
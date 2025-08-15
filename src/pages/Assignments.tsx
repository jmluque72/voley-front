import React, { useState } from 'react';
import { 
  useAssignments, 
  useCollectors, 
  useCategories,
  createAssignment,
  deleteAssignment,
  Assignment,
  Collector,
  Category
} from '../hooks/useAssignments';
import { 
  Users, 
  Tag, 
  Plus, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  UserCheck,
  Loader
} from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';

const Assignments: React.FC = () => {
  const { canManageAssignments } = usePermissions();
  const { assignments, loading, error, refreshAssignments } = useAssignments();
  const { collectors } = useCollectors();
  const { categories } = useCategories();
  
  const [selectedCollector, setSelectedCollector] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleCreateAssignment = async () => {
    if (!selectedCollector || !selectedCategory) {
      setActionMessage({ type: 'error', message: 'Selecciona un cobrador y una categoría' });
      return;
    }

    try {
      setActionLoading(true);
      await createAssignment({
        collectorId: selectedCollector,
        categoryId: selectedCategory
      });
      setActionMessage({ type: 'success', message: 'Asignación creada exitosamente' });
      setSelectedCollector('');
      setSelectedCategory('');
      refreshAssignments();
    } catch (error: any) {
      setActionMessage({ type: 'error', message: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      return;
    }

    try {
      setActionLoading(true);
      await deleteAssignment(assignmentId);
      setActionMessage({ type: 'success', message: 'Asignación eliminada exitosamente' });
      refreshAssignments();
    } catch (error: any) {
      setActionMessage({ type: 'error', message: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando asignaciones...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar asignaciones</h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={refreshAssignments}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Asignaciones</h1>
        <p className="text-gray-600">Gestiona las asignaciones entre cobradores y categorías</p>
      </div>

      {/* Mensaje de acción */}
      {actionMessage && (
        <div className={`mb-6 p-4 rounded-lg ${
          actionMessage.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            {actionMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {actionMessage.message}
          </div>
        </div>
      )}

      {/* Estadísticas */}
      {assignments && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cobradores</p>
                <p className="text-2xl font-bold text-gray-900">{assignments.summary.totalCollectors}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Tag className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Categorías</p>
                <p className="text-2xl font-bold text-gray-900">{assignments.summary.totalCategories}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Asignaciones</p>
                <p className="text-2xl font-bold text-gray-900">{assignments.summary.totalAssignments}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sin Asignar</p>
                <p className="text-2xl font-bold text-gray-900">{assignments.summary.unassignedCategories}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario para crear asignación */}
      {canManageAssignments && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Crear Nueva Asignación</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cobrador
              </label>
              <select
                value={selectedCollector}
                onChange={(e) => setSelectedCollector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar cobrador</option>
                {collectors.map((collector) => (
                  <option key={collector._id} value={collector._id}>
                    {collector.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name} ({category.gender})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCreateAssignment}
                disabled={actionLoading || !selectedCollector || !selectedCategory}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {actionLoading ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Crear Asignación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de asignaciones */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Asignaciones Actuales</h2>
            <button
              onClick={refreshAssignments}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Actualizar
            </button>
          </div>
        </div>
        
        {assignments && assignments.assignments.length === 0 ? (
          <div className="p-8 text-center">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay asignaciones</h3>
            <p className="text-gray-600">Crea tu primera asignación usando el formulario de arriba.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cobrador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Asignación
                  </th>
                  {canManageAssignments && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments?.assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.collector.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assignment.collector.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.category.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assignment.category.gender} - ${assignment.category.cuota}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(assignment.assignedAt).toLocaleDateString('es-ES')}
                    </td>
                    {canManageAssignments && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;

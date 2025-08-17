import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { useUsers } from '../hooks/useUsers';
import { User, CreateUserData, UpdateUserData } from '../services/usersService';
import { useCategories } from '../hooks/useCategories';

const Users: React.FC = () => {
  const {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers
  } = useUsers();

  const { categories } = useCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CreateUserData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'cobrador',
    categoryId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const columns = [
    { 
      key: 'name', 
      label: 'Nombre',
      render: (value: any, user: User) => `${user.firstName} ${user.lastName}`
    },
    { key: 'email', label: 'Email' },
    { 
      key: 'role', 
      label: 'Rol',
      render: (value: string) => {
        const roles = {
          administrador: 'Administrador',
          tesorero: 'Tesorero',
          cobrador: 'Cobrador'
        };
        return roles[value as keyof typeof roles] || value;
      }
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
      label: 'Fecha de Creación',
      render: (value: string) => {
        if (!value) return '';
        const date = new Date(value);
        return date.toLocaleDateString('es-ES');
      }
    }
  ];

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'cobrador', categoryId: '' });
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '', // No mostrar contraseña al editar
      role: user.role,
      categoryId: user.category?._id || ''
    });
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario "${user.firstName} ${user.lastName}"?`)) {
      try {
        await deleteUser(user._id);
      } catch (error: any) {
        console.error('Error eliminando usuario:', error);
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
    
    if (!editingUser && !formData.password.trim()) {
      setValidationError('La contraseña es obligatoria para crear un usuario');
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (editingUser) {
        // Editar usuario
        const updateData: UpdateUserData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          categoryId: formData.categoryId || null
        };
        
        // Solo incluir contraseña si se proporcionó
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }
        
        await updateUser(editingUser._id, updateData);
      } else {
        // Crear usuario
        const createData: CreateUserData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role
        };
        
        // Solo incluir categoría si se seleccionó
        if (formData.categoryId) {
          createData.categoryId = formData.categoryId;
        }
        
        await createUser(createData);
      }
      
      setIsModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'cobrador', categoryId: '' });
    } catch (error: any) {
      console.error('Error guardando usuario:', error);
      setValidationError(error.message || 'Error al guardar el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'cobrador', categoryId: '' });
    setEditingUser(null);
    setValidationError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Usuario</span>
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={refreshUsers}
            className="text-sm underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando usuarios...</p>
        </div>
      ) : (
        <DataTable
          data={filteredUsers}
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
        title={editingUser ? 'Editar Usuario' : 'Agregar Usuario'}
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
            />
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
              Contraseña {!editingUser && '*'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (validationError) setValidationError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={!editingUser}
              disabled={submitting}
              placeholder={editingUser ? 'Dejar vacío para mantener la actual' : 'Contraseña obligatoria'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'administrador' | 'tesorero' | 'cobrador' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={submitting}
            >
              <option value="cobrador">Cobrador</option>
              <option value="tesorero">Tesorero</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría (Opcional)
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={submitting}
            >
              <option value="">Sin categoría</option>
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
                  {editingUser ? 'Actualizando...' : 'Creando...'}
                </span>
              ) : (
                editingUser ? 'Actualizar' : 'Crear'
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

export default Users;
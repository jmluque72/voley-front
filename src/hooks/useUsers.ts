import { useState, useEffect } from 'react';
import usersService, { User, CreateUserData, UpdateUserData } from '../services/usersService';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  createUser: (data: CreateUserData) => Promise<void>;
  updateUser: (id: string, data: UpdateUserData) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersData = await usersService.getUsers();
      setUsers(usersData);
    } catch (err: any) {
      console.error('Error cargando usuarios:', err);
      setError(err.response?.data?.msg || 'Error cargando usuarios. Verifique que esté autenticado.');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: CreateUserData): Promise<void> => {
    try {
      const newUser = await usersService.createUser(data);
      setUsers(prev => [...prev, newUser]);
    } catch (err: any) {
      console.error('Error creando usuario:', err);
      throw new Error(err.response?.data?.msg || 'Error creando usuario');
    }
  };

  const updateUser = async (id: string, data: UpdateUserData): Promise<void> => {
    try {
      const updatedUser = await usersService.updateUser(id, data);
      setUsers(prev => 
        prev.map(user => 
          user._id === id ? updatedUser : user
        )
      );
    } catch (err: any) {
      console.error('Error actualizando usuario:', err);
      throw new Error(err.response?.data?.msg || 'Error actualizando usuario');
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    try {
      await usersService.deleteUser(id);
      setUsers(prev => prev.filter(user => user._id !== id));
    } catch (err: any) {
      console.error('Error eliminando usuario:', err);
      throw new Error(err.response?.data?.msg || 'Error eliminando usuario');
    }
  };

  const refreshUsers = async (): Promise<void> => {
    await loadUsers();
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers,
  };
}; 
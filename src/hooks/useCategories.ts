import { useState, useEffect } from 'react';
import categoriesService, { Category, CreateCategoryData, UpdateCategoryData } from '../services/categoriesService';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  createCategory: (data: CreateCategoryData) => Promise<void>;
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const categoriesData = await categoriesService.getCategories();
      setCategories(categoriesData);
    } catch (err: any) {
      console.error('Error cargando categorías:', err);
      setError(err.response?.data?.msg || 'Error cargando categorías. Verifique que esté autenticado.');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data: CreateCategoryData): Promise<void> => {
    try {
      const newCategory = await categoriesService.createCategory(data);
      setCategories(prev => [...prev, newCategory]);
    } catch (err: any) {
      console.error('Error creando categoría:', err);
      throw new Error(err.response?.data?.msg || 'Error creando categoría');
    }
  };

  const updateCategory = async (id: string, data: UpdateCategoryData): Promise<void> => {
    try {
      const updatedCategory = await categoriesService.updateCategory(id, data);
      setCategories(prev => 
        prev.map(category => 
          category._id === id ? updatedCategory : category
        )
      );
    } catch (err: any) {
      console.error('Error actualizando categoría:', err);
      throw new Error(err.response?.data?.msg || 'Error actualizando categoría');
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      await categoriesService.deleteCategory(id);
      setCategories(prev => prev.filter(category => category._id !== id));
    } catch (err: any) {
      console.error('Error eliminando categoría:', err);
      throw new Error(err.response?.data?.msg || 'Error eliminando categoría');
    }
  };

  const refreshCategories = async (): Promise<void> => {
    await loadCategories();
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
  };
}; 
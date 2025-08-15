import { useState, useEffect } from 'react';
import AssignmentsService, { 
  Assignment, 
  AssignmentsResponse, 
  Collector, 
  Category,
  CreateAssignmentData 
} from '../services/assignmentsService';

export const useAssignments = () => {
  const [assignments, setAssignments] = useState<AssignmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AssignmentsService.getAssignments();
      setAssignments(response);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las asignaciones');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const refreshAssignments = () => {
    fetchAssignments();
  };

  return {
    assignments,
    loading,
    error,
    refreshAssignments
  };
};

export const useCollectors = () => {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollectors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AssignmentsService.getCollectors();
      setCollectors(response);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los cobradores');
      console.error('Error fetching collectors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectors();
  }, []);

  return {
    collectors,
    loading,
    error,
    refreshCollectors: fetchCollectors
  };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AssignmentsService.getCategories();
      setCategories(response);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las categorías');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refreshCategories: fetchCategories
  };
};

// Funciones para gestionar asignaciones
export const createAssignment = async (data: CreateAssignmentData): Promise<void> => {
  try {
    await AssignmentsService.createAssignment(data);
  } catch (err: any) {
    throw new Error(err.message || 'Error al crear la asignación');
  }
};

export const deleteAssignment = async (id: string): Promise<void> => {
  try {
    await AssignmentsService.deleteAssignment(id);
  } catch (err: any) {
    throw new Error(err.message || 'Error al eliminar la asignación');
  }
};

// Re-export types
export type { Assignment, AssignmentsResponse, Collector, Category, CreateAssignmentData };

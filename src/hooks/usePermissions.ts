import { useAuth } from '../context/AuthContext';
import { hasPermission, getUserPermissions, canAccessRoute } from '../utils/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  const can = (permission: string): boolean => {
    return hasPermission(user, permission);
  };

  const getUserPerms = (): string[] => {
    return getUserPermissions(user);
  };

  const canAccess = (route: string): boolean => {
    return canAccessRoute(user, route);
  };

  const isAdmin = (): boolean => {
    return user?.role === 'administrador';
  };

  const isTreasurer = (): boolean => {
    return user?.role === 'tesorero';
  };

  const isCollector = (): boolean => {
    return user?.role === 'cobrador';
  };

  // Permisos específicos para familias
  const canManageFamilies = (): boolean => {
    return can('families.view') && can('families.create') && can('families.edit');
  };

  // Permisos específicos para configuración
  const canManageConfiguration = (): boolean => {
    return isAdmin();
  };

  const canManageAssignments = (): boolean => {
    return isAdmin() || isTreasurer();
  };

  return {
    can,
    getUserPerms,
    canAccess,
    isAdmin,
    isTreasurer,
    isCollector,
    canManageFamilies,
    canManageConfiguration,
    canManageAssignments,
    user
  };
}; 
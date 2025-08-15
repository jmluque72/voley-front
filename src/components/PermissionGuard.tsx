import React, { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Shield, AlertTriangle } from 'lucide-react';

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
  showAccessDenied?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission, 
  children, 
  fallback = null,
  showAccessDenied = false 
}) => {
  const { can } = usePermissions();

  if (can(permission)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showAccessDenied) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="text-sm font-medium text-yellow-900">
              Acceso Denegado
            </h3>
            <p className="text-xs text-yellow-700 mt-1">
              No tienes permisos para acceder a esta funcionalidad.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PermissionGuard; 
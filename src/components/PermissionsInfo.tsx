import React, { useState } from 'react';
import { getUserPermissions, ROLE_DESCRIPTIONS, ROLES } from '../utils/permissions';
import { User } from '../context/AuthContext';
import { Info, Shield, CheckCircle } from 'lucide-react';

interface PermissionsInfoProps {
  user: User | null;
}

const PermissionsInfo: React.FC<PermissionsInfoProps> = ({ user }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!user) return null;

  const permissions = getUserPermissions(user);
  const roleDescription = ROLE_DESCRIPTIONS[user.role as keyof typeof ROLE_DESCRIPTIONS] || 'Rol no definido';

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-medium text-blue-900">Permisos del Usuario</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
      
      <div className="mt-2">
        <p className="text-sm text-blue-800">{roleDescription}</p>
        <p className="text-xs text-blue-600 mt-1">
          {permissions.length} permisos disponibles
        </p>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <h4 className="text-xs font-medium text-blue-900 mb-2">Permisos Detallados:</h4>
          <div className="space-y-1">
            {permissions.map((permission, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span className="text-xs text-blue-700">{permission}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionsInfo; 
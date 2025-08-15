import React from 'react';
import { ROLES, ROLE_DESCRIPTIONS } from '../utils/permissions';

interface RoleBadgeProps {
  role: string;
  size?: 'sm' | 'md' | 'lg';
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case ROLES.ADMINISTRADOR:
        return 'bg-red-100 text-red-800 border-red-200';
      case ROLES.TESORERO:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ROLES.COBRADOR:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case ROLES.ADMINISTRADOR:
        return 'Administrador';
      case ROLES.TESORERO:
        return 'Tesorero';
      case ROLES.COBRADOR:
        return 'Cobrador';
      default:
        return role;
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(role)} ${sizeClasses[size]}`}
      title={ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS] || 'Rol no definido'}
    >
      {getRoleName(role)}
    </span>
  );
};

export default RoleBadge; 
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Permission {
  name: string;
  description: string;
  roles: string[];
}

// Definir permisos para cada funcionalidad
export const PERMISSIONS: Permission[] = [
  {
    name: 'users.view',
    description: 'Ver usuarios',
    roles: ['administrador']
  },
  {
    name: 'users.create',
    description: 'Crear usuarios',
    roles: ['administrador']
  },
  {
    name: 'users.edit',
    description: 'Editar usuarios',
    roles: ['administrador']
  },
  {
    name: 'users.delete',
    description: 'Eliminar usuarios',
    roles: ['administrador']
  },
  {
    name: 'categories.view',
    description: 'Ver categorías',
    roles: ['administrador']
  },
  {
    name: 'categories.create',
    description: 'Crear categorías',
    roles: ['administrador']
  },
  {
    name: 'categories.edit',
    description: 'Editar categorías',
    roles: ['administrador']
  },
  {
    name: 'categories.delete',
    description: 'Eliminar categorías',
    roles: ['administrador']
  },
  {
    name: 'players.view',
    description: 'Ver jugadores',
    roles: ['administrador']
  },
  {
    name: 'players.create',
    description: 'Crear jugadores',
    roles: ['administrador']
  },
  {
    name: 'players.edit',
    description: 'Editar jugadores',
    roles: ['administrador']
  },
  {
    name: 'players.delete',
    description: 'Eliminar jugadores',
    roles: ['administrador']
  },
  {
    name: 'players.bulk_upload',
    description: 'Carga masiva de jugadores',
    roles: ['administrador']
  },
  {
    name: 'families.view',
    description: 'Ver familias',
    roles: ['administrador', 'tesorero']
  },
  {
    name: 'families.create',
    description: 'Crear familias',
    roles: ['administrador', 'tesorero']
  },
  {
    name: 'families.edit',
    description: 'Editar familias',
    roles: ['administrador', 'tesorero']
  },
  {
    name: 'families.delete',
    description: 'Eliminar familias',
    roles: ['administrador', 'tesorero']
  },
  {
    name: 'payments.view',
    description: 'Ver pagos',
    roles: ['administrador', 'tesorero', 'cobrador']
  },
  {
    name: 'payments.create',
    description: 'Crear pagos',
    roles: ['administrador', 'tesorero', 'cobrador']
  },
  {
    name: 'payments.edit',
    description: 'Editar pagos',
    roles: ['administrador', 'tesorero']
  },
  {
    name: 'payments.delete',
    description: 'Eliminar pagos',
    roles: ['administrador']
  },
  {
    name: 'morosos.view',
    description: 'Ver morosos',
    roles: ['administrador', 'tesorero']
  },
  {
    name: 'reports.view',
    description: 'Ver reportes',
    roles: ['administrador', 'tesorero']
  },
  {
    name: 'reports.export',
    description: 'Exportar reportes',
    roles: ['administrador', 'tesorero']
  },

  {
    name: 'configuration.view',
    description: 'Ver configuración',
    roles: ['administrador']
  },
  {
    name: 'configuration.edit',
    description: 'Editar configuración',
    roles: ['administrador']
  },
  {
    name: 'assignments.view',
    description: 'Ver asignaciones',
    roles: ['administrador', 'tesorero']
  },
  {
    name: 'assignments.edit',
    description: 'Editar asignaciones',
    roles: ['administrador', 'tesorero']
  }
];

// Función para verificar si un usuario tiene un permiso específico
export function hasPermission(user: User | null, permissionName: string): boolean {
  if (!user) return false;
  
  const permission = PERMISSIONS.find(p => p.name === permissionName);
  if (!permission) return false;
  
  return permission.roles.includes(user.role);
}

// Función para obtener todos los permisos de un usuario
export function getUserPermissions(user: User | null): string[] {
  if (!user) return [];
  
  return PERMISSIONS
    .filter(permission => permission.roles.includes(user.role))
    .map(permission => permission.name);
}

// Función para verificar si un usuario puede acceder a una ruta
export function canAccessRoute(user: User | null, route: string): boolean {
  const routePermissions: { [key: string]: string } = {
    '/users': 'users.view',
    '/categories': 'categories.view',
    '/players': 'players.view',
    '/families': 'families.view',
    '/payments': 'payments.view',
    '/morosos': 'morosos.view',
    '/reports': 'reports.view',
    '/assignments': 'assignments.view',


    '/configuration': 'configuration.view'
  };
  
  const requiredPermission = routePermissions[route];
  if (!requiredPermission) return true; // Rutas sin permisos específicos son accesibles
  
  return hasPermission(user, requiredPermission);
}

// Función para obtener las opciones de navegación disponibles para un usuario
export function getAvailableNavigation(user: User | null) {
  const allNavigation = [
    { name: 'Usuarios', href: '/users', icon: 'Users', permission: 'users.view' },
    { name: 'Categorías', href: '/categories', icon: 'FolderOpen', permission: 'categories.view' },
    { name: 'Jugadores', href: '/players', icon: 'GamepadIcon', permission: 'players.view' },
    { name: 'Grupos Familiares', href: '/families', icon: 'Users', permission: 'families.view' },
    { name: 'Pagos', href: '/payments', icon: 'CreditCard', permission: 'payments.view' },
    { name: 'Configuración', href: '/configuration', icon: 'Settings', permission: 'configuration.view' },

    { name: 'Asignaciones', href: '/assignments', icon: 'UserCheck', permission: 'assignments.view' },

    { name: 'Morosos', href: '/morosos', icon: 'AlertTriangle', permission: 'morosos.view' },
    { name: 'Reportes', href: '/reports', icon: 'BarChart3', permission: 'reports.view' },
  ];
  
  if (!user) return [];
  
  return allNavigation.filter(item => hasPermission(user, item.permission));
}

// Roles disponibles
export const ROLES = {
  ADMINISTRADOR: 'administrador',
  TESORERO: 'tesorero',
  COBRADOR: 'cobrador'
} as const;

// Descripción de roles
export const ROLE_DESCRIPTIONS = {
  [ROLES.ADMINISTRADOR]: 'Acceso completo a todas las funcionalidades',
  [ROLES.TESORERO]: 'Gestión de pagos, morosos y reportes',
  [ROLES.COBRADOR]: 'Acceso básico solo a pagos'
} as const; 
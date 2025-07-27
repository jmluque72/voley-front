# Integración Frontend-Backend: Usuarios

## 🎯 Resumen

Se ha implementado la integración completa entre el frontend (React/TypeScript) y backend (Node.js/Express) para el módulo de **Usuarios** con operaciones CRUD completas, siguiendo exactamente la misma arquitectura que Categories.

## 🔧 Arquitectura Implementada

### Backend API
- **Puerto**: 3000
- **Base URL**: `http://localhost:3000/api`
- **Autenticación**: JWT Tokens
- **Autorización**: Solo administradores pueden gestionar usuarios

### Frontend
- **Framework**: React + TypeScript
- **Estado**: Custom Hooks + useState
- **HTTP Client**: Axios con interceptores
- **Configuración**: Centralizada en variables de entorno

## 📡 Endpoints Implementados

### Usuarios
```typescript
GET    /api/users           // Listar todos los usuarios (solo admin)
POST   /api/users           // Crear nuevo usuario (solo admin)
PUT    /api/users/:id       // Actualizar usuario (solo admin)
DELETE /api/users/:id       // Eliminar usuario (solo admin)
PUT    /api/users/:id/role  // Cambiar rol de usuario (solo admin)
```

## 🏗️ Estructura del Frontend

### 1. Servicio de Usuarios (`/src/services/usersService.ts`)
```typescript
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'administrador' | 'tesorero' | 'cobrador';
  category?: {
    _id: string;
    name: string;
    gender: string;
  } | null;
  createdAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'administrador' | 'tesorero' | 'cobrador';
  categoryId?: string;
}

class UsersService {
  async getUsers(): Promise<User[]> { ... }
  async createUser(data: CreateUserData): Promise<User> { ... }
  async updateUser(id: string, data: UpdateUserData): Promise<User> { ... }
  async deleteUser(id: string): Promise<{ msg: string }> { ... }
}
```

### 2. Hook Personalizado (`/src/hooks/useUsers.ts`)
```typescript
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (data: CreateUserData) => { ... };
  const updateUser = async (id: string, data: UpdateUserData) => { ... };
  const deleteUser = async (id: string) => { ... };
  
  return {
    users, loading, error,
    createUser, updateUser, deleteUser, refreshUsers,
  };
};
```

### 3. Componente React (`/src/pages/Users.tsx`)
```typescript
const Users: React.FC = () => {
  const {
    users, loading, error,
    createUser, updateUser, deleteUser,
  } = useUsers();

  const { categories } = useCategories(); // Integración con categorías

  // Manejo de formularios y UI sin alerts
};
```

## 🛠️ Funcionalidades Implementadas

### ✅ CRUD Completo
- **Create**: Crear nuevo usuario con rol y categoría opcional
- **Read**: Listar todos los usuarios con información de categoría
- **Update**: Editar usuario (contraseña opcional)
- **Delete**: Eliminar usuario con confirmación

### ✅ Gestión de Roles
- **Administrador**: Control total del sistema
- **Tesorero**: Gestión de pagos y reportes
- **Cobrador**: Operaciones básicas

### ✅ Integración con Categorías
- **Asignación opcional**: Usuarios pueden tener categoría asignada
- **Visualización**: Muestra categoría y género en la tabla
- **Selector dinámico**: Carga categorías automáticamente

### ✅ Validaciones y UX
- **Sin alerts molestos**: Errores mostrados contextualmente
- **Validación en tiempo real**: Limpia errores al escribir
- **Estados de carga**: Spinners durante operaciones
- **Contraseñas seguras**: Hash automático en backend
- **Emails únicos**: Validación de duplicados

## 📊 Ejemplos de Uso

### Crear Usuario
```typescript
const handleCreateUser = async () => {
  try {
    await createUser({
      name: 'Juan Pérez',
      email: 'juan@test.com',
      password: 'securePassword123',
      role: 'tesorero',
      categoryId: 'categoryId123' // Opcional
    });
    // Usuario creado exitosamente
  } catch (error) {
    // Manejo de error sin alert
  }
};
```

### Actualizar Usuario
```typescript
const handleUpdateUser = async () => {
  await updateUser('userId123', {
    name: 'Juan Pérez Actualizado',
    role: 'administrador',
    categoryId: null // Remover categoría
    // password no incluida = mantiene la actual
  });
};
```

### Listar Usuarios con Filtros
```typescript
const { users, loading, error } = useUsers();

const filteredUsers = users.filter(user =>
  user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  user.email.toLowerCase().includes(searchTerm.toLowerCase())
);
```

## 🔐 Sistema de Seguridad

### Validaciones Backend
- **Campos obligatorios**: name, email, password (en creación)
- **Email único**: No permite duplicados
- **Roles válidos**: Solo administrador, tesorero, cobrador
- **Contraseñas**: Hash con bcrypt (salt 10)
- **Autorización**: Solo admins pueden gestionar usuarios

### Validaciones Frontend
- **Formularios**: Validación en tiempo real
- **Tipos TypeScript**: Type safety completo
- **Estados**: Loading, error, success
- **UX**: Sin interrupciones molestas

## 🎨 Mejoras de UX Implementadas

### ❌ Eliminado
- **alerts()**: Sin popups molestos
- **URLs hardcodeadas**: Todo centralizado
- **Manejo manual de tokens**: Automático con interceptores

### ✅ Agregado
- **Validación visual**: Errores en cajas rojas
- **Auto-limpieza**: Errores desaparecen al corregir
- **Estados de carga**: Spinners y feedback visual
- **Confirmaciones elegantes**: Diálogos contextuales
- **Formularios inteligentes**: Validación condicional

## 🚀 Ejecutar en Desarrollo

### Backend
```bash
cd api
node api-with-users.js  # Puerto 3000
```

### Frontend  
```bash
cd front
npm run dev
```

### Credenciales de Prueba
```
Email: admin-fresh@test.com
Password: admin123
Role: administrador
```

## 📋 Casos de Uso Completos

### Flujo Típico de Gestión de Usuarios
1. **Admin hace login** → Recibe token JWT
2. **Ve lista de usuarios** → GET /api/users
3. **Crea nuevo usuario** → POST /api/users
4. **Asigna categoría** → PUT /api/users/:id
5. **Cambia rol** → PUT /api/users/:id
6. **Elimina usuario** → DELETE /api/users/:id

### Validaciones en Acción
```typescript
// Frontend valida antes de enviar
if (!formData.name.trim()) {
  setValidationError('El nombre es obligatorio');
  return;
}

// Backend valida y responde
if (!name || !email || !password) {
  return res.status(400).json({ 
    msg: 'Nombre, email y contraseña son obligatorios' 
  });
}
```

## 🔄 Comparación: Antes vs Después

### Antes
```typescript
// ❌ URLs hardcodeadas
await axios.get('http://localhost:3000/api/users', {
  headers: { Authorization: `Bearer ${token}` }
});

// ❌ Alerts molestos
alert('Usuario creado correctamente');

// ❌ Manejo manual de errores
catch (err) {
  alert(err.response?.data?.msg || 'Error');
}
```

### Después
```typescript
// ✅ Servicio centralizado
await usersService.getUsers();

// ✅ Sin alerts molestos
// Errores mostrados en UI

// ✅ Manejo elegante de errores
catch (error) {
  setValidationError(error.message);
}
```

## ⚡ Beneficios de esta Arquitectura

1. **Consistente**: Mismo patrón que Categories
2. **Reutilizable**: Fácil replicar para Players/Payments
3. **Type-Safe**: TypeScript en todo el stack
4. **Escalable**: Fácil agregar nuevas funcionalidades
5. **Mantenible**: Código organizado en capas
6. **Profesional**: UX sin interrupciones molestas

## 📈 Próximos Pasos

1. **Implementar Players**: Mismo patrón (servicio + hook + componente)
2. **Implementar Payments**: Seguir la estructura establecida
3. **Agregar notificaciones**: Sistema toast en lugar de alerts
4. **Optimizar búsqueda**: Debounce y filtros avanzados
5. **Agregar paginación**: Para listas grandes
6. **Tests unitarios**: Para servicios y hooks

**¡La base está completamente establecida para replicar esta misma arquitectura en Players y Payments! 🚀** 
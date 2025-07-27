# Integración Frontend-Backend: Categorías

## 🎯 Resumen

Se ha implementado la integración completa entre el frontend (React/TypeScript) y backend (Node.js/Express) para el módulo de **Categorías** con operaciones CRUD completas.

## 🔧 Arquitectura Implementada

### Backend API
- **Puerto**: 3000
- **Base URL**: `http://localhost:3000/api`
- **Autenticación**: JWT Tokens
- **Autorización**: Roles (administrador requerido para crear/editar/eliminar)

### Frontend
- **Framework**: React + TypeScript
- **Estado**: Custom Hooks + useState
- **HTTP Client**: Axios con interceptores
- **Configuración**: Centralizada en variables de entorno

## 📡 Endpoints Implementados

### Autenticación
```typescript
POST /api/auth/register  // Registro de usuario
POST /api/auth/login     // Login y obtención de token
```

### Categorías
```typescript
GET    /api/categories        // Listar todas las categorías
POST   /api/categories        // Crear nueva categoría (solo admin)
PUT    /api/categories/:id    // Actualizar categoría (solo admin)  
DELETE /api/categories/:id    // Eliminar categoría (solo admin)
```

## 🏗️ Estructura del Frontend

### 1. Configuración (`/src/config/api.ts`)
```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
};

export const API_ENDPOINTS = {
  CATEGORIES: '/categories',
  // ... otros endpoints
};
```

### 2. Cliente HTTP (`/src/lib/axios.ts`)
```typescript
import axios from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '../config/api';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
});

// Interceptor automático para agregar token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. Servicio de Categorías (`/src/services/categoriesService.ts`)
```typescript
export interface Category {
  _id: string;
  name: string;
  gender: 'masculino' | 'femenino';
  createdAt: string;
  updatedAt: string;
}

class CategoriesService {
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES);
    return response.data;
  }

  async createCategory(data: CreateCategoryData): Promise<Category> {
    const response = await apiClient.post(API_ENDPOINTS.CATEGORIES, data);
    return response.data;
  }
  
  // ... otros métodos
}
```

### 4. Hook Personalizado (`/src/hooks/useCategories.ts`)
```typescript
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (data: CreateCategoryData) => {
    const newCategory = await categoriesService.createCategory(data);
    setCategories(prev => [...prev, newCategory]);
  };
  
  // ... otros métodos
  
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
```

### 5. Componente React (`/src/pages/Categories.tsx`)
```typescript
const Categories: React.FC = () => {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  // Manejo de formularios y UI
};
```

## 🔐 Sistema de Autenticación

### Flujo de Autenticación
1. Usuario hace login → Recibe JWT token
2. Token se guarda en localStorage
3. Interceptor de axios agrega automáticamente el token a todas las requests
4. Backend valida el token en cada request
5. Si token es inválido → Interceptor hace logout automático

### Credenciales de Prueba
```
Email: admin@test.com
Password: admin123
Role: administrador
```

## 🛠️ Funcionalidades Implementadas

### ✅ CRUD Completo
- **Create**: Crear nueva categoría (nombre + género)
- **Read**: Listar todas las categorías con búsqueda
- **Update**: Editar categoría existente
- **Delete**: Eliminar categoría con confirmación

### ✅ Validaciones
- **Frontend**: Campos obligatorios, tipos de datos
- **Backend**: Validaciones de negocio, duplicados, autorización

### ✅ UX/UI
- **Estados de carga**: Spinners durante operaciones
- **Manejo de errores**: Mensajes descriptivos
- **Confirmaciones**: Diálogos antes de eliminar
- **Formularios**: Validación en tiempo real

## 📊 Ejemplo de Uso

### Crear Categoría
```typescript
const handleCreateCategory = async () => {
  try {
    await createCategory({
      name: 'Sub-18',
      gender: 'femenino'
    });
    // Categoría creada exitosamente
  } catch (error) {
    // Manejo de error
  }
};
```

### Listar Categorías
```typescript
const { categories, loading, error } = useCategories();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <CategoriesList categories={categories} />;
```

## 🚀 Ejecutar en Desarrollo

### Backend
```bash
cd api
node api-with-categories.js  # Puerto 3000
```

### Frontend  
```bash
cd front
npm run dev  # Puerto configurado por Vite
```

## 📋 Próximos Pasos

1. **Probar integración completa** en navegador
2. **Implementar Players** con la misma estructura
3. **Implementar Payments** con la misma estructura  
4. **Agregar sistema de notificaciones** (reemplazar alerts)
5. **Implementar paginación** para listas grandes
6. **Agregar tests unitarios** para servicios y hooks

## 🔍 Validación

### Probar Endpoints con cURL
```bash
# 1. Obtener token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' | \
  jq -r '.token')

# 2. Listar categorías
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/categories

# 3. Crear categoría
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Nueva Categoria","gender":"masculino"}' \
  http://localhost:3000/api/categories
```

## ⚡ Beneficios de esta Arquitectura

1. **Reutilizable**: Misma estructura para Players y Payments
2. **Mantenible**: Código organizado en capas
3. **Escalable**: Fácil agregar nuevas funcionalidades
4. **Type-Safe**: TypeScript en todo el frontend
5. **Centralizada**: Configuración en un solo lugar
6. **Automática**: Manejo de tokens y errores transparente 
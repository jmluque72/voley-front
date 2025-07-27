# Configuración de Variables de Entorno - Frontend

## ⚙️ Configuración del archivo .env

Crea un archivo `.env` en la raíz del proyecto frontend (`/front/.env`) con las siguientes variables:

```bash
# Configuración de la API
VITE_API_BASE_URL=http://localhost:5000/api

# Configuración del entorno
VITE_NODE_ENV=development

# Configuración de autenticación
VITE_TOKEN_STORAGE_KEY=token
VITE_USER_STORAGE_KEY=user
```

## 🔧 Variables disponibles

### API Configuration
- **`VITE_API_BASE_URL`**: URL base de la API (default: `http://localhost:5000/api`)
- **`VITE_NODE_ENV`**: Entorno de ejecución (development/production)

### Authentication
- **`VITE_TOKEN_STORAGE_KEY`**: Clave para almacenar el JWT token (default: `token`)
- **`VITE_USER_STORAGE_KEY`**: Clave para almacenar datos del usuario (default: `user`)

## 📁 Archivos de configuración

### `/src/config/api.ts`
Centraliza todas las configuraciones de la API y endpoints.

### `/src/lib/axios.ts`
Cliente de axios pre-configurado con:
- Interceptores automáticos para agregar el token
- Manejo automático de errores 401 (logout)
- Base URL configurada desde variables de entorno

## 🚀 Uso en desarrollo

```bash
# 1. Crear el archivo .env
cp .env.example .env

# 2. Editar las variables según tu entorno
nano .env

# 3. Ejecutar el proyecto
npm run dev
```

## 🔄 Migración del código existente

Para usar la nueva configuración centralizada, reemplaza las llamadas directas a axios:

### Antes:
```typescript
// ❌ URL hardcodeada
const res = await axios.get('http://localhost:3000/api/players', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Después:
```typescript
// ✅ Usando cliente configurado
import apiClient from '../lib/axios';
import { API_ENDPOINTS } from '../config/api';

const res = await apiClient.get(API_ENDPOINTS.PLAYERS);
```

## 🌍 Configuraciones por entorno

### Desarrollo
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

### Producción
```bash
VITE_API_BASE_URL=https://tu-api.com/api
VITE_NODE_ENV=production
```

## ⚠️ Notas importantes

1. **Prefijo VITE_**: Todas las variables deben empezar con `VITE_` para ser accesibles en el frontend
2. **No commitear .env**: El archivo `.env` debe estar en `.gitignore`
3. **Usar .env.example**: Crear un template sin valores sensibles
4. **Reiniciar servidor**: Cambios en `.env` requieren reiniciar `npm run dev` 
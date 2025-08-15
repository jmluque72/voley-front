# Sistema de Permisos - Backoffice

## 📋 Descripción

Se ha implementado un sistema completo de permisos basado en roles para el backoffice. El usuario **administrador** tiene acceso completo a todas las funcionalidades del sistema.

## 🎯 Roles y Permisos

### 🔴 **Administrador** (`administrador`)
**Acceso completo a todas las funcionalidades**

#### Permisos Disponibles:
- ✅ **Usuarios**: Ver, crear, editar, eliminar
- ✅ **Categorías**: Ver, crear, editar, eliminar
- ✅ **Jugadores**: Ver, crear, editar, eliminar, carga masiva
- ✅ **Pagos**: Ver, crear, editar, eliminar
- ✅ **Morosos**: Ver
- ✅ **Reportes**: Ver, exportar

### 🟡 **Tesorero** (`tesorero`)
**Gestión de pagos, morosos y reportes**

#### Permisos Disponibles:
- ✅ **Pagos**: Ver, crear, editar
- ✅ **Morosos**: Ver
- ✅ **Reportes**: Ver, exportar
- ❌ **Usuarios**: Sin acceso
- ❌ **Categorías**: Sin acceso
- ❌ **Jugadores**: Sin acceso

### 🟢 **Cobrador** (`cobrador`)
**Acceso básico solo a pagos**

#### Permisos Disponibles:
- ✅ **Pagos**: Ver, crear
- ❌ **Usuarios**: Sin acceso
- ❌ **Categorías**: Sin acceso
- ❌ **Jugadores**: Sin acceso
- ❌ **Morosos**: Sin acceso
- ❌ **Reportes**: Sin acceso

## 🛠️ Implementación Técnica

### Archivos Creados:

1. **`src/utils/permissions.ts`**: Sistema central de permisos
2. **`src/hooks/usePermissions.ts`**: Hook para manejar permisos
3. **`src/components/RoleBadge.tsx`**: Badge visual del rol
4. **`src/components/PermissionGuard.tsx`**: Protección de contenido
5. **`src/components/PermissionsInfo.tsx`**: Información de permisos

### Funcionalidades Implementadas:

#### 1. **Navegación Dinámica**
- Solo se muestran las opciones disponibles según el rol
- El administrador ve todas las opciones
- Otros roles ven solo lo que pueden acceder

#### 2. **Protección de Contenido**
- Componentes protegidos por permisos
- Mensajes de acceso denegado
- Fallbacks para contenido no autorizado

#### 3. **Indicadores Visuales**
- Badge del rol con colores distintivos
- Información de permisos en el perfil
- Tooltips con descripciones de roles

## 📱 Interfaz de Usuario

### Navegación por Rol

#### Administrador:
```
🔴 Admin Panel
├── 👥 Users
├── 📁 Categories  
├── 🎮 Players
├── 💳 Payments
├── ⚠️ Morosos
└── 📊 Reports
```

#### Tesorero:
```
🟡 Admin Panel
├── 💳 Payments
├── ⚠️ Morosos
└── 📊 Reports
```

#### Cobrador:
```
🟢 Admin Panel
└── 💳 Payments
```

### Badges de Rol

- **🔴 Administrador**: Fondo rojo, acceso completo
- **🟡 Tesorero**: Fondo amarillo, gestión de pagos y reportes
- **🟢 Cobrador**: Fondo verde, acceso solo a pagos

## 🔧 Uso del Sistema

### Verificar Permisos en Componentes:

```typescript
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = () => {
  const { can, isAdmin } = usePermissions();

  return (
    <div>
      {can('users.create') && (
        <button>Crear Usuario</button>
      )}
      
      {isAdmin() && (
        <button>Acción Solo Admin</button>
      )}
    </div>
  );
};
```

### Proteger Contenido:

```typescript
import PermissionGuard from '../components/PermissionGuard';

const ProtectedComponent = () => {
  return (
    <PermissionGuard permission="users.delete">
      <button>Eliminar Usuario</button>
    </PermissionGuard>
  );
};
```

### Mostrar Información de Rol:

```typescript
import RoleBadge from '../components/RoleBadge';

const UserInfo = ({ user }) => {
  return (
    <div>
      <h3>{user.name}</h3>
      <RoleBadge role={user.role} />
    </div>
  );
};
```

## 📊 Permisos Detallados

### Usuarios (`users.*`)
- `users.view`: Ver lista de usuarios
- `users.create`: Crear nuevos usuarios
- `users.edit`: Editar usuarios existentes
- `users.delete`: Eliminar usuarios

### Categorías (`categories.*`)
- `categories.view`: Ver categorías
- `categories.create`: Crear categorías
- `categories.edit`: Editar categorías
- `categories.delete`: Eliminar categorías

### Jugadores (`players.*`)
- `players.view`: Ver jugadores
- `players.create`: Crear jugadores
- `players.edit`: Editar jugadores
- `players.delete`: Eliminar jugadores
- `players.bulk_upload`: Carga masiva

### Pagos (`payments.*`)
- `payments.view`: Ver pagos
- `payments.create`: Crear pagos
- `payments.edit`: Editar pagos
- `payments.delete`: Eliminar pagos

### Morosos (`morosos.*`)
- `morosos.view`: Ver lista de morosos

### Reportes (`reports.*`)
- `reports.view`: Ver reportes
- `reports.export`: Exportar reportes

## 🚀 Beneficios

### 1. **Seguridad**
- Control granular de acceso
- Protección de funcionalidades sensibles
- Validación en frontend y backend

### 2. **Experiencia de Usuario**
- Interfaz limpia según permisos
- Indicadores visuales claros
- Mensajes informativos

### 3. **Escalabilidad**
- Fácil agregar nuevos roles
- Permisos configurables
- Sistema modular

### 4. **Mantenibilidad**
- Código organizado
- Separación de responsabilidades
- Documentación clara

## 🔒 Seguridad

### Validaciones Implementadas:

1. **Frontend**: Control de UI según permisos
2. **Backend**: Validación de roles en endpoints
3. **Rutas**: Protección de navegación
4. **Componentes**: Guardias de permisos

### Buenas Prácticas:

- ✅ Validación en ambos lados (frontend/backend)
- ✅ Mensajes de error informativos
- ✅ Fallbacks para contenido no autorizado
- ✅ Logs de acceso para auditoría

## 📈 Próximas Mejoras

### Funcionalidades Planificadas:
- [ ] Panel de administración de roles
- [ ] Permisos personalizados por usuario
- [ ] Logs de auditoría detallados
- [ ] Notificaciones de cambios de permisos
- [ ] Exportación de reportes de acceso

### Optimizaciones:
- [ ] Caché de permisos
- [ ] Lazy loading de componentes
- [ ] Optimización de consultas de permisos
- [ ] Sistema de herencia de permisos

¡El sistema de permisos está completamente implementado y el usuario administrador tiene acceso completo a todas las funcionalidades del backoffice! 
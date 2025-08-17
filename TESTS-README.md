# 🏐 Tests Automatizados - VolleyApp

Este directorio contiene tests automatizados para la aplicación VolleyApp usando **Playwright**.

## 📋 Índice

- [Instalación](#instalación)
- [Estructura de Tests](#estructura-de-tests)
- [Ejecución de Tests](#ejecución-de-tests)
- [Scripts Disponibles](#scripts-disponibles)
- [Configuración](#configuración)
- [Reportes](#reportes)

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Servidor backend corriendo (puerto 5000)
- Servidor frontend corriendo (puerto 5174)

### Instalar dependencias
```bash
npm install
npx playwright install
```

## 📁 Estructura de Tests

```
tests/
├── landing-page.spec.ts      # Tests de la landing page
├── backoffice.spec.ts        # Tests del sistema backoffice
└── e2e-workflow.spec.ts      # Tests de flujo completo
```

### 1. Landing Page Tests (`landing-page.spec.ts`)
- ✅ Carga correcta de la página
- ✅ Navegación funcional
- ✅ Tarjetas de características
- ✅ Sección de video demo
- ✅ Sección de descarga
- ✅ Responsive design
- ✅ Footer correcto

### 2. Backoffice Tests (`backoffice.spec.ts`)
- ✅ Login exitoso
- ✅ Validación de credenciales
- ✅ Manejo de errores
- ✅ Navegación entre secciones
- ✅ Logout correcto
- ✅ Responsive design

### 3. End-to-End Tests (`e2e-workflow.spec.ts`)
- ✅ Creación de jugadores
- ✅ Gestión de categorías
- ✅ Creación de pagos
- ✅ Grupos familiares
- ✅ Generación de reportes
- ✅ Configuración del sistema
- ✅ Búsqueda y filtros
- ✅ Paginación

## 🎯 Ejecución de Tests

### Ejecución Automática Completa
```bash
./run-tests.sh
```

### Tests Individuales

#### Landing Page
```bash
npm run test:landing
```

#### Backoffice
```bash
npm run test:backoffice
```

#### End-to-End
```bash
npm run test:e2e
```

### Modos de Ejecución

#### Headless (por defecto)
```bash
npm test
```

#### Con interfaz visual
```bash
npm run test:ui
```

#### Con navegador visible
```bash
npm run test:headed
```

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm test` | Ejecuta todos los tests |
| `npm run test:ui` | Ejecuta tests con interfaz visual |
| `npm run test:headed` | Ejecuta tests con navegador visible |
| `npm run test:landing` | Solo tests de landing page |
| `npm run test:backoffice` | Solo tests de backoffice |
| `npm run test:e2e` | Solo tests end-to-end |
| `npm run test:report` | Muestra reporte HTML |
| `./run-tests.sh` | Script completo con manejo de servidores |

## ⚙️ Configuración

### Playwright Config (`playwright.config.ts`)
- **Base URL**: `http://localhost:5174`
- **Browsers**: Chrome, Firefox, Safari, Mobile
- **Screenshots**: Solo en fallos
- **Videos**: Solo en fallos
- **Traces**: En reintentos

### Variables de Entorno
```bash
# Credenciales de test
TEST_EMAIL=admin@voley.com
TEST_PASSWORD=admin123

# URLs de servidores
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5174
```

## 📊 Reportes

### Reporte HTML
```bash
npm run test:report
```

### Reporte en Consola
```bash
npm test -- --reporter=list
```

### Reporte Detallado
```bash
npm test -- --reporter=html
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Servidor no disponible
```bash
# Verificar si el servidor está corriendo
curl http://localhost:5174

# Iniciar servidor si es necesario
npm run dev
```

#### 2. API no disponible
```bash
# Verificar si la API está corriendo
curl http://localhost:5000

# Iniciar API si es necesario
cd ../api && npm start
```

#### 3. Tests fallan por timeout
```bash
# Aumentar timeout en playwright.config.ts
timeout: 30000
```

#### 4. Problemas con navegadores
```bash
# Reinstalar navegadores
npx playwright install
```

### Debugging

#### Ejecutar test específico
```bash
npx playwright test landing-page.spec.ts --grep "should load"
```

#### Modo debug
```bash
npx playwright test --debug
```

#### Ver traces
```bash
npx playwright show-trace trace.zip
```

## 🎯 Casos de Uso

### 1. Desarrollo Diario
```bash
# Ejecutar tests rápidos
npm run test:landing
```

### 2. Antes de Deploy
```bash
# Ejecutar todos los tests
./run-tests.sh
```

### 3. CI/CD
```bash
# En pipeline de CI
npm test -- --reporter=html
```

### 4. Testing Manual
```bash
# Ver tests en acción
npm run test:ui
```

## 📈 Métricas

Los tests verifican:
- ✅ **Funcionalidad**: Login, CRUD, navegación
- ✅ **UI/UX**: Responsive, accesibilidad
- ✅ **Performance**: Tiempos de carga
- ✅ **Compatibilidad**: Múltiples navegadores
- ✅ **Integración**: End-to-end workflows

## 🤝 Contribución

### Agregar Nuevos Tests

1. Crear archivo en `tests/`
2. Seguir convención de nombres: `*.spec.ts`
3. Usar selectores robustos
4. Agregar descripción clara
5. Manejar errores apropiadamente

### Ejemplo de Test
```typescript
test('should create new item', async ({ page }) => {
  await page.goto('/items');
  await page.click('text=Add Item');
  await page.fill('input[name="name"]', 'Test Item');
  await page.click('text=Save');
  await expect(page.locator('text=Test Item')).toBeVisible();
});
```

## 📞 Soporte

Para problemas con los tests:
1. Revisar logs de consola
2. Verificar reporte HTML
3. Ejecutar en modo debug
4. Verificar configuración de servidores

---

**¡Los tests automatizados aseguran la calidad y estabilidad de VolleyApp!** 🏐

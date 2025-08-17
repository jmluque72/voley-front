import { test, expect } from '@playwright/test';

test.describe('End-to-End Workflow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login al sistema
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@voley.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Esperar a que cargue el dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test('should create and manage a player', async ({ page }) => {
    // Navegar a la sección de jugadores
    await page.click('text=Jugadores');
    
    // Crear un nuevo jugador
    await page.click('text=Agregar Jugador, Nuevo Jugador, +');
    
    // Llenar formulario
    await page.fill('input[name="name"], input[placeholder*="nombre"]', 'Juan Pérez');
    await page.fill('input[name="email"], input[placeholder*="email"]', 'juan@test.com');
    await page.fill('input[name="phone"], input[placeholder*="teléfono"]', '123456789');
    
    // Seleccionar categoría
    await page.selectOption('select[name="category"], select[placeholder*="categoría"]', '1');
    
    // Guardar jugador
    await page.click('text=Guardar, Crear, Submit');
    
    // Verificar que se creó correctamente
    await expect(page.locator('text=Juan Pérez')).toBeVisible();
  });

  test('should create and manage a category', async ({ page }) => {
    // Navegar a la sección de categorías
    await page.click('text=Categorías');
    
    // Crear una nueva categoría
    await page.click('text=Agregar Categoría, Nueva Categoría, +');
    
    // Llenar formulario
    await page.fill('input[name="name"], input[placeholder*="nombre"]', 'Categoría Test');
    await page.fill('input[name="quota"], input[placeholder*="cuota"]', '50000');
    await page.fill('textarea[name="description"], textarea[placeholder*="descripción"]', 'Descripción de prueba');
    
    // Guardar categoría
    await page.click('text=Guardar, Crear, Submit');
    
    // Verificar que se creó correctamente
    await expect(page.locator('text=Categoría Test')).toBeVisible();
  });

  test('should create a payment', async ({ page }) => {
    // Navegar a la sección de pagos
    await page.click('text=Pagos');
    
    // Crear un nuevo pago
    await page.click('text=Agregar Pago, Nuevo Pago, +');
    
    // Seleccionar jugador
    await page.selectOption('select[name="player"], select[placeholder*="jugador"]', '1');
    
    // Llenar detalles del pago
    await page.fill('input[name="amount"], input[placeholder*="monto"]', '50000');
    await page.selectOption('select[name="method"], select[placeholder*="método"]', 'efectivo');
    await page.fill('input[name="date"], input[type="date"]', '2024-01-15');
    
    // Guardar pago
    await page.click('text=Guardar, Crear, Submit');
    
    // Verificar que se creó correctamente
    await expect(page.locator('text=50000')).toBeVisible();
  });

  test('should create a family group', async ({ page }) => {
    // Navegar a la sección de grupos familiares
    await page.click('text=Grupos Familiares');
    
    // Crear un nuevo grupo familiar
    await page.click('text=Agregar Grupo, Nuevo Grupo, +');
    
    // Llenar formulario
    await page.fill('input[name="name"], input[placeholder*="nombre"]', 'Familia Pérez');
    
    // Guardar grupo
    await page.click('text=Guardar, Crear, Submit');
    
    // Verificar que se creó correctamente
    await expect(page.locator('text=Familia Pérez')).toBeVisible();
  });

  test('should generate reports', async ({ page }) => {
    // Navegar a la sección de reportes
    await page.click('text=Reportes');
    
    // Verificar que hay opciones de reportes
    await expect(page.locator('text=Reporte de Pagos, Reporte de Morosos, Estadísticas')).toBeVisible();
    
    // Generar un reporte
    await page.click('text=Generar Reporte, Exportar, Descargar');
    
    // Verificar que se genera el reporte
    await expect(page.locator('text=Reporte generado, Descarga completada')).toBeVisible();
  });

  test('should manage system configuration', async ({ page }) => {
    // Navegar a la configuración
    await page.click('text=Configuración');
    
    // Verificar que se puede acceder a la configuración
    await expect(page.locator('text=Configuración del Sistema, Ajustes')).toBeVisible();
    
    // Cambiar configuración
    await page.fill('input[name="companyName"], input[placeholder*="empresa"]', 'VolleyApp Test');
    await page.click('text=Guardar, Actualizar');
    
    // Verificar que se guardó
    await expect(page.locator('text=Configuración actualizada, Guardado')).toBeVisible();
  });

  test('should handle search and filtering', async ({ page }) => {
    // Navegar a jugadores
    await page.click('text=Jugadores');
    
    // Usar búsqueda
    await page.fill('input[placeholder*="buscar"], input[name="search"]', 'Juan');
    await page.press('input[placeholder*="buscar"], input[name="search"]', 'Enter');
    
    // Verificar resultados de búsqueda
    await expect(page.locator('text=Juan')).toBeVisible();
    
    // Usar filtros
    await page.selectOption('select[name="categoryFilter"], select[placeholder*="categoría"]', '1');
    await expect(page.locator('tbody tr')).toHaveCount.greaterThan(0);
  });

  test('should handle pagination', async ({ page }) => {
    // Navegar a jugadores
    await page.click('text=Jugadores');
    
    // Verificar que hay paginación
    const pagination = page.locator('.pagination, [aria-label*="paginación"]');
    
    if (await pagination.isVisible()) {
      // Navegar a la siguiente página
      await page.click('text=Siguiente, Next, >');
      await expect(page.locator('.pagination')).toBeVisible();
      
      // Navegar a la página anterior
      await page.click('text=Anterior, Previous, <');
      await expect(page.locator('.pagination')).toBeVisible();
    }
  });
});

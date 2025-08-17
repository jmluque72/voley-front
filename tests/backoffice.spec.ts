import { test, expect } from '@playwright/test';

test.describe('Backoffice Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar al login del backoffice
    await page.goto('/login');
  });

  test('should load login page correctly', async ({ page }) => {
    // Verificar que la página de login carga correctamente
    await expect(page).toHaveTitle(/VolleyApp/);
    
    // Verificar elementos del login
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Llenar formulario de login
    await page.fill('input[type="email"]', 'admin@voley.com');
    await page.fill('input[type="password"]', 'admin123');
    
    // Hacer clic en el botón de login
    await page.click('button[type="submit"]');
    
    // Verificar que se redirige al dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
    
    // Verificar que el usuario está logueado
    await expect(page.locator('text=Admin')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Llenar formulario con credenciales inválidas
    await page.fill('input[type="email"]', 'invalid@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Hacer clic en el botón de login
    await page.click('button[type="submit"]');
    
    // Verificar que se muestra un error
    await expect(page.locator('.error-message, .alert, [role="alert"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Intentar login sin credenciales
    await page.click('button[type="submit"]');
    
    // Verificar que se muestran errores de validación
    await expect(page.locator('.error-message, .alert, [role="alert"]')).toBeVisible();
  });

  test('should navigate to different sections after login', async ({ page }) => {
    // Login exitoso
    await page.fill('input[type="email"]', 'admin@voley.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Esperar a que cargue el dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
    
    // Verificar navegación a diferentes secciones
    const menuItems = [
      'Jugadores',
      'Categorías', 
      'Pagos',
      'Cobranzas',
      'Grupos Familiares',
      'Reportes',
      'Configuración'
    ];
    
    for (const item of menuItems) {
      await page.click(`text=${item}`);
      await expect(page.locator(`text=${item}`)).toBeVisible();
    }
  });

  test('should handle logout correctly', async ({ page }) => {
    // Login exitoso
    await page.fill('input[type="email"]', 'admin@voley.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Esperar a que cargue el dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
    
    // Hacer logout
    await page.click('text=Logout, Cerrar Sesión, Salir');
    
    // Verificar que se redirige al login
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Cambiar a vista móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verificar que el formulario se adapta
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});

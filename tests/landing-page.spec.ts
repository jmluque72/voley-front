import { test, expect } from '@playwright/test';

test.describe('Landing Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la landing page
    await page.goto('http://localhost:3001/landing.html');
  });

  test('should load landing page correctly', async ({ page }) => {
    // Verificar que la página carga correctamente
    await expect(page).toHaveTitle(/VolleyApp/);
    
    // Verificar elementos principales
    await expect(page.locator('h1')).toContainText('Sistema de Gestión de Voleibol');
    await expect(page.locator('text=VolleyApp')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    // Verificar que los enlaces de navegación funcionan
    const navLinks = page.locator('nav a');
    await expect(navLinks).toHaveCount(3); // Características, Backoffice, Descargar APK
    
    // Verificar enlace a características
    await page.click('text=Características');
    await expect(page.locator('#features')).toBeVisible();
    
    // Verificar enlace a descarga
    await page.click('text=Descargar APK');
    await expect(page.locator('#download')).toBeVisible();
  });

  test('should have all feature cards', async ({ page }) => {
    // Verificar que todas las tarjetas de características están presentes
    const featureCards = page.locator('.feature-card');
    await expect(featureCards).toHaveCount(6);
    
    // Verificar contenido de las tarjetas
    await expect(page.locator('text=Gestión de Jugadores')).toBeVisible();
    await expect(page.locator('text=Sistema de Pagos')).toBeVisible();
    await expect(page.locator('text=Cobranzas')).toBeVisible();
    await expect(page.locator('text=Grupos Familiares')).toBeVisible();
    await expect(page.locator('text=Reportes')).toBeVisible();
    await expect(page.locator('text=App Móvil')).toBeVisible();
  });

  test('should have video demo section', async ({ page }) => {
    // Verificar sección de video demo
    await page.click('text=Ver Demo');
    await expect(page.locator('#demo')).toBeVisible();
    await expect(page.locator('text=Demo del Sistema')).toBeVisible();
  });

  test('should have download section', async ({ page }) => {
    // Verificar sección de descarga
    await expect(page.locator('#download')).toBeVisible();
    await expect(page.locator('text=Descarga la App Móvil')).toBeVisible();
    await expect(page.locator('text=VolleyApp Mobile')).toBeVisible();
    
    // Verificar botón de descarga
    const downloadButton = page.locator('text=Descargar APK (v1.0)');
    await expect(downloadButton).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Cambiar a vista móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verificar que la navegación se adapta
    await expect(page.locator('nav')).toBeVisible();
    
    // Verificar que el contenido se ajusta
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.feature-card')).toHaveCount(6);
  });

  test('should have proper footer', async ({ page }) => {
    // Verificar footer
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('text=Sistema integral de gestión')).toBeVisible();
    await expect(page.locator('text=© 2024 VolleyApp')).toBeVisible();
  });
});

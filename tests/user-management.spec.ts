import { test, expect } from '@playwright/test';

test.describe('User Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@voley.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Esperar a que cargue el dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test('should create a new collector user', async ({ page }) => {
    // Navegar a la sección de usuarios/administración
    await page.click('text=Usuarios, Administración, Configuración');
    
    // Buscar botón para agregar usuario
    await page.click('text=Agregar Usuario, Nuevo Usuario, +, Crear Usuario');
    
    // Llenar formulario del nuevo usuario
    const testEmail = `cobrador.test.${Date.now()}@voley.com`;
    const testName = 'Cobrador Test';
    
    // Información básica
    await page.fill('input[name="name"], input[placeholder*="nombre"], input[placeholder*="Nombre"]', testName);
    await page.fill('input[name="email"], input[placeholder*="email"], input[placeholder*="Email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"], input[placeholder*="contraseña"]', 'cobrador123');
    await page.fill('input[name="confirmPassword"], input[placeholder*="confirmar"], input[placeholder*="Confirmar"]', 'cobrador123');
    
    // Seleccionar rol de cobrador
    await page.selectOption('select[name="role"], select[placeholder*="rol"], select[placeholder*="Rol"]', 'cobrador');
    
    // Información adicional del cobrador
    await page.fill('input[name="phone"], input[placeholder*="teléfono"], input[placeholder*="Teléfono"]', '123456789');
    await page.fill('input[name="address"], input[placeholder*="dirección"], textarea[name="address"]', 'Dirección de prueba');
    
    // Guardar usuario
    await page.click('text=Guardar, Crear, Submit, Crear Usuario');
    
    // Verificar que se creó correctamente
    await expect(page.locator(`text=${testName}`)).toBeVisible();
    await expect(page.locator(`text=${testEmail}`)).toBeVisible();
    await expect(page.locator('text=Cobrador, cobrador')).toBeVisible();
    
    // Verificar mensaje de éxito
    await expect(page.locator('text=Usuario creado, Usuario guardado, Éxito')).toBeVisible();
  });

  test('should validate required fields when creating user', async ({ page }) => {
    // Navegar a crear usuario
    await page.click('text=Usuarios, Administración, Configuración');
    await page.click('text=Agregar Usuario, Nuevo Usuario, +, Crear Usuario');
    
    // Intentar guardar sin llenar campos
    await page.click('text=Guardar, Crear, Submit, Crear Usuario');
    
    // Verificar que se muestran errores de validación
    await expect(page.locator('.error-message, .alert, [role="alert"], .text-red-500')).toBeVisible();
  });

  test('should prevent duplicate email addresses', async ({ page }) => {
    // Navegar a crear usuario
    await page.click('text=Usuarios, Administración, Configuración');
    await page.click('text=Agregar Usuario, Nuevo Usuario, +, Crear Usuario');
    
    // Usar email que ya existe
    await page.fill('input[name="name"], input[placeholder*="nombre"]', 'Cobrador Duplicado');
    await page.fill('input[name="email"], input[placeholder*="email"]', 'cobrador@voley.com');
    await page.fill('input[name="password"], input[type="password"]', 'cobrador123');
    await page.fill('input[name="confirmPassword"]', 'cobrador123');
    await page.selectOption('select[name="role"]', 'cobrador');
    
    // Guardar
    await page.click('text=Guardar, Crear, Submit, Crear Usuario');
    
    // Verificar error de email duplicado
    await expect(page.locator('text=Email ya existe, Email duplicado, Ya existe')).toBeVisible();
  });

  test('should edit existing collector user', async ({ page }) => {
    // Navegar a usuarios
    await page.click('text=Usuarios, Administración, Configuración');
    
    // Buscar y editar un cobrador existente
    await page.click('text=Editar, ✏️, Edit');
    
    // Modificar información
    const newName = 'Cobrador Actualizado';
    await page.fill('input[name="name"], input[placeholder*="nombre"]', newName);
    await page.fill('input[name="phone"], input[placeholder*="teléfono"]', '987654321');
    
    // Guardar cambios
    await page.click('text=Guardar, Actualizar, Submit');
    
    // Verificar que se actualizó
    await expect(page.locator(`text=${newName}`)).toBeVisible();
    await expect(page.locator('text=Usuario actualizado, Cambios guardados')).toBeVisible();
  });

  test('should assign categories to collector', async ({ page }) => {
    // Navegar a usuarios
    await page.click('text=Usuarios, Administración, Configuración');
    
    // Buscar un cobrador
    await page.click('text=Cobrador, cobrador');
    
    // Asignar categorías
    await page.click('text=Asignar Categorías, Categorías, Asignar');
    
    // Seleccionar categorías
    await page.check('input[type="checkbox"][name="category_1"]');
    await page.check('input[type="checkbox"][name="category_2"]');
    
    // Guardar asignación
    await page.click('text=Guardar Asignación, Confirmar, Guardar');
    
    // Verificar que se asignaron
    await expect(page.locator('text=Categorías asignadas, Asignación guardada')).toBeVisible();
  });

  test('should deactivate/reactivate user', async ({ page }) => {
    // Navegar a usuarios
    await page.click('text=Usuarios, Administración, Configuración');
    
    // Buscar un usuario
    await page.click('text=Desactivar, Activar, Estado');
    
    // Confirmar acción
    await page.click('text=Confirmar, Sí, OK');
    
    // Verificar cambio de estado
    await expect(page.locator('text=Usuario desactivado, Estado actualizado')).toBeVisible();
  });

  test('should search and filter users', async ({ page }) => {
    // Navegar a usuarios
    await page.click('text=Usuarios, Administración, Configuración');
    
    // Buscar por nombre
    await page.fill('input[placeholder*="buscar"], input[name="search"]', 'cobrador');
    await page.press('input[placeholder*="buscar"], input[name="search"]', 'Enter');
    
    // Verificar resultados
    await expect(page.locator('text=cobrador')).toBeVisible();
    
    // Filtrar por rol
    await page.selectOption('select[name="roleFilter"], select[placeholder*="rol"]', 'cobrador');
    await expect(page.locator('tbody tr')).toHaveCount.greaterThan(0);
  });

  test('should view user details', async ({ page }) => {
    // Navegar a usuarios
    await page.click('text=Usuarios, Administración, Configuración');
    
    // Ver detalles de un usuario
    await page.click('text=Ver, Detalles, 👁️');
    
    // Verificar información del usuario
    await expect(page.locator('text=Información del Usuario, Detalles')).toBeVisible();
    await expect(page.locator('text=Email, Nombre, Rol')).toBeVisible();
  });
});

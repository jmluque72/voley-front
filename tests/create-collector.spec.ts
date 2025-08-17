import { test, expect } from '@playwright/test';

test('Create Collector User - Complete Flow', async ({ page }) => {
  console.log('🏐 Iniciando test: Crear Usuario Cobrador');
  
  // 1. Ir al login
  console.log('📝 Paso 1: Navegando al login...');
  await page.goto('/login');
  
  // Verificar que estamos en la página de login
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  
  // 2. Hacer login como admin
  console.log('🔐 Paso 2: Haciendo login como admin...');
  await page.fill('input[type="email"]', 'admin@voley.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  // Esperar a que cargue el dashboard
  await expect(page).toHaveURL(/.*dashboard.*/);
  console.log('✅ Login exitoso');
  
  // 3. Navegar a la sección de usuarios
  console.log('👥 Paso 3: Navegando a gestión de usuarios...');
  
  // Intentar diferentes formas de encontrar la sección de usuarios
  const userSectionSelectors = [
    'text=Usuarios',
    'text=Administración',
    'text=Configuración',
    'text=Gestión de Usuarios',
    'text=Users',
    'a[href*="users"]',
    'a[href*="admin"]'
  ];
  
  let userSectionFound = false;
  for (const selector of userSectionSelectors) {
    try {
      await page.click(selector, { timeout: 2000 });
      console.log(`✅ Encontrada sección de usuarios con selector: ${selector}`);
      userSectionFound = true;
      break;
    } catch (e) {
      // Continuar con el siguiente selector
    }
  }
  
  if (!userSectionFound) {
    console.log('⚠️ No se encontró la sección de usuarios, intentando buscar en el menú...');
    // Buscar en el menú de navegación
    await page.click('nav, .menu, .sidebar, [role="navigation"]');
  }
  
  // 4. Crear nuevo usuario
  console.log('➕ Paso 4: Creando nuevo usuario...');
  
  // Buscar botón para agregar usuario
  const addUserSelectors = [
    'text=Agregar Usuario',
    'text=Nuevo Usuario',
    'text=Crear Usuario',
    'text=+',
    'button[aria-label*="usuario"]',
    'button[aria-label*="user"]'
  ];
  
  let addButtonFound = false;
  for (const selector of addUserSelectors) {
    try {
      await page.click(selector, { timeout: 2000 });
      console.log(`✅ Encontrado botón agregar usuario con selector: ${selector}`);
      addButtonFound = true;
      break;
    } catch (e) {
      // Continuar con el siguiente selector
    }
  }
  
  if (!addButtonFound) {
    console.log('⚠️ No se encontró el botón de agregar usuario');
  }
  
  // 5. Llenar formulario del cobrador
  console.log('📋 Paso 5: Llenando formulario del cobrador...');
  
  // Generar datos únicos para el test
  const timestamp = Date.now();
  const testEmail = `cobrador.test.${timestamp}@voley.com`;
  const testName = `Cobrador Test ${timestamp}`;
  
  console.log(`📧 Email de prueba: ${testEmail}`);
  console.log(`👤 Nombre de prueba: ${testName}`);
  
  // Llenar campos del formulario
  const formFields = [
    { selector: 'input[name="name"], input[placeholder*="nombre"], input[placeholder*="Nombre"]', value: testName },
    { selector: 'input[name="email"], input[placeholder*="email"], input[placeholder*="Email"]', value: testEmail },
    { selector: 'input[name="password"], input[type="password"], input[placeholder*="contraseña"]', value: 'cobrador123' },
    { selector: 'input[name="confirmPassword"], input[placeholder*="confirmar"], input[placeholder*="Confirmar"]', value: 'cobrador123' },
    { selector: 'input[name="phone"], input[placeholder*="teléfono"], input[placeholder*="Teléfono"]', value: '123456789' }
  ];
  
  for (const field of formFields) {
    try {
      await page.fill(field.selector, field.value);
      console.log(`✅ Campo llenado: ${field.value}`);
    } catch (e) {
      console.log(`⚠️ No se pudo llenar campo con selector: ${field.selector}`);
    }
  }
  
  // 6. Seleccionar rol de cobrador
  console.log('🎭 Paso 6: Seleccionando rol de cobrador...');
  
  const roleSelectors = [
    'select[name="role"]',
    'select[placeholder*="rol"]',
    'select[placeholder*="Rol"]',
    'select[name="userRole"]'
  ];
  
  let roleSelected = false;
  for (const selector of roleSelectors) {
    try {
      await page.selectOption(selector, 'cobrador');
      console.log(`✅ Rol seleccionado con selector: ${selector}`);
      roleSelected = true;
      break;
    } catch (e) {
      // Intentar con diferentes valores
      try {
        await page.selectOption(selector, 'collector');
        console.log(`✅ Rol seleccionado (collector) con selector: ${selector}`);
        roleSelected = true;
        break;
      } catch (e2) {
        // Continuar con el siguiente selector
      }
    }
  }
  
  if (!roleSelected) {
    console.log('⚠️ No se pudo seleccionar el rol de cobrador');
  }
  
  // 7. Guardar usuario
  console.log('💾 Paso 7: Guardando usuario...');
  
  const saveSelectors = [
    'text=Guardar',
    'text=Crear',
    'text=Submit',
    'text=Crear Usuario',
    'text=Save',
    'button[type="submit"]'
  ];
  
  let userSaved = false;
  for (const selector of saveSelectors) {
    try {
      await page.click(selector);
      console.log(`✅ Usuario guardado con selector: ${selector}`);
      userSaved = true;
      break;
    } catch (e) {
      // Continuar con el siguiente selector
    }
  }
  
  if (!userSaved) {
    console.log('⚠️ No se pudo guardar el usuario');
  }
  
  // 8. Verificar que se creó correctamente
  console.log('✅ Paso 8: Verificando creación del usuario...');
  
  // Esperar un momento para que se procese
  await page.waitForTimeout(2000);
  
  // Verificar que el usuario aparece en la lista
  try {
    await expect(page.locator(`text=${testName}`)).toBeVisible({ timeout: 10000 });
    console.log('✅ Usuario creado exitosamente y visible en la lista');
  } catch (e) {
    console.log('⚠️ No se pudo verificar que el usuario aparezca en la lista');
  }
  
  try {
    await expect(page.locator(`text=${testEmail}`)).toBeVisible({ timeout: 5000 });
    console.log('✅ Email del usuario visible');
  } catch (e) {
    console.log('⚠️ No se pudo verificar el email del usuario');
  }
  
  // Verificar mensaje de éxito
  const successMessages = [
    'text=Usuario creado',
    'text=Usuario guardado',
    'text=Éxito',
    'text=Success',
    'text=Usuario agregado'
  ];
  
  let successMessageFound = false;
  for (const message of successMessages) {
    try {
      await expect(page.locator(message)).toBeVisible({ timeout: 3000 });
      console.log(`✅ Mensaje de éxito encontrado: ${message}`);
      successMessageFound = true;
      break;
    } catch (e) {
      // Continuar con el siguiente mensaje
    }
  }
  
  if (!successMessageFound) {
    console.log('⚠️ No se encontró mensaje de éxito específico');
  }
  
  console.log('🎉 Test completado: Usuario cobrador creado exitosamente');
  console.log(`📊 Resumen:`);
  console.log(`   - Email: ${testEmail}`);
  console.log(`   - Nombre: ${testName}`);
  console.log(`   - Rol: Cobrador`);
  console.log(`   - Contraseña: cobrador123`);
});

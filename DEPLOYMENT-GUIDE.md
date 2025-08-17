# 🚀 Guía de Despliegue - Frontend EasyVoley

## 📋 Problemas Comunes y Soluciones

### ❌ **Problema: La landing page no se ve después del despliegue**

**Causa:** Las aplicaciones React/Vite son Single Page Applications (SPA) que usan routing del lado del cliente. Los servidores web no saben cómo manejar estas rutas.

**Síntomas:**
- Página en blanco al acceder directamente a una URL
- Error 404 al refrescar la página
- Rutas no funcionan correctamente

---

## ✅ **Soluciones Implementadas**

### **1. Configuración de Vite (`vite.config.ts`)**
```typescript
export default defineConfig({
  plugins: [react()],
  base: './', // Rutas relativas
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
});
```

### **2. Archivos de Configuración de Servidor**

#### **A. Netlify (`public/_redirects`)**
```
/*    /index.html   200
```

#### **B. Vercel (`vercel.json`)**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### **C. Apache (`public/.htaccess`)**
```apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### **D. Nginx (configuración del servidor)**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## 🛠️ **Pasos para Desplegar**

### **1. Build de Producción**
```bash
cd front
npm run build:prod
```

### **2. Verificar Build Local**
```bash
npm run serve
```

### **3. Subir Archivos**
Subir todo el contenido de la carpeta `dist/` al servidor web.

---

## 🌐 **Plataformas de Despliegue**

### **Netlify**
1. Conectar repositorio Git
2. Build command: `npm run build`
3. Publish directory: `dist`
4. El archivo `_redirects` se aplica automáticamente

### **Vercel**
1. Conectar repositorio Git
2. Framework preset: Vite
3. El archivo `vercel.json` se aplica automáticamente

### **Servidor Apache**
1. Subir archivos a `/var/www/html/`
2. El archivo `.htaccess` se aplica automáticamente
3. Asegurar que `mod_rewrite` esté habilitado

### **Servidor Nginx**
1. Configurar el servidor con la regla de `try_files`
2. Subir archivos al directorio configurado

---

## 🔧 **Verificación Post-Despliegue**

### **1. Verificar Rutas**
- ✅ `/` - Página principal
- ✅ `/login` - Página de login
- ✅ `/users` - Página de usuarios
- ✅ Refrescar página en cualquier ruta

### **2. Verificar Assets**
- ✅ CSS y JS se cargan correctamente
- ✅ Imágenes se muestran
- ✅ No hay errores 404 en la consola

### **3. Verificar Funcionalidad**
- ✅ Login funciona
- ✅ Navegación entre páginas
- ✅ CRUD operations funcionan

---

## 🐛 **Debugging**

### **Si la página sigue sin cargar:**

1. **Verificar consola del navegador**
   ```bash
   # Errores comunes:
   # - 404 en assets
   # - CORS errors
   # - JavaScript errors
   ```

2. **Verificar Network tab**
   ```bash
   # Verificar que index.html se sirve correctamente
   # Verificar que assets se cargan
   ```

3. **Verificar configuración del servidor**
   ```bash
   # Apache: mod_rewrite habilitado
   # Nginx: try_files configurado
   # Netlify: _redirects presente
   ```

---

## 📝 **Notas Importantes**

### **Variables de Entorno**
- Crear archivo `.env.production` para configuración de producción
- Configurar `VITE_API_BASE_URL` para la API de producción

### **Caché**
- Los archivos estáticos tienen caché de 1 año
- Para actualizaciones, usar versioning en assets

### **Seguridad**
- Configurar HTTPS en producción
- Configurar headers de seguridad apropiados

---

## 🎯 **Resultado Esperado**

Después de implementar estas soluciones:

✅ **La aplicación carga correctamente en cualquier URL**  
✅ **El refresh funciona en cualquier página**  
✅ **Las rutas del lado del cliente funcionan**  
✅ **Los assets se cargan correctamente**  
✅ **La aplicación es completamente funcional**

# 🚀 Guía de Despliegue - AWS Amplify

## 📋 Configuración Específica para AWS Amplify

### ✅ **Archivos de Configuración Creados**

#### **1. `amplify.yml` - Configuración de Build**
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

#### **2. `public/_redirects` - Redirecciones para SPA**
```
# AWS Amplify redirects for SPA
/*    /index.html   200

# Redirect www to non-www (optional)
https://www.yourdomain.com/* https://yourdomain.com/:splat 301!

# Force HTTPS (optional)
http://yourdomain.com/* https://yourdomain.com/:splat 301!
```

#### **3. `public/_headers` - Headers de Seguridad**
```
# Security headers
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

# Cache static assets
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Don't cache HTML files
*.html
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0
```

---

## 🛠️ **Pasos para Desplegar en AWS Amplify**

### **1. Preparar el Repositorio**
```bash
# Asegurar que todos los archivos estén commitados
git add .
git commit -m "Configuración para AWS Amplify"
git push origin main
```

### **2. Conectar en AWS Amplify Console**

1. **Ir a AWS Amplify Console**
   - URL: https://console.aws.amazon.com/amplify/

2. **Crear Nueva App**
   - Click en "New app" → "Host web app"

3. **Conectar Repositorio**
   - Seleccionar tu proveedor de Git (GitHub, GitLab, etc.)
   - Seleccionar el repositorio
   - Seleccionar la rama (main/master)

4. **Configurar Build Settings**
   - **Build settings**: Usar el archivo `amplify.yml` existente
   - **Environment variables**: Agregar si es necesario

### **3. Variables de Entorno (Opcional)**
```bash
# En AWS Amplify Console → App settings → Environment variables
VITE_API_BASE_URL=https://tu-api-url.com/api
VITE_APP_TITLE=EasyVoley Backoffice
```

### **4. Configurar Dominio Personalizado (Opcional)**
1. **Domain management** → **Add domain**
2. **Subdomain**: `app` o `admin`
3. **Domain**: `tudominio.com`
4. **SSL Certificate**: Automático

---

## 🔧 **Configuración Avanzada**

### **1. Configurar Branch Protection**
```bash
# En AWS Amplify Console → App settings → Build settings
# Agregar reglas de protección para main branch
```

### **2. Configurar Notificaciones**
```bash
# En AWS Amplify Console → App settings → Notifications
# Configurar notificaciones de build (email, Slack, etc.)
```

### **3. Configurar Prerendering (Opcional)**
```bash
# Para mejorar SEO, considerar prerendering
# Agregar en amplify.yml:
prerender:
  - path: /
  - path: /login
```

---

## 🐛 **Solución de Problemas Comunes**

### **❌ Error: Build Fails**
```bash
# Verificar en AWS Amplify Console → Build logs
# Errores comunes:
# 1. Node.js version incompatible
# 2. Dependencias faltantes
# 3. Variables de entorno no configuradas
```

### **❌ Error: Página en Blanco**
```bash
# Verificar:
# 1. Archivo _redirects presente en public/
# 2. Configuración de base en vite.config.ts
# 3. Rutas en React Router configuradas correctamente
```

### **❌ Error: Assets No Cargan**
```bash
# Verificar:
# 1. Configuración de base en vite.config.ts
# 2. Headers de caché en _headers
# 3. Rutas de assets en el build
```

---

## 📊 **Monitoreo y Analytics**

### **1. AWS Amplify Analytics**
```bash
# Habilitar en AWS Amplify Console
# App settings → Analytics
# Configurar eventos personalizados
```

### **2. CloudWatch Logs**
```bash
# Ver logs de build y runtime
# AWS Amplify Console → Build logs
# CloudWatch → Log groups
```

---

## 🔒 **Seguridad**

### **1. Headers de Seguridad**
- ✅ Configurados en `public/_headers`
- ✅ Protección contra XSS, clickjacking, etc.

### **2. HTTPS**
- ✅ Automático en AWS Amplify
- ✅ Certificados SSL gestionados por AWS

### **3. Access Control**
- ✅ Configurar acceso por IP si es necesario
- ✅ Usar AWS WAF para protección adicional

---

## 🚀 **Optimización de Performance**

### **1. Caché**
- ✅ Assets estáticos con caché de 1 año
- ✅ HTML sin caché para actualizaciones inmediatas

### **2. Compresión**
- ✅ Gzip automático en AWS Amplify
- ✅ Optimización de imágenes automática

### **3. CDN**
- ✅ CloudFront automático
- ✅ Distribución global automática

---

## 📝 **Comandos Útiles**

### **Build Local para Testing**
```bash
# Construir localmente
npm run build

# Verificar archivos generados
ls -la dist/

# Verificar configuración
cat dist/_redirects
cat dist/_headers
```

### **Verificar Configuración**
```bash
# Verificar que todos los archivos estén presentes
ls -la public/
# Debería mostrar: _redirects, _headers, .htaccess, 404.html
```

---

## 🎯 **Resultado Esperado**

Después de configurar AWS Amplify correctamente:

✅ **La aplicación se despliega automáticamente**  
✅ **Las rutas funcionan correctamente**  
✅ **Los assets se cargan sin problemas**  
✅ **HTTPS está habilitado automáticamente**  
✅ **CDN global está configurado**  
✅ **Monitoreo y logs están disponibles**  
✅ **La aplicación es completamente funcional**

---

## 📞 **Soporte**

Si tienes problemas:
1. **Revisar logs de build** en AWS Amplify Console
2. **Verificar configuración** de archivos
3. **Consultar documentación** de AWS Amplify
4. **Contactar soporte** de AWS si es necesario

#!/bin/bash

# Script de automatización de tests para VolleyApp
# Autor: Sistema de Tests Automatizados
# Fecha: $(date)

echo "🏐 VolleyApp - Tests Automatizados"
echo "=================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Asegúrate de estar en el directorio front/"
    exit 1
fi

# Verificar que Playwright está instalado
if ! command -v npx playwright &> /dev/null; then
    print_warning "Playwright no está instalado. Instalando..."
    npm install --save-dev @playwright/test
    npx playwright install
fi

print_status "Iniciando tests automatizados..."

# Función para ejecutar tests con manejo de errores
run_test_suite() {
    local test_name="$1"
    local test_command="$2"
    
    print_status "Ejecutando: $test_name"
    echo "----------------------------------------"
    
    if eval "$test_command"; then
        print_success "$test_name completado exitosamente"
        return 0
    else
        print_error "$test_name falló"
        return 1
    fi
}

# Contador de tests exitosos y fallidos
SUCCESS_COUNT=0
FAILED_COUNT=0

# 1. Tests de Landing Page
if run_test_suite "Landing Page Tests" "npx playwright test landing-page.spec.ts --reporter=list"; then
    ((SUCCESS_COUNT++))
else
    ((FAILED_COUNT++))
fi

echo ""

# 2. Tests de Backoffice (requiere servidor corriendo)
print_status "Verificando si el servidor está corriendo..."
if curl -s http://localhost:5174 > /dev/null; then
    print_success "Servidor detectado en puerto 5174"
    
    if run_test_suite "Backoffice Tests" "npx playwright test backoffice.spec.ts --reporter=list"; then
        ((SUCCESS_COUNT++))
    else
        ((FAILED_COUNT++))
    fi
else
    print_warning "Servidor no detectado. Iniciando servidor..."
    
    # Iniciar servidor en background
    npm run dev &
    SERVER_PID=$!
    
    # Esperar a que el servidor esté listo
    print_status "Esperando a que el servidor esté listo..."
    for i in {1..30}; do
        if curl -s http://localhost:5174 > /dev/null; then
            print_success "Servidor iniciado correctamente"
            break
        fi
        sleep 1
    done
    
    if run_test_suite "Backoffice Tests" "npx playwright test backoffice.spec.ts --reporter=list"; then
        ((SUCCESS_COUNT++))
    else
        ((FAILED_COUNT++))
    fi
    
    # Detener servidor
    kill $SERVER_PID 2>/dev/null
fi

echo ""

# 3. Tests End-to-End (requiere servidor y API corriendo)
print_status "Verificando si la API está corriendo..."
if curl -s http://localhost:5000 > /dev/null; then
    print_success "API detectada en puerto 5000"
    
    if run_test_suite "End-to-End Tests" "npx playwright test e2e-workflow.spec.ts --reporter=list"; then
        ((SUCCESS_COUNT++))
    else
        ((FAILED_COUNT++))
    fi
else
    print_warning "API no detectada. Los tests E2E pueden fallar."
    
    if run_test_suite "End-to-End Tests" "npx playwright test e2e-workflow.spec.ts --reporter=list"; then
        ((SUCCESS_COUNT++))
    else
        ((FAILED_COUNT++))
    fi
fi

echo ""
echo "=================================="
echo "🏐 RESUMEN DE TESTS"
echo "=================================="
echo ""

if [ $SUCCESS_COUNT -gt 0 ]; then
    print_success "Tests exitosos: $SUCCESS_COUNT"
fi

if [ $FAILED_COUNT -gt 0 ]; then
    print_error "Tests fallidos: $FAILED_COUNT"
fi

TOTAL_TESTS=$((SUCCESS_COUNT + FAILED_COUNT))
echo "Total de suites de tests: $TOTAL_TESTS"

if [ $FAILED_COUNT -eq 0 ]; then
    print_success "🎉 ¡Todos los tests pasaron exitosamente!"
    exit 0
else
    print_error "❌ Algunos tests fallaron. Revisa el reporte para más detalles."
    echo ""
    print_status "Para ver el reporte detallado ejecuta: npm run test:report"
    exit 1
fi

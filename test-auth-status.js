// Script para verificar el estado de autenticación
console.log('🔍 Verificando estado de autenticación...');

// Verificar si hay token en localStorage
const token = localStorage.getItem('voley_token');
const user = localStorage.getItem('voley_user');

console.log('📋 Estado actual:');
console.log('- Token existe:', !!token);
console.log('- Usuario existe:', !!user);

if (token) {
  console.log('- Token preview:', token.substring(0, 20) + '...');
}

if (user) {
  try {
    const userData = JSON.parse(user);
    console.log('- Usuario:', userData.name, `(${userData.role})`);
  } catch (e) {
    console.log('- Error parsing user data:', e);
  }
}

// Probar endpoint de asignaciones
async function testAssignmentsEndpoint() {
  console.log('\n🧪 Probando endpoint de asignaciones...');
  
  try {
    const response = await fetch('http://localhost:3000/api/assignments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    
    const data = await response.text();
    console.log('📡 Response data:', data);
    
    if (response.ok) {
      console.log('✅ Endpoint funcionando correctamente');
    } else {
      console.log('❌ Error en el endpoint');
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
}

// Ejecutar test
testAssignmentsEndpoint();

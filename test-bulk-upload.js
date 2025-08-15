/**
 * Script de prueba para la carga masiva de jugadores
 */

const API_CONFIG = {
  BASE_URL: 'http://192.168.1.15:3000/api',
};

// Token de prueba (reemplazar con un token válido)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OGZjZDM0NDM0ZDRlNDdiOGM1MDg3MSIsIm5hbWUiOiJBZG1pbmlzdHJhZG9yIiwiZW1haWwiOiJhZG1pbkB2b2xleS5jb20iLCJyb2xlIjoiYWRtaW5pc3RyYWRvciIsImlhdCI6MTc1NDI1NDY0NywiZXhwIjoxNzU0MzQxMDQ3fQ.99MQkrOh_4RrKXoWyrQpwW49ZWQgpm3Zg8UhJ6UTMgA';

// Datos de prueba
const testPlayers = [
  {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@test.com',
    birthDate: '2005-03-15',
    phone: '123456789',
    categoryId: '688fcda0b10d8185196c525d'
  },
  {
    firstName: 'María',
    lastName: 'González',
    email: 'maria.gonzalez@test.com',
    birthDate: '2006-07-22',
    phone: '987654321',
    categoryId: '688fcda0b10d8185196c525d'
  },
  {
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    email: 'carlos.rodriguez@test.com',
    birthDate: '2005-11-08',
    phone: '555666777',
    categoryId: '688fcda0b10d8185196c525d'
  }
];

async function testBulkUpload() {
  console.log('🧪 Testing bulk upload...');
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/players/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({
        players: testPlayers
      })
    });
    
    console.log('📊 Response status:', response.status);
    
    const data = await response.json();
    console.log('📄 Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Bulk upload successful!');
      console.log(`👥 Created: ${data.created} players`);
      if (data.errors && data.errors.length > 0) {
        console.log('⚠️ Errors:', data.errors);
      }
    } else {
      console.log('❌ Bulk upload failed');
      console.log('💬 Error:', data.msg);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return null;
  }
}

async function testGetPlayers() {
  console.log('\n📋 Testing get players...');
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/players`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    const data = await response.json();
    console.log('👥 Total players:', data.length);
    console.log('📄 Players:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('❌ Error getting players:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting bulk upload tests...\n');
  
  // Probar carga masiva
  await testBulkUpload();
  
  // Probar obtener jugadores
  await testGetPlayers();
  
  console.log('\n✨ Tests completed!');
}

// Ejecutar si se llama directamente
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testBulkUpload, testGetPlayers, runTests };
} else {
  runTests();
} 
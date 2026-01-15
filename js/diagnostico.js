/**
 * Script de diagnóstico para verificar la sincronización
 * Agregar en el <head> de las páginas para debugging
 */

console.log('=' . repeat(50));
console.log('🔍 DIAGNÓSTICO DE SINCRONIZACIÓN');
console.log('=' . repeat(50));

// 1. Verificar API_BASE
console.log('📍 Ubicación actual:', window.location.pathname);
console.log('🔌 API_BASE:', typeof API_BASE !== 'undefined' ? API_BASE : 'NO DEFINIDO');

// 2. Verificar funciones disponibles
const funcionesRequeridas = [
    'guardarAsistencia',
    'obtenerAsistencias',
    'guardarGasto',
    'obtenerGastos',
    'guardarEvento',
    'obtenerEventos',
    'mostrarNotificacion'
];

console.log('\n✅ FUNCIONES DISPONIBLES:');
funcionesRequeridas.forEach(func => {
    const existe = typeof window[func] === 'function';
    console.log(`  ${existe ? '✓' : '✗'} ${func}`);
});

// 3. Verificar localStorage
console.log('\n💾 ALMACENAMIENTO LOCAL:');
const respaldos = JSON.parse(localStorage.getItem('respaldos_sync') || '{}');
console.log(`  Respaldos pendientes: ${Object.keys(respaldos).length}`);
if (Object.keys(respaldos).length > 0) {
    console.log('  Detalles:', respaldos);
}

// 4. Verificar conexión a BD
console.log('\n🗄️ CONEXIÓN A BASE DE DATOS:');
fetch(API_BASE + 'obtener_gastos.php?club_id=1')
    .then(response => {
        if (response.ok) {
            console.log('  ✓ Conexión a BD exitosa');
            return response.json();
        } else {
            console.log('  ✗ Error HTTP ' + response.status);
        }
    })
    .then(data => {
        if (data && data.success) {
            console.log('  ✓ BD respondiendo correctamente');
            console.log('  Registros encontrados:', data.count);
        }
    })
    .catch(error => {
        console.warn('  ⚠ Error de conexión:', error.message);
        console.log('  Posibles causas:');
        console.log('    1. MySQL no está corriendo');
        console.log('    2. El servidor PHP no está activo');
        console.log('    3. Las credenciales en config.php son incorrectas');
    });

// 5. Función de prueba
window.pruebaSync = async function() {
    console.log('\n🧪 EJECUTANDO PRUEBA DE SINCRONIZACIÓN...\n');
    
    try {
        // Prueba 1: Guardar gasto
        console.log('Prueba 1: Guardando gasto de prueba...');
        const resultado1 = await guardarGasto(1, 'Prueba Sync', 50, 'gasto', null, 'Gasto de prueba');
        console.log('Resultado:', resultado1);
        
        // Prueba 2: Obtener gastos
        console.log('\nPrueba 2: Obteniendo gastos...');
        const resultado2 = await obtenerGastos(1);
        console.log('Total de registros:', resultado2.count);
        console.log('Primeros 3 registros:', resultado2.data.slice(0, 3));
        
    } catch (error) {
        console.error('❌ Error en prueba:', error);
    }
};

console.log('\n💡 TIPS:');
console.log('  • Ejecuta pruebaSync() en la consola para probar la sincronización');
console.log('  • Abre DevTools (F12) → Consola para ver este diagnóstico');
console.log('  • Si ves errores, revisa COMO_USAR_SINCRONIZACION.md');
console.log('\n' + '=' . repeat(50));

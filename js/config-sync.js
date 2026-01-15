/**
 * Configuración y utilidades para sincronización
 * Este archivo proporciona funciones auxiliares para migrar datos locales a la BD
 */

// Determinar la ruta de la API según la carpeta
function obtenerRutaAPI() {
    const path = window.location.pathname;
    
    if (path.includes('/Aventureros/') || path.includes('/Conquistadores/')) {
        return '../database/';
    } else if (path.includes('/Staff/') || path.includes('/Zona/')) {
        return '../database/';
    } else {
        return './database/';
    }
}

// Actualizar la variable API_BASE en sync.js dinámicamente
if (typeof API_BASE === 'undefined') {
    window.API_BASE = obtenerRutaAPI();
}

// Obtener ID del club desde la URL o sessionStorage
function obtenerIdClub() {
    const params = new URLSearchParams(window.location.search);
    const clubId = params.get('club_id') || sessionStorage.getItem('clubId');
    
    if (!clubId) {
        console.warn('⚠ No se encontró ID de club. Usar: ?club_id=1 en la URL');
    }
    
    return clubId;
}

// Obtener información del usuario actual
function obtenerUsuarioActual() {
    const userStr = sessionStorage.getItem('currentUser');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error('Error al parsear usuario:', e);
            return null;
        }
    }
    return null;
}

// Mostrar notificación de sincronización
function mostrarNotificacion(mensaje, tipo = 'info', duracion = 3000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.body.firstChild;
    document.body.insertBefore(alertDiv, container);
    
    setTimeout(() => {
        alertDiv.remove();
    }, duracion);
}

// Migrar datos del localStorage a la BD
async function migrarDatos() {
    const user = obtenerUsuarioActual();
    if (!user) {
        console.warn('No hay usuario autenticado');
        return;
    }
    
    try {
        mostrarNotificacion('🔄 Sincronizando datos...', 'info');
        
        // Migrar asistencias
        const asistenciasLocal = localStorage.getItem('attendance_data');
        if (asistenciasLocal) {
            const asistencias = JSON.parse(asistenciasLocal);
            let migradas = 0;
            
            for (let key in asistencias) {
                const registro = asistencias[key];
                if (registro.memberId && registro.date) {
                    await guardarAsistencia(
                        registro.memberId,
                        registro.date,
                        registro.status || 'presente'
                    );
                    migradas++;
                }
            }
            
            if (migradas > 0) {
                console.log(`✓ ${migradas} registros de asistencia migrados`);
            }
        }
        
        // Migrar eventos
        const eventosLocal = localStorage.getItem('eventos_zonales');
        if (eventosLocal) {
            const eventos = JSON.parse(eventosLocal);
            let migrados = 0;
            
            eventos.forEach(async (evento) => {
                if (evento.title) {
                    await guardarEvento(
                        evento.title,
                        evento.description || '',
                        evento.date || new Date().toISOString().split('T')[0],
                        obtenerIdClub() || 1
                    );
                    migrados++;
                }
            });
            
            if (migrados > 0) {
                console.log(`✓ ${migrados} eventos migrados`);
            }
        }
        
        // Migrar transacciones
        const transaccionesLocal = localStorage.getItem('transactions');
        if (transaccionesLocal) {
            const transacciones = JSON.parse(transaccionesLocal);
            let migradas = 0;
            
            transacciones.forEach(async (trans) => {
                if (trans.description && trans.amount) {
                    await guardarGasto(
                        obtenerIdClub() || 1,
                        trans.description,
                        parseFloat(trans.amount),
                        trans.type || 'gasto',
                        trans.date || new Date().toISOString().split('T')[0]
                    );
                    migradas++;
                }
            });
            
            if (migradas > 0) {
                console.log(`✓ ${migradas} transacciones migradas`);
            }
        }
        
        mostrarNotificacion('✓ Datos sincronizados exitosamente', 'success');
    } catch (error) {
        console.error('Error al migrar datos:', error);
        mostrarNotificacion('✗ Error en la sincronización', 'danger');
    }
}

// Cargar datos desde la BD en lugar del localStorage
async function cargarDesdeBD(tipo, clubId) {
    try {
        switch(tipo) {
            case 'asistencias':
                return await obtenerAsistencias(clubId);
            case 'eventos':
                return await obtenerEventos(clubId);
            case 'gastos':
                return await obtenerGastos(clubId);
            default:
                console.warn('Tipo de dato desconocido:', tipo);
                return [];
        }
    } catch (error) {
        console.error('Error al cargar desde BD:', error);
        return [];
    }
}

// Función para reemplazar localStorage.getItem con datos de la BD
// Esto permite compatibilidad hacia atrás mientras migramos
async function obtenerDatos(clave, clubId = null) {
    clubId = clubId || obtenerIdClub();
    
    // Primero intenta desde la BD
    try {
        if (clave.includes('attendance')) {
            return await obtenerAsistencias(clubId);
        } else if (clave.includes('evento')) {
            return await obtenerEventos(clubId);
        } else if (clave.includes('transaction')) {
            return await obtenerGastos(clubId);
        }
    } catch (error) {
        console.warn('No se pudo obtener desde BD, usando localStorage:', error.message);
    }
    
    // Si falla, usa localStorage como respaldo
    return JSON.parse(localStorage.getItem(clave) || '[]');
}

// Exportar configuración
console.log('✓ Configuración de sincronización cargada');

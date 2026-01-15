/**
 * Configuración y utilidades para sincronización
 * Este archivo proporciona funciones auxiliares para migrar datos locales a la BD
 */

// Verificar que sync.js esté cargado
if (typeof API_BASE === 'undefined') {
    console.error('❌ ERROR: sync.js no está cargado. Asegúrate de incluir <script src="../js/sync.js"></script>');
}

// Obtener ID del club desde la URL o sessionStorage
function obtenerIdClub() {
    const params = new URLSearchParams(window.location.search);
    const clubId = params.get('club_id') || sessionStorage.getItem('clubId');
    
    // Si no se encuentra, intenta detectarlo del rol del usuario
    if (!clubId) {
        const user = obtenerUsuarioActual();
        if (user) {
            if (user.role && user.role.includes('aventureros')) return '1';
            if (user.role && user.role.includes('conquistador')) return '2';
            if (user.role && user.role.includes('guias')) return '3';
        }
        console.warn('⚠ No se encontró ID de club. Usando club_id=1 por defecto');
        return '1';
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
    // Crear elemento si Bootstrap está disponible
    if (typeof bootstrap !== 'undefined') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, duracion);
    } else {
        // Fallback si Bootstrap no está disponible
        console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    }
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
                if (trans.descripcion && trans.monto) {
                    await guardarGasto(
                        obtenerIdClub() || 1,
                        trans.descripcion,
                        parseFloat(trans.monto),
                        trans.tipo || 'gasto',
                        trans.fecha || new Date().toISOString().split('T')[0]
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


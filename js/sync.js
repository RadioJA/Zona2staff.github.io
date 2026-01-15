/**
 * Librería de sincronización con la base de datos
 * Permite guardar y obtener registros desde cualquier dispositivo
 * Con respaldo local si no hay conexión
 */

// Detectar automáticamente la ruta de la API
function obtenerRutaAPI() {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/Aventureros/') || 
        currentPath.includes('/Conquistadores/') ||
        currentPath.includes('/Staff/') ||
        currentPath.includes('/Zona/')) {
        return '../database/';
    }
    return './database/';
}

const API_BASE = obtenerRutaAPI();
console.log('🔌 API_BASE configurada a:', API_BASE);

// ============ VERIFICAR CONEXIÓN ============

async function verificarConexion() {
    try {
        const response = await fetch(`${API_BASE}config.php`, {
            method: 'HEAD',
            cache: 'no-cache'
        });
        return response.ok;
    } catch {
        return false;
    }
}

// ============ ASISTENCIAS ============

async function guardarAsistencia(miembro_id, fecha, estado) {
    try {
        const response = await fetch(`${API_BASE}guardar_asistencia.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                miembro_id: miembro_id,
                fecha: fecha,
                estado: estado
            })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log('✓ Asistencia guardada en BD:', data.message);
            // Limpiar respaldo local
            limpiarRespaldoLocal('asistencia_' + miembro_id);
            return data;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.warn('⚠ Sin conexión BD, usando respaldo local:', error.message);
        // Guardar en respaldo local
        guardarRespaldoLocal('asistencia_' + miembro_id, {
            miembro_id, fecha, estado
        });
        return { success: false, local: true, error: 'Guardado localmente, se sincronizará' };
    }
}

async function obtenerAsistencias(clubId, fecha = null) {
    try {
        let url = `${API_BASE}obtener_asistencia.php?club_id=${clubId}`;
        if (fecha) url += `&fecha=${fecha}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            console.log('✓ Asistencias obtenidas de BD:', data.count);
            return data.data;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.warn('⚠ Sin conexión BD, usando respaldo local');
        return obtenerRespaldoLocal('asistencia_', 'array');
    }
}

// ============ EVENTOS ============

async function guardarEvento(titulo, descripcion, fecha, clubId, ubicacion = null) {
    try {
        const response = await fetch(`${API_BASE}guardar_evento.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                titulo: titulo,
                descripcion: descripcion,
                fecha: fecha,
                club_id: clubId,
                ubicacion: ubicacion
            })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log('✓ Evento guardado en BD:', data.message);
            limpiarRespaldoLocal('evento_' + clubId);
            return data;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.warn('⚠ Sin conexión BD, usando respaldo local:', error.message);
        guardarRespaldoLocal('evento_' + clubId, {
            titulo, descripcion, fecha, club_id: clubId, ubicacion
        });
        return { success: false, local: true, error: 'Guardado localmente' };
    }
}

async function obtenerEventos(clubId) {
    try {
        const response = await fetch(`${API_BASE}obtener_eventos.php?club_id=${clubId}`);
        const data = await response.json();
        
        if (data.success) {
            console.log('✓ Eventos obtenidos de BD:', data.count);
            return data.data;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.warn('⚠ Sin conexión BD, usando respaldo local');
        return obtenerRespaldoLocal('evento_', 'array');
    }
}

// ============ FINANZAS (GASTOS E INGRESOS) ============

async function guardarGasto(clubId, concepto, monto, tipo = 'gasto', fecha = null, descripcion = null) {
    try {
        if (!fecha) fecha = new Date().toISOString().split('T')[0];
        
        const response = await fetch(`${API_BASE}guardar_gasto.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                club_id: clubId,
                concepto: concepto,
                monto: monto,
                tipo: tipo,
                fecha: fecha,
                descripcion: descripcion
            })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log('✓ Gasto guardado en BD:', data.message);
            limpiarRespaldoLocal('gasto_' + clubId);
            return data;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.warn('⚠ Sin conexión BD, usando respaldo local:', error.message);
        guardarRespaldoLocal('gasto_' + clubId, {
            club_id: clubId, concepto, monto, tipo, fecha, descripcion
        });
        return { success: false, local: true, error: 'Guardado localmente' };
    }
}

async function obtenerGastos(clubId, tipo = null, fechaInicio = null, fechaFin = null) {
    try {
        let url = `${API_BASE}obtener_gastos.php?club_id=${clubId}`;
        if (tipo) url += `&tipo=${tipo}`;
        if (fechaInicio) url += `&fecha_inicio=${fechaInicio}`;
        if (fechaFin) url += `&fecha_fin=${fechaFin}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            console.log('✓ Gastos obtenidos de BD:', data.count);
            return data;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.warn('⚠ Sin conexión BD, usando respaldo local');
        const gastos = obtenerRespaldoLocal('gasto_', 'array');
        return { data: gastos, resumen: { total_gastos: 0, total_ingresos: 0, balance: 0 } };
    }
}

// ============ RESPALDO LOCAL ============

function guardarRespaldoLocal(clave, datos) {
    try {
        let respaldos = JSON.parse(localStorage.getItem('respaldos_sync')) || {};
        respaldos[clave] = {
            datos: datos,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('respaldos_sync', JSON.stringify(respaldos));
        console.log('💾 Guardado en respaldo local:', clave);
    } catch (error) {
        console.error('Error al guardar respaldo local:', error);
    }
}

function obtenerRespaldoLocal(prefijo, tipo = 'objeto') {
    try {
        const respaldos = JSON.parse(localStorage.getItem('respaldos_sync')) || {};
        
        if (tipo === 'array') {
            const resultados = [];
            for (let clave in respaldos) {
                if (clave.startsWith(prefijo)) {
                    resultados.push(respaldos[clave].datos);
                }
            }
            return resultados;
        } else {
            return respaldos[prefijo] ? respaldos[prefijo].datos : null;
        }
    } catch (error) {
        console.error('Error al obtener respaldo local:', error);
        return tipo === 'array' ? [] : null;
    }
}

function limpiarRespaldoLocal(clave) {
    try {
        let respaldos = JSON.parse(localStorage.getItem('respaldos_sync')) || {};
        delete respaldos[clave];
        localStorage.setItem('respaldos_sync', JSON.stringify(respaldos));
    } catch (error) {
        console.error('Error al limpiar respaldo local:', error);
    }
}

async function sincronizarRespaldosLocales() {
    try {
        const respaldos = JSON.parse(localStorage.getItem('respaldos_sync')) || {};
        let sincronizados = 0;
        
        for (let clave in respaldos) {
            const datos = respaldos[clave].datos;
            let resultado;
            
            if (clave.startsWith('asistencia_')) {
                resultado = await guardarAsistencia(datos.miembro_id, datos.fecha, datos.estado);
            } else if (clave.startsWith('evento_')) {
                resultado = await guardarEvento(datos.titulo, datos.descripcion, datos.fecha, datos.club_id, datos.ubicacion);
            } else if (clave.startsWith('gasto_')) {
                resultado = await guardarGasto(datos.club_id, datos.concepto, datos.monto, datos.tipo, datos.fecha, datos.descripcion);
            }
            
            if (resultado && resultado.success) {
                limpiarRespaldoLocal(clave);
                sincronizados++;
            }
        }
        
        if (sincronizados > 0) {
            console.log(`✓ ${sincronizados} registros sincronizados desde respaldo local`);
        }
    } catch (error) {
        console.error('Error al sincronizar respaldos:', error);
    }
}

// Sincronizar respaldos cuando se recupere conexión
window.addEventListener('online', sincronizarRespaldosLocales);
window.addEventListener('load', async () => {
    if (navigator.onLine) {
        await sincronizarRespaldosLocales();
    }
});

// ============ UTILIDADES ============

function formatoMoneda(monto) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(monto);
}

function formatoFecha(fecha) {
    return new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(fecha));
}

/**
 * Librería de sincronización con la base de datos
 * Permite guardar y obtener registros desde cualquier dispositivo
 */

const API_BASE = './database/';

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
            console.log('✓ Asistencia guardada:', data.message);
            return data;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error al guardar asistencia:', error);
        return { success: false, error: error.message };
    }
}

async function obtenerAsistencias(clubId, fecha = null) {
    try {
        let url = `${API_BASE}obtener_asistencia.php?club_id=${clubId}`;
        if (fecha) url += `&fecha=${fecha}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            console.log('✓ Asistencias obtenidas:', data.count);
            return data.data;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error al obtener asistencias:', error);
        return [];
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
            console.log('✓ Evento guardado:', data.message);
            return data;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error al guardar evento:', error);
        return { success: false, error: error.message };
    }
}

async function obtenerEventos(clubId) {
    try {
        const response = await fetch(`${API_BASE}obtener_eventos.php?club_id=${clubId}`);
        const data = await response.json();
        
        if (data.success) {
            console.log('✓ Eventos obtenidos:', data.count);
            return data.data;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        return [];
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
            console.log('✓ Registro guardado:', data.message);
            return data;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error al guardar gasto:', error);
        return { success: false, error: error.message };
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
            console.log('✓ Gastos obtenidos:', data.count);
            return data;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error al obtener gastos:', error);
        return { data: [], resumen: { total_gastos: 0, total_ingresos: 0, balance: 0 } };
    }
}

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

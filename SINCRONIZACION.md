# Sincronización de Registros - Guía de Uso

Los registros ahora se guardan en la base de datos MySQL y pueden verse desde cualquier dispositivo.

## � Funcionamiento Automático

- Los datos se guardan **automáticamente en la BD** cuando hay conexión
- Si **no hay conexión**, se guardan localmente y se sincronizan cuando se recupere la conexión
- Los registros son accesibles desde **PC, tablet, teléfono, etc.**

## 📦 Archivos Necesarios

### Backend (PHP):
```
database/guardar_asistencia.php
database/obtener_asistencia.php
database/guardar_evento.php
database/obtener_eventos.php
database/guardar_gasto.php
database/obtener_gastos.php
```

### Frontend (JavaScript):
```
js/sync.js                    ← Librería principal de sincronización
js/config-sync.js             ← Configuración y utilidades
```

## 🚀 Integración en tus Páginas HTML

### Paso 1: Incluir los scripts
Agregar esto en el `<head>` de tus archivos HTML:

```html
<!-- Librería de sincronización -->
<script src="../js/sync.js"></script>
<script src="../js/config-sync.js"></script>
```

### Paso 2: Usar en los formularios
Reemplazar `localStorage.setItem()` con `await guardarAsistencia()`, etc.

**Antes (localStorage - solo local):**
```javascript
localStorage.setItem('attendance', JSON.stringify(data));
```

**Después (BD - accesible desde cualquier dispositivo):**
```javascript
await guardarAsistencia(miembro_id, fecha, estado);
```

### Paso 3: Migrar datos existentes
Si tienes datos en localStorage, ejecutar en consola:

```javascript
await migrarDatos();  // Migra todo a la BD
```

## 📋 Funciones Disponibles

### Asistencias
```javascript
// Guardar
await guardarAsistencia(miembro_id, fecha, estado);
// Obtener
const registros = await obtenerAsistencias(club_id);
```

### Eventos
```javascript
// Guardar
await guardarEvento(titulo, descripcion, fecha, club_id, ubicacion);
// Obtener
const eventos = await obtenerEventos(club_id);
```

### Finanzas
```javascript
// Guardar gasto/ingreso
await guardarGasto(club_id, concepto, monto, tipo, fecha, descripcion);
// Obtener
const resultado = await obtenerGastos(club_id, tipo, fechaInicio, fechaFin);
// resultado.data → array de registros
// resultado.resumen → {total_gastos, total_ingresos, balance}
```

## 💻 Ejemplos Prácticos

### Ejemplo 1: Registrar Asistencia
```html
<button onclick="registrarAsistencia()">Marcar Presente</button>

<script src="../js/sync.js"></script>
<script src="../js/config-sync.js"></script>
<script>
async function registrarAsistencia() {
    const resultado = await guardarAsistencia(
        1,                           // ID del miembro
        new Date().toISOString().split('T')[0],  // Fecha de hoy
        'presente'                   // Estado
    );
    
    if (resultado.success) {
        mostrarNotificacion('✓ Asistencia registrada', 'success');
    } else if (resultado.local) {
        mostrarNotificacion('⚠ Guardado localmente, se sincronizará', 'warning');
    } else {
        mostrarNotificacion('✗ Error: ' + resultado.error, 'danger');
    }
}
</script>
```

### Ejemplo 2: Listar Asistencias
```javascript
async function mostrarAsistencias() {
    const clubId = 1;  // o obtenerIdClub() desde config-sync.js
    const asistencias = await obtenerAsistencias(clubId);
    
    asistencias.forEach(asistencia => {
        console.log(`${asistencia.nombre} - ${asistencia.fecha} - ${asistencia.estado}`);
    });
}
```

### Ejemplo 3: Registrar Gasto
```javascript
async function registrarGasto() {
    const resultado = await guardarGasto(
        1,                    // club_id
        'Uniforme',           // concepto
        250.50,               // monto
        'gasto',              // tipo: 'gasto' o 'ingreso'
        '2026-01-15',         // fecha
        'Compra de 10 uniformes'  // descripción
    );
    
    if (resultado.success) {
        alert('✓ Gasto registrado en la BD');
    }
}
```

### Ejemplo 4: Ver Resumen Financiero
```javascript
async function verFinanzas() {
    const resultado = await obtenerGastos(1);  // club_id = 1
    
    console.log('Total Gastos:', formatoMoneda(resultado.resumen.total_gastos));
    console.log('Total Ingresos:', formatoMoneda(resultado.resumen.total_ingresos));
    console.log('Balance:', formatoMoneda(resultado.resumen.balance));
    
    // Listar todos los movimientos
    resultado.data.forEach(registro => {
        console.log(`${registro.fecha} | ${registro.concepto} | ${formatoMoneda(registro.monto)} (${registro.tipo})`);
    });
}
```

## 🛡️ Funciona Sin Internet

Si no hay conexión:
1. Los datos se guardan en **localStorage local**
2. Cuando se recupere la conexión, se **sincronizan automáticamente** con la BD
3. **No pierdes ningún dato**

Para forzar la sincronización manual:
```javascript
await sincronizarRespaldosLocales();
```

## ⚙️ Configuración de la Base de Datos

### Paso 1: Crear la base de datos
```bash
mysql -u root -p < database/schema.sql
```

### Paso 2: Verificar config.php
```php
// database/config.php
define('DB_HOST', 'localhost');    // tu servidor MySQL
define('DB_USER', 'root');          // tu usuario
define('DB_PASS', '');              // tu contraseña
define('DB_NAME', 'zona2_db');      // nombre de la BD
```

### Paso 3: Ejecutar con un servidor PHP
```bash
# Opción 1: Servidor local PHP (desde la carpeta del proyecto)
php -S localhost:8000

# Opción 2: Apache/Nginx (configura el virtual host)

# Luego accede a: http://localhost:8000
```

## 🔗 Actualizar URL de Club

Para que funcione correctamente, añade el ID del club en la URL:

```
asistencia_avent.html?club_id=1
inscripcion_avent.html?club_id=1
ingreso_gastos_avent.html?club_id=1
```

O establécelo en sessionStorage:
```javascript
sessionStorage.setItem('clubId', '1');
```

## 📱 Verificar Sincronización en Console

Abre DevTools (F12) → Console y verás:
```
✓ Asistencia guardada en BD: Asistencia guardada correctamente
✓ Asistencias obtenidas de BD: 5
⚠ Sin conexión BD, usando respaldo local
💾 Guardado en respaldo local: asistencia_1
```

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| No aparecen datos de otros dispositivos | Verifica que `club_id` sea el mismo |
| Error "Error de conexión" | Verifica que MySQL esté corriendo y config.php sea correcto |
| Los datos no se sincronizan | Abre Console (F12) para ver errores específicos |
| Necesito limpiar datos locales | `localStorage.removeItem('respaldos_sync')` |

## 🚀 Próximos Pasos

1. ✅ Integrar `sync.js` en asistencia_avent.html
2. ✅ Integrar en ingreso_gastos_avent.html
3. ✅ Integrar en eventos_locales_avent.html
4. ✅ Hacer lo mismo para Conquistadores
5. ✅ Hacer lo mismo para Staff

¿Necesitas ayuda integrando en algún archivo específico?


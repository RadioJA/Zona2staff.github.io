# Sincronización de Registros - Guía de Uso

Los registros ahora se guardan en la base de datos MySQL y pueden verse desde cualquier dispositivo.

## 📦 Archivos Creados

### Backend (PHP):
- `database/guardar_asistencia.php` - Guarda registros de asistencia
- `database/obtener_asistencia.php` - Obtiene registros de asistencia
- `database/guardar_evento.php` - Guarda eventos
- `database/obtener_eventos.php` - Obtiene eventos
- `database/guardar_gasto.php` - Guarda gastos e ingresos
- `database/obtener_gastos.php` - Obtiene gastos e ingresos

### Frontend (JavaScript):
- `js/sync.js` - Librería para sincronizar datos con la base de datos

## 🚀 Cómo Usar en tus Páginas

### 1. Incluir la librería sync.js en tu HTML:
```html
<script src="../js/sync.js"></script>
```

### 2. Guardar Asistencia:
```javascript
// Guardar asistencia de un miembro
await guardarAsistencia(
    miembro_id,      // ID del miembro
    '2026-01-15',    // Fecha (opcional, usa hoy por defecto)
    'presente'       // Estado: 'presente', 'ausente', 'tardanza'
);
```

### 3. Obtener Asistencias:
```javascript
// Obtener todas las asistencias de un club
const asistencias = await obtenerAsistencias(club_id);

// O con una fecha específica
const asistencias = await obtenerAsistencias(club_id, '2026-01-15');
```

### 4. Guardar Evento:
```javascript
await guardarEvento(
    'Nombre del Evento',     // Título
    'Descripción del evento', // Descripción
    '2026-01-20',             // Fecha
    club_id,                  // ID del club
    'Ubicación'               // Ubicación (opcional)
);
```

### 5. Obtener Eventos:
```javascript
const eventos = await obtenerEventos(club_id);
```

### 6. Guardar Gasto o Ingreso:
```javascript
// Guardar un gasto
await guardarGasto(
    club_id,              // ID del club
    'Concepto',           // Ej: 'Compra de uniformes'
    150.00,               // Monto
    'gasto',              // Tipo: 'gasto' o 'ingreso'
    '2026-01-15',         // Fecha (opcional)
    'Descripción'         // Descripción (opcional)
);
```

### 7. Obtener Gastos e Ingresos:
```javascript
// Obtener todos
const resultado = await obtenerGastos(club_id);
console.log(resultado.data);      // Array de gastos
console.log(resultado.resumen);   // { total_gastos, total_ingresos, balance }

// Con filtros
const resultado = await obtenerGastos(
    club_id,
    'gasto',              // Tipo: 'gasto', 'ingreso'
    '2026-01-01',         // Fecha inicio (opcional)
    '2026-12-31'          // Fecha fin (opcional)
);
```

## 📊 Ejemplo Completo - Registrar Asistencia

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <title>Registro de Asistencia</title>
</head>
<body>
    <button onclick="registrarAsistencia()">Registrar Asistencia</button>

    <script src="../js/sync.js"></script>
    <script>
        async function registrarAsistencia() {
            // Guardar asistencia
            const resultado = await guardarAsistencia(1, '2026-01-15', 'presente');
            
            if (resultado.success) {
                alert('✓ Asistencia registrada');
                // Actualizar lista de asistencias
                const asistencias = await obtenerAsistencias(1);
                console.log(asistencias);
            } else {
                alert('✗ Error: ' + resultado.error);
            }
        }
    </script>
</body>
</html>
```

## 🔧 Configuración de la Base de Datos

Antes de usar, asegúrate de:

1. **Ejecutar el schema.sql**:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

2. **Verificar config.php**:
   - Host: `localhost`
   - Usuario: `root`
   - Contraseña: (tu contraseña MySQL)
   - Base de datos: `zona2_db`

3. **Si tu servidor está en la nube**, actualiza `config.php` con los datos de conexión correctos

## ⚠️ Notas Importantes

- Todos los datos se sincronizan automáticamente con la base de datos
- Los registros son accesibles desde cualquier dispositivo conectado al servidor
- Si no hay conexión a internet, usa `localStorage` temporalmente como respaldo
- Los datos se guardan en formato JSON en las respuestas

## 📱 Sincronización Offline (Próximamente)

Para funcionar sin internet, puedes agregar:
```javascript
// Guardar en localStorage si no hay conexión
try {
    // Intentar guardar en la BD
    await guardarAsistencia(...);
} catch (error) {
    // Si falla, guardar localmente
    let pendientes = JSON.parse(localStorage.getItem('pendientes')) || [];
    pendientes.push({tipo: 'asistencia', datos: ...});
    localStorage.setItem('pendientes', JSON.stringify(pendientes));
}
```

## 🆘 Troubleshooting

**Error: "Error de conexión"**
- Verifica que MySQL esté corriendo
- Revisa la configuración en `database/config.php`

**Error: "Table doesn't exist"**
- Ejecuta `database/schema.sql` para crear las tablas

**Error: CORS**
- Es normal en desarrollo, usa un servidor local (PHP, Node, etc.)

---

¿Necesitas ayuda integrando esto en alguna página específica?

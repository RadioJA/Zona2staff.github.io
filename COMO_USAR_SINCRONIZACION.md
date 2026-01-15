# Instrucciones para Activar Sincronización en el Proyecto

## ✅ Archivos YA Actualizados

Los siguientes archivos ya tienen sincronización habilitada:

- ✓ `Aventureros/asistencia_avent.html`
- ✓ `Aventureros/ingreso_gastos_avent.html`
- ✓ `Conquistadores/asistencia_conquist.html`
- ✓ `Conquistadores/ingreso_gastos_conquist.html`

## 📋 Pasos Para Ver Datos desde Otros Dispositivos

### 1. **Asegúrate que MySQL está corriendo**
```bash
# En Windows
net start MySQL80  # O el nombre de tu servicio

# O abre MySQL Workbench y verifica la conexión
```

### 2. **Verifica que config.php está correcto**
```php
// database/config.php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');  // Tu contraseña
define('DB_NAME', 'zona2_db');
```

### 3. **Crea la base de datos**
```bash
mysql -u root -p < database/schema.sql
```

### 4. **Ejecuta un servidor PHP**
Desde la carpeta del proyecto:
```bash
php -S localhost:8000
```

Luego accede a: `http://localhost:8000`

### 5. **Registra datos desde la PC**
- Abre en tu navegador: `http://localhost:8000/index.html`
- Inicia sesión
- Registra asistencia, eventos o gastos
- Los datos se guardarán en **MySQL**

### 6. **Accede desde otro dispositivo**
- Desde tu celular/tablet, accede a: `http://IP_DE_TU_PC:8000`
- Inicia sesión con la misma cuenta
- ¡Verás todos los registros sincronizados! 🎉

## 🔍 Para Encontrar tu IP

**En Windows:**
```bash
ipconfig
```
Busca "IPv4 Address" (ej: 192.168.1.100)

## 🧪 Prueba desde DevTools

1. Abre el navegador (F12)
2. Ve a la pestaña "Console"
3. Ejecuta:

```javascript
// Ver datos guardados
const datos = await obtenerGastos(1);
console.log(datos);

// Guardar un gasto de prueba
await guardarGasto(1, 'Prueba', 100, 'gasto');

// Ver asistencias
const asistencias = await obtenerAsistencias(1);
console.log(asistencias);
```

## ⚠️ Si No Ves los Datos

1. **Abre la Console (F12)**
   - Si ves error "Cannot POST", MySQL no está conectado
   - Si ves "CORS error", usa un servidor PHP, no abras el HTML directamente

2. **Verifica la conexión a BD**
   ```javascript
   // En Console
   const conectado = await verificarConexion();
   console.log(conectado);
   ```

3. **Limpia datos locales**
   ```javascript
   // En Console
   localStorage.clear();
   ```

## 🚀 Próximos Archivos a Actualizar

Para integrar en el resto del proyecto, sigue este patrón:

### En el `<head>`
```html
<!-- Agregar después de los scripts de Bootstrap -->
<script src="../js/sync.js"></script>
<script src="../js/config-sync.js"></script>
```

### En las funciones de Guardar
Cambia:
```javascript
// ❌ Viejo
localStorage.setItem('datos', JSON.stringify(datos));

// ✅ Nuevo
await guardarGasto(clubId, concepto, monto, tipo, fecha);
// o
await guardarAsistencia(miembro_id, fecha, estado);
// o
await guardarEvento(titulo, descripcion, fecha, club_id);
```

### En las funciones de Cargar
Cambia:
```javascript
// ❌ Viejo
const datos = JSON.parse(localStorage.getItem('datos'));

// ✅ Nuevo
const datos = await obtenerGastos(clubId);
// o
const datos = await obtenerAsistencias(clubId);
// o
const datos = await obtenerEventos(clubId);
```

## 📊 Información sobre Club IDs

- **Aventureros**: club_id = 1
- **Conquistadores**: club_id = 2
- **Guías**: club_id = 3

Si no sabes el club_id, usa `obtenerIdClub()` que está en `config-sync.js`

## ✨ Beneficios

- ✓ Los datos se guardan en una BD central
- ✓ Accesibles desde cualquier dispositivo
- ✓ Sincronización automática
- ✓ Respaldo local si no hay conexión
- ✓ Reportes y análisis en tiempo real

## 🆘 Soporte

Si algo no funciona:
1. Revisa la Console (F12)
2. Verifica que MySQL esté corriendo
3. Verifica que config.php sea correcto
4. Consulta SINCRONIZACION.md para más detalles

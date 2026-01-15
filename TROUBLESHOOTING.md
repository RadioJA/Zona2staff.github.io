# Guía de Troubleshooting - No se ven registros en otros dispositivos

## 🔍 Paso 1: Verificar que todo esté configurado correctamente

### 1.1 Abre DevTools (F12) en tu navegador
- Vete a la pestaña **Console**
- Deberías ver mensajes de diagnóstico como:
  ```
  🔍 DIAGNÓSTICO DE SINCRONIZACIÓN
  📍 Ubicación actual: /Aventureros/asistencia_avent.html
  🔌 API_BASE: ../database/
  ```

### 1.2 Si VES los mensajes de diagnóstico:
✓ Los scripts están cargando correctamente

### 1.3 Si NO ves los mensajes:
✗ Los scripts `sync.js`, `config-sync.js` o `diagnostico.js` no se están cargando
- Verifica que están en la carpeta `js/`
- Verifica que las rutas en el HTML son correctas

## 🔧 Paso 2: Verificar la conexión a la BD

### 2.1 En la Console (F12), ejecuta:
```javascript
fetch('../database/obtener_gastos.php?club_id=1')
    .then(r => r.json())
    .then(d => console.log(d))
    .catch(e => console.error(e))
```

### 2.2 Qué significan los resultados:

**Si ves:**
```json
{"success": true, "data": [...], "count": 5}
```
✓ **BD está funcionando correctamente**

**Si ves error:**
```
Error: Failed to fetch
TypeError: Cannot POST
```
✗ **Problemas:**
- MySQL no está corriendo
- El servidor PHP no está activo
- Las credenciales en `config.php` son incorrectas

## 🚀 Paso 3: Probar la sincronización

### 3.1 Ejecuta en la Console:
```javascript
pruebaSync()
```

Deberías ver:
```
🧪 EJECUTANDO PRUEBA DE SINCRONIZACIÓN...
Prueba 1: Guardando gasto de prueba...
{success: true, message: "Registro guardado correctamente", id: 123}

Prueba 2: Obteniendo gastos...
Total de registros: 25
Primeros 3 registros: [...]
```

### 3.2 Si la prueba falla:
- Revisa los errores en la Console
- Verifica MySQL esté corriendo
- Verifica config.php

## 📱 Paso 4: Sincronizar desde otro dispositivo

### 4.1 Si todo funciona en la prueba:
1. Registra un gasto desde tu PC
2. En DevTools Console, deberías ver:
   ```
   ✓ Gasto guardado en BD: Registro guardado correctamente
   ```
3. Abre la misma página desde tu celular
4. Deberías ver el gasto registrado

### 4.2 Si no ves el gasto en el celular:
- Verifica que estés usando la misma `club_id`
- Verifica que ambos dispositivos se conecten al mismo servidor
- Recarga la página en el celular (F5)

## 🐛 Errores Comunes

### Error: "Failed to fetch"
```
Causas:
1. MySQL no está corriendo
2. Servidor PHP no está activo (ejecuta: php -S localhost:8000)
3. Firewall bloqueando puerto 8000
```

**Solución:**
```bash
# Verifica MySQL
mysql -u root -p
# Si no funciona, inicia MySQL

# Inicia servidor PHP
cd c:\ruta\al\proyecto
php -S localhost:8000

# Accede desde navegador
http://localhost:8000
```

### Error: "Cannot POST to /database/guardar_gasto.php"
```
Causas:
1. Archivo PHP no existe
2. Ruta API_BASE es incorrecta
3. No hay permisos para ejecutar PHP
```

**Solución:**
- Verifica que `database/guardar_gasto.php` existe
- Verifica que `API_BASE` en Console es correcto
- En Windows, MySQL y PHP deben estar en PATH

### Datos no se sincronizan pero no hay error
```
Causas:
1. club_id incorrecto
2. Datos se guardan localmente pero no en BD
3. BD está llena o corrupta
```

**Solución:**
```javascript
// En Console, verifica el club_id
obtenerIdClub()

// Verifica respaldos locales
JSON.parse(localStorage.getItem('respaldos_sync'))

// Limpia respaldos si es necesario
localStorage.removeItem('respaldos_sync')
```

## ✅ Checklist de Verificación

Marca cada paso:

- [ ] Scripts `sync.js`, `config-sync.js`, `diagnostico.js` están en `js/`
- [ ] Los scripts están incluidos en el HTML con rutas correctas
- [ ] MySQL está corriendo (`net start MySQL80` en Windows)
- [ ] Ejecute `php -S localhost:8000` desde la carpeta del proyecto
- [ ] Accedo a `http://localhost:8000` en el navegador
- [ ] DevTools Console muestra "DIAGNÓSTICO DE SINCRONIZACIÓN"
- [ ] Console muestra `✓ Funciones disponibles` para todas las funciones
- [ ] `pruebaSync()` en Console funciona sin errores
- [ ] Los datos aparecen en la BD desde otro dispositivo

## 📞 Si nada funciona:

1. Abre DevTools Console (F12)
2. Copia TODO el contenido de la Console (click derecho → Select All → Copy)
3. Verifica que tengas:
   - MySQL corriendo
   - Servidor PHP corriendo
   - Las rutas correctas en HTML

## 🔗 Próximos pasos:

Si todo funciona correctamente:
- Los datos se sincronizarán automáticamente
- Puedes acceder desde PC, celular, tablet, etc.
- Los cambios se ven en tiempo real

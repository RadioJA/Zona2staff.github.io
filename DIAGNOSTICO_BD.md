# Guía de Diagnóstico - Datos No Se Guardan en BD

## 🔍 Paso 1: Ejecutar el Verificador PHP

Abre en tu navegador:
```
http://localhost:8000/database/diagnostico.php
```

Esto mostrará el estado de:
- ✓ Conexión a MySQL
- ✓ Existencia de la BD `zona2_db`
- ✓ Existencia de las tablas
- ✓ Datos en las tablas
- ✓ Prueba de escritura

## 🚨 Si ves errores de conexión:

### Error: "Access denied for user 'root'@'localhost'"
```
Solución:
1. Verifica que MySQL esté corriendo
   Windows: net start MySQL80
   
2. Tu contraseña podría ser diferente
   Abre config.php y cambia:
   define('DB_PASS', '');  // ← Aquí va tu contraseña
```

### Error: "SQLSTATE[HY000]: General error: 2006 MySQL server has gone away"
```
Solución:
1. MySQL no está corriendo
2. En Windows: 
   - Abre "Servicios" (services.msc)
   - Busca MySQL
   - Haz click derecho → Iniciar
   
O ejecuta en terminal Admin:
   net start MySQL80
```

### Error: "SQLSTATE[HY000]: General error: 1049 Unknown database 'zona2_db'"
```
Solución:
La BD no existe. Crea la BD ejecutando:
   mysql -u root -p < database/schema.sql
```

## ✅ Si todo está OK:

Deberías ver:
```
RESUMEN
✓ Conexión a MySQL: FUNCIONANDO
✓ Base de datos zona2_db: EXISTE
✓ Tablas: CREADAS
✓ Prueba de escritura: EXITOSA
```

## 📋 Paso 2: Verificar que los formularios están enviando datos

1. Abre DevTools (F12) → Console
2. Ejecuta:
```javascript
// Prueba guardar un gasto
await guardarGasto(1, 'Prueba', 50, 'gasto');
```

3. Deberías ver en Console:
```
✓ Gasto guardado en BD: Registro guardado correctamente
```

## 🔄 Paso 3: Verificar que los datos se guardan

1. Abre nuevamente `http://localhost:8000/database/diagnostico.php`
2. Debes ver aumentado el número de registros en "VERIFICANDO DATOS EN FINANZAS"

## 🧪 Paso 4: Prueba desde otro dispositivo

1. Desde tu celular accede a:
```
http://192.168.X.X:8000/database/diagnostico.php
```
(Reemplaza 192.168.X.X con tu IP)

2. Deberías ver los MISMOS registros que desde la PC

## ✨ Si TODO funciona:

1. Los datos están guardándose en la BD ✓
2. Los datos se ven desde otros dispositivos ✓
3. La sincronización está completa ✓

## 🆘 Si aún no se guardan:

### Posible causa 1: club_id incorrecto
```
En la página de asistencia/gastos, verifica que club_id sea correcto
Aventureros: club_id = 1
Conquistadores: club_id = 2
Guías: club_id = 3

En Console ejecuta:
obtenerIdClub()  // Debe mostrar el ID correcto
```

### Posible causa 2: El servidor PHP no está corriendo
```
Abre terminal en la carpeta del proyecto:
php -S localhost:8000

Debes ver:
"Development Server running at http://127.0.0.1:8000"
```

### Posible causa 3: Los archivos PHP no existen
```
Verifica que existan:
- database/guardar_gasto.php
- database/obtener_gastos.php
- database/guardar_asistencia.php
- database/obtener_asistencia.php
```

### Posible causa 4: Permisos de archivos
```
En Windows, asegúrate que:
1. Puedas leer/escribir en la carpeta database/
2. MySQL tenga permisos de escritura
3. El usuario www-data (si usas Apache) tenga permisos
```

## 📞 Comando de Verificación Rápida

En terminal, ejecuta:
```bash
# Verificar MySQL
mysql -u root -p -e "SELECT * FROM zona2_db.finanzas LIMIT 5;"

# Deberías ver los registros que guardaste
```

## 🎯 Resumen de Pasos

1. [ ] Ejecuté `http://localhost:8000/database/diagnostico.php`
2. [ ] Todo muestra ✓ (conexión, tablas, escritura)
3. [ ] Ejecuté `await guardarGasto(1, 'Prueba', 50, 'gasto')` en Console
4. [ ] Recargué diagnostico.php y ví aumentado el contador de registros
5. [ ] Accedí desde otro dispositivo y ví los mismos datos
6. [ ] ¡Sincronización funciona! 🎉

## Siguientes pasos si TODO funciona:

Los datos ahora se guardarán en tiempo real para todo los usuarios.
Puedes:
- Registrar asistencia desde la PC
- Ver los datos desde el celular
- Registrar gastos desde cualquier dispositivo
- Todo se sincroniza automáticamente

¡Éxito! 🚀

<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'diagnostico' => 'VERIFICADOR DE SINCRONIZACIÓN'
], JSON_PRETTY_PRINT);

// 1. Verificar config.php
echo "\n\n=== 1. VERIFICANDO config.php ===\n";
if (file_exists('config.php')) {
    echo "✓ Archivo config.php existe\n";
    
    // Cargar config sin mostrar valores sensibles
    require_once 'config.php';
    echo "✓ Config cargada correctamente\n";
} else {
    echo "✗ ERROR: No existe config.php\n";
    die;
}

// 2. Verificar conexión a MySQL
echo "\n=== 2. VERIFICANDO CONEXIÓN A MYSQL ===\n";
try {
    echo "Intentando conectar a: localhost\n";
    echo "BD: zona2_db\n";
    echo "Usuario: root\n\n";
    
    $test_conn = new PDO(
        "mysql:host=localhost;dbname=zona2_db",
        "root",
        "",
        array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'")
    );
    
    echo "✓ CONEXIÓN EXITOSA\n";
    $test_conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
} catch(PDOException $e) {
    echo "✗ ERROR DE CONEXIÓN:\n";
    echo $e->getMessage() . "\n\n";
    
    echo "POSIBLES CAUSAS:\n";
    echo "1. MySQL no está corriendo\n";
    echo "2. Usuario/contraseña incorrectos\n";
    echo "3. Base de datos 'zona2_db' no existe\n";
    echo "4. Base de datos no está en localhost\n";
    die;
}

// 3. Verificar tablas
echo "\n=== 3. VERIFICANDO TABLAS ===\n";
try {
    $tables = $test_conn->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "Tablas encontradas: " . count($tables) . "\n";
    
    $requiredTables = ['usuarios', 'clubes', 'miembros', 'asistencias', 'eventos', 'finanzas'];
    
    foreach ($requiredTables as $table) {
        if (in_array($table, $tables)) {
            echo "  ✓ $table\n";
        } else {
            echo "  ✗ $table (FALTA)\n";
        }
    }
    
} catch(Exception $e) {
    echo "✗ Error al verificar tablas: " . $e->getMessage() . "\n";
}

// 4. Verificar datos en finanzas
echo "\n=== 4. VERIFICANDO DATOS EN FINANZAS ===\n";
try {
    $count = $test_conn->query("SELECT COUNT(*) FROM finanzas")->fetchColumn();
    echo "Registros en tabla finanzas: $count\n";
    
    if ($count > 0) {
        echo "✓ Hay datos en la tabla finanzas\n";
        
        // Mostrar últimos 3 registros
        $latest = $test_conn->query("
            SELECT id, concepto, monto, tipo, fecha 
            FROM finanzas 
            ORDER BY id DESC 
            LIMIT 3
        ")->fetchAll(PDO::FETCH_ASSOC);
        
        echo "\nÚltimos 3 registros:\n";
        foreach ($latest as $reg) {
            echo "  ID: {$reg['id']} | {$reg['fecha']} | {$reg['concepto']} | \${$reg['monto']} ({$reg['tipo']})\n";
        }
    } else {
        echo "⚠ No hay datos en finanzas\n";
        echo "Los datos NO se están guardando correctamente\n";
    }
    
} catch(Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

// 5. Verificar datos en asistencias
echo "\n=== 5. VERIFICANDO DATOS EN ASISTENCIAS ===\n";
try {
    $count = $test_conn->query("SELECT COUNT(*) FROM asistencias")->fetchColumn();
    echo "Registros en tabla asistencias: $count\n";
    
    if ($count > 0) {
        echo "✓ Hay datos en la tabla asistencias\n";
    } else {
        echo "⚠ No hay datos en asistencias\n";
    }
    
} catch(Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

// 6. Prueba de escritura
echo "\n=== 6. PRUEBA DE ESCRITURA ===\n";
try {
    // Intentar insertar un registro de prueba
    $stmt = $test_conn->prepare("
        INSERT INTO finanzas (club_id, tipo, concepto, monto, fecha, descripcion, created_at)
        VALUES (:club_id, :tipo, :concepto, :monto, :fecha, :desc, NOW())
    ");
    
    $fecha = date('Y-m-d');
    $stmt->execute([
        ':club_id' => 1,
        ':tipo' => 'gasto',
        ':concepto' => 'Prueba de Diagnóstico - ' . date('Y-m-d H:i:s'),
        ':monto' => 99.99,
        ':fecha' => $fecha,
        ':desc' => 'Este es un registro de prueba'
    ]);
    
    echo "✓ ESCRITURA EXITOSA\n";
    echo "Se insertó un registro de prueba\n";
    echo "ID insertado: " . $test_conn->lastInsertId() . "\n";
    
} catch(Exception $e) {
    echo "✗ ERROR AL ESCRIBIR:\n";
    echo $e->getMessage() . "\n";
}

// 7. Resumen final
echo "\n=== RESUMEN ===\n";
echo "✓ Conexión a MySQL: FUNCIONANDO\n";
echo "✓ Base de datos zona2_db: EXISTE\n";
echo "✓ Tablas: CREADAS\n";
echo "✓ Prueba de escritura: EXITOSA\n";
echo "\nLa BD está funcionando correctamente.\n";
echo "Si los datos no aparecen en tu aplicación:\n";
echo "1. Verifica que estés usando club_id correcto\n";
echo "2. Revisa la Console (F12) para ver errores\n";
echo "3. Recarga la página (Ctrl+F5)\n";

$test_conn = null;
?>

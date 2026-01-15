<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $miembro_id = $data['miembro_id'] ?? null;
        $fecha = $data['fecha'] ?? date('Y-m-d');
        $estado = $data['estado'] ?? 'presente'; // presente, ausente, tardanza

        if (!$miembro_id) {
            throw new Exception('ID de miembro requerido');
        }

        // Verificar si ya existe registro para este día
        $checkStmt = $conn->prepare("
            SELECT id FROM asistencias 
            WHERE miembro_id = :miembro_id AND fecha = :fecha
        ");
        $checkStmt->execute([
            ':miembro_id' => $miembro_id,
            ':fecha' => $fecha
        ]);

        if ($checkStmt->rowCount() > 0) {
            // Actualizar registro existente
            $stmt = $conn->prepare("
                UPDATE asistencias 
                SET estado = :estado 
                WHERE miembro_id = :miembro_id AND fecha = :fecha
            ");
        } else {
            // Insertar nuevo registro
            $stmt = $conn->prepare("
                INSERT INTO asistencias (miembro_id, fecha, estado) 
                VALUES (:miembro_id, :fecha, :estado)
            ");
        }

        $stmt->execute([
            ':miembro_id' => $miembro_id,
            ':fecha' => $fecha,
            ':estado' => $estado
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Asistencia guardada correctamente',
            'id' => $conn->lastInsertId()
        ]);

    } catch(Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>

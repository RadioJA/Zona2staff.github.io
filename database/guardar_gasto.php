<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $club_id = $data['club_id'] ?? null;
        $concepto = $data['concepto'] ?? null;
        $monto = $data['monto'] ?? null;
        $tipo = $data['tipo'] ?? 'gasto'; // gasto o ingreso
        $fecha = $data['fecha'] ?? date('Y-m-d');
        $descripcion = $data['descripcion'] ?? null;

        if (!$club_id || !$concepto || !$monto) {
            throw new Exception('Club, concepto y monto son requeridos');
        }

        $stmt = $conn->prepare("
            INSERT INTO finanzas (club_id, concepto, monto, tipo, fecha, descripcion, created_at) 
            VALUES (:club_id, :concepto, :monto, :tipo, :fecha, :descripcion, NOW())
        ");

        $stmt->execute([
            ':club_id' => $club_id,
            ':concepto' => $concepto,
            ':monto' => $monto,
            ':tipo' => $tipo,
            ':fecha' => $fecha,
            ':descripcion' => $descripcion
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Registro guardado correctamente',
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

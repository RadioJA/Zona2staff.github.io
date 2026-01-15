<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $titulo = $data['titulo'] ?? null;
        $descripcion = $data['descripcion'] ?? null;
        $fecha = $data['fecha'] ?? date('Y-m-d');
        $club_id = $data['club_id'] ?? null;
        $ubicacion = $data['ubicacion'] ?? null;

        if (!$titulo || !$club_id) {
            throw new Exception('Título y club son requeridos');
        }

        $stmt = $conn->prepare("
            INSERT INTO eventos (titulo, descripcion, fecha, club_id, ubicacion, created_at) 
            VALUES (:titulo, :descripcion, :fecha, :club_id, :ubicacion, NOW())
        ");

        $stmt->execute([
            ':titulo' => $titulo,
            ':descripcion' => $descripcion,
            ':fecha' => $fecha,
            ':club_id' => $club_id,
            ':ubicacion' => $ubicacion
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Evento guardado correctamente',
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

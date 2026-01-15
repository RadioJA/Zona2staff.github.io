<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once 'config.php';

try {
    $club_id = $_GET['club_id'] ?? null;
    $estado = $_GET['estado'] ?? null;

    $query = "
        SELECT e.id, e.titulo, e.descripcion, e.fecha, e.ubicacion, 
               e.club_id, c.nombre as club_nombre, e.created_at
        FROM eventos e
        LEFT JOIN clubes c ON e.club_id = c.id
        WHERE 1=1
    ";

    $params = [];

    if ($club_id) {
        $query .= " AND e.club_id = :club_id";
        $params[':club_id'] = $club_id;
    }

    $query .= " ORDER BY e.fecha DESC";

    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $eventos,
        'count' => count($eventos)
    ]);

} catch(Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>

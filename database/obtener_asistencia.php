<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once 'config.php';

try {
    $club_id = $_GET['club_id'] ?? null;
    $fecha = $_GET['fecha'] ?? null;
    $miembro_id = $_GET['miembro_id'] ?? null;

    $query = "
        SELECT a.id, a.miembro_id, a.fecha, a.estado, 
               m.nombre, m.apellido, m.clase
        FROM asistencias a
        JOIN miembros m ON a.miembro_id = m.id
        WHERE 1=1
    ";

    $params = [];

    if ($club_id) {
        $query .= " AND m.club_id = :club_id";
        $params[':club_id'] = $club_id;
    }

    if ($fecha) {
        $query .= " AND a.fecha = :fecha";
        $params[':fecha'] = $fecha;
    }

    if ($miembro_id) {
        $query .= " AND a.miembro_id = :miembro_id";
        $params[':miembro_id'] = $miembro_id;
    }

    $query .= " ORDER BY a.fecha DESC, m.nombre ASC";

    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $asistencias = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $asistencias,
        'count' => count($asistencias)
    ]);

} catch(Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>

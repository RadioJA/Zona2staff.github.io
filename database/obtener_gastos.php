<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once 'config.php';

try {
    $club_id = $_GET['club_id'] ?? null;
    $tipo = $_GET['tipo'] ?? null; // gasto, ingreso, o ambos
    $fecha_inicio = $_GET['fecha_inicio'] ?? null;
    $fecha_fin = $_GET['fecha_fin'] ?? null;

    $query = "
        SELECT f.id, f.club_id, f.concepto, f.monto, f.tipo, f.fecha, f.descripcion,
               c.nombre as club_nombre, f.created_at
        FROM finanzas f
        LEFT JOIN clubes c ON f.club_id = c.id
        WHERE 1=1
    ";

    $params = [];

    if ($club_id) {
        $query .= " AND f.club_id = :club_id";
        $params[':club_id'] = $club_id;
    }

    if ($tipo) {
        $query .= " AND f.tipo = :tipo";
        $params[':tipo'] = $tipo;
    }

    if ($fecha_inicio) {
        $query .= " AND f.fecha >= :fecha_inicio";
        $params[':fecha_inicio'] = $fecha_inicio;
    }

    if ($fecha_fin) {
        $query .= " AND f.fecha <= :fecha_fin";
        $params[':fecha_fin'] = $fecha_fin;
    }

    $query .= " ORDER BY f.fecha DESC";

    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $gastos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calcular totales
    $total_gastos = 0;
    $total_ingresos = 0;
    foreach ($gastos as $gasto) {
        if ($gasto['tipo'] === 'gasto') {
            $total_gastos += $gasto['monto'];
        } else {
            $total_ingresos += $gasto['monto'];
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $gastos,
        'count' => count($gastos),
        'resumen' => [
            'total_gastos' => $total_gastos,
            'total_ingresos' => $total_ingresos,
            'balance' => $total_ingresos - $total_gastos
        ]
    ]);

} catch(Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>

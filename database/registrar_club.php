<?php
require_once 'config.php';
header('Content-Type: application/json');

session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
    exit;
}

try {
    $stmt = $conn->prepare('INSERT INTO clubes (nombre, tipo, director_id) VALUES (?, ?, ?)');
    $stmt->execute([
        $data['club'],
        'conquistadores',
        $_SESSION['user_id']
    ]);
    $club_id = $conn->lastInsertId();

    // Aquí puedes guardar otros datos relacionados en tablas adicionales si es necesario

    echo json_encode(['success' => true, 'club_id' => $club_id]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
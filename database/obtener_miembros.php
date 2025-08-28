<?php
require_once 'config.php';
header('Content-Type: application/json');
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit;
}
$data = json_decode(file_get_contents('php://input'), true);
$user = isset($data['user']) ? $data['user'] : null;
if (!$user) {
    echo json_encode(['success' => false, 'message' => 'Usuario no especificado']);
    exit;
}
try {
    if ($user['role'] === 'admin') {
        $stmt = $conn->prepare('SELECT * FROM miembros');
        $stmt->execute();
    } else {
        $stmt = $conn->prepare('SELECT * FROM miembros WHERE created_by = ?');
        $stmt->execute([$user['username']]);
    }
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'records' => $records]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
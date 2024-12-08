<?php
/**
 * クリックデータの削除
 */
require_once("MYDB.php");
header('Content-Type: application/json');

try {
    $pdo = db_connect();
    
    // POSTデータの取得
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        throw new Exception('ID is required');
    }

    // トランザクション開始
    $pdo->beginTransaction();
    
    try {
        // クリックデータを削除
        $stmt = $pdo->prepare("DELETE FROM click_coordinates WHERE id = :id");
        $stmt->execute([':id' => $data['id']]);
        
        $pdo->commit();
        echo json_encode(['status' => 'success']);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
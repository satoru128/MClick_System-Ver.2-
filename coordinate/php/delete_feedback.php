<?php
/**
 * フィードバックの削除
 */

require_once("MYDB.php");
header('Content-Type: application/json');

try {
    $pdo = db_connect();
    
    // POSTデータの取得
    $data = json_decode(file_get_contents('php://input'), true);
    
    // トランザクション開始
    $pdo->beginTransaction();
    
    try {
        // 発言者情報を削除
        $stmt = $pdo->prepare("
            DELETE FROM feedback_speakers 
            WHERE feedback_id = :id
        ");
        $stmt->execute([':id' => $data['id']]);
        
        // フィードバックを削除
        $stmt = $pdo->prepare("
            DELETE FROM feedbacks 
            WHERE id = :id
        ");
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
?>
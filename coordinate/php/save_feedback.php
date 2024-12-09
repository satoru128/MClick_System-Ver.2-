<?php
/**
 * フィードバックの保存
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
        // フィードバックの保存
        $stmt = $pdo->prepare("
            INSERT INTO feedbacks 
            (video_id, timestamp, comment, record_time) 
            VALUES 
            (:video_id, :timestamp, :comment, NOW())
        ");
        $stmt->execute([
            ':video_id' => $data['video_id'],
            ':timestamp' => $data['timestamp'],
            ':comment' => $data['comment']
        ]);

        // 挿入したフィードバックのIDを取得
        $feedback_id = $pdo->lastInsertId();
        
        // 発言者情報の保存
        $stmt = $pdo->prepare("
            INSERT INTO feedback_speakers 
            (feedback_id, user_id) 
            VALUES 
            (:feedback_id, :user_id)
        ");
        
        // 各発言者についてループ
        foreach ($data['speakers'] as $user_id) {
            $stmt->execute([
                ':feedback_id' => $feedback_id,
                ':user_id' => $user_id
            ]);
        }

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
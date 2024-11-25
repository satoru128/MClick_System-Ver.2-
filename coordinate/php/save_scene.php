<?php
/**
 * シーン記録を保存するAPI
 */
require_once("MYDB.php");
header('Content-Type: application/json');

try {
    $pdo = db_connect();
    
    // POSTデータを取得
    $data = json_decode(file_get_contents('php://input'), true);
    
    // トランザクション開始
    $pdo->beginTransaction();
    
    try {
        // シーン記録の保存
        $stmt = $pdo->prepare("
            INSERT INTO scene_records 
            (user_id, video_id, click_time) 
            VALUES (:user_id, :video_id, :click_time)
        ");
        
        $stmt->execute([
            ':user_id' => $data['user_id'],
            ':video_id' => $data['video_id'],
            ':click_time' => $data['time']
        ]);

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
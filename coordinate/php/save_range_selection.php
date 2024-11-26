<?php
/**
 * 範囲選択
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
        $stmt = $pdo->prepare("
            INSERT INTO range_selections 
            (user_id, video_id, start_x, start_y, width, height, click_time, comment) 
            VALUES (:user_id, :video_id, :start_x, :start_y, :width, :height, :click_time, :comment)
        ");

        $stmt->execute([
            ':user_id' => $data['user_id'],
            ':video_id' => $data['video_id'],
            ':start_x' => $data['startX'],
            ':start_y' => $data['startY'],
            ':width' => $data['width'],
            ':height' => $data['height'],
            ':click_time' => $data['time'],
            ':comment' => $data['comment'] ?? null
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
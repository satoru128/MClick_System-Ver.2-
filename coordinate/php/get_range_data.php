<?php
/**
 * 範囲選択データを取得するAPI
 */
require_once("MYDB.php");
header('Content-Type: application/json');

try {
    $pdo = db_connect();
    
    // POSTデータを取得
    $data = json_decode(file_get_contents('php://input'), true);
    
    // 範囲選択データを取得
    $stmt = $pdo->prepare("
        SELECT id, user_id, start_x, start_y, width, height, click_time, comment
        FROM range_selections 
        WHERE video_id = :video_id 
        AND user_id = :user_id 
        ORDER BY click_time ASC
    ");
    
    $stmt->execute([
        ':video_id' => $data['video_id'],
        ':user_id' => $data['user_id']
    ]);
    
    $ranges = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',
        'ranges' => $ranges
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
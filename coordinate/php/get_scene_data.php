<?php
/**
 * シーン記録データを取得するAPI
 */
require_once("MYDB.php");
header('Content-Type: application/json');

try {
    $pdo = db_connect();
    
    // POSTデータを取得
    $data = json_decode(file_get_contents('php://input'), true);
    
    // シーン記録データを取得
    $stmt = $pdo->prepare("
        SELECT id, user_id, click_time, comment
        FROM scene_records 
        WHERE video_id = :video_id 
        AND user_id = :user_id 
        ORDER BY click_time ASC
    ");
    
    $stmt->execute([
        ':video_id' => $data['video_id'],
        ':user_id' => $data['user_id']
    ]);
    
    $scenes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',
        'scenes' => $scenes
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
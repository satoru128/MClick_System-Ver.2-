<?php
/**
 * 最新のクリックデータにコメントを追加するAPI
 */
require_once("MYDB.php");
header('Content-Type: application/json');

try {
    $pdo = db_connect();
    
    // POSTデータを取得
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['user_id']) || !isset($data['video_id']) || !isset($data['comment'])) {
        throw new Exception('Required parameters are missing');
    }

    // 最新のクリックデータを更新
    $stmt = $pdo->prepare("
        UPDATE click_coordinates 
        SET comment = :comment 
        WHERE user_id = :user_id 
        AND video_id = :video_id 
        ORDER BY id DESC 
        LIMIT 1
    ");
    
    $stmt->bindParam(':comment', $data['comment']);
    $stmt->bindParam(':user_id', $data['user_id']);
    $stmt->bindParam(':video_id', $data['video_id']);
    
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'No click data found to update'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
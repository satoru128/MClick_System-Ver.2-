<?php
/**
 * ※不要（削除予定ファイル）
 * シーン記録のコメントを更新するAPI
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

    // 最新のシーン記録にコメントを追加
    $stmt = $pdo->prepare("
        UPDATE scene_records 
        SET comment = :comment 
        WHERE user_id = :user_id 
        AND video_id = :video_id 
        ORDER BY id DESC 
        LIMIT 1
    ");
    
    $stmt->execute([
        ':comment' => $data['comment'],
        ':user_id' => $data['user_id'],
        ':video_id' => $data['video_id']
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'No scene record found to update'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
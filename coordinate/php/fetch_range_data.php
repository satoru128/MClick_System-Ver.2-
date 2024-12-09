<?php
/**
 * 範囲選択データを取得するAPI
 * 
 * データベースに保存されている範囲選択データを，記録時間順に取得し，JSONとして返す．
 */
require_once("MYDB.php");
header('Content-Type: application/json');

try {
    $pdo = db_connect();
    
    // POSTデータを取得
    $data = json_decode(file_get_contents('php://input'), true);
    $user_ids = $data['user_ids'] ?? [];
    $video_id = $data['video_id'];
    
    // 選択されたユーザーのデータのみを取得
    $placeholders = str_repeat('?,', count($user_ids) - 1) . '?';
    $stmt = $pdo->prepare("
        SELECT id, user_id, click_time, comment 
        FROM range_selections 
        WHERE video_id = ? 
        AND user_id IN ($placeholders)
        ORDER BY click_time ASC
    ");
    
    // パラメータをバインド
    $params = array_merge([$video_id], $user_ids);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);   // 配列作成
    
    echo json_encode([
        'status' => 'success',
        'data' => $results
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
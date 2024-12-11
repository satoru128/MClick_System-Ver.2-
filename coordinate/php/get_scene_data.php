<?php
/**
 * シーン記録データを取得するAPI
 */
header('Content-Type: application/json');
error_reporting(0);
ini_set('display_errors', 0);

require_once("MYDB.php");

try {
    $pdo = db_connect();
    
    // POSTデータを取得
    $data = json_decode(file_get_contents('php://input'), true);
    $video_id = $data['video_id'];

    // ヒートマップ用（複数ユーザー）とその他の機能（単一ユーザー）で分岐
    if (isset($data['user_ids']) && is_array($data['user_ids'])) {
        // ヒートマップ用の処理（複数ユーザー）
        $user_ids = $data['user_ids'];
        $placeholders = str_repeat('?,', count($user_ids) - 1) . '?';
        $query = "
            SELECT id, user_id, click_time, comment
            FROM scene_records 
            WHERE video_id = ? 
            AND user_id IN ($placeholders)
            ORDER BY click_time ASC
        ";
        $params = array_merge([$video_id], $user_ids);
    } else {
        // 既存機能用の処理（単一ユーザー）
        $user_id = $data['user_id'];
        $query = "
            SELECT id, user_id, click_time, comment
            FROM scene_records 
            WHERE video_id = ? 
            AND user_id = ?
            ORDER BY click_time ASC
        ";
        $params = [$video_id, $user_id];
    }

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
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
<?php
/**
 * シーン記録データを取得するAPI
 * 
 * データベースに保存されているシーン記録データを，記録時間順に取得し，JSONとして返す．
 */
require_once("MYDB.php");
header('Content-Type: application/json');

try {
    // データベースに接続
    $pdo = db_connect();
    
    // セッションから現在の動画IDを取得
    session_start();
    $video_id = $_SESSION['video_id'];
    
    // 特定の動画IDに対応するデータのみを取得
    $stmt = $pdo->prepare("
        SELECT id, user_id, click_time, comment 
        FROM scene_records 
        WHERE video_id = :video_id
        ORDER BY click_time ASC
    ");
    $stmt->execute([':video_id' => $video_id]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
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
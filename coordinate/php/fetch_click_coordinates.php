<?php
/**
 * クリック座標データを取得するAPI
 * 
 * データベースに保存されているクリック座標を，クリック時間順に取得し，JSONとして返す．
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
        SELECT id, click_time, x_coordinate, y_coordinate, comment 
        FROM click_coordinates 
        WHERE video_id = :video_id
        ORDER BY click_time ASC
    ");
    $stmt->execute([':video_id' => $video_id]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',  // statusプロパティを設定
        'data' => $results      // dataプロパティを設定
    ]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error']);
}
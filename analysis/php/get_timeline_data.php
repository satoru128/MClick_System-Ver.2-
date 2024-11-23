<?php
/**
 * 時系列グラフ用のデータを取得するAPI
 * クリックデータを10秒間隔で集計してJSON形式で返す
 */
require_once("../../coordinate/php/MYDB.php");
header('Content-Type: application/json');

try {
    // データベースに接続
    $pdo = db_connect();
    
    // POSTデータを取得
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // クリックデータを10秒間隔で集計
    $stmt = $pdo->prepare("
        SELECT 
            FLOOR(click_time / 10) * 10 as click_time,
            COUNT(*) as click_count
        FROM click_coordinates 
        WHERE video_id = :video_id 
        AND user_id = :user_id 
        GROUP BY FLOOR(click_time / 10)
        ORDER BY click_time ASC
    ");
    
    $stmt->bindParam(':video_id', $data['video_id']);
    $stmt->bindParam(':user_id', $data['user_id']);
    $stmt->execute();
    
    $clicks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 結果を返す
    echo json_encode([
        'status' => 'success',
        'data' => $clicks
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
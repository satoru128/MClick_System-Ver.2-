<?php
/**
 * リプレイ用のクリックデータを取得するAPI
 * 
 * 指定された動画IDとユーザーIDに基づいて，
 * クリックデータを時系列順に取得する．
 */
require_once("MYDB.php");
header('Content-Type: application/json');

try {
    // データベースに接続
    $pdo = db_connect();
    
    // POSTデータを取得
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // クリックデータを取得
    $stmt = $pdo->prepare("
        SELECT 
            id,
            x_coordinate AS x,
            y_coordinate AS y,
            click_time,
            comment
        FROM click_coordinates 
        WHERE video_id = :video_id 
        AND user_id = :user_id 
        ORDER BY click_time ASC
    ");
    
    $stmt->bindParam(':video_id', $data['video_id']);
    $stmt->bindParam(':user_id', $data['user_id']);
    $stmt->execute();
    
    $clicks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 結果を返す
    echo json_encode([
        'status' => 'success',
        'clicks' => $clicks
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error'
    ]);
}
?>
<?php
/**
 * クリック座標の保存を行うAPI
 * 
 * クライアントから送信されたJSONデータを受け取り，
 * クリック座標をデータベースに保存する．
 */
header('Content-Type: application/json');
require_once("MYDB.php");

try {
    // データベースに接続
    $pdo = db_connect();
    
    // POSTされたJSONデータを取得
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // クリック座標をデータベースに保存
    $stmt = $pdo->prepare("INSERT INTO click_coordinates (user_id, x_coordinate, y_coordinate, click_time, video_id) VALUES (:user_id, :x, :y, :click_time, :video_id)");
    
    $stmt->bindParam(':user_id', $data['user_id']);
    $stmt->bindParam(':x', $data['x']);
    $stmt->bindParam(':y', $data['y']);
    $stmt->bindParam(':click_time', $data['click_time']);
    $stmt->bindParam(':video_id', $data['video_id']);
    $stmt->execute();

    // // クリックカウントの更新
    // $stmt = $pdo->prepare("
    //     INSERT INTO click_counts (user_id, video_id, click_count) 
    //     VALUES (:user_id, :video_id, 1)
    //     ON DUPLICATE KEY UPDATE click_count = click_count + 1
    // ");
    // $stmt->bindParam(':user_id', $user_id);
    // $stmt->bindParam(':video_id', $video_id);
    // $stmt->execute();

    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error"]);
}
?>
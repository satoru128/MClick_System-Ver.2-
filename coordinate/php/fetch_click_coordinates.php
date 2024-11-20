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
    
    // クリック時間順にデータを取得
    $stmt = $pdo->prepare("SELECT * FROM click_coordinates ORDER BY click_time ASC");
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',  // statusプロパティを設定
        'data' => $results      // dataプロパティを設定
    ]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error']);
}
?>
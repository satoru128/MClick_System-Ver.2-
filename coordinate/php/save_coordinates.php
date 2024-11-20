<?php
/**
 * クリック座標の保存
 */

require_once("MYDB.php");
header('Content-Type: application/json');

try {
    $pdo = db_connect();
    
    // POSTデータno取得
    $data = json_decode(file_get_contents('php://input'), true);
    
    // トランザクション開始
    $pdo->beginTransaction();
    
    try {
        // クリック座標の保存
        $stmt = $pdo->prepare("
            INSERT INTO click_coordinates 
            (user_id, x_coordinate, y_coordinate, click_time, video_id) 
            VALUES (:user_id, :x, :y, :click_time, :video_id)
        ");
        $stmt->execute([
            ':user_id' => $data['user_id'],
            ':x' => $data['x'],
            ':y' => $data['y'],
            ':click_time' => $data['click_time'],
            ':video_id' => $data['video_id']
        ]);

        // クリックカウントの更新
        $stmt = $pdo->prepare("
            INSERT INTO click_counts 
                (user_id, video_id, click_count) 
            VALUES 
                (:user_id, :video_id, 1) 
            ON DUPLICATE KEY UPDATE 
                click_count = click_count + 1
        ");
        $stmt->execute([
            ':user_id' => $data['user_id'],
            ':video_id' => $data['video_id']
        ]);

        $pdo->commit();
        echo json_encode(['status' => 'success']);

    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
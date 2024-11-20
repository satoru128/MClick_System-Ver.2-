<?php
/**
 * 最新のクリックデータを削除し，その時間を返す
 */
require_once("MYDB.php");
header('Content-Type: application/json');

try {
    // データベース接続
    $pdo = db_connect();
    
    // POSTデータ取得
    $data = json_decode(file_get_contents('php://input'), true);
    
    // データバリデーション
    if (!isset($data['user_id']) || !isset($data['video_id'])) {
        throw new Exception('Required parameters are missing');
    }
    
    $user_id = $data['user_id'];
    $video_id = $data['video_id'];

    // トランザクション開始
    $pdo->beginTransaction();

    try {
        // 最新のクリックデータを取得
        $stmt = $pdo->prepare("
            SELECT id, click_time 
            FROM click_coordinates 
            WHERE user_id = :user_id 
            AND video_id = :video_id 
            ORDER BY id DESC 
            LIMIT 1
        ");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':video_id', $video_id);
        $stmt->execute();
        $latest = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($latest) {
            // 最新のデータを削除
            $stmt = $pdo->prepare("
                DELETE FROM click_coordinates 
                WHERE id = :id
            ");
            $stmt->bindParam(':id', $latest['id']);
            $stmt->execute();

            // クリックカウントを1減らす
                $stmt = $pdo->prepare("
                UPDATE click_counts 
                SET click_count = GREATEST(click_count - 1, 0)
                WHERE user_id = :user_id 
                AND video_id = :video_id
            ");
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':video_id', $video_id);
            $stmt->execute();

            // トランザクションをコミット
            $pdo->commit();

            echo json_encode([
                'status' => 'success',
                'click_time' => $latest['click_time']
            ]);
        } else {
            // 削除するデータがない
            $pdo->rollBack();
            echo json_encode([
                'status' => 'error',
                'message' => 'No data to delete'
            ]);
        }
    } catch (Exception $e) {
        // エラー時はロールバック
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

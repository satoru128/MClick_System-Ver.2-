<?php
/**
 * コメント更新用API
 * 各データテーブル（クリック座標，範囲選択，シーン記録）のコメントを更新
 */

require_once("MYDB.php");
header('Content-Type: application/json');

try {
    $pdo = db_connect();
    
    // POSTデータの取得
    $data = json_decode(file_get_contents('php://input'), true);
    
    // トランザクション開始
    $pdo->beginTransaction();
    
    try {
        // データ型に応じてテーブルを選択
        $table = '';
        switch($data['type']) {
            case 'click':
                $table = 'click_coordinates';
                break;
            case 'range':
                $table = 'range_selections';
                break;
            case 'scene':
                $table = 'scene_records';
                break;
            default:
                throw new Exception('Invalid data type specified');
        }
        
        // コメントの更新
        $stmt = $pdo->prepare("
            UPDATE {$table} 
            SET comment = :comment 
            WHERE id = :id
        ");
        
        $stmt->execute([
            ':comment' => $data['comment'],
            ':id' => $data['id']
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
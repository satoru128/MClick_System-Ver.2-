<?php
/**
 * クリック座標のコメント編集用（不要：削除予定）
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
                throw new Exception('Invalid type specified');
        }
        
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
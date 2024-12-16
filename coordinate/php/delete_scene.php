<?php
/**
 * シーン記録データの削除
 */
require_once("MYDB.php");
session_start();
header('Content-Type: application/json');

try {
    $pdo = db_connect();
    
    // POSTデータの取得
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        throw new Exception('ID is required');
    }

    // 権限チェック：データの所有者確認
    $stmt = $pdo->prepare("SELECT user_id FROM scene_records WHERE id = :id");
    $stmt->execute([':id' => $data['id']]);
    $record = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$record) {
        throw new Exception('データが見つかりません');
    }

    // ログインユーザーとデータの所有者が一致するか確認
    if ($record['user_id'] !== $_SESSION['user_id']) {
        throw new Exception('権限がありません');
    }

    // トランザクション開始
    $pdo->beginTransaction();
    
    try {
        // シーン記録データを削除
        $stmt = $pdo->prepare("DELETE FROM scene_records WHERE id = :id");
        $stmt->execute([':id' => $data['id']]);
        
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
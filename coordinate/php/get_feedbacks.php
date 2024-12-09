<?php
/**
 * フィードバック一覧の取得
 */

require_once("MYDB.php");
header('Content-Type: application/json');

try {
    $pdo = db_connect();
    
    $data = json_decode(file_get_contents('php://input'), true);
    error_log('Debugging in get_feedbacks.php:');  // デバッグ追加
    error_log('Received video_id: ' . $data['video_id']);  // デバッグ追加
    
    // まずfeedbacksテーブルの内容を確認
    $check_stmt = $pdo->query("SELECT COUNT(*) FROM feedbacks");
    $total_count = $check_stmt->fetchColumn();
    error_log('Total records in feedbacks table: ' . $total_count);  // デバッグ追加

    $stmt = $pdo->prepare("
        SELECT f.*, GROUP_CONCAT(fs.user_id) as speaker_ids
        FROM feedbacks f
        LEFT JOIN feedback_speakers fs ON f.id = fs.feedback_id
        WHERE f.video_id = :video_id
        GROUP BY f.id
        ORDER BY f.timestamp
    ");
    
    $stmt->execute([':video_id' => $data['video_id']]);
    $feedbacks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    error_log('Query executed with video_id: ' . $data['video_id']);  // デバッグ追加
    error_log('Number of feedbacks found: ' . count($feedbacks));  // デバッグ追加
    error_log('Feedbacks data: ' . print_r($feedbacks, true));  // デバッグ追加
    
    echo json_encode([
        'status' => 'success',
        'feedbacks' => $feedbacks,
        'debug' => [  // デバッグ情報を追加
            'video_id' => $data['video_id'],
            'total_records' => $total_count,
            'found_records' => count($feedbacks)
        ]
    ]);
    
} catch (Exception $e) {
    error_log('Error in get_feedbacks: ' . $e->getMessage());  // デバッグ追加
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
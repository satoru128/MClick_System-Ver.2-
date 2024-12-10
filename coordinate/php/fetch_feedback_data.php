<?php
/**
 * フィードバック一覧の取得
 */
require_once("MYDB.php");
header('Content-Type: application/json');

try {
    $pdo = db_connect();
    
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['video_id'])) {
        throw new Exception('video_id is required');
    }

    $stmt = $pdo->prepare("
        SELECT 
            f.id,
            f.video_id,
            f.timestamp,
            f.comment,
            f.record_time,
            fs.user_id as speaker_id
        FROM 
            feedbacks f
            INNER JOIN feedback_speakers fs ON f.id = fs.feedback_id
        WHERE 
            f.video_id = :video_id
        ORDER BY 
            f.timestamp ASC
    ");
    
    $stmt->execute([':video_id' => $data['video_id']]);
    $feedbacks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 取得したデータを直接ファイルに出力
    file_put_contents('debug_output.txt', print_r($feedbacks, true));
    
    // レスポンスの前にデータを出力
    header('Content-Type: application/json');
    $response = ['status' => 'success', 'feedbacks' => $feedbacks];
    file_put_contents('debug_response.txt', json_encode($response));
    
    echo json_encode($response);

} catch (Exception $e) {
    error_log('Error: ' . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
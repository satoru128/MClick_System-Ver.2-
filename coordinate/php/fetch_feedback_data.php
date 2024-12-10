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
           GROUP_CONCAT(DISTINCT u.name SEPARATOR ', ') as speaker_names
       FROM feedbacks f
       LEFT JOIN feedback_speakers fs ON f.id = fs.feedback_id
       LEFT JOIN users u ON fs.user_id = u.user_id
       WHERE f.video_id = :video_id
       GROUP BY f.id, f.video_id, f.timestamp, f.comment, f.record_time
       ORDER BY f.timestamp ASC
   ");
   
   $stmt->execute([':video_id' => $data['video_id']]);
   $feedbacks = $stmt->fetchAll(PDO::FETCH_ASSOC);
   
   echo json_encode([
       'status' => 'success',
       'feedbacks' => $feedbacks
   ]);

} catch (Exception $e) {
   echo json_encode([
       'status' => 'error',
       'message' => $e->getMessage()
   ]);
}
?>
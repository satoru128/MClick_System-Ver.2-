<?php
require_once(__DIR__ . "/MYDB.php");

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $user_id = $input['user_id'];
    $video_id = $input['video_id'];

    try {
        $pdo = db_connect();
        // クリック数を取得
        $stmt = $pdo->prepare("SELECT click_count FROM click_counts WHERE user_id = :user_id AND video_id = :video_id");
        $stmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->bindValue(':video_id', $video_id, PDO::PARAM_STR);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            // クリック数を更新
            $new_count = $row['click_count'] + 1;
            $stmt = $pdo->prepare("UPDATE click_counts SET click_count = :click_count WHERE user_id = :user_id AND video_id = :video_id");
            $stmt->bindValue(':click_count', $new_count, PDO::PARAM_INT);
            $stmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->bindValue(':video_id', $video_id, PDO::PARAM_STR);
            $stmt->execute();
        } else {
            // 新しいレコードを挿入
            $stmt = $pdo->prepare("INSERT INTO click_counts (user_id, video_id, click_count) VALUES (:user_id, :video_id, 1)");
            $stmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->bindValue(':video_id', $video_id, PDO::PARAM_STR);
            $stmt->execute();
        }

        echo json_encode(['status' => 'success']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>

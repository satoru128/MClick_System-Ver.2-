<?php
/**
 * ユーザー情報を取得するAPI
 * 
 * mode=currentの場合：現在のユーザーIDのみ返す
 * mode=allの場合：全ユーザー一覧を返す
 */
require_once("MYDB.php");
session_start();
header('Content-Type: application/json');

try {
    // リクエストモードの取得
    $mode = isset($_GET['mode']) ? $_GET['mode'] : 'current';
    
    // 現在のユーザーID取得モード
    if ($mode === 'current') {
        if (isset($_SESSION['user_id'])) {
            echo json_encode([
                "status" => "success",
                "user_id" => $_SESSION['user_id']
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "user_id" => null,
                "message" => "User ID not found in session"
            ]);
        }
        exit;
    }
    
    // 全ユーザー一覧取得モード
    if ($mode === 'all') {
        $pdo = db_connect();
        
        $stmt = $pdo->prepare("
            SELECT user_id, name 
            FROM users 
            ORDER BY user_id ASC
        ");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "status" => "success",
            "current_user" => $_SESSION['user_id'] ?? null,
            "users" => $users
        ]);
        exit;
    }
    
    // 不正なモード
    echo json_encode([
        "status" => "error",
        "message" => "Invalid mode specified"
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
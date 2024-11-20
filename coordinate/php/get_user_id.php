<?php
/**
 * ユーザーIDを取得するAPI
 * 
 * セッションからユーザーIDを取得し，JSONとして返す．
 * セッションが存在しない場合はnullを返す．
 */
session_start();
header('Content-Type: application/json');

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
?>
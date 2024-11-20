<?php
/**
 * セッション管理
 */
require_once(__DIR__ . "/../user_registration/php/common.php");

// セッションの設定
ini_set('session.cookie_httponly', 1); // JavaScriptからのクッキーアクセスを防止
ini_set('session.use_only_cookies', 1);// URLパラメータによるセッションIDの受け渡しを禁止
ini_set('session.cookie_secure', 1);   // HTTPS接続時のみクッキーを送信
session_start();
// セッションハイジャック対策
if (!isset($_SESSION['last_ip'])) {
    $_SESSION['last_ip'] = $_SERVER['REMOTE_ADDR'];
} elseif ($_SESSION['last_ip'] !== $_SERVER['REMOTE_ADDR']) {
    session_unset();
    session_destroy();
    header("Location: login.php?error=" . urlencode("セッションが無効になりました。再度ログインしてください。"));
    exit();
}
// セッションの有効性チェック
if (!isset($_SESSION["user_id"])) {
    header("Location: login.php?error=" . urlencode("ログインしてください"));
    exit();
}
// セッションの有効期限を更新
$_SESSION['last_activity'] = time();
?>
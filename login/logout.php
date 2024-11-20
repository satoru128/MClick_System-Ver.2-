<?php
/**
 * ログアウト機能
 */
require_once(__DIR__ . "/../user_registration/php/common.php");
session_start();
// セッション変数を全て解除 (セッション変数を空の配列で上書き)
$_SESSION = array();
// セッションクッキーを削除
if (ini_get("session.use_cookies")) {// クッキーを使用している場合
    $params = session_get_cookie_params();// 現在のセッションクッキーのパラメータを取得
    setcookie(
        session_name(), // セッションID用のクッキー名
         '',            // クッキーの値を空に
          time() - 42000,// 有効期限を過去の時刻に設定して無効化
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}
// セッションデータを完全に破棄
session_destroy();
// ログインページにリダイレクト
header("Location: login.php?message=" . urlencode("ログアウトしました"));
exit();
?>
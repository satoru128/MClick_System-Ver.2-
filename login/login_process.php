<?php
/**
 * ログイン認証処理 
 */
require_once(__DIR__ . "/../user_registration/php/common.php");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $user_id = isset($_POST["user_id"]) ? $_POST["user_id"] : "";
    $password = isset($_POST["password"]) ? $_POST["password"] : "";
    $video_id = isset($_POST["video_id"]) ? $_POST["video_id"] : "";

    $dbm = new DBManager();
    $member = $dbm->get_user($user_id);
    if ($member && $member["password"] === $password) {
        session_start();
        $_SESSION["user_id"] = $user_id;
        $_SESSION["name"] = $member["name"];
        $_SESSION["video_id"] = $video_id;
        header("Location: ./../index.php");
        exit();
    } else {
        header("Location: login.php?error=IDまたはパスワードが間違っています");
        exit();
    }
} else {
    header("Location: login.php");
    exit();
}
?>

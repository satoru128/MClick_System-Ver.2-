<?php
    /**
     * 登録情報編集前に入力したパスワードを確認
     */
    require_once("common.php");

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $user_id = $_POST["user_id"];
        $password = $_POST["password"];

        $member = $dbm->get_user($user_id);
        
        if ($member && $member["password"] === $password) {
            // パスワードが一致した場合
            header("Location: user_edit.php?user_id={$user_id}");
            exit();
        } else {
            // パスワードが一致しなかった場合
            header("Location: index.php?error=※正しいパスワードを入力してください");
            exit();
        }
    } else {
        header("Location: index.php");
        exit();
    }
?>

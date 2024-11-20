<?php
    /**
     * ユーザー情報削除画面 
     */
    require_once("common.php");

    $user_id = isset($_GET["user_id"]) ? (int)$_GET["user_id"] : 0;
    $member = $dbm->get_user($user_id); 
    if ($member) {
        show_top("情報削除");
        show_delete($member);
        //show_bottom(true);
    } else {
        // ユーザーが見つからない場合の処理
        header("Location: index.php?error=ユーザーが見つかりません");
        exit();
    }
?>

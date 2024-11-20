<?php
    /**
     * ユーザー情報の更新の確認画面 
     */
    require_once("common.php");

    $old_user_id = isset($_GET["user_id"]) ? (int)$_GET["user_id"] : 0;
    $member = $dbm->get_user($old_user_id);

    if ($member) {
        $name = $member["name"];
        $user_id = $member["user_id"];
        $password = $member["password"];
    } else {
        // ユーザーが見つからない場合の処理
        header("Location: index.php?error=すでに使用されているidです。更新されませんでした。");
        exit();
    }

    show_top("情報更新"); 
    show_update($name, $user_id, $password, $old_user_id);
    //show_bottom(true);
?>

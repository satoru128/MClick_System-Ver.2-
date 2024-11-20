<?php
    /**
     * ユーザー情報の削除・更新の確認画面 
     */
    require_once("common.php");

    //isset関数：指定した変数が設定されており、かつNULLでないかどうかを確認する
    
    $user_id = isset($_POST["user_id"]) ? $_POST["user_id"] : (isset($_GET["user_id"]) ? $_GET["user_id"] : null);

    $user_id = isset($_GET["user_id"]) ? $_GET["user_id"] : null;
    if ($user_id === null) {
        header("Location: index.php?error=パスワードが正しくありません");
        exit();
    }
    $member = $dbm->get_user($user_id); 
    if ($member) {
        show_top("選択情報");
        show_user($member);
        show_operations($user_id);
        //show_bottom(true);
    } else {
        // ユーザーが見つからない場合の処理
        header("Location: index.php?error=ユーザーが見つかりません");
        exit();
    }
?>


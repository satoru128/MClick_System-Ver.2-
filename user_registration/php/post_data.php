<?php
/**
 * データの挿入・更新・削除 
 */
require_once("common.php");

if (isset($_POST["data"])) {
    // POSTで送られたデータ取得
    $name = isset($_POST["name"]) ? $_POST["name"] : "";
    $user_id = isset($_POST["user_id"]) ? (int)$_POST["user_id"] : 0;
    $password = isset($_POST["password"]) ? $_POST["password"] : "";
    $password_confirm = isset($_POST["password_confirm"]) ? $_POST["password_confirm"] : "";
    $old_user_id = isset($_POST["old_user_id"]) ? (int)$_POST["old_user_id"] : 0;

    // データ挿入処理
    if ($_POST["data"] == "create") {
        if (!check_input($name, $user_id, $password, $password_confirm, $error)) {
            header("Location: user_input.php?error={$error}");
            exit();
        }
        if ($dbm->if_id_exists($user_id)) {
            $error = "すでに使用されているidです";
            header("Location: user_input.php?error={$error}");
            exit();   
        }
        if (!$dbm->insert_user($name, $user_id, $password)) {
            $error = "DBエラー";
            header("Location: user_input.php?error={$error}");
            exit();    
        }
        header("Location: index.php");
        exit();
        
    // データ更新処理   
    } else if ($_POST["data"] == "update") {
        if (!check_input($name, $user_id, $password, $password_confirm, $error)) {
            header("Location: user_update.php?error={$error}&id={$old_user_id}");
            exit();  
        }
        if ($dbm->if_id_exists($user_id) && $user_id != $old_user_id) {
            $error = "すでに使用されているidです";
            header("Location: user_update.php?error={$error}&id={$old_user_id}");
            exit();   
        }
        $dbm->update_user($name, $user_id, $password, $old_user_id);
        header("Location: index.php");
        exit();

    // データ削除処理   
    } else if ($_POST["data"] == "delete") {
        if (!$dbm->delete_user($user_id)) {
            $error = "DBエラー";
            header("Location: user_delete.php?error={$error}&id={$user_id}");
            exit();                
        }
        header("Location: index.php");
        exit();       
    } else {
        header("Location: index.php");
        exit();
    }  
}
?>

<?php
/**
 * 入力された値の確認をする関数の定義 
 */
function check_input($name, $user_id, $password, $password_confirm, &$error) {
    $error = "";
    //  空欄がないかどうかのチェック
    if ($name === "" or $user_id === "" or $password === "" or $password_confirm === "") {
        $error = "※入力されていない値があります";
        return false;
    }
    //  idが正しく入力されているかをチェック
    if (!preg_match("/[0-9]{4}/", $user_id)) {
        $error = "※idとパスワード は、4文字の半角、数字で入力してください";
        return false;
    }
    // パスワードが一致するかをチェック
    if ($password !== $password_confirm) {
        $error = "※パスワードが一致しません";
        return false;
    }
    return true;
}
?>
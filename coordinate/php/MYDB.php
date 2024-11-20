<?php
/**
 * データベース接続用の関数
 * 
 * データベースへの接続を行い，PDOオブジェクトを返す．
 * 接続に失敗した場合はエラーメッセージを表示する．
 */
function db_connect(){
    // データベース接続に必要な情報
    $db_user = "root";    // データベースのユーザー名
    $db_pass = "satoru0411";  // パスワード
    $db_host = "localhost";   // ホスト名
    $db_name = "coordinates_db";  // データベース名
    $db_type = "mysql";    // データベースの種類
    
    $dsn = "$db_type:host=$db_host;dbname=$db_name;charset=utf8";
    
    try {
        $pdo = new PDO($dsn, $db_user, $db_pass);
        // エラーが発生した場合に例外を投げる設定
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    } catch(PDOException $Exception) {
        die('エラー :' . $Exception->getMessage());
    }
    return $pdo;
}
?>
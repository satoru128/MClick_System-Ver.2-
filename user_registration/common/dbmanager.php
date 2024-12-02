<?php
/**
 * データベースを管理するクラス 
 */
class DBManager {
    private $conn;

    public function __construct() {
        // データベース接続情報
        $db_host = 'localhost'; // データベースホスト
        $db_name = 'coordinates_db'; // データベース名
        $db_user = 'root'; // データベースユーザー名
        $db_pass = 'yudai0606'; // データベースパスワード
        
        // データベース接続
        try {
            $this->conn = new PDO("mysql:host={$db_host};dbname={$db_name}", $db_user, $db_pass);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            // データベース接続エラー
            echo "データベースに接続できませんでした。エラー: " . $e->getMessage();
            exit;
        }
    }
    //  データベースへの接続
    private function connect() {
        $this->db = new PDO($this->access_info, $this->user, $this->password);
    }
    //  データベースへの接続解除
    private function disconnect() {
        $this->db = null;
    }

    //  学生情報の削除
    public function delete_user($user_id) {
        try {
            $stmt = $this->conn->prepare("DELETE FROM users WHERE user_id = :user_id");
            $stmt->bindParam(':user_id', $user_id);
            return $stmt->execute();
        } catch (PDOException $e) {
            echo "ユーザー情報の削除中にエラーが発生しました。エラー: " . $e->getMessage();
            exit;
        }
    }

    //  特定の学生情報の取得
    public function get_user($user_id) {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM users WHERE user_id = :user_id");
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            echo "ユーザー情報の取得中にエラーが発生しました。エラー: " . $e->getMessage();
            exit;
        }
    }

    //  テーブルからユーザー一覧の取得
    public function get_all_user() {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM users");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            echo "データを取得できませんでした。エラー: " . $e->getMessage();
            exit;
        }
    }

    public function get_user_by_id($user_id) {
        $stmt = $this->conn->prepare('SELECT * FROM users WHERE user_id = :user_id');
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    //  ユーザー情報の挿入
    public function insert_user($name, $user_id, $password) {
        try {
            $stmt = $this->conn->prepare("INSERT INTO users (name, user_id, password) VALUES (:name, :user_id, :password)");
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':password', $password);
            return $stmt->execute();
        } catch (PDOException $e) {
            echo "ユーザー情報の挿入中にエラーが発生しました。エラー: " . $e->getMessage();
            exit;
        }
    }

    //  $idで指定したユーザー情報が存在するかを調べる
    public function if_id_exists($user_id) {
        try {
            $stmt = $this->conn->prepare("SELECT COUNT(*) FROM users WHERE user_id = :user_id");
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();
            $count = $stmt->fetchColumn();
            return $count > 0;
        } catch (PDOException $e) {
            echo "ユーザーIDの存在確認中にエラーが発生しました。エラー: " . $e->getMessage();
            exit;
        }
    }

    public function update_user($name, $user_id, $password, $old_user_id) {
        try {
            $stmt = $this->conn->prepare("UPDATE users SET name = :name, user_id = :user_id, password = :password WHERE user_id = :old_user_id");
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':password', $password);
            $stmt->bindParam(':old_user_id', $old_user_id);
            return $stmt->execute();
        } catch (PDOException $e) {
            echo "ユーザー情報の更新中にエラーが発生しました。エラー: " . $e->getMessage();
            exit;
        }
    }
}
?>

<?php 
    /**
     * トップ画面
     */
    require_once("common.php");
    show_top();
?>
<script>
    if (performance.navigation.type == 2) {
        location.reload(true);
    }
</script>
<?php
    if (isset($_GET["error"])) {
        echo "<p style='color:red;'>{$_GET["error"]}</p>";
    }
    //  ユーザー一覧の表示
    $user = $dbm->get_all_user();
    if ($user != null) {
        show_user_list($user); 
    }
    echo "<a href=\"user_input.php\">新規登録</a>";
    show_bottom();
?>

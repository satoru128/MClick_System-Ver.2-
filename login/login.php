<?php
require_once(__DIR__ . "/../user_registration/php/common.php");

// HTML上部の表示処理
function show_login_top() {
    echo <<<LOGIN_TOP
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>ログイン画面</title>
        <!-- Bootstrap CSSの読み込み -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-light">
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h1 class="card-title text-center mb-4">ログイン</h1>
    LOGIN_TOP;
}

// ログインフォームの表示処理
function show_login_form() {
    // エラーメッセージの表示
    if (isset($_GET["error"])) {
        echo "<div class='alert alert-danger'>{$_GET["error"]}</div>";
    }

    echo <<<LOGIN_FORM
    <form action="login_process.php" method="post">
        <div class="mx-auto" style="max-width: 400px;">
            <div class="mb-3">
                <label for="user_id" class="form-label">ID：</label>
                <input type="text" class="form-control" id="user_id" name="user_id" 
                       placeholder="例）1111" pattern="[0-9]{4}" 
                       title="4文字の半角、数字で入力してください" required>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">パスワード：</label>
                <input type="password" class="form-control" id="password" name="password" 
                       placeholder="例）2222" pattern="[0-9]{4}" 
                       title="4文字の半角、数字で入力してください" required>
            </div>
            <div class="mb-3">
                <label for="videoSelection" class="form-label">視聴したい動画を選択してください：</label>
                <select class="form-select" id="videoSelection" name="video_id">
                    <option value="n0tt3meYVkU">動画1</option>
                    <option value="11GgnxEEyXQ">動画2</option>
                    <option value="dwk2DTGHjc4">動画3</option>
                </select>
            </div>
            <div class="d-flex flex-column align-items-center">
                <button type="submit" class="btn btn-primary mb-3 w-auto" 
                        style="min-width: 160px;">ログイン</button>
            </div>
        </div>
    </form>
    <div class="mx-auto text-center" style="max-width: 400px;">
        <p class="mt-3">アカウントをお持ちでない場合は、
           <a href="../user_registration/php/user_input.php" 
              class="text-decoration-none">新規登録</a>してください。
        </p>
    </div>
    LOGIN_FORM;
}

// HTML下部の表示処理
function show_login_bottom() {
    echo <<<LOGIN_BOTTOM
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Bootstrap JS -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
    LOGIN_BOTTOM;
}
?>

<?php
// メイン処理部分
show_login_top();
show_login_form();
show_login_bottom();
?>
<?php
/**
 * HTML出力に関する関数を定義 
 */

//  HTML上部を表示する
function show_top($heading="ユーザー登録一覧") {
    $colWidth = ($heading === "ユーザー登録一覧") ? "col-md-8" : "col-md-6";
    echo <<<USERS_LIST
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{$heading}</title>
        <!-- Bootstrap CSSの読み込み -->
        <link href="/../Bootstrap/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="styles.css">
    </head>
    <body class="bg-light">
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="{$colWidth}">
                    <div class="card">
                        <div class="card-body">
                            <h1 class="card-title text-center mb-4">{$heading}</h1>
    USERS_LIST;
}

//  HTML下部を表示する
function show_bottom($return_top=false) {
    if ($return_top == true) {
        echo '<div class="text-center mt-3">';
        echo '<a href="index.php" class="btn btn-secondary w-auto" style="min-width: 160px;">ユーザー登録一覧へ</a>';
        echo '</div>';
    }
    echo <<<BOTTOM
        </div>
        <!-- Bootstrap JSの読み込み -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
        <script src="/../Bootstrap/js/bootstrap.min.js"></script>
        <script>
        window.onpageshow = function(event) {
            if (event.persisted) {
                document.querySelectorAll('form').forEach(function(form) {
                    form.reset();
                });
            }
        };
        </script>
    </body>
    </html>
    BOTTOM;
}

//  登録フォームの表示
function show_input() {
    $error = get_error();
    if ($error) {
        echo "<div class='alert alert-danger'>{$error}</div>";
    }
    show_edit_input_common("", "", "", "", "create", "登録");    
}

//  挿入フォーム・更新フォームの表示
function show_update($name, $user_id, $password, $old_user_id) {
    $error = get_error();
    echo <<<UPDATE_FORM
    <form action="post_data.php" method="post" onsubmit="return validateForm()">
    <div class="mx-auto" style="max-width: 400px;">
        <div class="mb-3">
            <label for="name" class="form-label">名前：</label>
            <input type="text" class="form-control" id="name" name="name" value="{$name}" required>
        </div>
        <div class="mb-3">
            <label for="user_id" class="form-label">ID：</label>
            <input type="text" class="form-control" id="user_id" name="user_id" value="{$user_id}" pattern="[0-9]{4}" title="4文字の半角、数字で入力してください" required>
        </div>
        <div class="mb-3">
            <label for="password" class="form-label">パスワード：</label>
            <input type="password" class="form-control" id="password" name="password" value="{$password}" pattern="[0-9]{4}" title="4文字の半角、数字で入力してください" required>
        </div>
        <div class="mb-3">
            <label for="password_confirm" class="form-label">パスワードの確認：</label>
            <input type="password" class="form-control" id="password_confirm" name="password_confirm" pattern="[0-9]{4}" title="4文字の半角、数字で入力してください" required>
        </div>
        <p class="text-danger">{$error}</p>
        <input type="hidden" name="old_user_id" value="{$old_user_id}">
        <input type="hidden" name="data" value="update">
        <div class="d-flex flex-column align-items-center">
            <button type="submit" class="btn btn-primary mb-2 w-auto" style="min-width: 160px;">更新する</button>
            <button type="button" onclick="history.back()" class="btn btn-secondary mb-2 w-auto" style="min-width: 160px;">戻る</button>
        </div>
    </div>
    </form>
UPDATE_FORM;
}

function show_edit_input_common($name, $user_id, $password, $old_user_id, $data, $button) {
    $error = get_error();
    echo <<<INPUT_FORM
    <form action="post_data.php" method="post" onsubmit="return validateForm()">
    <div class="mx-auto" style="max-width: 400px;">
        <div class="mb-3">
            <label for="name" class="form-label">名前：</label>
            <input type="text" class="form-control" id="name" name="name" value="{$name}" placeholder="例）山田太郎" required>
        </div>
        <div class="mb-3">
            <label for="user_id" class="form-label">ID：</label>
            <input type="text" class="form-control" id="user_id" name="user_id" value="{$user_id}" placeholder="例）1111" pattern="[0-9]{4}" title="4文字の半角、数字で入力してください" required>
        </div>
        <div class="mb-3">
            <label for="password" class="form-label">パスワード：</label>
            <input type="password" class="form-control" id="password" name="password" value="{$password}" placeholder="例）2222" pattern="[0-9]{4}" title="4文字の半角、数字で入力してください" required>
        </div>
        <div class="mb-3">
            <label for="password_confirm" class="form-label">パスワードの確認：</label>
            <input type="password" class="form-control" id="password_confirm" name="password_confirm" placeholder="例）2222" pattern="[0-9]{4}" title="4文字の半角、数字で入力してください" required>
        </div>
        <p class="text-danger">{$error}</p>
        <input type="hidden" name="old_user_id" value="{$old_user_id}">
        <input type="hidden" name="data" value="{$data}">
        <div class="d-flex flex-column align-items-center">
            <button type="submit" class="btn btn-primary">{$button}</button>
        </div>
    </div>
    </form>
    <div class="mx-auto text-center" style="max-width: 400px;">
    <p class="mt-3">すでにアカウントをお持ちの場合は、<a href="../../login/login.php" class="text-decoration-none">ログイン</a>してください。</p>
    </div>
INPUT_FORM;
}

//  削除フォームの表示
function show_delete($member) {
    if($member != null) {
        show_user($member);
    }
    $error = get_error();
    if ($error) {
        echo "<div class='alert alert-danger'>{$error}</div>";
    }
    echo <<<DELETE
    <form action="post_data.php" method="post" class="mt-4">
        <p class="lead text-center">この情報を削除しますか？</p>
        <input type="hidden" name="user_id" value="{$member["user_id"]}"/>
        <input type="hidden" name="data" value="delete"/>
        <div class="d-flex flex-column align-items-center">
            <button type="submit" class="btn btn-danger mb-2 w-auto" style="min-width: 160px;">はい</button>
            <button type="button" onclick="history.back()" class="btn btn-secondary mb-2 w-auto" style="min-width: 160px;">戻る</button>
        </div>
    </form>
    DELETE;        
}

//  ユーザー登録一覧
function show_user_list($members) {
    // カスタムCSSをインラインで追加
    echo '<style>
        .table-custom th:first-child,
        .table-custom td:first-child {
            width: 40%;  /* 名前 */
        }
        .table-custom th:nth-child(2),
        .table-custom td:nth-child(2) {
            width: 15%;  /* ID */
        }
        .table-custom th:nth-child(3),
        .table-custom td:nth-child(3) {
            width: 15%;  /* パスワード */
        }
        .table-custom th:last-child,
        .table-custom td:last-child {
            width: 30%;  /* 操作 */
        }
    </style>';

    echo '<div class="table-responsive">';
    echo '<table class="table table-bordered table-custom">';
    echo '<thead class="table-secondary"><tr><th>名前</th><th>ID</th><th>パスワード</th><th>操作</th></tr></thead><tbody>';
    
    foreach($members as $loop) {
        $hidden_password = str_repeat('*', strlen($loop["password"]));
        echo <<<END
        <tr>    
            <td>{$loop["name"]}</td>
            <td>{$loop["user_id"]}</td>
            <td>{$hidden_password}</td>
            <td>
                <form action="check_password.php" method="post">
                    <input type="hidden" name="user_id" value="{$loop["user_id"]}">
                    <div class="input-group">
                        <input type="password" class="form-control" name="password" placeholder="パスワード">
                        <button type="submit" class="btn btn-outline-primary">編集</button>
                    </div>
                </form>
            </td>
        </tr>
        END;
    }
    echo '</tbody></table></div>';
    echo '<p class="text-center mt-3"><a href="../../login/login.php" class="text-decoration-none">ログイン画面へ</a></p>';
    
}

//  特定の登録情報を表示する
function show_user($member) {
    echo '<div class="table-responsive mb-4">';
    echo '<table class="table table-bordered">';
    echo '<thead class="table-secondary"><tr><th>名前</th><th>ID</th><th>パスワード</th></tr></thead>';
    echo "<tbody><tr><td>{$member["name"]}</td><td>{$member["user_id"]}</td><td>{$member["password"]}</td></tr></tbody>";
    echo '</table></div>';
}

//  選択編集画面の操作の一覧の表示
function show_operations($user_id) {
    echo <<<OPERATIONS
    <div class="d-flex flex-column align-items-center">
        <a href="user_update.php?user_id={$user_id}" class="btn btn-primary mb-2 w-auto" style="min-width: 160px;">情報の更新</a>
        <a href="user_delete.php?user_id={$user_id}" class="btn btn-danger mb-2 w-auto" style="min-width: 160px;">情報の削除</a>
        <a href="index.php" class="btn btn-secondary mb-2 w-auto" style="min-width: 160px;">戻る</a>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            var backBtn = document.querySelector('a.btn-secondary');
            backBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'index.php';
            });
        });
    </script>
    OPERATIONS;
}
?>

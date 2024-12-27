<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>ログイン画面</title>
    <!-- Bootstrap CSSの読み込み -->
    <link href="../Bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <!-- 既存のスタイルシートも維持 -->
    <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-light">
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h1 class="card-title text-center mb-4 ">ログイン</h1>

                        <?php
                            require_once(__DIR__ . "/../user_registration/php/common.php");
                            if (isset($_GET["error"])) {
                                echo "<p class='text-danger'>{$_GET["error"]}</p>";
                            }
                        ?>

                        <form action="login_process.php" method="post">
                        <div class="mx-auto" style="max-width: 400px;">
                            <div class="mb-3">
                                <label for="user_id" class="form-label">ID：</label>
                                <input type="text" class="form-control" id="user_id" name="user_id" placeholder="例）1111" required>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">パスワード：</label>
                                <input type="password" class="form-control" id="password" name="password" placeholder="例）2222" required>
                            </div>
                            <div class="mb-3">
                                <label for="videoSelection" class="form-label">視聴したい動画を選択してください：</label>
                                <select class="form-select" id="videoSelection" name="video_id">
                                    <option value="n0tt3meYVkU">動画1</option>
                                    <option value="11GgnxEEyXQ">動画2</option>
                                    <option value="dwk2DTGHjc4">動画3</option>
                                    <!-- ここに他の動画IDを追加 -->
                                </select>
                            </div>
                            <div class="d-grid">
                                <input type="submit" class="btn btn-primary" value="ログイン">
                            </div>
                        </div>
                        </form>
                        <p class="mt-3 text-center">
                            <a href="../user_registration/php/user_input.php" class="text-decoration-none">新規登録</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JSの読み込み -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
</body>
</html>
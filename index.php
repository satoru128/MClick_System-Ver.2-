<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>動画アノテーションシステム</title>
        
        <!-- スタイルシート -->
        <link href="./Bootstrap/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="./coordinate/css/style.css">
        <!-- Bootstrap Bundle (JS) -->
        <script src="./Bootstrap/js/bootstrap.bundle.min.js"></script>
        <!-- YouTube API -->
        <script src="https://www.youtube.com/iframe_api"></script>
        <!-- カスタムスクリプト -->
        <script src="./coordinate/script/app.js?v=<?php echo time(); ?>"></script>
    </head>
    <body class="bg-light">
        <?php
            session_start();
            if (!isset($_SESSION['user_id'])) {
                header("Location: login.php");
                exit;
            }

            $user_id = $_SESSION['user_id'];
            $video_id = isset($_SESSION['video_id']) ? $_SESSION['video_id'] : 'n0tt3meYVkU';
            echo "<script>console.log('video ID: " .$video_id . "');</script>";
        ?>

        <!--ナビゲーションバー-->
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="container-fluid">
                <span class="navbar-brand">動画アノテーションシステム</span>
                <div class="navbar-text text-white">
                    ユーザーID：<?php echo $user_id; ?> | 
                    動画ID：<?php echo $video_id; ?>
                </div>
                <a href="./login/logout.php" class="btn btn-outline-light">ログアウト</a>
            </div>
        </nav>

        <div class="container mt-3">
            <div class="row">
                <!--左側-->
                <div class="col-lg-8">
                    <!--動画表示とキャンバス-->
                    <div class="card">
                        <div class="card-body">
                            <div id="video-container" class="position-relative">
                                <div id="player" data-video-id="<?php echo $video_id; ?>" style="width: 640px; height: 360px;"></div>
                                <canvas id="myCanvas" width="640" height="360"></canvas>
                            </div>
                        </div>
                    </div>

                    <!--動画コントロール-->
                    <div class="card mt-3">
                        <div class="card-body">
                            <!--動画下のコントロール-->
                            <div class="mb-3">
                                <div class="btn-group" role="group">
                                    <button id="playBtn" class="btn btn-primary">再生</button>
                                    <button id="pauseBtn" class="btn btn-primary">一時停止</button>
                                    <button id="stopBtn" class="btn btn-primary">停止</button>
                                </div>
                                <button id="muteBtn" class="btn btn-info mx-2">🔊</button>
                                <div class="btn-group">
                                    <button id="rewindBtn" class="btn btn-outline-primary">◀◀ 10秒</button>
                                    <button id="skipBtn" class="btn btn-outline-primary">10秒 ▶▶</button>
                                </div>
                                <button id="commentBtn" class="btn btn-info mx-2" onclick="showCommentModal('coordinate')">コメント</button>
                                <button id="mistakeBtn" class="btn btn-warning mx-2">ミス</button>
                            </div>

                            <!--シークバー-->
                            <div>
                                <label for="seekBar" class="form-label">再生位置：<span id="timeDisplay">00:00 / 00:00</span></label>
                                <input type="range" class="form-range" id="seekBar" value="0" max="100">
                            </div>
                        </div>
                    </div>
                </div>

                <!--右側-->
                <div class="col-lg-4">
                    <!--アノテーション制御-->
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">アノテーション制御</h5>
                            <div class="d-flex justify-content-between mb-3">
                                <div class="form-check form-switch">
                                <!-- このチェックボックスが event.target -->
                                <input class="form-check-input" type="checkbox" id="toggleCoordinateBtn">
                                    <label class="form-check-label" for="toggleCoordinateBtn">座標取得</label>
                                </div>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="replayBtn">
                                    <label class="form-check-label" for="replayBtn">リプレイ</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!--座標データ表示-->
                    <div class="card mt-3">
                        <div class="card-body">
                            <h5 class="card-title">クリック座標データ</h5>
                            <!-- ユーザー選択部分を追加 -->
                            <div class="mb-3">
                                <div class="d-flex align-items-center mb-2">
                                    <!-- <h6 class="me-3 mb-0">表示するユーザー：</h6> -->
                                    <div id="user-select" class="d-flex flex-wrap gap-2">
                                        <!-- ユーザー選択チェックボックスの追加 -->
                                    </div>
                                </div>
                            </div>
                            <div id="coordinate-data" class="table-responsive"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- コメント入力用モーダル -->
            <div class="modal fade" id="commentModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">コメント入力</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <textarea id="commentInput" class="form-control" rows="3" placeholder="ここにコメントを入力"></textarea>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" onclick="handleCommentSubmit()">送信</button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 右クリックメニュー -->
            <div id="customContextMenu" class="context-menu" style="display: none;">
                <div class="context-menu-header">
                    <span>アノテーション選択</span>
                    <button type="button" class="btn-close" aria-label="Close"></button>
                </div>
                <div class="context-menu-item" data-action="range">
                    <i class="bi bi-square"></i>範囲選択
                </div>
                <div class="context-menu-divider"></div>
                <div class="context-menu-item" data-action="scene">
                    <i class="bi bi-camera"></i>シーン記録
                </div>
            </div>
        <!--JavaScript-->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    </body>
</html>
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
        <script src="./coordinate/script/errorManager.js"></script>
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
                                <button id="exportBtn" class="btn btn-success">エクスポート</button>
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

                    <!-- データ表示カード内のリプレイ表示設定部分 -->
                    <div class="card mt-3">
                        <div class="card-body">
                            <!-- リプレイ表示設定部分を2つに分割 -->
                            <div class="mb-3">
                                <div class="dropdown">
                                    <button class="btn btn-outline-primary dropdown-toggle" 
                                            type="button" 
                                            id="replaySettingsDropdown" 
                                            data-bs-toggle="dropdown">
                                            リプレイに表示させる記録の選択
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li>
                                            <div class="dropdown-item">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="showClicks" checked>
                                                    <label class="form-check-label" for="showClicks">
                                                        クリック座標
                                                    </label>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="dropdown-item">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="showRanges" checked>
                                                    <label class="form-check-label" for="showRanges">
                                                        範囲選択
                                                    </label>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="dropdown-item">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="showScenes" checked>
                                                    <label class="form-check-label" for="showScenes">
                                                        シーン記録
                                                    </label>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                
                                <!-- コメント表示設定を分離 -->
                                <div class="form-check form-switch mt-2">
                                    <input class="form-check-input" type="checkbox" id="showComments" checked>
                                    <label class="form-check-label" for="showComments">
                                        コメントを常時表示
                                    </label>
                                </div>
                            </div>

                            <!-- ユーザー選択ドロップダウン -->
                            <div class="mb-3">
                                <div class="dropdown">
                                    <button class="btn btn-outline-primary dropdown-toggle" 
                                            type="button" id="userDropdown" data-bs-toggle="dropdown">
                                        表示するユーザーを選択 (最大3名)
                                    </button>
                                    <ul class="dropdown-menu" id="user-select"></ul>
                                </div>
                                <div id="selected-users-display" class="mt-2 small text-muted"></div>
                            </div>

                            <!-- タブナビゲーション -->
                            <ul class="nav nav-tabs" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#clicks-tab" type="button">
                                        クリック座標データ
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#ranges-tab" type="button">
                                        範囲選択データ
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#scenes-tab" type="button">
                                        シーン記録データ
                                    </button>
                                </li>
                            </ul>

                            <!-- タブコンテンツ -->
                            <div class="tab-content mt-3">
                                <div class="tab-pane fade show active" id="clicks-tab">
                                    <div id="coordinate-data" class="table-responsive"></div>
                                </div>
                                <div class="tab-pane fade" id="ranges-tab">
                                    <div id="range-data" class="table-responsive"></div>
                                </div>
                                <div class="tab-pane fade" id="scenes-tab">
                                    <div id="scene-data" class="table-responsive"></div>
                                </div>
                            </div>
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
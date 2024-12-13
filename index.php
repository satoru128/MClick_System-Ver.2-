<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>動画アノテーションシステム</title>
        
        <!-- スタイルシート -->
        <link href="./Bootstrap/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css">
        <link rel="stylesheet" href="./coordinate/css/style.css">
        <!-- jQuery -->
        <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
        <!-- Bootstrap Bundle (JS) -->
        <script src="./Bootstrap/js/bootstrap.bundle.min.js"></script>
        <!-- YouTube API -->
        <script src="https://www.youtube.com/iframe_api"></script>
        <!-- カスタムスクリプト -->
        <script src="./coordinate/script/errorManager.js"></script> 
        <script src="./coordinate/script/annotationManager.js"></script>
        <script src="./coordinate/script/feedbackManager.js"></script>
        <script src="./coordinate/script/replayManager.js"></script>    
        <script src="./coordinate/script/tableManager.js"></script>
        <script src="./coordinate/script/heatmapManager.js"></script>
        <script src="./coordinate/script/guideManager.js"></script>
        <script src="./coordinate/script/manualManager.js"></script>
        <script src="./coordinate/script/app.js?v=<?php echo time(); ?>"></script>
        <!-- Shepherd.js -->
        <!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/shepherd.js@11.1.1/dist/css/shepherd.css"/> -->
        <link rel="stylesheet" href="./shepherd/css/shepherd.css">
        <script src="https://cdn.jsdelivr.net/npm/shepherd.js@11.1.1/dist/js/shepherd.min.js"></script>
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
                <div>
                    <!-- ヘルプボタン -->
                    <button id="helpBtn" class="btn btn-outline-light me-2">
                        <i class="bi bi-question-circle"></i>
                    </button>
                    <button id="exportBtn" class="btn btn-outline-light me-2">
                        <i class="bi bi-download"></i> エクスポート
                    </button>
                    <a href="./login/logout.php" class="btn btn-outline-light">ログアウト</a>
                </div>
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
                            <div class="control-container">
                                <div class="btn-group" role="group">
                                    <!-- 再生/一時停止/停止ボタン -->
                                    <button id="playBtn" class="btn btn-primary" style="min-width: 60px;">
                                        <i class="bi bi-play-fill"></i>
                                    </button>
                                    <button id="pauseBtn" class="btn btn-primary" style="min-width: 60px;">
                                        <i class="bi bi-pause-fill"></i>
                                    </button>
                                    <button id="stopBtn" class="btn btn-primary" style="min-width: 60px;">
                                        <i class="bi bi-stop-fill"></i>
                                    </button>
                                </div>
                                <!-- ミュートボタン -->
                                <button id="muteBtn" class="btn btn-info">
                                    <i class="bi bi-volume-up-fill"></i>
                                </button>

                                <!-- 早送り/巻き戻しボタン -->
                                <div class="btn-group">
                                    <button id="rewindBtn" class="btn btn-outline-primary">
                                        <i class="bi bi-skip-backward-fill"></i> 10秒
                                    </button>
                                    <button id="skipBtn" class="btn btn-outline-primary">
                                        10秒 <i class="bi bi-skip-forward-fill"></i>
                                    </button>
                                </div>

                                <!-- その他のボタン -->
                                <button id="commentBtn" class="btn btn-info" onclick="showCommentModal('coordinate')">
                                    <i class="bi bi-chat-square-text"></i> コメント
                                </button>
                                <button id="mistakeBtn" class="btn btn-warning">
                                    <i class="bi bi-x-circle"></i> 取消
                                </button>
                                <button id="feedbackBtn" class="btn btn-success" disabled onclick="handleFeedbackClick()">
                                    <i class="bi bi-chat-right-quote"></i>
                                </button>
                                
                                <!-- 再生速度 -->
                                <div class="dropdown">
                                    <button class="btn btn-info dropdown-toggle" type="button" id="speedDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="bi bi-speedometer2"></i> <span id="currentSpeed">1.0</span>x
                                    </button>
                                    <ul class="dropdown-menu" aria-labelledby="speedDropdown">
                                        <li><a class="dropdown-item" href="#" onclick="changePlaybackSpeed(0.25)">0.25x</a></li>
                                        <li><a class="dropdown-item" href="#" onclick="changePlaybackSpeed(0.5)">0.5x</a></li>
                                        <li><a class="dropdown-item" href="#" onclick="changePlaybackSpeed(1.0)">1.0x</a></li>
                                        <li><a class="dropdown-item" href="#" onclick="changePlaybackSpeed(1.5)">1.5x</a></li>
                                        <li><a class="dropdown-item" href="#" onclick="changePlaybackSpeed(2.0)">2.0x</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <!-- シークバー -->
                                <div>
                                    <label for="seekBar" class="form-label">再生時間：<span id="timeDisplay">00:00 / 00:00</span></label>
                                    <div class="seekbar-container">
                                        <!-- 波グラフエリア -->
                                        <div id="waveArea" style="display: none;">
                                            <canvas id="waveChart"></canvas>
                                        </div>
                                        <input type="range" class="form-range" id="seekBar" value="0" max="100">
                                    </div>
                                </div>
                                <!-- 棒グラフエリア -->
                                <div id="heatmapArea" style="display: none;">
                                    <canvas id="heatmapChart"></canvas>
                                </div>
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
                                <!-- 座標取得トグル -->
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="toggleCoordinateBtn">
                                    <label class="form-check-label" for="toggleCoordinateBtn">座標取得</label>
                                </div>
                                <!-- リプレイトグル -->
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="replayBtn">
                                    <label class="form-check-label" for="replayBtn">リプレイ</label>
                                </div>
                                <!-- ヒートマップトグル追加 -->
                                <div class="d-flex align-items-center gap-2">
                                    <!-- ヒートマップトグル -->
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="heatmapToggle" onchange="handleHeatmapToggleChange(event)">
                                        <label class="form-check-label" for="heatmapToggle">ヒートマップ</label>
                                    </div>
                                </div>
                            </div>
                            <!-- ヒートマップ表示ボタン -->
                            <button id="expandHeatmapBtn" class="btn btn-outline-primary btn-sm" style="display: none;">
                                <i class="bi bi-graph-up"></i> ヒートマップを拡大
                            </button>
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
                                <!-- タブナビゲーション -->
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#feedback-tab" type="button">
                                        フィードバック
                                    </button>
                                </li>
                            </ul>

                            <!-- タブコンテンツ -->
                            <div class="tab-content mt-3">
                                <div class="tab-pane fade show active" id="clicks-tab">
                                    <div id="click-data" class="table-responsive"></div>
                                </div>
                                <div class="tab-pane fade" id="ranges-tab">
                                    <div id="range-data" class="table-responsive"></div>
                                </div>
                                <div class="tab-pane fade" id="scenes-tab">
                                    <div id="scene-data" class="table-responsive"></div>
                                </div>
                                <div class="tab-pane fade" id="feedback-tab">
                                    <div id="feedback-data" class="table-responsive"></div>
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
                            <input type="hidden" id="commentMode" value="new">
                            <input type="hidden" id="editTargetId">
                            <input type="hidden" id="editTargetType">
                            <textarea id="commentInput" class="form-control" rows="3" placeholder="ここにコメントを入力"></textarea>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" onclick="handleCommentSubmit()">送信</button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- フィードバック入力用モーダル -->
            <div class="modal fade" id="feedbackModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">フィードバック入力</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <!-- 発言者選択（ラジオボタン） -->
                            <div class="mb-3">
                                <label class="form-label">発言者：</label>
                                <div id="speakerCheckboxes">
                                    <!-- 発言者追加 -->
                                </div>
                            </div>
                            <!-- コメント入力欄 -->
                            <div class="mb-3">
                                <label for="feedbackInput" class="form-label">コメント：</label>
                                <textarea id="feedbackInput" class="form-control" rows="3" placeholder="ここにコメントを入力"></textarea>
                            </div>
                            <!-- 記録時間の表示 -->
                            <div class="text-muted">
                                記録時間: <span id="feedbackTimestamp">0:00</span>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" onclick="handleFeedbackSubmit()">送信</button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 削除確認用モーダル -->
            <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">削除の確認</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>このデータを削除しますか？</p>
                            <input type="hidden" id="deleteTargetId">
                            <input type="hidden" id="deleteTargetType">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-danger" onclick="TableManager.executeDelete()">削除</button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- ヒートマップ表示用モーダル -->
            <div class="modal fade" id="heatmapModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">アノテーション頻度分布</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <canvas id="heatmapModalChart"></canvas>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ガイド選択モーダル -->
            <div class="modal fade" id="guideSelectModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">ヘルプガイド</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <p>ガイドの表示方法を選択してください↓</p>
                            <button id="startTourBtn" class="btn btn-primary m-2">
                                <i class="bi bi-cursor"></i> 操作ガイド
                            </button>
                            <button id="showManualBtn" class="btn btn-info m-2">
                                <i class="bi bi-book"></i> 詳細マニュアル
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 詳細マニュアルモーダル -->
            <div class="modal fade" id="manualModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">システム利用マニュアル</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <!-- 目次 -->
                            <div class="help-toc mb-4">
                                <!-- 動的に挿入 -->
                            </div>
                            <!-- マニュアルコンテンツ -->
                            <div class="manual-content">
                                <!-- マニュアルが動的に挿入 -->
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" onclick="resetModalState()">閉じる</button>
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
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    </body>
</html>
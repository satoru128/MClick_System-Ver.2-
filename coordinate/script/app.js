//===========================================
// グローバル変数
//===========================================
let canvas;                    // キャンバス要素
let player;                    // YouTubeプレーヤー
let isCoordinateEnabled = false;  // 座標取得モード
let isReplayEnabled = false;   // リプレイモード
let userId = null;            // ユーザーID
let videoId = null;           // 動画ID
let ctx;                      // キャンバスコンテキスト
let isPlaying = false;        // 再生状態
let clickCount = 0;           //クリックカウント用
let selectedUsers = new Set(); // 選択されたユーザーのIDを保持
let allUsers = []; // 全ユーザーのリストを保持
let tempSelectionData = null;  // 一時的な選択データを保持
let popoverStates = new Map();  // ポップオーバーの表示状態を記憶
let activePopovers = [];     // アクティブなポップオーバーを管理

// クリック座標表示用の色の定義
const USER_COLORS = [
    { bg: 'rgba(255, 200, 200, 0.7)', text: '#000000' }, // 薄い赤
    { bg: 'rgba(200, 200, 255, 0.7)', text: '#000000' }, // 薄い青
    { bg: 'rgba(200, 255, 200, 0.7)', text: '#000000' }  // 薄い緑
];
let userColorAssignments = new Map(); // ユーザーIDと割り当てられた色の管理用
let isDrawingRange = false;     //範囲選択アノテーション
let rangeStartX, rangeStartY;   //範囲選択アノテーション

//===========================================
//ベースとなる状態管理クラス
//===========================================
/**
 * アノテーションの状態を管理するクラス
 */
class AnnotationStateManager {
    constructor() {
        this.annotationStates = new Map();  // アノテーションの表示状態
        this.commentStates = new Map();     // コメントの表示状態
        this.activePopovers = [];           // アクティブなポップオーバー
    }

    /**
     * アノテーションデータの初期化
     */
    initializeData(type, userId, data) {
        console.log('InitializeData called with:', { type, userId, data }); // 入力データの確認
        
        data.forEach(item => {
            const key = `${type}-${userId}-${item.id}`;
            
            if (type === 'range') {
                console.log('Processing range item:', item); // 各範囲データの確認
            }
    
            const stateData = {
                id: item.id,
                type: type,
                userId: userId,
                time: item.click_time,
                isVisible: false,
                comment: item.comment
            };
    
            if (type === 'range') {
                stateData.start_x = Number(item.start_x);
                stateData.start_y = Number(item.start_y);
                stateData.width = Number(item.width);
                stateData.height = Number(item.height);
            } else {
                stateData.x = item.x_coordinate || item.x;
                stateData.y = item.y_coordinate || item.y;
            }
    
            console.log('Created state data:', stateData); // 作成したデータの確認
            this.annotationStates.set(key, stateData);
        });
    }

    /**
     * 表示状態の更新
     */
    updateVisibility(currentTime) {
        let hasChanges = false;
        this.annotationStates.forEach((state, key) => {
            const timeDiff = currentTime - state.time;
            const shouldBeVisible = timeDiff >= 0 && timeDiff <= 2.0;
            
            if (state.isVisible !== shouldBeVisible) {
                state.isVisible = shouldBeVisible;
                hasChanges = true;
            }
        });
        return hasChanges;
    }

    /**
     * コメント表示状態の管理
     */
    toggleComment(key, visible) {
        this.commentStates.set(key, visible);
    }

    /**
     * 表示すべきアノテーションの取得
     */
    getVisibleAnnotations() {
        return Array.from(this.annotationStates.entries())
            .filter(([_, state]) => state.isVisible)
            .map(([key, state]) => ({
                key,
                ...state,
                showComment: this.commentStates.get(key) || false
            }));
    }
}

/**
 * リプレイ機能のための状態管理とデータの更新処理
 */
class ReplayManager {
    constructor() {
        this.stateManager = new AnnotationStateManager();
        this.monitoringId = null;
        this.isReplayActive = false;
    }

    /**
     * リプレイの初期化
     */
    initializeReplay() {
        if (selectedUsers.size === 0) {
            showModeError('リプレイ', 'ユーザーを選択してください');
            return false;
        }

        // データの取得と初期化
        Promise.all([
            // クリックデータ
            ...Array.from(selectedUsers).map(userId => 
                fetch('./coordinate/php/get_click_data.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ video_id: videoId, user_id: userId })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        this.stateManager.initializeData('click', userId, data.clicks);
                    }
                })
            ),
            // 範囲選択データ
            ...Array.from(selectedUsers).map(userId => 
                fetch('./coordinate/php/get_range_data.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ video_id: videoId, user_id: userId })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Fetched range data:', data); // デバッグ用
                    if (data.status === 'success') {
                        this.stateManager.initializeData('range', userId, data.ranges);
                    }
                })
            ),
            // シーン記録データ
            ...Array.from(selectedUsers).map(userId => 
                fetch('./coordinate/php/get_scene_data.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ video_id: videoId, user_id: userId })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        this.stateManager.initializeData('scene', userId, data.scenes);
                    }
                })
            )
        ])
        .then(() => {
            player.seekTo(0);
            this.startMonitoring();
            return true;
        })
        .catch(error => {
            console.error('データ取得エラー:', error);
            return false;
        });
    }

    /**
     * モニタリング開始
     */
    startMonitoring() {
        if (this.monitoringId) {
            clearInterval(this.monitoringId);
        }

        this.monitoringId = setInterval(() => {
            if (!this.isReplayActive) {
                clearInterval(this.monitoringId);
                return;
            }

            // 動画が一時停止中は更新しない
            if (player && player.getPlayerState() === YT.PlayerState.PAUSED) {
                return;
            }

            const currentTime = player.getCurrentTime();
            this.updateDisplay(currentTime);
        }, 500);
    }

    /**
     * 表示の更新
     */
    updateDisplay(currentTime) {
        const hasChanges = this.stateManager.updateVisibility(currentTime);
        if (hasChanges) {
            this.render();
        }
    }

    /**
     * 描画処理
     */
    render() {
        // 現在表示中の要素をマーク
        const currentElements = new Set(
            document.querySelectorAll('.annotation-container')
        );

        const visibleAnnotations = this.stateManager.getVisibleAnnotations();
        
        visibleAnnotations.forEach(annotation => {
            let container = document.getElementById(
                `annotation-${annotation.type}-${annotation.id}`
            );

            // 新規要素の作成
            if (!container) {
                container = this.createAnnotationElement(annotation);
                this.showComment(container, annotation);
            } else {
                // 既存要素を表示維持リストから削除
                currentElements.delete(container);
                // コメント表示状態の更新
                this.updateCommentVisibility(container, annotation);
            }
        });

        // 不要になった要素を削除
        currentElements.forEach(element => {
            const popover = bootstrap.Popover.getInstance(element);
            if (popover) {
                popover.dispose();
            }
            element.remove();
        });
    }

    /**
     * アノテーション要素の作成１
     */
    createAnnotationElement(annotation) {
        // 最初にcolorを取得
        const color = getUserColor(annotation.userId);
        if (!color) return null;
    
        if (annotation.type === 'range') {
            console.log('Range data:', {    //デバッグ用
                start_x: annotation.start_x,
                start_y: annotation.start_y,
                width: annotation.width,
                height: annotation.height
            });

            // 範囲選択の描画
            ctx.fillStyle = color.bg.replace('0.7', '0.2');
            ctx.fillRect(annotation.start_x, annotation.start_y, annotation.width, annotation.height);
            
            // 範囲の枠線
            ctx.strokeStyle = color.bg.replace('0.7', '0.8');
            ctx.lineWidth = 2;
            ctx.strokeRect(annotation.start_x, annotation.start_y, annotation.width, annotation.height);
        }
    
        // 番号表示用のコンテナ作成
        const container = document.createElement('div');
        container.id = `annotation-${annotation.type}-${annotation.id}`;
        container.className = 'annotation-container';
    
        // 形状要素の作成
        const shape = document.createElement('div');
        shape.className = annotation.type === 'scene' ? 'annotation-square' : 'annotation-circle';
        shape.style.backgroundColor = color.bg;
    
        // 番号要素の作成
        const number = document.createElement('div');
        number.className = 'annotation-number';
        number.textContent = annotation.id.toString();
    
        // 要素の組み立て
        container.appendChild(shape);
        container.appendChild(number);
    
        // 位置の設定
        this.updateAnnotationPosition(container, annotation);
    
        // videoコンテナに追加
        const videoContainer = document.getElementById('video-container');
        videoContainer.appendChild(container);

        return container;
    }

    /**
     * コメントの表示制御
     */
    showComment(container, annotation) {
        if (!annotation.comment || !container) return;

        // 初期化を確実にするため、少し遅延させる
        requestAnimationFrame(() => {
            try {
                // 既存のポップオーバーの確認と破棄
                const existingPopover = bootstrap.Popover.getInstance(container);
                if (existingPopover) {
                    existingPopover.dispose();
                }

                if (!document.body.contains(container)) return;

                let popover = null;
                const initPopover = () => {
                    popover = new bootstrap.Popover(container, {
                        container: 'body',
                        placement: 'right',
                        trigger: 'manual',
                        content: annotation.comment,
                        html: true
                    });

                    // クリックイベントの設定
                    container.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (!document.body.contains(container)) return;
                        
                        const isShown = container.classList.contains('popover-shown');
                        if (isShown && popover) {
                            try {
                                popover.hide();
                                container.classList.remove('popover-shown');
                            } catch (error) {
                                console.warn('Popover hide error:', error);
                            }
                        } else if (popover) {
                            try {
                                popover.show();
                                container.classList.add('popover-shown');
                            } catch (error) {
                                console.warn('Popover show error:', error);
                            }
                        }
                    });

                    return popover;
                };

                // ポップオーバーの初期化
                popover = initPopover();

                // コメント常時表示モードの場合
                if (isCommentsAlwaysVisible()) {
                    setTimeout(() => {
                        if (document.body.contains(container) && popover) {
                            try {
                                if (!container.classList.contains('popover-shown')) {
                                    popover.show();
                                    container.classList.add('popover-shown');
                                }
                            } catch (error) {
                                console.warn('Initial popover show error:', error);
                                // エラーが発生した場合、再初期化を試みる
                                popover.dispose();
                                popover = initPopover();
                            }
                        }
                    }, 100);
                }
            } catch (error) {
                console.warn('Popover setup error:', error);
            }
        });
    }

    /**
     * コメント表示状態の更新
     */
    updateCommentVisibility(container, annotation) {
        if (!annotation.comment) return;

        const popover = bootstrap.Popover.getInstance(container);
        if (!popover) return;

        const key = `${annotation.type}-${annotation.userId}-${annotation.id}`;
        const shouldShow = this.stateManager.commentStates.get(key) || 
                          document.getElementById('showComments').checked;

        try {
            if (shouldShow && !container.classList.contains('popover-shown')) {
                popover.show();
                container.classList.add('popover-shown');
            } else if (!shouldShow && container.classList.contains('popover-shown')) {
                popover.hide();
                container.classList.remove('popover-shown');
            }
        } catch (error) {
            console.warn('Popover visibility error:', error);
        }
    }

    /**
     * アノテーション要素の位置更新
     */
    updateAnnotationPosition(container, annotation) {
        switch (annotation.type) {
            case 'click':
                container.style.left = `${annotation.x}px`;
                container.style.top = `${annotation.y}px`;
                break;
            case 'range':
                container.style.left = `${annotation.start_x}px`;
                container.style.top = `${annotation.start_y}px`;
                break;
            case 'scene':
                // シーン記録は画面下部に固定表示
                const colorIndex = userColorAssignments.get(annotation.userId);
                const baseY = canvas.height - 40;
                const yOffset = 40;
                const y = baseY - (colorIndex * yOffset);
                container.style.left = '30px';
                container.style.top = `${y}px`;
                break;
        }
    }
}

const replayManager = new ReplayManager();  // リプレイデータの管理

//===========================================
// YouTube Player 初期化
//===========================================
function onYouTubeIframeAPIReady() {
    console.log('YouTube API Ready');
    videoId = document.getElementById('player').getAttribute('data-video-id');
    window.videoId = videoId;
    console.log('Retrieved Video ID:', videoId);

    // ユーザーIDの取得
    fetch('./coordinate/php/get_user_id.php')
        .then(response => response.json())
        .then(data => {
            if (data.user_id) {
                userId = data.user_id;
                console.log('User ID initialized:', userId);
                
                // プレーヤーを初期化
                initializePlayer(videoId);

                // リプレイ機能の初期化
                document.getElementById('replayBtn').addEventListener('change', handleReplayChange);
                document.getElementById('showComments').addEventListener('change', function(e) {
                    if (replayManager.isReplayActive) {
                        replayManager.render();
                    }
                });
            } else {
                console.error('User ID not found'); 
                alert('ユーザーIDが見つかりません。再度ログインしてください。');
            }
        })
        .catch(error => {
            console.error('Error fetching user ID:', error); 
            alert('ユーザーID取得中にエラーが発生しました。');
        });
}

// プレーヤーの初期化関数を分離
function initializePlayer(videoId) {
    player = new YT.Player('player', {
        height: '360',
        width: '640',
        videoId: videoId || '11GgnxEEyXQ', // デフォルト動画ID
        playerVars: {
            'controls': 0,    // YouTubeコントロールを非表示
            'disablekb': 1,   // キーボード操作を無効化
            'modestbranding': 1,  // YouTubeロゴを最小限
            'rel': 0,         // 関連動画を非表示
            'showinfo': 0,     // 動画情報を非表示
            'enablejsapi': 1,  // JavaScript APIを有効化
            'playsinline': 1,  // インライン再生を強制
            'iv_load_policy': 3 // アノテーションを無効化
        },
        events: {
            'onReady': onPlayerReady,  // プレーヤーの準備完了時
            'onStateChange': onPlayerStateChange,  // 再生状態が変化した時
            'onError': onPlayerError  // エラー発生時
        }
    });
    console.log('プレーヤー初期化完了');
}

// プレーヤーの準備完了時の処理
function onPlayerReady(event) {
    console.log('Player ready');
    console.log('Video title:', player.getVideoData().title);
    console.log('初期化時の値確認:', {
        videoId: window.videoId,
        userId: window.userId
    });

    // 各機能の初期化
    initializeCanvas();     // キャンバスの初期化
    initializeControls();   // コントロールの初期化
    initializeUserSelect(); // ユーザー選択機能の初期化
    initializeReplaySettings(); // リプレイ表示選択の初期化
    initializeContextMenu(); // 右クリックメニューの初期化
    initializeTabsAndData();    // タブとデータ表示の初期化
}

function onPlayerStateChange(event) {
    isPlaying = (event.data === YT.PlayerState.PLAYING);  // 再生中かどうかを更新

    // 再生開始時にポップオーバーの位置を更新する処理を追加
    if (isPlaying && isCommentsAlwaysVisible()) {
        document.querySelectorAll('.annotation-container').forEach(container => {
            const popover = bootstrap.Popover.getInstance(container);
            if (popover) {
                popover.update();
            }
        });
    }
}

// エラーハンドラ
function onPlayerError(event) {
    // event.dataは，YouTube IFrame API によって自動的に設定される
    console.error('Player error code:', event.data);
    let errorMessage = '';

    // event.dataの値によってエラーメッセージを変更
    switch (event.data) {
        case 2:
            errorMessage = '無効なパラメータだよ';
            break;
        case 5:
            errorMessage = 'HTML5プレーヤーでエラーだよ';
            break;
        case 100:
            errorMessage = '動画が見つからないよ';
            break;
        case 101:
        case 150:
            errorMessage = '動画の埋め込み再生が許可されていないようです';
            break;
        default:
            errorMessage = 'エラーが発生した';
    }
    console.error('Error message:', errorMessage);
}

//===========================================
// プレーヤーコントロールの初期化と設定
//===========================================
function initializeControls() {
    console.log('Initializing controls');
    setupPlaybackControls();    // 再生関連のコントロール設定
    setupAnnotationControls();  // アノテーション関連のコントロール設定
    setInterval(updateDisplayTime, 1000);  // 1秒ごとに時間表示を更新
}

/**
 * 再生関連のコントロール設定
 */
function setupPlaybackControls() {
    // 基本的な再生コントロール
    document.getElementById('playBtn').addEventListener('click', handlePlayClick);
    document.getElementById('pauseBtn').addEventListener('click', handlePauseClick);
    document.getElementById('stopBtn').addEventListener('click', handleStopClick);
    
    // 音声とシーク関連のコントロール
    document.getElementById('muteBtn').addEventListener('click', handleMuteClick);
    document.getElementById('rewindBtn').addEventListener('click', handleRewindClick);
    document.getElementById('skipBtn').addEventListener('click', handleSkipClick);
    document.getElementById('seekBar').addEventListener('input', handleSeekBarInput);
}

/**
*  アノテーション関連のコントロールを設定
* - 座標取得，リプレイモード，ミスボタン，コメントボタン
*/
function setupAnnotationControls() {
    // 座標取得＆リプレイのトグル
    const toggleBtn = document.getElementById('toggleCoordinateBtn');
    const replayBtn = document.getElementById('replayBtn');
    
    // ミス＆コメントボタン
    const mistakeBtn = document.getElementById('mistakeBtn');
    const commentBtn = document.getElementById('commentBtn');

    //データのエクスポートボタン
    const exportBtn =  document.getElementById('exportBtn');
 
    // 座標取得モードの切り替え
    if (toggleBtn) {
        toggleBtn.addEventListener('change', handleToggleCoordinateChange);
    } else {
        console.error('座標取得ボタンがない');
    }
 
    // リプレイモードの切り替え
    if (replayBtn) {
        replayBtn.addEventListener('change', handleReplayChange);
    } else {
        console.error('リプレイボタンがない');
    }
 
    // ミスボタン
    if (mistakeBtn) {
        mistakeBtn.addEventListener('click', handleMistakeClick);
    } else {
        console.error('ミスボタンがない');
    }
 
    // コメントボタン
    if (commentBtn) {
        commentBtn.addEventListener('click', handleCommentClick);
    } else {
        console.error('コメントボタンがない');
    }

    //データのエクスポートボタン
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExportClick);
    } else {
        console.error('エクスポートボタンがない');
    }
}

//===========================================
// 動画のコントロールボタン制御
//===========================================
/**
 * 再生ボタン
 */
function handlePlayClick() {
    console.log('再生ボタンがクリックされた');
    if (player) {
        player.playVideo();
        isPlaying = true;
    }
}

/**
 * 一時停止
 */
function handlePauseClick() {
    console.log('一時停止ボタンがクリックされた');
    if (player) {
        player.pauseVideo();
        isPlaying = false;
    }
}

/**
 * 停止ボタン
 */
function handleStopClick() {
    console.log('停止ボタンがクリックされた');
    if (player) {
        player.stopVideo();
        player.seekTo(0);   // はじめに戻る
        isPlaying = false;
        player.pauseVideo();// 一時停止状態にする
    }
}

/**
 * ミュートボタン
 */
function handleMuteClick() {
    console.log('ミュートボタンが押された');
    if (player) {
        const muteBtn = document.getElementById('muteBtn');
        if (player.isMuted()) {
            player.unMute();
            muteBtn.textContent = '🔊'; 
        } else {
            player.mute();
            muteBtn.textContent = '🔇';
        }
    }
}

/**
 * 10秒戻るボタン
 */
function handleRewindClick() {
    console.log('Rewind button clicked');
    if (player) {
        // 現在の再生時間を取得
        const currentTime = player.getCurrentTime();
        // 10秒前の位置に移動（0秒以下にはならないようにする）
        player.seekTo(Math.max(currentTime - 10, 0), true);
    }
}

/**
 * 10秒送りボタン
 */
function handleSkipClick() {
    console.log('Skip button clicked');
    if (player) {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        player.seekTo(Math.min(currentTime + 10, duration), true);
    }
}

/**
 * シークバー
 * @param {Event} event - 入力イベント
 */
function handleSeekBarInput(event) {
    if (player) {
        const time = player.getDuration() * (event.target.value / 100);
        player.seekTo(time, true);
    }
}

//===========================================
// ユーティリティ関数（時間表示関連）
//===========================================
/**
 * 動画の現在時間と総時間
 */
function updateDisplayTime() {
    // プレーヤーが準備できていない場合は何もしない
    if (!player || !player.getCurrentTime) return;
    
    // 現在時間と総時間を取得して
    const currentTime = formatTime(player.getCurrentTime());
    const duration = formatTime(player.getDuration());
    document.getElementById('timeDisplay').textContent = `${currentTime} / ${duration}`;
    
    // シークバーの位置も更新
    const seekBar = document.getElementById('seekBar');
    if (seekBar) {
        // 現在位置をパーセント値（0-100）で設定
        seekBar.value = (player.getCurrentTime() / player.getDuration()) * 100;
    }
}

/**
 * 秒数を「分:秒」形式の文字列に変換
 * @param {number} seconds - 変換する秒数
 * @returns {string} 「分:秒」形式の文字列
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    // 秒が1桁の場合は0を付ける
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

//===========================================
// アノテーション機能（左クリック）
//===========================================
/**
 * キャンバスの初期化
 */
function initializeCanvas() {
    console.log('キャンバスの初期化を開始');
    canvas = document.getElementById('myCanvas');  // グローバル変数に代入
    ctx = canvas.getContext('2d');

    // キャンバスのサイズを設定（動画と同じに）
    canvas.width = 640;
    canvas.height = 360;
    
    // キャンバスのクリックイベント
    canvas.addEventListener('click', handleCanvasClick);
    console.log('キャンバスの初期化完了');
}

/**
* 座標取得クリックイベント（左クリック）
* @param {Event} event - クリックイベント
*/
function handleCanvasClick(event) {
    // 範囲選択中は処理しない
    if (isDrawingRange) {
        return;
    }
    
    // 座標取得モードがOFFの場合は処理しない
    if (!isCoordinateEnabled) {
        console.log('座標取得モード：OFF');
        return;
    }

    // リプレイモード中は処理しない
    if (isReplayEnabled) {
        return;
    }

    // 範囲選択中は処理しない
    if (isDrawingRange) {
        return;
    }

    // イベントの伝播を止める
    event.preventDefault();
    event.stopPropagation();
 
    // クリック座標の計算
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const clickTime = player.getCurrentTime();

    // 座標の保存
    saveCoordinate(x, y, clickTime)
        .then(result => {
            console.log('座標保存成功:', result);
            visualizeClick(x, y);  // クリック位置を可視化
            return fetchClickCoordinates();  // 座標データ一覧を更新
        })
        .catch(error => {
            console.error('座標の保存に失敗:', error);
            alert('座標の保存中にエラーが発生しました。');
        });
}

/**
 * クリック座標データの保存
 * @param {number} x - X座標（0-1の範囲）
 * @param {number} y - Y座標（0-1の範囲）
 * @param {number} clickTime - クリック時の動画再生時間
 * @returns {Promise} 保存処理のPromise
 */
function saveCoordinate(x, y, clickTime) {
    console.log('Saving coordinate:', { x, y, clickTime, userId, videoId });
    return fetch('./coordinate/php/save_coordinates.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: userId,
            x: x,
            y: y,
            click_time: clickTime,
            video_id: videoId
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(text => {
        console.log('Raw server response:', text);
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error('JSON parse error:', e);
            throw new Error('Invalid JSON response: ' + text);
        }
    })
    .then(result => {
        if (result.status === "success") {
            console.log('Coordinates saved successfully');
            return result;
        } else {
            throw new Error('Server returned error: ' + (result.message || 'Unknown error'));
        }
    });
}

/**
 * クリック位置の可視化
 * @param {number} x - X座標
 * @param {number} y - Y座標
 */
//約1.5秒かけて消える (0.02 × 30ミリ秒 × 50回)
function visualizeClick(x, y) { 
    const canvas = document.getElementById('myCanvas');
    let opacity = 1.0;  // 透明度（1.0 = 完全不透明）

    function drawCircle() {
        ctx.clearRect(x - 6, y - 6, 12, 12);  // 前の円を消す
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;  // 透明度を設定
        ctx.fill();
    }

    // フェードアウトのアニメーション
    const fadeInterval = setInterval(() => {
        opacity -= 0.02;  // 透明度を徐々に下げる
        
        if (opacity <= 0) {
            clearInterval(fadeInterval);  // 完全に透明になったら停止
            ctx.clearRect(x - 6, y - 6, 12, 12);  // 円を消す
        } else {
            drawCircle();  // 新しい透明度で円を描画
        }
    }, 30);  // 30ミリ秒ごとに更新
}

//===========================================
// アノテーション機能（右クリック）
//===========================================
/**
 * 1. コンテキストメニューの初期化と表示制御
 */
function initializeContextMenu() {
    const canvas = document.getElementById('myCanvas');
    const contextMenu = document.getElementById('customContextMenu');

    // 閉じるボタンの処理
    const closeButton = contextMenu.querySelector('.btn-close');
    if (closeButton) {
        closeButton.addEventListener('click', function(e) {
            // イベントの伝播を止める（メニュー項目のクリックを防ぐため）
            e.preventDefault();
            e.stopPropagation();

            // メニューを非表示
            contextMenu.style.display = 'none';

            // 動画を再生（一時停止していた場合）
            if (player) {
                player.playVideo();
            } 
        });
    }

    // 右クリック処理
    canvas.addEventListener('contextmenu', function(e) {
        // 座標取得モードがオフ、またはリプレイモード中は右クリックメニューを表示しない
        if (!isCoordinateEnabled || isReplayEnabled) {
            e.preventDefault(); // ブラウザのデフォルト右クリックメニューを防ぐ
            return;
        }

        e.preventDefault();  // ブラウザのデフォルト右クリックメニューを防ぐ
        e.stopPropagation(); // 他のイベントハンドラへの伝播を停止

        player.pauseVideo();

        contextMenu.style.display = 'block';
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
        
        const canvas = e.target;
        rangeStartX = e.clientX - canvas.getBoundingClientRect().left;
        rangeStartY = e.clientY - canvas.getBoundingClientRect().top;
    });


    // デバッグ用：右クリックイベントが発火しているか確認
    canvas.addEventListener('mousedown', function(e) {
        if (e.button === 2) { // 右クリック
            console.log('右クリックされた');
        }
    });

    // メニューアイテムのクリックイベント
    contextMenu.addEventListener('click', function(e) {
        const action = e.target.closest('.context-menu-item')?.dataset.action;
        if (!action) return;
    
        // 通常のクリック記録を防ぐためにフラグを設定
        e.preventDefault();
        e.stopPropagation();
        
        switch (action) {
            case 'range':
                startRangeSelection();
                break;
            case 'scene':
                const currentTime = player.getCurrentTime();
                tempSelectionData = {
                    type: 'scene',
                    data: {
                        time: currentTime
                    }
                };
                showCommentModal('scene');
                break;
        }
        contextMenu.style.display = 'none';
    });

    // メニュー以外をクリックした時に閉じる
    document.addEventListener('click', function(e) {
        if (!contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
        }
    });
}

/**
 * 2. 範囲選択の開始
 */
function startRangeSelection() {
    const canvas = document.getElementById('myCanvas');
    isDrawingRange = true;

    // 最初のクリックで開始位置を設定
    function onFirstClick(e) {
        // 通常のクリックイベントを防止
        e.preventDefault();
        e.stopPropagation();

        const rect = canvas.getBoundingClientRect();
        rangeStartX = e.clientX - rect.left;
        rangeStartY = e.clientY - rect.top;

        // 開始位置が設定されたら、次のクリックのリスナーを設定
        canvas.removeEventListener('click', onFirstClick);
        canvas.addEventListener('click', onSecondClick);

        // マウス移動時の範囲プレビュー表示を開始
        canvas.addEventListener('mousemove', onMouseMove);
    }

    // マウス移動時の範囲プレビュー
    function onMouseMove(e) {
        if (!isDrawingRange) return;

        const rect = canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 123, 255, 0.2)';
        ctx.strokeStyle = 'rgba(0, 123, 255, 0.8)';
        ctx.lineWidth = 2;

        const width = currentX - rangeStartX;
        const height = currentY - rangeStartY;
        ctx.fillRect(rangeStartX, rangeStartY, width, height);
        ctx.strokeRect(rangeStartX, rangeStartY, width, height);
    }

    // 2回目のクリックで範囲を確定
    function onSecondClick(e) {
        // 通常のクリックイベントを防止
        e.preventDefault();
        e.stopPropagation();

        const rect = canvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        // 範囲選択データを保存
        tempSelectionData = {
            type: 'range',
            data: {
                startX: Math.min(rangeStartX, endX),
                startY: Math.min(rangeStartY, endY),
                width: Math.abs(endX - rangeStartX),
                height: Math.abs(endY - rangeStartY),
                time: player.getCurrentTime()
            }
        };

        // イベントリスナーを削除
        canvas.removeEventListener('click', onSecondClick);
        canvas.removeEventListener('mousemove', onMouseMove);
        
        // キャンバスをクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 範囲選択モードを終了
        isDrawingRange = false;

        // コメント入力モーダルを表示
        showCommentModal('range');
    }

    // 最初のクリックのリスナーを設定
    canvas.addEventListener('click', onFirstClick);
}

/**
 * 3．範囲選択の終了処理
 */
function endSelection(e) {
    if (!isDrawingRange) return;
    
    // イベントの伝播を停止して通常のクリック処理を防ぐ
    e.preventDefault();
    e.stopPropagation();
    
    isDrawingRange = false;

    // 選択範囲データの保存準備
    const canvas = document.getElementById('myCanvas');
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    // 選択範囲のデータを一時保存
    tempSelectionData = {
        type: 'range',
        data: {
            startX: Math.min(rangeStartX, endX),  // 左上のX座標
            startY: Math.min(rangeStartY, endY),  // 左上のY座標
            width: Math.abs(endX - rangeStartX),  // 範囲の幅
            height: Math.abs(endY - rangeStartY), // 範囲の高さ
            time: player.getCurrentTime()         // 記録時間
        }
    };

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // コメント入力モーダルを表示
    showCommentModal('range');
}


//===========================================
// リプレイ機能（共通表示）
//===========================================
/**
 * リプレイの初期化
 */
function initializeReplay() {
    // 選択されているユーザーが0の場合
    if (selectedUsers.size === 0) {
        showModeError('リプレイ', 'ユーザーを選択してください');
        stopReplay();
        return;
    }

    // 動画を停止して最初に巻き戻す
    player.seekTo(0);
    clearCanvas();
    popoverStates.clear();  // ポップオーバーの表示状態をリセット

    // 選択されたユーザーのクリックデータ取得
    Promise.all([
        // クリックデータ
        ...Array.from(selectedUsers).map(userId => 
            fetch('./coordinate/php/get_click_data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    video_id: videoId,
                    user_id: userId
                })
            })
            .then(response => response.json())
            .then(data => ({
                type: 'click',
                userId: userId,
                data: data.status === 'success' ? data.clicks : []
            }))
        ),
        // 範囲選択データ取得
        ...Array.from(selectedUsers).map(userId => 
            fetch('./coordinate/php/get_range_data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    video_id: videoId,
                    user_id: userId
                })
            })
            .then(response => response.json())
            .then(data => ({
                type: 'range',
                userId: userId,
                data: data.status === 'success' ? data.ranges : []
            }))
        ),
        // シーン記録データ取得
        ...Array.from(selectedUsers).map(userId => 
            fetch('./coordinate/php/get_scene_data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    video_id: videoId,
                    user_id: userId
                })
            })
            .then(response => response.json())
            .then(data => ({
                type: 'scene',
                userId: userId,
                data: data.status === 'success' ? data.scenes : []
            }))
        )
    ])
    .then(results => {
        // データ整理
        replayClickData = {};
        replayRangeData = {};
        replaySceneData = {};

        results.forEach(result => {
            if (result.data.length > 0) {
                switch(result.type) {
                    case 'click':
                        replayClickData[result.userId] = result.data;
                        break;
                    case 'range':
                        replayRangeData[result.userId] = result.data;
                        break;
                    case 'scene':
                        replaySceneData[result.userId] = result.data;
                        break;
                }
            }
        });

        // リプレイ開始
        startReplayMonitoring();
        player.pauseVideo();
    })
    .catch(error => {
        console.error('リプレイデータの取得に失敗:', error);
        showModeError('エラー', 'データの取得に失敗しました');
        stopReplay();
    });
}

/**
 * リプレイ時の監視開始（200msごとに更新）
 */
function startReplayMonitoring() {
    // 既存のモニタリングがあれば停止
    if (replayIntervalId) {
        clearInterval(replayIntervalId);
    }
    
    // 新しいモニタリングを開始
    replayIntervalId = setInterval(() => {
        if (!isReplayEnabled) {
            clearInterval(replayIntervalId);
            return;
        }
        
        // 動画が一時停止中は更新しない
        if (player && player.getPlayerState() === YT.PlayerState.PAUSED) {
            return;
        }
        
        const currentTime = player.getCurrentTime();
        updateReplayDisplay(currentTime);
    }, 200);
}

/**
 * リプレイ要素のクリーンアップ
 */
function clearReplayElements() {
    // 現在表示中のアノテーションコンテナを取得
    const currentContainers = new Set(
        document.querySelectorAll('.annotation-container')
    );

    // アクティブなポップオーバーをチェック
    activePopovers = activePopovers.filter(item => {
        // 要素が存在しない、またはポップオーバーが不要になった場合
        if (!document.body.contains(item.element) || 
            !currentContainers.has(item.element)) {
            if (item.popover && document.body.contains(item.element)) {
                try {
                    item.popover.dispose();
                } catch (error) {
                    console.warn('Popover cleanup error:', error);
                }
            }
            return false;
        }
        return true;
    });

    // 表示中のポップオーバーがないコンテナを削除
    currentContainers.forEach(container => {
        if (!container.classList.contains('popover-shown')) {
            if (document.body.contains(container)) {
                container.remove();
            }
        }
    });
}


/**
 * コメント表示（共通）
 */
function handleAnnotationComment(x, y, id, comment, color, type) {
    const elementId = `annotation-${type}-${id}`;
    
    // 既存要素のクリーンアップ
    const existingElement = document.getElementById(elementId);
    if (existingElement) {
        const existingPopover = bootstrap.Popover.getInstance(existingElement);
        if (existingPopover) {
            existingPopover.dispose();
        }
        existingElement.remove();
    }

    // コンテナの作成
    const container = document.createElement('div');
    container.id = elementId;
    container.className = 'annotation-container';

    // 形状要素の作成
    const shape = document.createElement('div');
    shape.className = type === 'scene' ? 'annotation-square' : 'annotation-circle';
    shape.style.backgroundColor = color;

    // 番号要素の作成
    const number = document.createElement('div');
    number.className = 'annotation-number';
    number.textContent = id.toString();

    // 要素の組み立て
    container.appendChild(shape);
    container.appendChild(number);

    // videoコンテナに追加してから位置設定
    const videoContainer = document.getElementById('video-container');
    videoContainer.appendChild(container);

    // 位置設定
    container.style.left = `${x}px`;
    container.style.top = `${y}px`;

    // コメントがある場合のポップオーバー設定
    if (comment) {
        // 要素が完全にDOMに追加されてから初期化
        requestAnimationFrame(() => {
            try {
                const popover = new bootstrap.Popover(container, {
                    container: 'body',
                    placement: 'right',
                    trigger: 'manual',
                    content: comment
                });

                // アクティブなポップオーバーとして記録
                activePopovers.push({
                    element: container,
                    popover: popover
                });

                // クリックイベントの設定
                container.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isShown = container.classList.contains('popover-shown');
                    
                    try {
                        if (isShown) {
                            popover.hide();
                            container.classList.remove('popover-shown');
                        } else {
                            popover.show();
                            container.classList.add('popover-shown');
                        }
                    } catch (error) {
                        console.warn('Popover toggle error:', error);
                    }
                });

                // コメント常時表示モードの場合
                if (isCommentsAlwaysVisible()) {
                    setTimeout(() => {
                        if (document.body.contains(container)) {
                            try {
                                popover.show();
                                container.classList.add('popover-shown');
                            } catch (error) {
                                console.warn('Initial popover show error:', error);
                            }
                        }
                    }, 100);
                }
            } catch (error) {
                console.warn('Popover initialization error:', error);
            }
        });
    }

    return container;
}

/**
 * タイプに応じたポップオーバーのオフセットを取得
 */
function getPopoverOffset(type) {
    switch(type) {
        case 'click':
            return [0, 15];  // 上下0px, 左右15px
        case 'range':
            return [0, 15];  // 上下0px, 左右15px
        case 'scene':
            return [-5, 20]; // 上に5px, 右に20px
        default:
            return [0, 15];
    }
}


/**
 * ユーザーIDに対応する色情報を取得
 * @param {string} userId - ユーザーID
 * @returns {Object|null} 色情報（bgとtextプロパティを持つ）
 */
function getUserColor(userId) {
    const colorIndex = userColorAssignments.get(userId);
    if (colorIndex !== undefined) {
        return USER_COLORS[colorIndex];
    }
    return null;
}

/**
 * コメントの常時表示が有効かどうかを判定（共通）
 */
function isCommentsAlwaysVisible() {
    const checkbox = document.getElementById('showComments');
    return checkbox && checkbox.checked;
}

/**
 * リプレイの停止
 */
function stopReplay() {
    clearCanvas();
    if (replayIntervalId) {
        clearInterval(replayIntervalId);
        replayIntervalId = null;
    }
    replayClickData = {};
    isReplayEnabled = false;
    document.getElementById('replayBtn').checked = false;
}

/**
 * キャンバスをクリア
 */
function clearCanvas() {
    const canvas = document.getElementById('myCanvas');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * リプレイ要素のクリーンアップ
 */
function clearAnnotations() {
    document.querySelectorAll('.annotation-container').forEach(container => {
        const popover = bootstrap.Popover.getInstance(container);
        if (popover) {
            try {
                popover.dispose();
            } catch (error) {
                console.warn('Popover cleanup error:', error);
            }
        }
        container.remove();
    });
}

/**
 * アノテーション表示用のコンテナ作成（共通処理）
 */
function createAnnotationContainer(type, id, color) {
    const container = document.createElement('div');
    container.className = 'annotation-container';
    container.id = `annotation-${type}-${id}`;

    const shape = document.createElement('div');
    shape.className = type === 'scene' ? 'annotation-square' : 'annotation-circle';
    shape.style.backgroundColor = color;

    const number = document.createElement('div');
    number.className = 'annotation-number';
    number.textContent = id.toString();

    container.appendChild(shape);
    container.appendChild(number);

    return container;
}

//===========================================
// 左クリックのリプレイ機能
//===========================================


//===========================================
// 範囲選択の描画用
//===========================================



//===========================================
// シーン記録のリプレイ機能
//===========================================


//===========================================
// リプレイに表示するユーザーの選択用チェックボックス
//===========================================
/**
 * ユーザー選択のチェックボックス変更時の処理
 */
function handleUserCheckboxChange(e) {
    if (e.target.checked) {
        // 選択数の制限チェック
        if (selectedUsers.size >= 3) {
            e.preventDefault();
            e.target.checked = false;
            showModeError('制限', '最大3名まで選択可能です');
            return;
        }
        
        selectedUsers.add(e.target.value);
        const nextColorIndex = userColorAssignments.size;
        userColorAssignments.set(e.target.value, nextColorIndex);
    } else {
        selectedUsers.delete(e.target.value);
        userColorAssignments.delete(e.target.value);
        
        // 残りのユーザーの色を再割り当て
        const remainingUsers = Array.from(selectedUsers);
        userColorAssignments.clear();
        remainingUsers.forEach((userId, index) => {
            userColorAssignments.set(userId, index);
        });
    }
    
    // 色プレビューの更新
    updateColorPreviews();
    
    // 全てのデータテーブルを更新
    fetchClickCoordinates();
    fetchRangeData();
    fetchSceneData();
    
    updateSelectedUsersDisplay();
}

//===========================================
// テーブルに表示するユーザーの選択用ドロップダウン
//===========================================
/**
 * ユーザー選択機能の初期化
 */
function initializeUserSelect() {
    // ユーザー選択UI要素の作成
    const userSelectDiv = document.createElement('div');
    userSelectDiv.className = 'mb-3';
    userSelectDiv.innerHTML = `
        <div class="d-flex align-items-center mb-2">
            <div id="user-select"></div>
        </div>
    `;
    
    // 座標データ表示領域の前に挿入
    const coordDataDiv = document.getElementById('coordinate-data');
    coordDataDiv.parentNode.insertBefore(userSelectDiv, coordDataDiv);

    // ユーザー一覧の取得と表示
    fetchUserList();
}

/**
 * ユーザー一覧の取得
 */
function fetchUserList() {
    fetch('./coordinate/php/get_user_id.php?mode=all')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                allUsers = data.users;
                renderUserSelect();
                fetchClickCoordinates();
                fetchRangeData();
                fetchSceneData()
            }
        })
        .catch(error => {
            console.error('ユーザー一覧の取得失敗:', error);
            showModeError('エラー', 'ユーザー一覧の取得に失敗しました');
        });
}

/**
 * ユーザー選択UIの作成（ドロップダウン）
 */
function renderUserSelect() {
    const container = document.getElementById('user-select');
    if (!container) return;

    // ドロップダウンメニューの内容のみを更新
    container.innerHTML = allUsers.map(user => {
        const colorIndex = userColorAssignments.get(user.user_id);
        const color = colorIndex !== undefined ? USER_COLORS[colorIndex].bg : 'transparent';
        return `
            <li>
                <div class="dropdown-item">
                    <div class="form-check">
                        <input class="form-check-input user-checkbox" 
                               type="checkbox" 
                               id="user-${user.user_id}" 
                               value="${user.user_id}"
                               ${selectedUsers.has(user.user_id) ? 'checked' : ''}>
                        <label class="form-check-label" for="user-${user.user_id}">
                            <span class="color-preview" style="
                                display: inline-block;
                                width: 12px;
                                height: 12px;
                                margin-right: 5px;
                                background-color: ${color};
                                border-radius: 50%;
                                border: 1px solid #ccc;
                            "></span>
                            ${user.name} (${user.user_id})
                        </label>
                    </div>
                </div>
            </li>
        `;
    }).join('');

    // チェックボックスのイベント設定
    document.querySelectorAll('.user-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function(e) {
            if (e.target.checked) {
                // 選択数の制限チェック
                if (selectedUsers.size >= 3) {
                    e.preventDefault();
                    e.target.checked = false;
                    showModeError('制限', '最大3名まで選択可能です');
                    return;
                }
                
                selectedUsers.add(e.target.value);
                const nextColorIndex = userColorAssignments.size;
                userColorAssignments.set(e.target.value, nextColorIndex);
            } else {
                selectedUsers.delete(e.target.value);
                userColorAssignments.delete(e.target.value);
                
                // 残りのユーザーの色を再割り当て
                const remainingUsers = Array.from(selectedUsers);
                userColorAssignments.clear();
                remainingUsers.forEach((userId, index) => {
                    userColorAssignments.set(userId, index);
                });
            }
            
            // 色プレビューの更新
            updateColorPreviews();
            fetchClickCoordinates();
            fetchRangeData();
            fetchSceneData();
            updateSelectedUsersDisplay();
        });
    });

    updateSelectedUsersDisplay();
}

/**
 * 表示するユーザー選択の変更ハンドラ
 */
function handleUserSelectionChange(event) {
    if (event.target.checked) {
        if (selectedUsers.size >= 3) {
            event.preventDefault();
            event.target.checked = false;
            showModeError('制限', '最大3名まで選択可能です');
            return;
        }
        
        selectedUsers.add(event.target.value);
        const nextColorIndex = userColorAssignments.size;
        userColorAssignments.set(event.target.value, nextColorIndex);
    } else {
        selectedUsers.delete(event.target.value);
        userColorAssignments.delete(event.target.value);
        
        // 残りのユーザーの色を再割り当て
        const remainingUsers = Array.from(selectedUsers);
        userColorAssignments.clear();
        remainingUsers.forEach((userId, index) => {
            userColorAssignments.set(userId, index);
        });
    }

    // リプレイ中の場合は再初期化
    if (isReplayEnabled) {
        replayManager.initializeReplay();
    }

    updateColorPreviews();
    updateSelectedUsersDisplay();
}

/**
 * ドロップダウンメニュー内の色プレビューを更新
 */
function updateColorPreviews() {
    allUsers.forEach(user => {
        const colorPreview = document.querySelector(`#user-${user.user_id}`).parentElement.querySelector('.color-preview');
        const colorIndex = userColorAssignments.get(user.user_id);
        colorPreview.style.backgroundColor = colorIndex !== undefined ? USER_COLORS[colorIndex].bg : 'transparent';
    });
}

/**
 * 選択されているユーザーの表示を更新
 */
function updateSelectedUsersDisplay() {
    const displayElement = document.getElementById('selected-users-display');
    if (selectedUsers.size === 0) {
        displayElement.textContent = 'ユーザーが選択されていません';
        return;
    }

    const selectedInfo = Array.from(selectedUsers)
        .map(id => {
            const user = allUsers.find(u => u.user_id === id);
            const colorIndex = userColorAssignments.get(id);
            // 色が割り当てられていない場合のデフォルト処理
            const color = colorIndex !== undefined ? USER_COLORS[colorIndex].bg : '#000000';
            return `<span style="color: black; background-color: ${color};
                        border: 1px solid black; padding: 2px; border-radius: 4px;">${user ? user.name : id}
                    </span>`;
        })
        .join(', ');
    
    displayElement.innerHTML = `選択中: ${selectedInfo}`;
}

//===========================================
// リプレイするアノテーションの種類選択用ドロップダウン
//===========================================
/**
 * リプレイ表示設定の初期化
 */
function initializeReplaySettings() {
    // チェックボックスの状態変更時の処理
    ['showClicks', 'showRanges', 'showScenes'].forEach(id => {
        document.getElementById(id).addEventListener('change', function() {
            // リプレイ中であれば表示を更新
            if (isReplayEnabled) {
                clearCanvas();
                const currentTime = player.getCurrentTime();
                updateReplayDisplay(currentTime);
            }
        });
    });
}

/**
 * コメント表示チェックボックスのハンドラ
 */
function handleCommentsVisibilityChange(event) {
    const isVisible = event.target.checked;
    const visibleAnnotations = replayManager.stateManager.getVisibleAnnotations();
    
    visibleAnnotations.forEach(annotation => {
        const key = `${annotation.type}-${annotation.userId}-${annotation.id}`;
        replayManager.stateManager.toggleComment(key, isVisible);
    });

    // 表示の更新
    replayManager.render();
}

//===========================================
// データ表示テーブル➀（クリック座標）
//===========================================
/**
 * クリック座標データの取得
 */
function fetchClickCoordinates() {
    console.log('データ取得中...'); 
    
    // 選択されているユーザーがいない場合の処理
    if (selectedUsers.size === 0) {
        const container = document.getElementById('coordinate-data');
        container.innerHTML = '<p class="text-center">ユーザーを選択してください</p>';
        return;
    }

    // POSTデータの準備
    const postData = {
        user_ids: Array.from(selectedUsers),
        video_id: videoId
    };

    fetch('./coordinate/php/fetch_click_coordinates.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            displayCoordinates(data.data);
        }
    })
    .catch(error => {
        console.error('座標データの取得失敗:', error);
    });
}

/**
 * 座標データをテーブル形式で表示（色分け対応）
 */
function displayCoordinates(coordinates) {
    const container = document.getElementById('coordinate-data');
    if (!container) return;

    const table = document.createElement('table');
    table.className = 'table';

    table.innerHTML = `
        <thead class="table-light">
            <tr>
                <th style="width: 10%;">No.</th>
                <th style="width: 20%;">時間</th>
                <th style="width: 15%;">X座標</th>
                <th style="width: 15%;">Y座標</th>
                <th style="width: 40%;">コメント</th>
            </tr>
        </thead>
        <tbody>
            ${coordinates.map(coord => {
                // ユーザーの色を取得
                const colorIndex = userColorAssignments.get(coord.user_id);
                
                // 色が割り当てられている場合のみ背景色を設定
                const color = colorIndex !== undefined ? USER_COLORS[colorIndex] : null;
                
                return `
                    <tr style="${color ? `background-color: ${color.bg}; color: ${color.text};` : ''}">
                        <td>${coord.id}</td>
                        <td>${Number(coord.click_time).toFixed(2)}s</td>
                        <td>${Number(coord.x_coordinate)}</td>
                        <td>${Number(coord.y_coordinate)}</td>
                        <td class="text-break">${coord.comment || ''}</td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    `;

    container.innerHTML = '';
    container.appendChild(table);
}

/**
 * 背景色の明度を計算（文字色の自動調整用）
 * @param {string} color - HSL色文字列
 * @returns {number} 明度（0-1）
 */
function getLuminance(color) {
    // HSL形式の色から明度（L）を抽出
    const match = color.match(/hsl\(\d+,\s*\d+%,\s*(\d+)%\)/);
    if (match) {
        return parseInt(match[1], 10) / 100;
    }
    return 0.5; // デフォルト値
}

//===========================================
// データ表示テーブル➁➂（範囲選択，シーン記録）
//===========================================
/**
 * タブ切り替えとデータ表示の初期化
 */
function initializeTabsAndData() {
    // タブ切り替え時のイベントリスナー設定
    document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(event) {
            switch(event.target.dataset.bsTarget) {
                case '#clicks-tab':
                    fetchClickCoordinates();
                    break;
                case '#ranges-tab':
                    fetchRangeData();
                    break;
                case '#scenes-tab':
                    fetchSceneData();
                    break;
            }
        });
    });

    // 初期表示時のデータ取得
    fetchClickCoordinates();
}

/**
 * 範囲選択データの取得
 */
function fetchRangeData() {
    console.log('範囲選択データ取得中...'); 
    
    // 選択されているユーザーがいない場合の処理
    if (selectedUsers.size === 0) {
        const container = document.getElementById('range-data');
        container.innerHTML = '<p class="text-center">ユーザーを選択してください</p>';
        return;
    }

    const postData = {
        user_ids: Array.from(selectedUsers),
        video_id: videoId
    };

    fetch('./coordinate/php/fetch_range_data.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            displayRangeData(data.data);
        }
    })
    .catch(error => {
        console.error('範囲選択データの取得失敗:', error);
    });
}

/**
 * 範囲選択データをテーブル形式で表示（色分け対応）
 */
function displayRangeData(ranges) {
    const container = document.getElementById('range-data');
    if (!container) return;

    const table = document.createElement('table');
    table.className = 'table';

    table.innerHTML = `
        <thead class="table-light">
            <tr>
                <th style="width: 10%;">No.</th>
                <th style="width: 20%;">時間</th>
                <th style="width: 30%;">選択範囲</th>
                <th style="width: 40%;">コメント</th>
            </tr>
        </thead>
        <tbody>
            ${ranges.map(range => {
                const colorIndex = userColorAssignments.get(range.user_id);
                const color = colorIndex !== undefined ? USER_COLORS[colorIndex] : null;
                
                return `
                    <tr style="${color ? `background-color: ${color.bg}; color: ${color.text};` : ''}">
                        <td>${range.id}</td>
                        <td>${Number(range.click_time).toFixed(2)}s</td>
                        <td>X:${Number(range.start_x)} Y:${Number(range.start_y)} 
                            W:${Number(range.width)} H:${Number(range.height)}</td>
                        <td class="text-break">${range.comment || ''}</td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    `;

    container.innerHTML = '';
    container.appendChild(table);
}

/**
 * シーン記録データの取得
 */
function fetchSceneData() {
    console.log('シーン記録データ取得中...'); 
    
    if (selectedUsers.size === 0) {
        const container = document.getElementById('scene-data');
        container.innerHTML = '<p class="text-center">ユーザーを選択してください</p>';
        return;
    }

    const postData = {
        user_ids: Array.from(selectedUsers),
        video_id: videoId
    };

    fetch('./coordinate/php/fetch_scene_data.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            displaySceneData(data.data);
        }
    })
    .catch(error => {
        console.error('シーン記録データの取得失敗:', error);
    });
}

/**
 * シーン記録データをテーブル形式で表示（色分け対応）
 */
function displaySceneData(scenes) {
    const container = document.getElementById('scene-data');
    if (!container) return;

    const table = document.createElement('table');
    table.className = 'table';

    table.innerHTML = `
        <thead class="table-light">
            <tr>
                <th style="width: 10%;">No.</th>
                <th style="width: 20%;">時間</th>
                <th style="width: 70%;">コメント</th>
            </tr>
        </thead>
        <tbody>
            ${scenes.map(scene => {
                const colorIndex = userColorAssignments.get(scene.user_id);
                const color = colorIndex !== undefined ? USER_COLORS[colorIndex] : null;
                
                return `
                    <tr style="${color ? `background-color: ${color.bg}; color: ${color.text};` : ''}">
                        <td>${scene.id}</td>
                        <td>${Number(scene.click_time).toFixed(2)}s</td>
                        <td class="text-break">${scene.comment || ''}</td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    `;

    container.innerHTML = '';
    container.appendChild(table);
}


//===========================================
// ミスボタン
//===========================================

/**
 * ミスボタン（最後のクリックを取り消して巻き戻す）
 */
function handleMistakeClick() {
    // 座標取得ボタンOFF時の処理
    if (!isCoordinateEnabled) {
        showModeError('通知', '座標取得モードをオンにしてください');
        return;
    }

    // リプレイモード中は操作不可
    if (isReplayEnabled) {
        showModeError('通知', 'リプレイ中は取り消せません');
        return;
    }

    const mistakeBtn = document.getElementById('mistakeBtn');
    mistakeBtn.disabled = true;

    fetch('./coordinate/php/delete_latest_click.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: userId,
            video_id: videoId
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            showModeError('取消', '最後のクリックを取り消しました');
            
            fetchClickCoordinates();
            const currentTime = player.getCurrentTime();
            player.seekTo(Math.max(currentTime - 1, 0), true);
        }else if (result.status === 'no_data') {
            // クリックデータがない場合
            showModeError('通知', 'クリックデータがありません');
        } else {
            showModeError('エラー', '削除に失敗しました');
        }
    })
    .catch(error => {
        console.error('削除エラー:', error);
        showModeError('エラー', '削除に失敗しました');
    })
    .finally(() => {
        mistakeBtn.disabled = false;
    });
}


//===========================================
// クリックカウント
//===========================================
/**
 * クリックカウントの表示を更新する関数
 * @param {number} count - 現在のクリック回数
 */
function updateClickCountDisplay(count) {
    const countDisplay = document.getElementById('clickCountDisplay');
    if (countDisplay) {
        countDisplay.textContent = `クリック回数: ${count}`;
    }
}

//===========================================
// コメント機能
//===========================================
/**
 * コメントボタン
 */
function handleCommentClick() {
    console.log('コメントボタンが押された');
    if (player) {
        // 動画を一時停止
        player.pauseVideo();
        
        // 入力欄を初期化
        document.getElementById('commentInput').value = '';
        
        // モーダルを表示
        const commentModal = new bootstrap.Modal(document.getElementById('commentModal'));
        commentModal.show();
    }
}

/**
 * コメント送信の処理
 */
function handleCommentSubmit() {
    const commentText = document.getElementById('commentInput').value;
    const modalTitle = document.querySelector('#commentModal .modal-title').textContent;

    if (!commentText.trim()) {
        alert('コメントを入力してください');
        return;
    }

    let endpoint;
    let postData;

    switch(modalTitle) {
        case 'クリック座標のコメント':
            endpoint = './coordinate/php/update_latest_comment.php';
            postData = {
                user_id: userId,
                video_id: videoId,
                comment: commentText
            };
            break;
        
        case '範囲選択のコメント':
        case 'シーン記録のコメント':
            if (!tempSelectionData) return;
            
            endpoint = tempSelectionData.type === 'range' 
                ? './coordinate/php/save_range_selection.php'
                : './coordinate/php/save_scene.php';
            
            postData = {
                ...tempSelectionData.data,
                user_id: userId,
                video_id: videoId,
                comment: commentText
            };
            break;
    }

    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {

            // モーダルを閉じる処理
            const modal = document.getElementById('commentModal');
            const commentModal = bootstrap.Modal.getInstance(modal);
            commentModal.hide();

            // モーダルの状態をリセット
            resetModalState();

            // 全てのコメント送信成功時に視覚的フィードバック
            const videoContainer = document.getElementById('video-container');
            videoContainer.classList.add('border-flash');
            setTimeout(() => {
                videoContainer.classList.remove('border-flash');
            }, 500);

            // 動画を再生
            player.playVideo();
            
            // データを更新
            fetchClickCoordinates();
            fetchRangeData();
            fetchSceneData();
        }
    })
    .catch(error => {
        console.error('コメントの保存に失敗:', error);
        alert('コメントの保存中にエラーが発生しました。');
    });
}

/**
 * コメントモーダルの表示
 * @param {string} type - 'coordinate'（通常クリック）, 'range'（範囲選択）, 'scene'（シーン記録）
 */
function showCommentModal(type) {
    const modal = document.getElementById('commentModal');
    const titleElement = modal.querySelector('.modal-title');
    const commentInput = document.getElementById('commentInput');
    const modalBody = modal.querySelector('.modal-body');
    
    // 既存の文字数カウンターを削除
    const existingCounter = document.getElementById('charCount');
    if (existingCounter) {
        existingCounter.remove();
    }

    // 入力欄をクリア
    commentInput.value = '';
    
    // タイプに応じてタイトル設定
    switch(type) {
        case 'coordinate':
            titleElement.textContent = 'クリック座標のコメント';
            break;
        case 'range':
            titleElement.textContent = '範囲選択のコメント';
            break;
        case 'scene':
            titleElement.textContent = 'シーン記録のコメント';
            break;
    }

    // 文字数カウンターの追加
    const charCountDiv = document.createElement('div');
    charCountDiv.id = 'charCount';
    charCountDiv.className = 'mt-2 text-muted small';
    charCountDiv.innerHTML = '残り文字数: <span>100</span>文字';
    modalBody.appendChild(charCountDiv);

    // 文字数制限とカウンター更新の設定
    commentInput.maxLength = 100;
    const updateCharCount = () => {
        const remaining = 100 - commentInput.value.length;
        const countSpan = charCountDiv.querySelector('span');
        countSpan.textContent = remaining;
        countSpan.style.color = remaining < 20 ? '#dc3545' : '';
    };

    // 入力イベントのリスナーを設定
    commentInput.addEventListener('input', updateCharCount);
    
    // Enterキーでの送信
    commentInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.ctrlKey) {
            e.preventDefault();
            document.querySelector('#commentModal .btn-primary').click();
        }
    });

    // モーダル表示時の処理
    modal.addEventListener('shown.bs.modal', () => {
        commentInput.focus();
        updateCharCount();
    });

    // モーダルが閉じられる時の処理
    modal.addEventListener('hidden.bs.modal', handleModalClose);

    // モーダル表示
    const commentModal = new bootstrap.Modal(modal);
    commentModal.show();
}

/**
 * モーダルが閉じられたときの処理
 * @param {Event} e - モーダルのイベント
 */
function handleModalClose(e) {
    // モーダルが送信ボタンで閉じられた場合は何もしない
    if (e.target.querySelector('#commentInput').dataset.submitted === 'true') {
        return;
    }
    
    // 一時データをクリア
    tempSelectionData = null;

    // モーダルの状態をリセット
    resetModalState();
}

/**
 * モーダル関連の状態をリセット
 */
function resetModalState() {
    // 入力内容をクリア
    const commentInput = document.getElementById('commentInput');
    if (commentInput) {
        commentInput.value = '';
    }

    // カウンター要素を削除
    const charCount = document.getElementById('charCount');
    if (charCount) {
        charCount.remove();
    }

    // モーダル背景を削除
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
        modalBackdrop.remove();
    }

    // bodyタグのスタイルをリセット
    document.body.classList.remove('modal-open');
    document.body.removeAttribute('style');
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0';
}

//===========================================
//データのエクスポート機能
//===========================================
function handleExportClick() {
    fetch('export.php')
        .then(response => response.text())
        .then(data => {
            if (data.trim() === "success") {
                showModeError('成功', 'データがエクスポートされました');
            } else if (data.trim() === "no data") {
                showModeError('通知', 'エクスポートするデータがありません');
            } else {
                showModeError('座標取得', 'エクスポートに失敗しました');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('エクスポートに失敗しました');
        });
}

//===========================================
// モード切り替え（座標取得，リプレイ）
//===========================================
/**
 * 座標取得切り替え
 * @param {Event} event - チェックボックスの変更イベント
 */
function handleToggleCoordinateChange(event) {
    // リプレイモードがONの場合は切り替え禁止
    if (event.target.checked && isReplayEnabled) {
        event.target.checked = false;
        showModeError('切り替え', 'リプレイモードをオフにする必要があります');
        return;
    }

    player.pauseVideo();
    // モードの切り替え
    isCoordinateEnabled = event.target.checked;
    console.log('座標取得モード: ' + (isCoordinateEnabled ? 'ON' : 'OFF'));
}

/**
* リプレイ切り替えボタン
* @param {Event} event - チェックボックスの変更イベント
*/
function handleReplayChange(event) {
    // 座標取得モードがONの場合は切り替え禁止
    if (event.target.checked && isCoordinateEnabled) {
        event.target.checked = false;
        showModeError('切り替え', '座標取得モードをオフにする必要があります');
        return;
    }

    player.pauseVideo();
    isReplayEnabled = event.target.checked;
    replayManager.isReplayActive = isReplayEnabled;

    if (isReplayEnabled) {
        // 初期化実行
        replayManager.initializeReplay();
    } else {
        // リプレイの停止処理
        clearCanvas();
        clearAnnotations();
        replayManager.stateManager = new AnnotationStateManager();
    }
}

//===========================================
// エラー表示処理
//===========================================
/**
 * モード切り替えエラーの表示
 * @param {string} mode - エラーが発生したタイトル名
 * @param {string} message - エラーメッセージ
 */
function showModeError(mode, message) {
    // Toast要素を作成
    const errorToast = document.createElement('div');
    // クラス「toast」を追加
    errorToast.className = 'toast align-items-center bg-danger text-white border-0';
    errorToast.setAttribute('role', 'alert');
    errorToast.setAttribute('aria-live', 'assertive');
    errorToast.setAttribute('aria-atomic', 'true');
    
    errorToast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <strong>${mode}</strong><br>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    document.body.appendChild(errorToast);
    const toast = new bootstrap.Toast(errorToast);
    toast.show();

    // 4秒後に自動で削除
    setTimeout(() => {
        errorToast.remove();
    }, 4000);

    // チェックボックスをシェイク
    const checkbox = mode === '座標取得' ? 
        document.getElementById('toggleCoordinateBtn') : 
        document.getElementById('replayBtn');
    
    checkbox.classList.add('error-shake');
    setTimeout(() => {
        checkbox.classList.remove('error-shake');
    }, 500);
}


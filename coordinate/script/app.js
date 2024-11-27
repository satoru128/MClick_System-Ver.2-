//===========================================
// グローバル変数
//===========================================
let player;                    // YouTubeプレーヤー
let isCoordinateEnabled = false;  // 座標取得モード
let isReplayEnabled = false;   // リプレイモード
let userId = null;            // ユーザーID
let videoId = null;           // 動画ID
let ctx;                      // キャンバスコンテキスト
let isPlaying = false;        // 再生状態
let clickCount = 0;           //クリックカウント用
let replayClickData = {};    // クリックデータ
let replayIntervalId = null; // モニタリング用のインターバルID
let selectedUsers = new Set(); // 選択されたユーザーのIDを保持
let allUsers = []; // 全ユーザーのリストを保持
let tempSelectionData = null;  // 一時的な選択データを保持

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
// YouTube Player 初期化
//===========================================
function onYouTubeIframeAPIReady() {
    console.log('YouTube API Ready');           // VideoID取得前の準備確認ログ
    videoId = document.getElementById('player').getAttribute('data-video-id');
    window.videoId = videoId;  // windowオブジェクトにも設定
    console.log('Retrieved Video ID:', videoId);// VideoID取得後の確認ログ

    // ユーザーIDの取得
    fetch('./coordinate/php/get_user_id.php')
        .then(response => response.json())
        .then(data => {
            if (data.user_id) {
                userId = data.user_id;
                console.log('User ID initialized:', userId);  // ユーザーID取得の確認ログ
                
                // ユーザーID取得後にプレーヤーを初期化する関数
                initializePlayer(videoId);
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
    initializeContextMenu(); // 右クリックメニューの初期化
    fetchClickCoordinates();  // 座標データの取得
}

function onPlayerStateChange(event) {
    isPlaying = (event.data === YT.PlayerState.PLAYING);  // 再生中かどうかを更新
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
// アノテーション機能（座標取得とリプレイ）
//===========================================
/**
 * キャンバスの初期化
 */
function initializeCanvas() {
    console.log('キャンバスの初期化を開始');
    const canvas = document.getElementById('myCanvas');
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
 * 座標データをサーバーに保存
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
 * クリック位置を赤い点で示し，フェードアウト(加筆)
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
// リプレイ機能
//=========================================== 
/**
 * リプレイの初期化処理（データの取得，動画の初期化，モニタリングの開始）
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
    
    // 選択された全ユーザーのクリックデータを取得
    Promise.all(Array.from(selectedUsers).map(userId => 
        fetch('./coordinate/php/get_click_data.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                video_id: videoId,
                user_id: userId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                return {
                    userId: userId,
                    clicks: data.clicks
                };
            }
            return null;
        })
    ))
    .then(results => {
        replayClickData = {};
        results.forEach(result => {
            if (result) {
                replayClickData[result.userId] = result.clicks;
            }
        });
        
        if (Object.keys(replayClickData).length > 0) {
            startReplayMonitoring();
            player.pauseVideo();
        } else {
            showModeError('リプレイ', 'データが見つかりませんでした');
            stopReplay();
        }
    })
    .catch(error => {
        console.error('リプレイデータの取得に失敗:', error);
        showModeError('エラー', 'データの取得に失敗しました');
        stopReplay();
    });
}

/**
 * リプレイのモニタリング開始
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
        
        const currentTime = player.getCurrentTime();
        updateClickDisplay(currentTime);
    }, 100);  // 100ミリ秒間隔で更新
}

/**
 * クリック表示の更新（複数ユーザー対応）
 */
function updateClickDisplay(currentTime) {
    if (!player || !replayClickData) return;

    clearCanvas();
    
    // 選択されたユーザーのデータを表示
    Object.entries(replayClickData).forEach(([userId, clicks]) => {
        // allUsersの中でのインデックスを取得して色を決定
        const userIndex = allUsers.findIndex(user => user.user_id === userId);
        const colorInfo = USER_COLORS[userIndex + 1];  // インデックスは0から始まるため+1
        
        clicks.forEach(click => {
            const timeSinceClick = currentTime - click.click_time;
            if (click.click_time <= currentTime && timeSinceClick <= 2.0) { // 2秒間表示
                drawReplayClick(
                    click.x, 
                    click.y, 
                    colorInfo.bg, 
                    click.comment,
                    click
                );
            }
        });
    });
}

/**
 * リプレイ用のクリック描画（ID表示付き）
 * コメント表示位置を円の右下に固定
 */
function drawReplayClick(x, y, color, comment, clickData) {
    // クリック円の描画部分
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);  // 半径8px
    ctx.fillStyle = color;              // 塗りつぶし色（USER_COLORSから）
    ctx.fill();
    ctx.strokeStyle = '#000000';        // 円の輪郭色（黒）
    ctx.lineWidth = 1;                  // 輪郭の太さ
    ctx.stroke();

    // IDのスタイル
    ctx.fillStyle = '#000000';          // ID文字色（黒）
    ctx.font = 'bold 10px Arial';       // フォントスタイル
    ctx.textAlign = 'center';           // テキストの水平位置
    ctx.textBaseline = 'middle';        // テキストの垂直位置
    ctx.fillText(clickData.id.toString(), x, y);
    
    // コメントがある場合のみホバー効果を設定
    if (comment) {
        const canvas = document.getElementById('myCanvas');
        const rect = canvas.getBoundingClientRect();
        
        canvas.addEventListener('mousemove', function(e) {
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const distance = Math.sqrt(
                Math.pow(mouseX - x, 2) + 
                Math.pow(mouseY - y, 2)
            );
            
            if (distance <= 8) {
                // 円の中心から4px右、4px下の位置にツールチップを表示
                const tooltipX = x + rect.left + 4;
                const tooltipY = y + rect.top + 4;
                showClickTooltip(tooltipX, tooltipY, comment);
            } else {
                hideClickTooltip();
            }
        });
    }
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
 * ツールチップの表示
 * @param {number} x - 表示位置のX座標
 * @param {number} y - 表示位置のY座標
 * @param {string} comment - 表示するコメント
 */
function showClickTooltip(x, y, comment) {
    // ツールチップの要素を取得
    let tooltip = document.getElementById('clickTooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'clickTooltip';
        document.body.appendChild(tooltip);
    }

    // コメントを設定
    tooltip.textContent = comment;
    tooltip.style.display = 'block';

    // ウィンドウのサイズを取得（画面端での位置調整用）
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // ツールチップのサイズを取得
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    // 基準位置（赤丸の右下）から表示位置を計算
    let posX = x;
    let posY = y;

    // 画面端をはみ出す場合
    if (posX + tooltipWidth > windowWidth) {
        posX = x - tooltipWidth - 8;  // 左側に表示
    }
    if (posY + tooltipHeight > windowHeight) {
        posY = y - tooltipHeight - 8;  // 上側に表示
    }

    // 計算した位置にツールチップを表示
    tooltip.style.left = `${posX}px`;
    tooltip.style.top = `${posY}px`;
}

/**
 * ツールチップを非表示
 */
function hideClickTooltip() {
    const tooltip = document.getElementById('clickTooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

/**
 * キャンバスをクリア
 */
function clearCanvas() {
    const canvas = document.getElementById('myCanvas');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

//===========================================
// ユーザー選択機能の追加
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
            <h6 class="me-3 mb-0">表示するユーザー：</h6>
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
                // 以下の行を削除
                // selectedUsers.add(data.current_user);
                renderUserSelect();
                fetchClickCoordinates();
            }
        })
        .catch(error => {
            console.error('ユーザー一覧の取得失敗:', error);
            showModeError('エラー', 'ユーザー一覧の取得に失敗しました');
        });
}

/**
 * ユーザー選択UIの作成（ドロップダウン形式）
 */
function renderUserSelect() {
    const container = document.getElementById('user-select');
    if (!container) return;

    container.innerHTML = `
        <div class="dropdown">
            <button class="btn btn-outline-primary dropdown-toggle" 
                    type="button" 
                    id="userDropdown" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false">
                表示するユーザーを選択 (最大3名)
            </button>
            <ul class="dropdown-menu" aria-labelledby="userDropdown" style="max-height: 200px; overflow-y: auto;">
                ${allUsers.map(user => {
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
                }).join('')}
            </ul>
        </div>
        <div id="selected-users-display" class="mt-2 small text-muted"></div>
    `;

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
            updateSelectedUsersDisplay();
        });
    });
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
            // 色が割り当てられていない場合のデフォルト処理を追加
            const color = colorIndex !== undefined ? USER_COLORS[colorIndex].bg : '#000000';
            return `<span style="color: ${color}">${user ? user.name : id}</span>`;
        })
        .join(', ');
    
    displayElement.innerHTML = `選択中: ${selectedInfo}`;
}

/**
 * リプレイ時の円の描画
 */
function updateClickDisplay(currentTime) {
    if (!player || !replayClickData) return;

    clearCanvas();
    
    Object.entries(replayClickData).forEach(([userId, clicks]) => {
        const colorIndex = userColorAssignments.get(userId);
        if (colorIndex === undefined) return; // 色が割り当てられていない場合はスキップ
        
        const colorInfo = USER_COLORS[colorIndex];
        clicks.forEach(click => {
            const timeSinceClick = currentTime - click.click_time;
            if (click.click_time <= currentTime && timeSinceClick <= 2.0) {
                drawReplayClick(
                    click.x, 
                    click.y, 
                    colorInfo.bg, 
                    click.comment,
                    click
                );
            }
        });
    });
}

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

    // デバッグ用
    console.log('Current color assignments:', Array.from(userColorAssignments.entries()));

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
                // デバッグ用
                // console.log('Coordinate:', coord, 'Color Index:', colorIndex);
                
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
    console.log('リプレイモード: ' + (isReplayEnabled ? 'ON' : 'OFF'));

    // リプレイモードONの場合
    if (isReplayEnabled) {
        initializeReplay();  // リプレイ開始
    } else {
        stopReplay();       // リプレイ停止
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

//===========================================
// 右クリック
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
            console.log('Right click detected');
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
 * 2. 範囲選択の開始処理
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

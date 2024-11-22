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
let replayClickData = [];    // クリックデータ
let replayIntervalId = null; // モニタリング用のインターバルID


//===========================================
// YouTube Player 初期化
//===========================================
function onYouTubeIframeAPIReady() {
    console.log('YouTube API Ready');           // VideoID取得前の準備確認ログ
    videoId = document.getElementById('player').getAttribute('data-video-id');
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

    // 各機能の初期化
    initializeCanvas();     // キャンバスの初期化
    initializeControls();   // コントロールの初期化
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
 
    // コメント送信ボタン
    // const commentSubmit = document.getElementById('commentSubmit');
    // if (commentSubmit) {
    //     commentSubmit.addEventListener('click', handleCommentSubmit);
    // } else {
    //     console.error('コメント送信ボタンが見つかりません');
    // }
 
    // コメントキャンセルボタン
    // const commentCancel = document.getElementById('commentCancel');
    // if (commentCancel) {
    //     commentCancel.addEventListener('click', () => {
    //         player.playVideo();  // キャンセル時に再生再開
    //     });
    // } else {
    //     console.error('コメントキャンセルボタンが見つかりません');
    // }
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
* キャンバスクリック時の処理
* @param {Event} event - クリックイベント
*/
function handleCanvasClick(event) {
    // 座標取得モードがOFFの場合は処理しない
    if (!isCoordinateEnabled) {
        console.log('座標取得モード：OFF');
        return;
    }
 
    // イベントの伝播を止める（これがないと他のクリックイベントも動く）
    event.preventDefault();
    event.stopPropagation();
 
    // クリック座標の計算
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;  // キャンバス内のX座標
    const y = event.clientY - rect.top;   // キャンバス内のY座標
    const clickTime = player.getCurrentTime();  // クリック時の動画再生時間
 
    // デバッグ用確認ログ
    console.log('クリック座標:', { x, y, clickTime });
 
    /// 座標の保存
    saveCoordinate(x, y, clickTime)
        .then(result => {
            console.log('座標の保存成功', result);
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
 * リプレイデータを取得
 */
function fetchReplayData(videoId) {
    console.log('リプレイデータを取得中...');
    
    return fetch('./coordinate/php/get_click_data.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            video_id: videoId,
            user_id: userId
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('取得したリプレイデータ:', data);
        if (data.status === 'success') {
            return data.clicks.map(click => ({
                x: parseFloat(click.x),
                y: parseFloat(click.y),
                click_time: parseFloat(click.click_time),
                comment: click.comment,
                id: click.id
            }));
        }
        return [];
    })
    .catch(error => {
        console.error('リプレイデータの取得に失敗:', error);
        return [];
    });
}

/**
 * リプレイの初期化処理（データの取得，動画の初期化，モニタリングの開始）
 */
function initializeReplay() {
    // 動画を停止して最初に巻き戻す
    player.seekTo(0);
    clearCanvas();
    
    // クリックデータの取得と再生開始
    fetchReplayData(videoId)
        .then(clicks => {
            if (clicks && clicks.length > 0) {
                replayClickData = clicks;     // データをグローバル変数に保存
                startReplayMonitoring();      // クリック表示のモニタリング開始
                player.pauseVideo();
            } else {
                showModeError('リプレイ', 'データがありません');
                stopReplay();
            }
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
 * 現在の再生時間に応じたクリック表示の更新
 * @param {number} currentTime - 現在の再生時間（秒）
 */
function updateClickDisplay(currentTime) {
    if (!player || !replayClickData) return;

    clearCanvas();
    
    // 現在時刻までのクリックを表示
    replayClickData.forEach(click => {
        // 現在の再生時間からクリック時間を引いた差が1秒以内のものだけ表示
        const timeSinceClick = currentTime - click.click_time;
        if (click.click_time <= currentTime && timeSinceClick <= 2.0) {
            drawClickWithNumber(click.x, click.y, click);
        }
    });

    setupHoverEvents();  // ホバー効果は表示中の点に対してのみ有効
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
    replayClickData = [];
    isReplayEnabled = false;
    document.getElementById('replayBtn').checked = false;
}

/**
 * クリック位置の描画
 */
function drawClickWithNumber(x, y, clickData) {
    // 赤い丸を描画
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.fill();
    
    // IDを描画
    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(clickData.id.toString(), x, y);
}

/**
 * ホバーイベント設定（すべてのクリックポイントに対して）
 */
function setupHoverEvents() {
    const canvas = document.getElementById('myCanvas');
    
    // 既存のイベントリスナーを削除
    canvas.removeEventListener('mousemove', handleCanvasHover);
    
    // 新しいイベントリスナーを追加
    canvas.addEventListener('mousemove', handleCanvasHover);
}

/**
 * キャンバス全体のホバーイベントハンドラ
 * @param {MouseEvent} event - マウスイベント
 */
function handleCanvasHover(event) {
    const canvas = document.getElementById('myCanvas');
    const rect = canvas.getBoundingClientRect();

    // マウス位置をキャンバス内の座標に変換
    // event.clientX = ブラウザの左端からの距離
    // rect.left = キャンバスの左端までの距離
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    let hovered = false;

    // 現在表示中のすべての赤丸をチェック
    replayClickData.forEach(click => {
        if (click.click_time <= player.getCurrentTime()) {
            // マウスと赤丸の距離を計算
            const distance = Math.sqrt(
                Math.pow(mouseX - click.x, 2) + 
                Math.pow(mouseY - click.y, 2)
            );
            
            // マウスが赤丸の上にある場合
            if (distance <= 8) {
                hovered = true;
                const circleX = click.x + rect.left;
                const circleY = click.y + rect.top;
                showClickTooltip(
                    circleX + 4,
                    circleY + 4,
                    click.comment || 'コメントなし'
                );
            }
        }
    });

    // どの円の上にもマウスがない場合
    if (!hovered) {
        hideClickTooltip();
    }
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
// 座標データの取得と表示
//===========================================
/**
 * PHPからデータを取得しテーブル形式で表示
 */
function fetchClickCoordinates() {
    console.log('データ取得中...'); // 処理開始ログ
    fetch('./coordinate/php/fetch_click_coordinates.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') { // データ取得成功
                displayCoordinates(data.data); // テーブルに表示
            } else {
                console.log('座標データがゼロ'); 
            }
        })
        .catch(error => {
            console.error('座標データの取得失敗:', error); 
        });
}


/**
* 座標データをテーブル形式で表示
* @param {Array} coordinates - 表示する座標データの配列
*/
function displayCoordinates(coordinates) {
    const container = document.getElementById('coordinate-data');
    if (!container) return;
 
    // テーブル作成のHTML
    const table = document.createElement('table');
    table.className = 'table table-striped';  // Bootstrap
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
            ${coordinates.map(coord => `
                <tr>
                    <td>${coord.id}</td>
                    <td>${Number(coord.click_time).toFixed(2)}s</td>
                    <td>${Number(coord.x_coordinate)}</td>
                    <td>${Number(coord.y_coordinate)}</td>
                    <td class="text-break">${coord.comment || ''}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
 
    // テーブル表示
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

/**コメント「送信」（最新のクリックデータにコメント追加）
 */
function handleCommentSubmit() {
    const commentText = document.getElementById('commentInput').value;
    if (!commentText.trim()) {
        alert('コメントを入力してください');
        return;
    }

    // コメントを保存
    fetch('./coordinate/php/update_latest_comment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: userId,
            video_id: videoId,
            comment: commentText
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            // モーダルを閉じる
            const commentModal = bootstrap.Modal.getInstance(document.getElementById('commentModal'));
            commentModal.hide();
            
            // テーブル表示を更新
            fetchClickCoordinates();
            
            // 動画を再生
            player.playVideo();
        }
    })
    .catch(error => {
        console.error('コメントの保存に失敗:', error);
        alert('コメントの保存中にエラーが発生しました。');
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
    console.log('リプレイモード: ' + (isReplayEnabled ? 'ON' : 'OFF'));

    // リプレイモードONの場合
    if (isReplayEnabled) {
        initializeReplay();  // リプレイ開始
    } else {
        stopReplay();       // リプレイ停止
    }
    // if (isReplayEnabled) {
    //     player.pauseVideo();  // 一時停止
    //     player.seekTo(0);     // 動画を最初に戻す
        
    //     // クリックデータの取得と再生
    //     fetchReplayData(videoId)
    //         .then(clicks => {
    //             if (clicks && clicks.length > 0) {
    //                 replayClicks(clicks);  // クリックデータの再生
    //             } else {
    //                 console.log('リプレイするデータがありません');
    //                 showModeError('リプレイ', 'データがありません');
    //                 isReplayEnabled = false;
    //                 event.target.checked = false;
    //             }
    //         });
    // } else {
    //     clearCanvas();  // キャンバスをクリア
    // }
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
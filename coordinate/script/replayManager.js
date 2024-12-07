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
        // ユーザーが選択されていない場合のエラーメッセージ
        if (selectedUsers.size === 0) {
            ErrorManager.showError(
                ErrorManager.ErrorTypes.REPLAY, 
                ErrorManager.Messages.NO_USER_SELECTED
            );
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

        // キャンバスをクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const visibleAnnotations = this.stateManager.getVisibleAnnotations();
        
        visibleAnnotations.forEach(annotation => {
            let container = document.getElementById(
                `annotation-${annotation.type}-${annotation.id}`
            );

            // 範囲選択の描画は別メソッドに分離
            if (annotation.type === 'range') {
                this.drawRange(annotation);
            }

            // 新規要素の作成
            if (!container) {
                container = this.createAnnotationElement(annotation);
                const videoContainer = document.getElementById('video-container');
                videoContainer.appendChild(container);
                if (annotation.comment) {
                    this.showComment(container, annotation);
                }
            } else {
                currentElements.delete(container);
            }
        });

        // 不要な要素を削除
        currentElements.forEach(element => {
            const popover = bootstrap.Popover.getInstance(element);
            if (popover) {
                popover.dispose();
            }
            element.remove();
        });
    }

    /**
     * 範囲選択の描画処理
     */
    drawRange(range) {
        const color = this.getUserColor(range.userId);
        if (!color) return;

        // 範囲の描画
        ctx.fillStyle = color.bg.replace('0.7', '0.2');  
        ctx.fillRect(range.start_x, range.start_y, range.width, range.height);
        
        // 範囲の枠線
        ctx.strokeStyle = color.bg.replace('0.7', '0.8');
        ctx.lineWidth = 2;
        ctx.strokeRect(range.start_x, range.start_y, range.width, range.height);
    }

    /**
     * アノテーション要素の作成
     */
    createAnnotationElement(annotation) {
        const color = this.getUserColor(annotation.userId);
        if (!color) return null;

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

        return container;
    }

    /**
     * ユーザーIDに対応する色情報を取得
     * @param {string} userId - ユーザーID
     * @returns {Object|null} 色情報（bgとtextプロパティを持つ）
     */
    getUserColor(userId) {
        const colorIndex = userColorAssignments.get(userId);
        if (colorIndex !== undefined) {
            return USER_COLORS[colorIndex];
        }
        return null;
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

    /**
     * リプレイの停止処理
     */
    stopReplay() {
        // キャンバスのクリア
        this.clearCanvas();

        // インターバルの停止
        if (this.monitoringId) {
            clearInterval(this.monitoringId);
            this.monitoringId = null;
        }

        // データのリセット
        this.replayClickData = {};
        this.isReplayActive = false;

        // UIの更新
        document.getElementById('replayBtn').checked = false;
    }

    /**
     * リプレイモードの終了処理
     */
    finishReplay() {
        this.clearCanvas();
        this.clearAnnotations();
        this.stateManager = new AnnotationStateManager();
    }

    /**
     * キャンバスのクリア
     */
    clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

window.ReplayManager = ReplayManager;
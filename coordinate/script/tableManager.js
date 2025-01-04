/**
 * テーブル管理用クラス
 */
class TableManager {
    /**
     * コメント編集モーダルの表示
     */
    static showCommentEditModal(type, id, currentComment) {
        // 動画を一時停止
        if (player) {
            player.pauseVideo();
        }
        
        // 既存のモーダルの再利用
        showCommentModal(type, {
            mode: 'edit',
            id: id,
            type: type,
            comment: currentComment
        });
    }

    /**
     * コメントを省略する関数
     * @param {string} comment - 元のコメント
     * @param {number} maxLength - 最大表示文字数
     * @returns {Object} 処理されたコメント情報
     */
    static truncateComment(comment, maxLength = 25) {
        if (!comment) return {
            text: '',
            isLong: false,
            fullText: ''
        };
        
        if (comment.length <= maxLength) return {
            text: comment,
            isLong: false,
            fullText: comment
        };
        
        return {
            text: `${comment.substring(0, maxLength)}...`,
            isLong: true,
            fullText: comment
        };
    }

    /**
     * コメントの展開・折りたたみを処理する関数
     * @param {string} commentId - コメント要素のID
     * @param {Event} event - クリックイベント
     */
    static toggleComment(commentId, event) {
        event.preventDefault();
        event.stopPropagation();
        
        const commentContainer = document.getElementById(commentId);
        if (!commentContainer) return;

        const shortText = commentContainer.querySelector('.short-text');
        const fullText = commentContainer.querySelector('.full-text');
        const toggleBtn = commentContainer.querySelector('.toggle-btn');
        
        if (shortText.style.display === 'none') {
            // 折りたたむ
            shortText.style.display = 'inline';
            fullText.style.display = 'none';
            toggleBtn.textContent = 'もっと見る';
        } else {
            // 展開する
            shortText.style.display = 'none';
            fullText.style.display = 'inline';
            toggleBtn.textContent = '折りたたむ';
        }
    }

    /**
     * テーブルの共通表示処理
     * @param {string} type - テーブルの種類（'click', 'range', 'scene', 'feedback'）
     * @param {Array} data - 表示データ
     * @param {Object} options - 表示オプション
     */

    static displayTable(type, data, options) {
        const container = document.getElementById(`${type}-data`);
        if (!container) return;

        const table = document.createElement('table');
        table.className = 'table table-hover';
        
        // ヘッダー部分
        const thead = document.createElement('thead');
        thead.className = 'table-light';
        thead.innerHTML = `
            <tr>
                ${options.columns.map(col => 
                    `<th style="width: ${col.width || 'auto'};">${col.label}</th>`
                ).join('')}
            </tr>
        `;
        table.appendChild(thead);
        
        // ボディ部分
        const tbody = document.createElement('tbody');
        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="${options.columns.length}" class="text-center">
                        データがありません
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = data.map(item => {
                const colorIndex = userColorAssignments.get(item.user_id);
                const color = colorIndex !== undefined ? USER_COLORS[colorIndex] : null;
                
                const cursorStyle = isReplayEnabled ? 'cursor: pointer;' : 'cursor: not-allowed; opacity: 0.6;';
                const isOwnData = item.user_id === userId;  // ログインユーザーのデータかチェック
                
                // type が 'feedback' の場合は専用のフォーマッターを使用
                if (type === 'feedback' && options.feedbackFormatter) {
                    return options.feedbackFormatter(item, cursorStyle, color);
                }

                const truncated = this.truncateComment(item.comment);
                const commentId = `comment-${type}-${item.id}`;
                const commentHtml = truncated.isLong ? `
                    <div id="${commentId}" class="comment-container">
                        <span class="short-text">${truncated.text}</span>
                        <span class="full-text" style="display: none;">${truncated.fullText}</span>
                        <button class="btn btn-link btn-sm toggle-btn p-0" 
                            onclick="TableManager.toggleComment('${commentId}', event)">
                            もっと見る
                        </button>
                    </div>
                ` : (item.comment || '');

                // 既存の表示形式
                return `
                    <tr style="${color ? `background-color: ${color.bg}; color: ${color.text};` : ''}">
                        <td class="clickable-cell align-middle" 
                            style="${cursorStyle}"
                            data-time="${item.click_time}"
                            onclick="TableManager.handleTimeClick(event, ${item.click_time})">
                            ${item.id}</td>
                        <td class="align-middle">${Number(item.click_time).toFixed(2)}s</td>
                        <td class="text-break align-middle">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="me-2">${commentHtml}</span>
                                ${isOwnData ? `
                                    <button class="btn btn-sm btn-link p-0"
                                            onclick="TableManager.showCommentEditModal('${type}', ${item.id}, '${item.comment?.replace(/'/g, "\\'") || ''}')"
                                            title="コメントを編集">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </td>
                        <td class="align-middle">
                            ${isOwnData ? `
                                <button class="btn btn-sm btn-outline-danger"
                                        onclick="TableManager.showDeleteModal('${type}', ${item.id})"
                                        title="削除">
                                    <i class="bi bi-trash"></i>
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `;
            }).join('');
        }
        table.appendChild(tbody);
        
        container.innerHTML = '';
        container.appendChild(table);
    }

    /**
     * 時間クリック時のハンドラ
     * @param {Event} event - クリックイベント
     * @param {number} time - ジャンプする時間（秒）
     */
    static handleTimeClick(event, time) {
        if (!isReplayEnabled) {
            ErrorManager.showError(
                ErrorManager.ErrorTypes.NOTIFICATION,
                ErrorManager.Messages.JUMP_ERROR
            );
            return;
        }

        // イベントの伝播を停止
        event.preventDefault();
        event.stopPropagation();

        // 再生位置を変更
        if (player) {
            player.seekTo(time);
            player.pauseVideo();

            // アノテーションの表示を更新
            if (replayManager) {
                replayManager.updateDisplay(time);
            }
        }
    }

    /**
     * 削除確認モーダルの表示
     * @param {string} type - 削除対象のタイプ（'click', 'range', 'scene', 'feedback'）
     * @param {number} id - 削除対象のID
     */
    static showDeleteModal(type, id) {
        // 動画を一時停止
        if (player) {
            player.pauseVideo();
        }
        
        // 削除対象の情報を保存
        document.getElementById('deleteTargetId').value = id;
        document.getElementById('deleteTargetType').value = type;
        
        // メッセージをカスタマイズ
        const messageMap = {
            'click': 'このクリック座標',
            'range': 'この範囲選択',
            'scene': 'このシーン記録',
            'feedback': 'このフィードバック'
        };
        const message = `${messageMap[type]}を削除してもよろしいですか？`;
        document.querySelector('#deleteConfirmModal .modal-body p').textContent = message;
        
        // モーダルを表示
        const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        modal.show();
    }

    /**
     * 削除の実行
     */
    static async executeDelete() {
        const id = document.getElementById('deleteTargetId').value;
        const type = document.getElementById('deleteTargetType').value;
        console.log('削除開始:', { id, type });  // デバッグ用
        
        try {
            // タイプに応じたエンドポイントを設定
            const endpoints = {
                'click': './coordinate/php/delete_click.php',
                'range': './coordinate/php/delete_range.php',
                'scene': './coordinate/php/delete_scene.php',
                'feedback': './coordinate/php/delete_feedback.php'
            };

            const response = await fetch(endpoints[type], {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });

            const data = await response.json();
            if (data.status === 'success') {
                // モーダルを閉じる
                const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
                modal.hide();

                // 成功メッセージを表示
                const messages = {
                    'click': 'クリック座標を削除しました',
                    'range': '範囲選択を削除しました',
                    'scene': 'シーン記録を削除しました',
                    'feedback': 'フィードバックを削除しました'
                };
                ErrorManager.showError(
                    ErrorManager.ErrorTypes.SUCCESS,
                    messages[type]
                );

                // テーブルを更新
                this.updateTable(type);
            }
        } catch (error) {
            console.error('削除エラー:', error);
            ErrorManager.showError(
                ErrorManager.ErrorTypes.ERROR,
                '削除に失敗しました'
            );
        }
    }

    /**
     * テーブル表示の更新
     */
    static updateTable(type) {
        switch(type) {
            case 'click':
                fetchClickData();
                break;
            case 'range':
                fetchRangeData();
                break;
            case 'scene':
                fetchSceneData();
                break;
            case 'feedback':
                feedbackManager.getFeedbacks();
                break;
        }
    }
}

// グローバルスコープで利用できるようにする
window.TableManager = TableManager;
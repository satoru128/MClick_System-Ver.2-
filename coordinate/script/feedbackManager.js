/**
 * フィードバックを管理するクラス
 */
class FeedbackManager {
    constructor() {
        this.isEnabled = false;
    }

    /**
     * フィードバック機能の有効/無効を切り替え
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        const feedbackBtn = document.getElementById('feedbackBtn');
        if (feedbackBtn) {
            feedbackBtn.disabled = !enabled;
        }
    }

    /**
     * フィードバックデータの表示
     */
    displayFeedbacks(feedbacks) {
        TableManager.displayTable('feedback', feedbacks, {
            columns: [
                { label: '', width: '15%' },
                { label: '発言者', width: '25%' },
                { label: 'コメント', width: '45%' },
                { label: '操作', width: '15%' }
            ],
            feedbackFormatter: (item, cursorStyle, color) => {
                const speaker = allUsers.find(user => user.user_id === item.speaker_id);
                const speakerDisplay = speaker ? speaker.name : `ID: ${item.speaker_id || '---'}`;
                
                return `
                    <tr style="${color ? `background-color: ${color.bg}; color: ${color.text};` : ''}">
                        <td class="clickable-cell align-middle" 
                            style="${cursorStyle}"
                            data-time="${item.timestamp}"
                            onclick="TableManager.handleTimeClick(event, ${item.timestamp})">
                            ${Number(item.timestamp).toFixed(2)}s</td>
                        <td class="align-middle">${speakerDisplay}</td>
                        <td class="text-break align-middle">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="me-2">${item.comment || ''}</span>
                                <button class="btn btn-sm btn-link p-0"
                                        onclick="TableManager.showCommentEditModal('feedback', ${item.id}, '${item.comment?.replace(/'/g, "\\'") || ''}')"
                                        title="コメントを編集">
                                    <i class="bi bi-pencil"></i>
                                </button>
                            </div>
                        </td>
                        <td class="align-middle">
                            <button class="btn btn-sm btn-outline-danger"
                                    onclick="TableManager.showDeleteModal('feedback', ${item.id})"
                                    title="削除">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }
        });
    }

    /**
     * フィードバックを記録
     * @param {number} timestamp 動画の再生時間
     * @param {string} comment コメント
     * @param {Array} speakers 発言者のユーザーID配列
     */
    async recordFeedback(timestamp, comment, speakers) {
        try {
            const response = await fetch('./coordinate/php/save_feedback.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    video_id: videoId,
                    timestamp: timestamp,
                    comment: comment,
                    speakers: speakers
                })
            });
    
            const data = await response.json();
            
            if (data.status === 'success') {
                this.getFeedbacks();  // テーブル更新
                ErrorManager.showError(
                    ErrorManager.ErrorTypes.SUCCESS,
                    'フィードバックを記録しました'
                );
            } else {
                throw new Error(data.message || '保存に失敗しました');
            }
        } catch (error) {
            console.error('保存エラー:', error);    // エラー出力
            ErrorManager.showError(
                ErrorManager.ErrorTypes.ERROR,
                ErrorManager.Messages.FEEDBACK_ERROR
            );
        }
    }

    /**
     * フィードバックの表示を更新
     */
    async getFeedbacks() {
        try {
            const response = await fetch('./coordinate/php/fetch_feedback_data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ video_id: videoId })
            });
    
            const data = await response.json();
            console.log('Received feedback data:', data);  // デバッグ出力
    
            if (data.status === 'success') {
                this.displayFeedbacks(data.feedbacks);
            }
        } catch (error) {
            console.error('データ取得エラー:', error);
        }
    }
}

// グローバルスコープで利用できるようにする
window.FeedbackManager = FeedbackManager;
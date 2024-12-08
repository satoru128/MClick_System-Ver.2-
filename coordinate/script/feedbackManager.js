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
        console.log('Displaying feedbacks:', feedbacks);
        
        // TableManagerの共通機能を利用
        TableManager.displayTable('feedback', feedbacks, {
            columns: [
                { label: '時間', width: '20%' },
                { label: '発言者', width: '20%' },
                { label: 'コメント', width: '50%' },
                { label: '操作', width: '10%' }
            ],
            formatter: feedback => `
                <tr>
                    <td>${Number(feedback.timestamp).toFixed(2)}s</td>
                    <td>${feedback.speakers ? feedback.speakers.join(', ') : ''}</td>
                    <td class="text-break">${feedback.comment}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="TableManager.showDeleteModal('feedback', ${feedback.id})"
                                title="削除">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `
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
            console.error('保存エラー:', error);
            ErrorManager.showError(
                ErrorManager.ErrorTypes.ERROR,
                '保存に失敗しました'
            );
        }
    }

    /**
     * フィードバックの表示を更新
     */
    async getFeedbacks() {
        try {
            const response = await fetch('./coordinate/php/get_feedbacks.php', {
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
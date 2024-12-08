/**
 * フィードバックを管理するクラス
 */
class FeedbackManager {
    constructor() {
        this.isEnabled = false;  // リプレイ時のみ有効
        this.feedbackData = {};  // フィードバックデータ保存用
    }

    /**
     * フィードバック機能の有効/無効を切り替え
     * @param {boolean} enabled 
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        
        // フィードバックボタンの有効/無効を切り替え
        const feedbackBtn = document.getElementById('feedbackBtn');
        if (feedbackBtn) {
            feedbackBtn.disabled = !enabled;
        }
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

    /**
     * フィードバックテーブルの表示
     */
    displayFeedbacks(feedbacks) {
        console.log('Displaying feedbacks:', feedbacks);
        const container = document.getElementById('feedback-data');
        const table = document.createElement('table');
        table.className = 'table';
        
        table.innerHTML = `
            <thead class="table-light">
                <tr>
                    <th>時間</th>
                    <th>発言者</th>
                    <th>コメント</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                ${feedbacks && feedbacks.length > 0 ? 
                    feedbacks.map(feedback => `
                        <tr>
                            <td>${Number(feedback.timestamp).toFixed(2)}s</td>
                            <td>${feedback.speakers ? feedback.speakers.join(', ') : ''}</td>
                            <td class="text-break">${feedback.comment}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger" 
                                        onclick="feedbackManager.deleteFeedback(${feedback.id})"
                                        title="削除">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('') :
                    '<tr><td colspan="4" class="text-center">データがありません</td></tr>'
                }
            </tbody>
        `;
        
        container.innerHTML = '';
        container.appendChild(table);
    }

    /**
     * フィードバックの削除
     */
    async deleteFeedback(id) {
        if (confirm('このフィードバックを削除しますか？')) {
            try {
                const response = await fetch('./coordinate/php/delete_feedback.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id })
                });
                
                if (response.ok) {
                    this.getFeedbacks();
                    ErrorManager.showError(
                        ErrorManager.ErrorTypes.SUCCESS,
                        'フィードバックを削除しました'
                    );
                }
            } catch (error) {
                console.error('削除エラー:', error);
                ErrorManager.showError(
                    ErrorManager.ErrorTypes.ERROR,
                    '削除に失敗しました'
                );
            }
        }
    }

    async recordFeedback(timestamp, comment, speakers) {
        const sendData = {
            video_id: videoId,
            timestamp: timestamp,
            comment: comment,
            speakers: speakers
        };
        
        try {
            const response = await fetch('./coordinate/php/save_feedback.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sendData)
            });
    
            const text = await response.text();  // レスポンスを文字列として取得
            
            try {
                const data = JSON.parse(text);
                if (data.status === 'success') {
                    // ... 成功時の処理 ...
                }
            } catch (e) {
                console.error('JSON parse error:', e);
                console.error('Response text:', text);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
}

// グローバルスコープで利用できるようにする
window.FeedbackManager = FeedbackManager;
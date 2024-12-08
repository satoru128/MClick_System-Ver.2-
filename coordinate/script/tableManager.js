/**
 * テーブル管理用クラス
 */
class TableManager {
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
        table.className = 'table';

        // ヘッダー部分の生成
        table.innerHTML = `
            <thead class="table-light">
                <tr>
                    ${options.columns.map(col => 
                        `<th style="width: ${col.width || 'auto'};">${col.label}</th>`
                    ).join('')}
                </tr>
            </thead>
            <tbody>
                ${data && data.length > 0 ? 
                    data.map(item => options.formatter(item)).join('') :
                    `<tr><td colspan="${options.columns.length}" class="text-center">データがありません</td></tr>`
                }
            </tbody>
        `;

        container.innerHTML = '';
        container.appendChild(table);
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
                fetchClickCoordinates();
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
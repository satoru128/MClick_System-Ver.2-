/**
 * エラー表示を管理するクラス
 */
class ErrorManager {
    /**
     * エラータイプの定義（定数）
     */
    static ErrorTypes = {
        MODE_SWITCH: 'モード切り替え',
        REPLAY: 'リプレイ',
        NOTIFICATION: '通知',
        ERROR: 'エラー',
        LIMIT: '制限',
        SUCCESS: '成功',
        CANCEL: '取消'
    };

    /**
     * エラーメッセージを表示
     * @param {string} type - エラーの種類（ErrorTypesから選択）
     * @param {string} message - エラーメッセージ
     * @param {HTMLElement} element - シェイクさせる要素
     */
    static showError(type, message, element) {
        // Toast要素の作成
        const errorToast = document.createElement('div');
        errorToast.className = 'toast align-items-center bg-danger text-white border-0';
        errorToast.setAttribute('role', 'alert');
        errorToast.setAttribute('aria-live', 'assertive');
        errorToast.setAttribute('aria-atomic', 'true');
        
        // スタイルを追加して最上部に固定
        errorToast.style.position = 'fixed';
        errorToast.style.top = '20px';  // 上端から20pxの位置
        errorToast.style.left = '50%';  // 左端から50%の位置
        errorToast.style.transform = 'translateX(-50%)';  // 中央揃え
        errorToast.style.zIndex = '9999';  // 最前面に表示
        
        // Toastの内容を設定
        errorToast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${type}</strong><br>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        // Toastを表示
        document.body.appendChild(errorToast);
        const toast = new bootstrap.Toast(errorToast);
        toast.show();

        // 自動削除のタイマー設定
        setTimeout(() => {
            errorToast.remove();
        }, 4000);

        // シェイクアニメーション
        if (element) {
            this.addShakeAnimation(element);
        }
    }

    /**
     * シェイクアニメーションを追加
     * @param {HTMLElement} element - アニメーションを適用する要素
     */
    static addShakeAnimation(element) {
        element.classList.add('error-shake');
        setTimeout(() => {
            element.classList.remove('error-shake');
        }, 500);
    }

    /**
     * エラーメッセージのテンプレート
     */
    static Messages = {
        REPLAY_MODE_OFF: 'リプレイモードを先にオフにしてください',
        COORDINATE_MODE_OFF: '座標取得モードを先にオフにしてください',
        NO_USER_SELECTED: 'ユーザーを選択してください',
        MAX_USERS_LIMIT: '最大3名まで選択可能です',
        ENABLE_COORDINATE_MODE: '座標取得モードをオンにしてください',
        NO_OPERATION_IN_REPLAY: 'リプレイ中は取り消せません',
        FETCH_DATA_ERROR: 'データの取得に失敗しました',
        USER_LIST_ERROR: 'ユーザー一覧の取得に失敗しました',
        NO_CLICK_DATA: 'クリックデータがありません',
        DELETE_ERROR: '削除に失敗しました',
        LAST_CLICK_DELETED: '最後のクリックを取り消しました',
        EXPORT_SUCCESS: 'データがエクスポートされました',
        NO_EXPORT_DATA: 'エクスポートするデータがありません',
        EXPORT_ERROR: 'エクスポートに失敗しました',
        COMMENT_REQUIRED: 'コメントを入力してください',
        COMMENT_UPDATED: 'コメントを更新しました',
        COMMENT_SAVED: 'コメントを保存しました',
        COMMENT_ERROR: 'コメントの保存中にエラーが発生しました',
        JUMP_ERROR: 'リプレイモード時のみジャンプ可能です',
        FEEDBACK_ERROR: '保存に失敗しました',
    };
}

// グローバルスコープで利用できるようにする
window.ErrorManager = ErrorManager;
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

window.AnnotationStateManager = AnnotationStateManager;
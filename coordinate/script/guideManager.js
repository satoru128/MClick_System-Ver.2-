/**
 * ガイド機能を管理するクラス
 */
class GuideManager {
    constructor() {
        this.tour = null;
        this.manualManager = new ManualManager();
        this.initialize();
    }

    /**
     * 初期化処理
     */
    initialize() {
        // ヘルプボタンのイベントリスナー設定
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showGuideSelection());
        }

        // ガイド選択ボタンのイベントリスナー設定
        const tourBtn = document.getElementById('startTourBtn');
        const manualBtn = document.getElementById('showManualBtn');
        
        if (tourBtn) {
            tourBtn.addEventListener('click', () => this.startTourGuide());
        }
        if (manualBtn) {
            manualBtn.addEventListener('click', () => this.showManual());
        }

        // Shepherdツアーの初期化と基本設定
        this.tour = new Shepherd.Tour({
            useModalOverlay: true,
            defaultStepOptions: {
                classes: 'custom-shepherd-theme',  // カスタムクラスを追加
                classes: 'shadow-md bg-purple-dark',
                scrollTo: {
                    behavior: 'smooth',  // スムーズスクロール
                    block: 'center'      // 画面中央に表示
                },
                arrow: false,  // 矢印を非表示にする
                cancelIcon: {
                    enabled: true
                },
                popperOptions: {
                    modifiers: [{
                        name: 'offset',
                        options: {
                            offset: [0, 12]  // 吹き出しと要素の間隔を設定
                        }
                    }]
                },
                cancelIcon: {
                    enabled: true
                }
            }
        });
    }

    /**
     * ガイド選択モーダルの表示
     */
    showGuideSelection() {
        const modal = new bootstrap.Modal(document.getElementById('guideSelectModal'));
        modal.show();
    }

    /**
     * マニュアルの表示
     */
    showManual() {
        const selectModal = bootstrap.Modal.getInstance(document.getElementById('guideSelectModal'));
        selectModal.hide();

        const manualModal = new bootstrap.Modal(document.getElementById('manualModal'));
        manualModal.show();
    }

    /**
     * ツアーガイドのステップを設定
     */
    getTourSteps() {
        return [
            // 1. 動画表示エリア
            {
                id: 'video-container',
                title: '1. 動画表示エリア',
                text: '動画の再生とアノテーションの記録・表示を行うメインエリアです．<br>' +
                      '左クリックでクリック位置を記録し，右クリックで範囲選択やシーン記録が行えます．',
                attachTo: {
                    element: '#video-container',
                    on: 'bottom-start'
                },
                buttons: [{ text: "次へ", action: this.tour.next }]
            },

            // 2. アノテーション制御
            {
                id: 'annotation-controls',
                title: '2. アノテーション制御',
                text: 'アノテーションの記録と再生に関する重要な設定です．',
                attachTo: {
                    element: '.card:has(#replayBtn)',
                    on: 'left-start'
                },
                buttons: [
                    { text: "戻る", action: this.tour.back },
                    { text: "次へ", action: this.tour.next }
                ]
            },

            // 3. 座標取得モード
            {
                id: 'coordinate-mode',
                title: '2.1 座標取得モード',
                text: 'このモードをオンにすると，動画上でアノテーションの記録が可能になります．<br>' +
                      '※リプレイモードがオフの時のみ使用できます．',
                attachTo: {
                    element: '#toggleCoordinateBtn',
                    on: 'left-start',
                    offset: [0, 15]
                },
                buttons: [
                    { text: "戻る", action: this.tour.back },
                    { text: "次へ", action: this.tour.next }
                ]
            },

            // 4. リプレイモード
            {
                id: 'replay-mode',
                title: '2.2 リプレイモード',
                text: '記録したアノテーションを動画とともに再生します．<br>' +
                      '※座標取得モードがオフの時のみ使用できます．',
                attachTo: {
                    element: '#replayBtn',
                    on: 'left-start'
                },
                buttons: [
                    { text: "戻る", action: this.tour.back },
                    { text: "次へ", action: this.tour.next }
                ]
            },

            // 5. ヒートマップモード
            {
                id: 'heatmap-mode',
                title: '2.3 ヒートマップモード',
                text: 'アノテーションの頻度を時系列で可視化します．<br>' +
                      '※座標取得モードがオフの時のみ使用できます．',
                attachTo: {
                    element: '#heatmapToggle',
                    on: 'left-start'
                },
                buttons: [
                    { text: "戻る", action: this.tour.back },
                    { text: "次へ", action: this.tour.next }
                ]
            },

            // 6. ユーザー選択
            {
                id: 'user-select',
                title: '3. ユーザー選択',
                text: 'リプレイで表示するユーザーを選択します（最大3名）．<br>' +
                      '選択したユーザーのアノテーションがデータテーブルにも表示されます．',
                attachTo: {
                    element: '#userDropdown',
                    on: 'left-start'
                },
                buttons: [
                    { text: "戻る", action: this.tour.back },
                    { text: "次へ", action: this.tour.next }
                ]
            },

            // 7. リプレイ表示設定
            {
                id: 'replay-settings',
                title: '4. リプレイ表示設定',
                text: 'リプレイ時に表示するアノテーションの種類を選択できます．<br>' +
                      'クリック座標，範囲選択，シーン記録の表示をカスタマイズできます．',
                attachTo: {
                    element: '#replaySettingsDropdown',
                    on: 'left-start'
                },
                buttons: [
                    { text: "戻る", action: this.tour.back },
                    { text: "次へ", action: this.tour.next }
                ]
            },

            // 8. データテーブル
            {
                id: 'data-tabs',
                title: '5. データテーブル',
                text: 'クリック座標，範囲選択，シーン記録，フィードバックの記録を確認できます．<br>' +
                      'No.をクリックすると該当時間にジャンプし，コメントの編集や削除も可能です．',
                attachTo: {
                    element: '.nav-tabs',
                    on: 'left-start'
                },
                buttons: [
                    { text: "戻る", action: this.tour.back },
                    { text: "ガイドを終了", action: this.tour.complete }
                ]
            }
        ];
    }

    /**
     * ツアーガイドの開始
     */
    startTourGuide() {
        // 既存のステップをクリア
        this.tour.steps = [];
        // 選択モーダルを閉じる
        const selectModal = bootstrap.Modal.getInstance(document.getElementById('guideSelectModal'));
        selectModal.hide();

        // ツアーのステップを設定
        this.getTourSteps().forEach(step => {
            this.tour.addStep(step);
        });

        // ツアーを開始
        this.tour.start();
    }
}

// グローバルスコープで利用できるようにする
window.GuideManager = GuideManager;
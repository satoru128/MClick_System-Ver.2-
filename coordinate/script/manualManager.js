/**
 * マニュアル機能を管理するクラス
 */
class ManualManager {
    constructor() {
        this.sections = this.getManualContent();
        this.initialize();
    }

    /**
     * 初期化処理
     */
    initialize() {
        // マニュアルボタンのイベントリスナー
        const manualBtn = document.getElementById('showManualBtn');
        if (manualBtn) {
            manualBtn.addEventListener('click', () => this.showManual());
        }

        // 目次のクリックイベントを設定
        document.addEventListener('click', (e) => {
            if (e.target.matches('.help-toc a')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').slice(1);
                this.scrollToSection(targetId);
            }
        });
    }

    /**
     * マニュアルの内容をHTML文字列として定義
     * @returns {Array} マニュアルセクションの配列
     */
    getManualContent() {
        return [
            {
                id: 'basic',
                title: '1. 基本操作',
                content: `
                    <div class="manual-section w-75">
                        <h6>1.1 動画コントロール</h6>
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead class="table-light text-center">
                                    <tr>
                                        <th>アイコン</th>
                                        <th>機能</th>
                                        <th>説明</th>
                                    </tr>
                                </thead>
                                <tbody class="text-center">
                                    <tr>
                                        <td>
                                            <i class="bi bi-play-fill"></i>
                                            <i class="bi bi-pause-fill"></i>
                                            <i class="bi bi-stop-fill"></i>
                                        </td>
                                        <td>基本操作</td>
                                        <td>再生，一時停止，停止の制御</td>
                                    </tr>
                                    <tr>
                                        <td><i class="bi bi-volume-up-fill"></i></td>
                                        <td>ミュート</td>
                                        <td>音声のオン/オフ切替</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <i class="bi bi-skip-backward-fill"></i>
                                            <i class="bi bi-skip-forward-fill"></i>
                                        </td>
                                        <td>シーク操作</td>
                                        <td>10秒前後への移動</td>
                                    </tr>
                                    <tr>
                                        <td><i class="bi bi-chat-square-text"></i></td>
                                        <td>コメント</td>
                                        <td>最新のクリック記録にコメントを追加</td>
                                    </tr>
                                    <tr>
                                        <td><i class="bi bi-x-circle"></i></td>
                                        <td>取消</td>
                                        <td>最新のクリック記録を削除</td>
                                    </tr>
                                    <tr>
                                        <td><i class="bi bi-chat-right-quote"></i></td>
                                        <td>フィードバック</td>
                                        <td>リプレイ時のコメントを記録</td>
                                    </tr>
                                    <tr>
                                        <td><i class="bi bi-speedometer2"></i></td>
                                        <td>再生速度</td>
                                        <td>0.25倍～2.0倍の範囲で変更可能</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="alert alert-info mt-3">
                            <i class="bi bi-info-circle"></i> 
                            フィードバック用のコメント：リプレイモードが "オン" の時のみ使用できます．
                        </div>
                    </div>
                `
            },
            {
                id: 'annotation',
                title: '2. アノテーション機能',
                content: `
                    <div class="manual-section w-80">
                        <h6>2.1 アノテーションの記録</h6>
                        <p>「座標取得」をオンにすることで，以下の操作が可能になります</p>
                        
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead class="table-light text-center">
                                    <tr>
                                        <th>操作</th>
                                        <th>機能</th>
                                        <th>詳細説明</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="text-center">左クリック</td>
                                        <td>クリック位置を記録</td>
                                        <td>
                                            <ul class="mb-0">
                                                <li>記録後にコメントを追加可能</li>
                                                <li>「取消」ボタンで最新の記録を削除</li>
                                            </ul>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="text-center">右クリック</td>
                                        <td>
                                            範囲選択<br>
                                            or<br>
                                            シーン記録
                                        </td>
                                        <td>
                                            <ul class="mb-0">
                                                <li>範囲選択：2点のクリックで範囲を指定</li>
                                                <li>シーン記録：現在のシーン（場面）を記録</li>
                                                <li>コメントの入力が必須</li>
                                            </ul>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="alert alert-info mt-3">
                            <i class="bi bi-info-circle"></i> 
                            座標取得モード：リプレイモードが "オフ" の時のみ使用できます．
                        </div>
                    </div>
                `
            },
            {
                id: 'replay',
                title: '3. リプレイ機能',
                content: `
                    <div class="manual-section w-80">
                        <h6>3.1 リプレイの開始</h6>
                        <p>「リプレイ」をオンにすることで，記録したアノテーションを動画とともに再生できます</p>
                        
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead class="table-light text-center">
                                    <tr>
                                        <th>設定項目</th>
                                        <th>機能</th>
                                        <th>詳細説明</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="text-center">ユーザー選択</td>
                                        <td>表示するユーザーの選択</td>
                                        <td>
                                            <ul class="mb-0">
                                                <li>最大3名まで選択可能</li>
                                                <li>選択したユーザーのデータが，リプレイ画面とテーブルに表示</li>
                                                <li>ユーザーごとに異なる色で表示</li>
                                            </ul>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="text-center">表示設定</td>
                                        <td>動画に表示する記録の選択</td>
                                        <td>
                                            <ul class="mb-0">
                                                <li>クリック座標（表示/非表示）</li>
                                                <li>範囲選択（表示/非表示）</li>
                                                <li>シーン記録（表示/非表示）</li>
                                                <li>コメント（常時表示切替）</li>
                                            </ul>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="text-center">データテーブル</td>
                                        <td>記録データの表示と操作</td>
                                        <td>
                                            <ul class="mb-0">
                                                <li>No.セルをクリックで該当時間の動画にジャンプ</li>
                                                <li>コメントの編集が可能　<i class="bi bi-pencil"></i></li>
                                                <li>不要なデータの削除　<i class="bi bi-trash"></i></li>
                                            </ul>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="alert alert-info mt-3">
                            <i class="bi bi-info-circle"></i> 
                            リプレイモード：座標取得モードが "オフ" の時のみ使用できます．
                        </div>
                    </div>
                `
            },
            {
                id: 'data',
                title: '4. データ表示',
                content: `
                    <div class="manual-section w-80">
                        <h6>4.1 データテーブル表示</h6>
                        <p>記録したデータは以下の4種類のタブで確認できます：</p>
                        
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead class="table-light text-center">
                                    <tr>
                                        <th>タブ</th>
                                        <th>表示内容</th>
                                        <th>操作方法</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="text-center">クリック座標</td>
                                        <td>左クリックで記録した位置データ</td>
                                        <td rowspan="4">
                                            <ul class="mb-0">
                                                <li>No.クリック：該当時間にジャンプ</li>
                                                <li><i class="bi bi-pencil"></i>：コメントの編集</li>
                                                <li><i class="bi bi-trash"></i>：データの削除</li>
                                            </ul>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="text-center">範囲選択</td>
                                        <td>右クリックで記録した範囲データ</td>
                                    </tr>
                                    <tr>
                                        <td class="text-center">シーン記録</td>
                                        <td>右クリックで記録したシーンデータ</td>
                                    </tr>
                                    <tr>
                                        <td class="text-center">フィードバック</td>
                                        <td>リプレイ時に記録したコメント</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="alert alert-info mt-3">
                            <i class="bi bi-info-circle"></i> 
                            "No." のクリック：リプレイ時のみ機能します．
                        </div>
                    </div>
                `
            },
            {
                id: 'other',
                title: '5. その他の機能',
                content: `
                    <div class="manual-section w-80">
                        <h6>5.1 その他の機能</h6>
                        
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead class="table-light text-center">
                                    <tr>
                                        <th>機能</th>
                                        <th>説明</th>
                                        <th>詳細設定</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="text-center">ヒートマップ</td>
                                        <td>アノテーションの頻度を時系列で可視化</td>
                                        <td>
                                            <ul class="mb-0">
                                                <li>棒グラフ：時間帯ごとの記録件数を表示</li>
                                                <li>波形グラフ：記録の時間的な分布を表示</li>
                                                <li>選択中のユーザーのデータを色分けして表示</li>
                                            </ul>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="text-center">
                                            データ<br>エクスポート<br>
                                            <i class="bi bi-download"></i>
                                        </td>
                                        <td>記録データの出力</td>
                                        <td>
                                            <ul class="mb-0">
                                                <li>全ての種類のデータを一括でエクスポート</li>
                                                <li>クリック座標・範囲選択・シーン記録データを含む</li>
                                                <li>フィードバックデータも含めて出力</li>
                                            </ul>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="alert alert-info mt-3">
                            <i class="bi bi-info-circle"></i> 
                            ヒートマップ：座標取得モード時は使用できません．
                        </div>
                    </div>
                `
            }
        ];
    }

    /**
     * 目次の生成
     * @returns {string} 目次のHTML
     */
    generateTOC() {
        return `
            <h6>目次</h6>
            <nav class="nav flex-column">
                ${this.sections.map(section => `
                    <a class="nav-link" href="#${section.id}">
                        ${section.title}
                    </a>
                `).join('')}
            </nav>
        `;
    }

    /**
     * マニュアルコンテンツの生成
     * @returns {string} マニュアル本文のHTML
     */
    generateContent() {
        return this.sections.map(section => `
            <div id="${section.id}" class="manual-section mb-4">
                <h6>${section.title}</h6>
                ${section.content}
            </div>
        `).join('');
    }

    /**
     * マニュアルの表示
     */
    showManual() {
        // ガイド選択モーダルを閉じる
        const selectModal = bootstrap.Modal.getInstance(document.getElementById('guideSelectModal'));
        if (selectModal) {
            selectModal.hide();
        }

        // 目次とコンテンツを更新
        const tocContainer = document.querySelector('.help-toc');
        const contentContainer = document.querySelector('.manual-content');

        if (tocContainer) {
            tocContainer.innerHTML = this.generateTOC();
        }
        if (contentContainer) {
            contentContainer.innerHTML = this.generateContent();
        }

        // マニュアルモーダルを表示
        const manualModal = new bootstrap.Modal(document.getElementById('manualModal'));
        manualModal.show();

        // モーダルが閉じられたときの処理を追加
        document.getElementById('manualModal').addEventListener('hidden.bs.modal', () => {
            // モーダル背景を削除
            const modalBackdrop = document.querySelector('.modal-backdrop');
            if (modalBackdrop) {
                modalBackdrop.remove();
            }

            // bodyのスタイルをリセット
            document.body.classList.remove('modal-open');
            document.body.removeAttribute('style');
            document.body.style.overflow = 'auto';
            document.body.style.paddingRight = '0';
        });
    }

    /**
     * 特定のセクションまでスクロール
     * @param {string} sectionId - スクロール先のセクションID
     */
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// グローバルスコープで利用できるようにする
window.ManualManager = ManualManager;
/**
 * ヒートマップを管理するクラス
 */
class HeatmapManager {
    constructor() {
        this.chart = null;
        this.modalChart = null;
        this.updateInterval = null;
        this.initialize();
    }

    /**
     * 初期化処理
     */
    initialize() {
        // 拡大ボタンのイベント設定
        const expandBtn = document.getElementById('expandHeatmapBtn');
        expandBtn?.addEventListener('click', this.handleExpand.bind(this));
    }

    /**
     * 表示設定の取得（リプレイと同じ設定を使用）
     */
    getDisplaySettings() {
        return {
            showClicks: document.getElementById('showClicks').checked,
            showRanges: document.getElementById('showRanges').checked,
            showScenes: document.getElementById('showScenes').checked
        };
    }

    /**
     * トグル切り替え時の処理
     */
    handleToggle(event) {
        const heatmapArea = document.getElementById('heatmapArea');
        const expandBtn = document.getElementById('expandHeatmapBtn');
        const showBtn = document.getElementById('showHeatmapBtn');
        
        if (event.target.checked) {
            heatmapArea.style.display = 'block';
            expandBtn.style.display = 'inline-block';
            showBtn.style.display = 'inline-block';
            this.startUpdating();
        } else {
            heatmapArea.style.display = 'none';
            expandBtn.style.display = 'none';
            showBtn.style.display = 'none';
            this.stopUpdating();
        }
    }

    /**
     * 表示するデータの取得
     */
    async fetchDisplayData() {
        const settings = this.getDisplaySettings();
        console.log('表示設定:', settings); // デバッグ：表示設定の確認
        console.log('選択中ユーザー:', selectedUsers); // デバッグ：選択ユーザーの確認
        const data = [];
    
        if (selectedUsers.size === 0) {
            console.log('選択されているユーザーがいません'); // デバッグ
            return null;
        }
    
        try {
            // クリックデータの取得
            if (settings.showClicks) {
                console.log('クリックデータ取得開始');
                const clickData = await this.fetchTypeData('click');
                console.log('取得したクリックデータ:', clickData);
                if (clickData) data.push(...clickData);
            }
    
            // 範囲選択データの取得
            if (settings.showRanges) {
                console.log('範囲データ取得開始');
                const rangeData = await this.fetchTypeData('range');
                console.log('取得した範囲データ:', rangeData);
                if (rangeData) data.push(...rangeData);
            }
    
            // シーン記録データの取得
            if (settings.showScenes) {
                console.log('シーンデータ取得開始');
                const sceneData = await this.fetchTypeData('scene');
                console.log('取得したシーンデータ:', sceneData);
                if (sceneData) data.push(...sceneData);
            }
    
            console.log('最終的なデータ:', data); // デバッグ
            return data;
        } catch (error) {
            console.error('データ取得エラー:', error);
            return null;
        }
    }

    /**
     * 特定タイプのデータ取得
     */
    async fetchTypeData(type) {
        const endpoint = {
            click: './coordinate/php/get_click_data.php',
            range: './coordinate/php/get_range_data.php',
            scene: './coordinate/php/get_scene_data.php'
        }[type];
    
        console.log(`${type}データ取得開始:`, {
            videoId,
            selectedUsers: Array.from(selectedUsers)
        }); // デバッグ
    
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                video_id: videoId,
                user_ids: Array.from(selectedUsers)
            })
        });
    
        const result = await response.json();
        console.log(`${type}データ取得結果:`, result); // デバッグ
    
        if (result.status === 'success') {
            return result[`${type}s`].map(item => ({
                ...item,
                type: type,
                time: item.click_time
            }));
        }
        return null;
    }

    /**
     * ヒートマップデータの作成
     */
    processData(rawData) {
        if (!rawData || rawData.length === 0) return null;

        const duration = player.getDuration();
        const interval = 10; // 10秒間隔
        const datasets = {};

        // ユーザーごとにデータを分類
        Array.from(selectedUsers).forEach(userId => {
            const userData = rawData.filter(item => item.user_id === userId);
            const data = new Array(Math.ceil(duration / interval)).fill(0);

            userData.forEach(item => {
                const index = Math.floor(item.time / interval);
                if (index < data.length) {
                    data[index]++;
                }
            });

            // ユーザーの色を取得
            const colorIndex = userColorAssignments.get(userId);
            const color = USER_COLORS[colorIndex];
            const user = allUsers.find(u => u.user_id === userId);

            datasets[userId] = {
                label: user ? user.name : userId,
                data: data,
                backgroundColor: color.bg,
                borderColor: color.bg.replace('0.7', '1'),
                borderWidth: 1
            };
        });

        return {
            labels: this.generateTimeLabels(duration, interval),
            datasets: Object.values(datasets)
        };
    }

    /**
     * 時間ラベルの生成
     */
    generateTimeLabels(duration, interval) {
        const labels = [];
        for (let i = 0; i < duration; i += interval) {
            const minutes = Math.floor(i / 60);
            const seconds = i % 60;
            labels.push(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
        return labels;
    }

    /**
     * グラフの描画
     */
    async drawHeatmap() {
        console.log('drawHeatmap開始'); // デバッグログ
        const ctx = document.getElementById('heatmapChart').getContext('2d');
        console.log('コンテキスト取得:', ctx); // デバッグログ
    
        const rawData = await this.fetchDisplayData();
        console.log('取得したデータ:', rawData); // デバッグログ
    
        const chartData = this.processData(rawData);
        console.log('加工したデータ:', chartData); // デバッグログ
        
        if (!chartData) {
            console.log('チャートデータがありません'); // デバッグログ
            return;
        }
    
        if (this.chart) {
            console.log('既存のチャートを破棄'); // デバッグログ
            this.chart.destroy();
        }
    
        try {
            this.chart = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'アノテーション数'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: '動画時間'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'アノテーション頻度分布'
                        },
                        tooltip: {
                            callbacks: {
                                title: (items) => `時間: ${items[0].label}`,
                                label: (item) => `${item.dataset.label}: ${item.raw}回`
                            }
                        }
                    }
                }
            });
            console.log('チャート作成完了'); // デバッグログ
        } catch (error) {
            console.error('チャート作成エラー:', error); // エラーログ
        }
    }

    /**
     * モーダルでの表示処理
     */
    async showInModal() {
        // 動画を一時停止
        if (player) {
            player.pauseVideo();
        }

        // 更新を一時停止
        this.stopUpdating();

        const modal = new bootstrap.Modal(document.getElementById('heatmapModal'));
        modal.show();

        // モーダルが閉じられたときの処理
        document.getElementById('heatmapModal').addEventListener('hidden.bs.modal', () => {
            if (this.modalChart) {
                this.modalChart.destroy();
                this.modalChart = null;
            }
            // ヒートマップトグルがONの場合は更新を再開
            if (document.getElementById('heatmapToggle').checked) {
                this.startUpdating();
            }
        });

        // モーダル内のグラフを描画（1回のみ）
        const modalCtx = document.getElementById('heatmapModalChart').getContext('2d');
        const rawData = await this.fetchDisplayData();
        const chartData = this.processData(rawData);
        
        if (this.modalChart) {
            this.modalChart.destroy();
        }

        this.modalChart = new Chart(modalCtx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                ...this.chart.options
            }
        });
    }

    /**
     * 拡大表示の切り替え
     */
    handleExpand() {
        this.isExpanded = !this.isExpanded;
        const heatmapArea = document.getElementById('heatmapArea');
        
        if (this.isExpanded) {
            heatmapArea.style.height = '300px';
        } else {
            heatmapArea.style.height = '100px';
        }
        
        if (this.chart) {
            this.chart.resize();
        }
    }

    /**
     * 定期更新の開始
     */
    startUpdating() {
        this.drawHeatmap();
        this.updateInterval = setInterval(() => {
            this.drawHeatmap();
        }, 30000); // 5秒ごとに更新
    }

    /**
     * 定期更新の停止
     */
    stopUpdating() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}

// グローバルスコープで利用できるようにする
window.HeatmapManager = HeatmapManager;
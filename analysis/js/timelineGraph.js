/**
 * 時系列グラフの実装
 * Chart.jsを使用したクリックデータの可視化
 */
class TimelineGraph {
    constructor() {
        this.chart = null;
    }

    /**
     * グラフの初期化と描画
     */
    async initialize() {
        try {
            const data = await this.fetchData();
            this.drawGraph(data);
        } catch (error) {
            console.error('グラフ初期化エラー:', error);
        }
    }

    /**
     * クリックデータの取得
     */
    async fetchData() {
        try {
            const response = await fetch('./analysis/php/get_timeline_data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    video_id: window.videoId,
                    user_id: window.userId
                })
            });
            const result = await response.json();
            if (result.status === 'success') {
                return result.data;
            }
            throw new Error('データの取得に失敗しました');
        } catch (error) {
            console.error('データ取得エラー:', error);
            return [];
        }
    }

    /**
     * グラフの描画
     * @param {Array} data - クリックデータ配列
     */
    drawGraph(data) {
        const ctx = document.getElementById('timeline-graph').getContext('2d');
        
        // 既存のグラフがあれば破棄
        if (this.chart) {
            this.chart.destroy();
        }

        // データの整形
        const chartData = {
            labels: data.map(item => this.formatTime(item.click_time)),
            datasets: [{
                label: 'クリック頻度',
                data: data.map(item => parseInt(item.click_count)),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                tension: 0.1
            }]
        };

        // グラフの設定
        this.chart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'クリック数'
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
                        text: 'クリック頻度分析'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });
    }

    /**
     * 時間のフォーマット（秒を「分:秒」形式に）
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// グローバルに公開
window.TimelineGraph = TimelineGraph;
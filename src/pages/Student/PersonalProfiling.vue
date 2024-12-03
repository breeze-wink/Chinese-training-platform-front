<template>
    <div class="page-container">
        <Header />
        <div class="main-container">
            <Sidebar />
            <div class="learning-stats">
                <div class="learning-hours">
                    <h2>学习时长</h2>
                    <hr class="divider">
                    <div class="stats-row">
                        <div class="stat-box hours-box">
                            <span>已学习</span>
                            <span class="hours">156.3小时</span>
                        </div>
                        <div class="stat-box percentage-box">
                            <span>超越本班</span>
                            <span class="percentage">95%</span>
                            <span>的同学</span>
                        </div>
                    </div>
                </div>
                <div class="average-score">
                    <h2>均分排名</h2>
                    <hr class="divider">
                    <div class="stats-row">
                        <div class="stat-box score-box">
                            <span>平均分</span>
                            <span class="score">84</span>
                        </div>
                        <div class="stat-box ranking-box">
                            <span>本班排名</span>
                            <span class="ranking">6</span>
                        </div>
                    </div>
                </div>
                <div class="data-analysis">
                    <h2>数据分析面板</h2>
                    <hr class="divider">
                    <div class="radar-chart">
                        <svg width="300" height="300"></svg>
                        <!-- Radar chart placeholder -->
                    </div>
                </div>
                <div class="shortboard-section">
                    <h2>短板</h2>
                    <hr class="divider">
                    <div class="shortboard">
                        <div class="bar-chart">
                            <div class="bar" style="height: 100px; background-color: #66c2ff;"></div>
                            <div class="bar" style="height: 150px; background-color: #ffcc66;"></div>
                            <div class="bar" style="height: 75px; background-color: #ff6666;"></div>
                        </div>
                        <div class="bar-labels">
                            <span>科目1</span>
                            <span>科目2</span>
                            <span>科目3</span>
                        </div>
                    </div>
                </div>
                <div class="score-trend-section">
                    <h2>历史分数波动</h2>
                    <hr class="divider">
                    <div class="score-trend">
                        <div class="line-chart">
                            <svg width="600" height="300">
                                <polyline points="20,280 60,250 100,260 140,230 180,200 220,220 260,240 300,270 340,250 380,230 420,260 460,280 500,270 540,250 580,260"
                                          style="fill:none;stroke:#66c2ff;stroke-width:2"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Header from "@/components/Header.vue";
import Sidebar from "@/components/Sidebar.vue";

export default {
    name: 'LearningStats',
    components: {
        Sidebar,
        Header
    }
};
</script>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: linear-gradient(135deg, #f0f0f0, #ffffff);
}

.main-container {
    display: flex;
    flex: 1;
    padding: 20px;
    background-color: #ffffff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
}

.learning-stats {
    font-family: 'Arial', sans-serif;
    text-align: left; /* 修改为左对齐 */
    flex: 1;
    margin-left: 20px;
    padding: 20px;
    background-color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
}

.divider {
    border: 1px solid #e0e0e0;
    margin: 10px 0;
}

.stats-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stat-box {
    flex: 1;
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    margin: 0 10px;
    text-align: center; /* 统计框内的内容居中对齐 */
}

.hours, .percentage, .score, .ranking {
    font-size: 24px;
    font-weight: bold;
    color: #333333;
}

.radar-chart, .shortboard, .score-trend {
    width: 100%;
    margin: 20px 0;
}

.bar-chart {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 200px;
    width: 100%;
}

.bar {
    width: 20%;
    background-color: #ccc;
    margin: 0 5px;
    transition: transform 0.3s;
}

.bar:hover {
    transform: translateY(-10px);
}

.bar-labels {
    display: flex;
    justify-content: space-around;
    margin-top: 10px;
    font-size: 14px;
    color: #666666;
}

.line-chart svg {
    display: block;
    margin: 0 auto;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
}

h2, h3 {
    color: #333333;
    margin-bottom: 10px;
}

h3 {
    font-size: 18px;
}
</style>
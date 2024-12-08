<template>
    <div class="page-container">
        <Header />
        <div class="main-container">
            <Sidebar />
            <div class="learning-stats" v-if="allDataLoaded || (avgScore || multidimensionalScores.length || weaknessScores.length || scoreFluctuations.length)">
                <!-- 均分排名 -->
                <div class="average-score" v-if="!loadingAvgScore">
                    <h2>均分排名</h2>
                    <hr class="divider">
                    <div class="stats-row">
                        <div class="stat-box score-box">
                            <span>平均分</span>
                            <span class="score">{{ avgScore || 'N/A' }}</span>
                        </div>
                        <div class="stat-box ranking-box">
                            <span>本班排名</span>
                            <span class="ranking">{{ classRank || 'N/A' }}</span>
                        </div>
                    </div>
                </div>
                <!-- 数据分析面板 -->
                <div class="data-analysis" v-if="!loadingMultidimensionalScores && multidimensionalScores.length">
                    <h2>数据分析面板</h2>
                    <hr class="divider">
                    <div class="radar-chart">
                        <svg width="300" height="300"></svg>
                        <!-- Radar chart placeholder -->
                    </div>
                </div>
                <!-- 短板 -->
                <div class="shortboard-section" v-if="!loadingWeaknessScores && weaknessScores.length">
                    <h2>短板</h2>
                    <hr class="divider">
                    <div class="shortboard">
                        <div class="bar-chart">
                            <div v-for="(weakness, index) in weaknessScores" :key="index" class="bar-item">
                                <div class="bar-labels">
                                    <span>{{ weakness.weaknessName }}</span>
                                </div>
                                <div class="bar-container">
                                    <div class="bar"
                                         :style="{
                                             width: Math.max(weakness.weaknessScore * 100, 5) + '%',
                                             backgroundColor: colors[index % colors.length],
                                             minWidth: '5px'
                                         }"
                                         :title="`${weakness.weaknessName}: ${weakness.weaknessScore * 100}%`"
                                    ></div>
                                </div>
                                <!-- 调试信息 -->
                                <p style="font-size: 10px; color: red;">Debug: {{ weakness.weaknessName }} - Width: {{ Math.max(weakness.weaknessScore * 100, 5) }}%</p>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 历史分数波动 -->
                <div class="score-trend-section" v-if="!loadingScoreFluctuations && scoreFluctuations.length">
                    <h2>历史分数波动</h2>
                    <hr class="divider">
                    <div class="score-trend">
                        <div class="line-chart">
                            <svg :width="chartWidth" :height="chartHeight">
                                <polyline :points="linePoints" style="fill:none;stroke:#66c2ff;stroke-width:2"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                <p>Loading...</p>
            </div>
        </div>
    </div>
</template>

<script>
import Header from "@/components/Header.vue";
import Sidebar from "@/components/Sidebar.vue";
import axios from 'axios';
import { mapGetters } from 'vuex';

export default {
    name: 'LearningStats',
    components: {
        Sidebar,
        Header
    },
    data() {
        return {
            avgScore: null,
            classRank: null,
            multidimensionalScores: [],
            weaknessScores: [],
            scoreFluctuations: [],
            loadingAvgScore: true,
            loadingMultidimensionalScores: true,
            loadingWeaknessScores: true,
            loadingScoreFluctuations: true,
            colors: ['#66c2ff', '#ffcc66', '#ff6666'],
            chartWidth: 600,
            chartHeight: 300
        };
    },
    computed: {
        ...mapGetters(['getUserId']),
        allDataLoaded() {
            return !this.loadingAvgScore &&
                !this.loadingMultidimensionalScores &&
                !this.loadingWeaknessScores &&
                !this.loadingScoreFluctuations;
        },
        linePoints() {
            if (this.scoreFluctuations.length === 0) return '';

            const points = [];
            const xStep = this.chartWidth / (this.scoreFluctuations.length - 1);
            const yMax = Math.max(...this.scoreFluctuations.map(item => item.score));
            const yMin = Math.min(...this.scoreFluctuations.map(item => item.score));

            this.scoreFluctuations.forEach((item, index) => {
                const x = xStep * index;
                const y = (1 - (item.score - yMin) / (yMax - yMin)) * (this.chartHeight - 20) + 20; // 20 is the margin
                points.push(`${x},${y}`);
            });

            return points.join(' ');
        }
    },
    mounted() {
        this.fetchStudentData();
        this.fetchMultidimensionalScores();
        this.fetchWeaknessScores();
        this.fetchScoreFluctuations();
    },
    methods: {
        async fetchStudentData() {
            try {
                const response = await axios.get(`/api/student/${this.getUserId}/get-avg-score`);
                if (response.status === 200) {
                    this.avgScore = response.data.data.averageHomeworkScore;
                    this.classRank = response.data.data.classRank;
                    console.log(response.data);
                }
            } catch (error) {
                console.error('获取学生数据失败:', error);
            } finally {
                this.loadingAvgScore = false;
            }
        },
        async fetchMultidimensionalScores() {
            try {
                const response = await axios.get(`/api/student/${this.getUserId}/get-multidimensional-scores`);
                if (response.status === 200) {
                    this.multidimensionalScores = response.data.data;
                    console.log(response.data);
                }
            } catch (error) {
                console.error('获取多维得分率失败:', error);
            } finally {
                this.loadingMultidimensionalScores = false;
            }
        },
        async fetchWeaknessScores() {
            try {
                const response = await axios.get(`/api/student/${this.getUserId}/get-weakness-scores`);
                if (response.status === 200) {
                    this.weaknessScores = response.data.data.map(item => ({
                        type: item.type,
                        weaknessName: item.weaknessName,
                        // 将weaknessScore转换为小数
                        weaknessScore: parseFloat((item.weaknessScore / 100).toFixed(2)), // 转换并保留两位小数
                    }));
                    console.log('Fetched weakness scores:', this.weaknessScores); // 添加日志输出
                }
            } catch (error) {
                console.error('获取短板得分率失败:', error);
            } finally {
                this.loadingWeaknessScores = false;
                this.$nextTick(() => {
                    // 确保 DOM 更新完成后再执行其他操作
                });
            }
        },
        async fetchScoreFluctuations() {
            try {
                const response = await axios.get(`/api/student/${this.getUserId}/score-fluctuations`);
                if (response.status === 200) {
                    this.scoreFluctuations = response.data.data;
                    console.log(response.data);
                }
            } catch (error) {
                console.error('获取历史分数波动数据失败:', error);
            } finally {
                this.loadingScoreFluctuations = false;
            }
        }
    }
};
</script>

<style scoped>
/* 样式保持不变 */
.page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f0f0f0; /* 背景改为浅灰色 */
}

.main-container {
    display: flex;
    flex: 1;
}

.learning-stats {
    font-family: 'Arial', sans-serif;
    text-align: left;
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
    text-align: center;
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
    flex-direction: column; /* 改变为垂直排列 */
    gap: 10px; /* 添加间距 */
}

.bar-item {
    display: flex;
    align-items: center; /* 水平居中对齐 */
    gap: 10px; /* 给文本和条形之间添加一些空间 */
}

.bar-container {
    position: relative;
    width: calc(100% - 100px); /* 减去左侧标签宽度 */
    height: 20px; /* 固定高度 */
}

.bar {
    height: 100%; /* 条形的高度等于容器的高度 */
    transition: transform 0.3s;
    min-width: 5px; /* 确保条形至少有最小宽度 */
}

.bar:hover {
    transform: translateX(-5px); /* 减少位移以避免与左边界的冲突 */
}

.bar-labels {
    min-width: 100px; /* 确保标签有足够的宽度 */
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
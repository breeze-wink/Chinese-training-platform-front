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
                  <svg :width="chartWidth" :height="chartHeight">
                    <g :transform="`translate(${chartWidth / 2}, ${chartHeight / 2})`">
                      <!-- 雷达图的级别圆圈 -->
                      <circle v-for="(level, index) in levels" :key="index"
                              :r="level * radiusStep" fill="none" stroke="#e0e0e0" stroke-width="1"/>

                        <polygon :points="radarPoints()" style="fill: none; stroke: #66c2ff; stroke-width: 2; opacity: 0.7"/>

                        <!--                        <polygon :points="generateRadarPath()" style="fill: none; stroke: #66c2ff; stroke-width: 2; opacity: 0.7"/>-->

                      <!-- 数据点 -->
                      <circle v-for="(item, index) in radarDataPoints" :key="'radar-point-' + index"
                              :cx="item.x" :cy="item.y" r="5" fill="#66c2ff" stroke="#fff" stroke-width="2"
                              @mouseover="showTooltip(item, 'radar')"
                              @mouseout="hideTooltip"/>

                        <!-- 边界线 -->
                        <line
                                v-for="(label, index) in labels"
                                :key="'line-' + index"
                                :x1="0"
                                :y1="0"
                                :x2="Math.cos(index * angleStep - Math.PI / 2) * maxRadius"
                                :y2="Math.sin(index * angleStep - Math.PI / 2) * maxRadius"
                                stroke="#e0e0e0"
                                stroke-width="1"
                                @mouseover="showTooltipForLabel(index, $event)"
                                @mouseout="hideTooltip"
                        />

                        <polygon :points="radarPoints" style="fill: none; stroke: #ffff00; stroke-width: 2; opacity: 0.7"/>
                      <!-- 标签文本 -->
                      <text v-for="(label, index) in labels" :key="'text-' + index"
                            :x="Math.cos(index * angleStep - Math.PI / 2) * (maxRadius + 20)"
                            :y="Math.sin(index * angleStep - Math.PI / 2) * (maxRadius + 20)"
                            text-anchor="middle" font-size="12" fill="#444">
                        {{ label }}
                      </text>

                      <line v-for="(item, index) in radarDataPoints" :key="'line-' + index"
                            :x1="0" :y1="0"
                            :x2="Math.cos(index * angleStep - Math.PI / 2) * maxRadius"
                            :y2="Math.sin(index * angleStep - Math.PI / 2) * maxRadius"
                            stroke="#e0e0e0" stroke-width="1"/>

                        <!-- Tooltip -->
                        <g v-if="tooltip.visible">
                            <!-- 背景矩形 -->
                            <rect
                                    :x="tooltip.x - 60"
                                    :y="tooltip.y - 30"
                                    width="120"
                                    height="40"
                                    stroke="#66c2ff"
                                    stroke-width="1"
                                    fill="#333"
                                    rx="4"
                                    ry="4"
                            />
                            <!-- Tooltip 名称 -->
                            <text
                                    :x="tooltip.x"
                                    :y="tooltip.y - 10"
                                    text-anchor="middle"
                                    font-size="12"
                                    fill="#fff"
                            >
                                {{ tooltip.name }}
                            </text>
                            <!-- Tooltip 分数 -->
                            <text
                                    :x="tooltip.x"
                                    :y="tooltip.y + 10"
                                    text-anchor="middle"
                                    font-size="12"
                                    fill="#fff"
                            >
                                分数: {{ tooltip.score }}
                            </text>
                        </g>


                    </g>
                  </svg>
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
                                             width: Math.max(weakness.weaknessScore * 100) + '%',
                                             backgroundColor: colors[index % colors.length],
                                             minWidth: '5px'
                                         }"
                                         :title="`${weakness.weaknessName}: ${weakness.weaknessScore * 100}%`"
                                    ></div>
                                </div>
                                <!-- 具体参数信息 -->
                                <p style="font-size: 10px; color: red;">{{ weakness.weaknessName }} - 正确率: {{ Math.max(weakness.weaknessScore * 100) }}%</p>
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
                      <!-- 渐变定义 -->
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color: #66c2ff; stop-opacity: 1" />
                          <stop offset="100%" style="stop-color: #ff6666; stop-opacity: 1" />
                        </linearGradient>
                      </defs>

                      <!-- 折线图 -->
                      <polyline :points="linePoints" style="fill:none;stroke:url(#lineGradient);stroke-width:3"/>

                      <!-- 数据点 -->
                      <circle v-for="(point, index) in dataPoints" :key="'point-' + index"
                              :cx="point.x" :cy="point.y" r="4" fill="#ff6666" stroke="#fff" stroke-width="2"
                              @mouseover="showTooltip(point)"
                              @mouseout="hideTooltip"
                      />

                      <!-- 横轴 -->
<!--                      <line :x1="margin.left" :y1="chartHeight - margin.bottom" :x2="chartWidth - margin.right" :y2="chartHeight - margin.bottom" stroke="#ccc" stroke-width="1"/>-->

                      <g v-if="tooltip.visible">
                        <!-- 背景矩形 -->
                        <rect
                            :x="tooltip.x - 25"
                            :y="tooltip.y + 15"
                            width="150"
                            height="40"
                            stroke="#66c2ff"
                            stroke-width="1"
                            fill="#66c2ff"
                            rx="4"
                            ry="4"
                        />
                        <!-- Tooltip 文本 -->
                        <text
                            :x="tooltip.x + 50"
                        :y="tooltip.y + 30"
                        text-anchor="middle"
                        font-size="12"
                        fill="white"
                        >
                        {{ tooltip.date }}
                        </text>
                        <text
                            :x="tooltip.x + 50"
                            :y="tooltip.y + 50"
                            text-anchor="middle"
                            font-size="12"
                            fill="white"
                        >
                          分数: {{ tooltip.score }}
                        </text>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>

                <div class="chart-container">
                    <ECharts :option="option" style="width: 100%;height:400px;"></ECharts>
                </div>


            </div>
            <div class="learning-stats" v-else>
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
import * as echarts from 'echarts';
import {
    RadarChart
} from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import {computed} from "vue";


echarts.use([
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    RadarChart,
    CanvasRenderer
]);

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
            chartHeight: 600,
            maxLevels: 5,
            radiusStep: 40,
            tooltip: {
                visible: false,
                x: 0,
                y: 0,
                name: '',
                score: 0
            },
            margin: { top: 20, right: 20, bottom: 40, left: 40 }
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

        radarDataPoints: computed(() => {
            return this.scores.map((score, index) => {
                const angle = index * this.angleStep - Math.PI / 2; // 从顶部开始
                const radius = score / this.maxScore * this.maxRadius; // 根据分数比例计算半径
                return {
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                    score,
                    name: this.labels[index]
                };
            });
        }),

        dataPoints() {
        if (this.scoreFluctuations.length === 0) return [];

        const xStep = (this.chartWidth - this.margin.left - this.margin.right) / (this.scoreFluctuations.length - 1);
        const yMax = Math.max(...this.scoreFluctuations.map(item => item.score));
        const yMin = Math.min(...this.scoreFluctuations.map(item => item.score));

        let points;
        // 如果所有分数相同，避免返回空数组
        if (yMax === yMin) {
          points = this.scoreFluctuations.map((item, index) => {
            const x = this.margin.left + xStep * index;
            const y = this.margin.top + (this.chartHeight - this.margin.top - this.margin.bottom) / 2;
            return { x, y, date: item.date, score: item.score };
          });
        } else {
          points = this.scoreFluctuations.map((item, index) => {
            const x = this.margin.left + xStep * index;
            const y = this.margin.top + (1 - (item.score - yMin) / (yMax - yMin)) * (this.chartHeight - this.margin.top - this.margin.bottom);
            return { x, y, date: item.date, score: item.score };
          });
        }
        console.log('Generated dataPoints:', points);
        return points;
      },
      linePoints() {
        return this.dataPoints.map(p => `${p.x},${p.y}`).join(' ');
      },
      labels() {
            return this.multidimensionalScores.map(score => score.name);
        },
        maxRadius() {
            return this.radiusStep * this.maxLevels;
        },
        levels() {
            return Array.from({ length: this.maxLevels }, (_, i) => (i + 1));
        },
        angleStep() {
            return (Math.PI * 2) / this.labels.length;
        }
    },
    mounted() {
        this.fetchStudentData();
        this.fetchMultidimensionalScores();
        this.fetchWeaknessScores();
        this.fetchScoreFluctuations();
        // const chartDom = this.$refs.chart;
        // const myChart = echarts.init(chartDom);
        // const option = {
        //     // ...你的ECharts配置项
        // };
        // myChart.setOption(option);
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
                    const data = response.data.data;
                    console.log('Fetched data:', data);
                    this.multidimensionalScores = data.map(item => ({
                        score: Number(item.score), // 确保 score 是数字类型
                        name: item.name || ''     // 确保有 name 值
                    }));
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
        },
      // Tooltip 方法
      showTooltip(point) {
        clearTimeout(this.hideTooltipTimeout);
        // 添加偏移量，使 Tooltip 位于数据点的右上方
        const offsetX = 10; // 向右偏移10px
        const offsetY = -30; // 向上偏移30px

        this.tooltip.visible = true;
        this.tooltip.x = point.x + offsetX;
        this.tooltip.y = point.y + offsetY;
        this.tooltip.date = point.date;
        this.tooltip.score = point.score;
      },
      hideTooltip() {
        this.hideTooltipTimeout = setTimeout(() => {
          this.tooltip.visible = false;
        }, 200);
      },

        radarPoints() {
            if (!this.multidimensionalScores.length) return '';

            const points = [];
            const angleStep = (Math.PI * 2) / this.labels.length; // 每个点的角度增量
            const maxScore = 100; // 假设满分为 100

            this.multidimensionalScores.forEach((item, index) => {
                const angle = angleStep * index - Math.PI / 2; // 从顶部开始计算角度
                const radius = (item.score / maxScore) * this.maxRadius; // 归一化半径
                if (isNaN(radius)) {
                    console.error('Radius calculation failed:', item);
                }
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);
                points.push(`${x},${y}`);
            });

            // 确保路径闭合
            if (points.length > 0) {
                points.push(points[0]); // 第一个点补回到最后
            }

            return points.join(' ');
        },

        showTooltipForLabel(index, event) {
            const offsetX = 10; // 偏移量
            const offsetY = -30;

            // 找到对应的分数和名称
            const label = this.labels[index];
            const score = this.multidimensionalScores[index]?.score || 0;

            // 获取鼠标的位置
            const x = event.clientX + offsetX;
            const y = event.clientY + offsetY;

            // 更新 Tooltip 数据
            this.tooltip.visible = true;
            this.tooltip.x = x;
            this.tooltip.y = y;
            this.tooltip.name = label;
            this.tooltip.score = score;
        },
    }
};
</script>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f0f0f0; /* 背景改为浅灰色 */
}

.main-container {
    display: flex;
    flex: 1;
    background-color: #f0f0f0; /* 背景改为浅灰色 */
}

.learning-stats {
    font-family: 'Arial', sans-serif;
    text-align: left;
    flex: 2;
    margin-top: 20px;
    padding: 20px;
    background-color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 增加阴影 */
    border-radius: 15px;
    transition: transform 0.3s;
    margin-left: 300px;
}

.learning-stats:hover {
    transform: translateY(-5px); /* 鼠标悬浮时轻微上浮 */
}

.divider {
    border: 1px solid #e0e0e0;
    margin: 15px 0;
    width: 90%;
    margin-left: auto;
    margin-right: auto;
}

h2 {
    color: #444444; /* 主标题颜色 */
    font-size: 1.7rem; /* 标题更大 */
    margin-bottom: 15px;
    font-weight: bold;
}

h3 {
    color: #666666;
    font-size: 1.2rem;
    margin-bottom: 10px;
}

.stat-box {
    flex: 1;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin: 0 15px;
    text-align: center;
    transition: background-color 0.3s, transform 0.3s;
}

.stat-box:hover {
    background-color: #f0f8ff; /* 悬浮时背景变色 */
    transform: scale(1.05); /* 鼠标悬浮时轻微放大 */
}

.stat-box span {
    font-size: 1.8rem; /* 增加字体大小 */
    color: #333;
}

.stats-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}

.bar-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    padding: 10px 0;
    border-bottom: 1px solid #e0e0e0;
}

.bar-container {
    position: relative;
    flex: 1;
    height: 30px;
    border-radius: 5px;
    background-color: #f2f2f2;
}

.bar {
    height: 100%;
    border-radius: 5px;
    transition: width 0.3s ease-in-out;
}

.bar-labels {
    min-width: 120px;
    font-size: 16px;
    color: #555;
}

.line-chart svg {
    display: block;
    margin: 30px auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 15px;
    border: none;
    width: 600px;
    height: 600px;
}

.score-trend svg {
    width: 100%;
    height: 600px; /* 与 data 中的 chartHeight 一致 */
}


.score-trend {
  min-width: 400px;  /* 设置最小宽度 */
  min-height: 300px; /* 设置最小高度 */
}

.bar-item p {
    font-size: 12px;
    color: #FF6666;
}

.radar-chart svg {
    display: block;
    margin: 0 auto;
    width: 100%;
    max-width: 600px;
    max-height: 600px;
}

circle, line, text {
    transition: all 0.3s ease;
}

polygon {
    fill: rgba(102, 194, 255, 0.3);
    stroke: #66c2ff;
    stroke-width: 2px;
}

circle {
    stroke: #ccc;
    fill: none;
}

text {
    font-size: 14px;
    fill: #444;
    font-weight: bold;
}

line {
    stroke: #ccc;
    stroke-width: 1;
}

.bar {
    height: 100%;
    border-radius: 5px;
    background: linear-gradient(to right, #66c2ff, #ffcc66);
}

.bar:hover {
    transform: scale(1.05);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.line-chart path {
    fill: none;
    stroke: #66c2ff;
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
    transition: stroke 0.3s ease;
}

.line-chart path:hover {
    stroke: #ff6666;
}

.line-chart circle {
    fill: #ff6666;
    stroke: #fff;
    stroke-width: 2;
    transition: transform 0.3s ease;
}

.line-chart circle:hover {
    transform: scale(1.5);
    fill: #ffcc66;
}

@media (max-width: 768px) {
    .main-container {
        flex-direction: column;
    }

    .learning-stats {
        margin-left: 0;
        margin-top: 15px;
    }

    .stat-box {
        padding: 15px;
    }

    .bar-container {
        width: 100%;
    }

  .line-chart svg,
  .score-trend svg {
    width: 100%;
    height: auto;
  }
}

/* 强调平均分和排名 */

.stat-box .score {
    font-weight: bold;
    font-size: 2rem;
    color: #66c2ff; /* 用更亮的颜色突出显示分数 */
}

.stat-box .ranking {
    font-weight: bold;
    font-size: 2rem;
    color: #ff6666; /* 用红色突出显示排名 */
}

/* 在 <g> 组中添加过渡效果 */
g {
  transition: opacity 0.3s ease;
}


/* 改进文本样式 */
text {
  font-size: 14px;
  fill: #444;
  font-weight: bold;
  transition: fill 0.3s ease;
}

circle {
  stroke: #ccc;
  fill: none;
  transition: stroke 0.3s ease; /* 加入过渡效果 */
}

/* 鼠标悬浮时改变颜色 */
circle:hover {
  stroke: #66c2ff;
}

line {
  stroke: #ccc;
  stroke-width: 1;
  transition: stroke 0.3s ease;
}

line:hover {
  stroke: #66c2ff; /* 在鼠标悬浮时高亮显示 */
}

/* 优化折线图的路径 */
.line-chart path {
  fill: none;
  stroke: #66c2ff;
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
  transition: stroke 0.3s ease;
}

/* 鼠标悬浮时改变颜色 */
.line-chart path:hover {
  stroke: #ff6666; /* 鼠标悬浮时使用更醒目的红色 */
}

.line-chart circle {
  fill: #ff6666;
  stroke: #fff;
  stroke-width: 2;
  transition: transform 0.3s ease, fill 0.3s ease;
}

/* 鼠标悬浮时放大 */
.line-chart circle:hover {
  transform: scale(1.5);
  fill: #ffcc66; /* 鼠标悬浮时改变颜色为黄色 */
}

</style>




<template>
    <div class="page-container">
        <Header />

        <div class="main-container">
            <Sidebar />

            <main class="content">
                <section class="poetry-list">
                    <div class="poetry-section">
                        <h1>必背古诗词</h1>
                        <h2>七年级上册</h2>
                        <div class="poem-grid">
                            <div v-for="poem in poems_seven_upper" :key="poem.title" class="poem-item">
                                <router-link :to="{ name: 'PoemDetail', params: { id: poem.title } }">
                                    <h3>{{ poem.title }}</h3>
                                </router-link>
                                <p>{{ poem.author }} | {{ poem.dynasty }}</p>
                                <p>{{ poem.annotation }}</p>
                            </div>
                        </div>
                        <h2>七年级下册</h2>
                        <div class="poem-grid">
                            <div v-for="poem in poems_seven_lower" :key="poem.title" class="poem-item">
                                <router-link :to="{ name: 'PoemDetail', params: { id: poem.title } }">
                                    <h3>{{ poem.title }}</h3>
                                </router-link>
                                <p>{{ poem.author }} | {{ poem.dynasty }}</p>
                                <p>{{ poem.annotation }}</p>
                            </div>
                        </div>
                        <h2>八年级上册</h2>
                        <div class="poem-grid">
                            <div v-for="poem in poems_eight_upper" :key="poem.title" class="poem-item">
                                <router-link :to="{ name: 'PoemDetail', params: { id: poem.title } }">
                                    <h3>{{ poem.title }}</h3>
                                </router-link>
                                <p>{{ poem.author }} | {{ poem.dynasty }}</p>
                                <p>{{ poem.annotation }}</p>
                            </div>
                        </div>
                        <h2>八年级下册</h2>
                        <div class="poem-grid">
                            <div v-for="poem in poems_eight_lower" :key="poem.title" class="poem-item">
                                <router-link :to="{ name: 'PoemDetail', params: { id: poem.title } }">
                                    <h3>{{ poem.title }}</h3>
                                </router-link>
                                <p>{{ poem.author }} | {{ poem.dynasty }}</p>
                                <p>{{ poem.annotation }}</p>
                            </div>
                        </div>
                        <h2>九年级上册</h2>
                        <div class="poem-grid">
                            <div v-for="poem in poems_nine_upper" :key="poem.title" class="poem-item">
                                <router-link :to="{ name: 'PoemDetail', params: { id: poem.title } }">
                                    <h3>{{ poem.title }}</h3>
                                </router-link>
                                <p>{{ poem.author }} | {{ poem.dynasty }}</p>
                                <p>{{ poem.annotation }}</p>
                            </div>
                        </div>
                        <h2>九年级下册</h2>
                        <div class="poem-grid">
                            <div v-for="poem in poems_nine_lower" :key="poem.title" class="poem-item">
                                <router-link :to="{ name: 'PoemDetail', params: { id: poem.title } }">
                                    <h3>{{ poem.title }}</h3>
                                </router-link>
                                <p>{{ poem.author }} | {{ poem.dynasty }}</p>
                                <p>{{ poem.annotation }}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="poetry-list">
                    <div class="poetry-section">
                        <h1>优秀范文</h1>
                        <div class="essay-container">
                            <div v-for="essay in essays" :key="essay.id" class="essay-item">
                                <!-- 每个范文前加点符号 -->
                                <span class="dot">•</span>
                                <!-- 如果 pdfUrl 不存在，则显示 essay.title -->
                                <a href="#" @click.prevent="fetchEssayPdf(essay.id)" v-if="!pdfUrl[essay.id]" class="essay-title">
                                    {{ essay.title }}
                                </a>

                                <!-- 如果 pdfUrl 存在，则显示 PDF 链接 -->
                                <a v-if="pdfUrl[essay.id]" :href="pdfUrl[essay.id]" target="_blank" class="essay-title">
                                    {{ essay.title }}
                                </a>

                                <p class="essay-annotation">{{ essay.annotation }}</p>
                            </div>
                        </div>
                        <div v-if="error" class="error">{{ error }}</div>
                    </div>
                </section>
            </main>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { reactive } from 'vue';  // 确保导入 reactive
import axios from 'axios';
import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";
import {
    poems_seven_upper,
    poems_seven_lower,
    poems_eight_upper,
    poems_eight_lower,
    poems_nine_upper,
    poems_nine_lower,
} from '@/store/poems';

export default {
    components: {
        Sidebar,
        Header
    },
    data() {
        return {
            poems_seven_upper: poems_seven_upper,
            poems_seven_lower: poems_seven_lower,
            poems_eight_upper: poems_eight_upper,
            poems_eight_lower: poems_eight_lower,
            poems_nine_upper: poems_nine_upper,
            poems_nine_lower: poems_nine_lower,
            essays: [], // 初始化为空数组
            loading: true,
            error: null,
            pdfUrl: reactive({}),  // 使用 reactive 创建响应式对象
        };
    },
    computed: {
        ...mapGetters(['getUserId'])
    },
    created() {
        this.fetchEssays();
    },
    methods: {
        async fetchEssays() {
            const studentId = this.getUserId; // 从 Vuex store 获取学生 ID
            if (!studentId) {
                this.error = '缺少学生 ID';
                this.loading = false;
                return;
            }

            try {
                const response = await axios.get(`/api/student/${studentId}/view-essays`);
                if (response.status === 200) {
                    this.essays = response.data.infoData; // 将 infoData 赋值给 essays
                    this.loading = false;
                } else {
                    throw new Error('作文列表获取失败');
                }
            } catch (error) {
                console.error('请求失败:', error.response ? error.response.data : error.message);
                this.error = error.response ? error.response.data.message : '请求失败';
                this.loading = false;
            }
        },
        async fetchEssayPdf(essayId) {
            const studentId = this.getUserId; // 从 Vuex store 获取学生 ID
            try {
                // 获取作文的 PDF 内容
                const response = await axios.get(`/api/student/${studentId}/essay/get-info/${essayId}`, {
                    responseType: 'blob'  // 设置响应类型为 blob
                });

                // 创建一个 URL 对象
                const url = window.URL.createObjectURL(response.data);
                // 直接更新 pdfUrl 的属性
                this.pdfUrl[essayId] = url;  // 在响应式对象上直接赋值

                this.loading = false;
            } catch (err) {
                this.error = err;
                this.loading = false;
            }
        }
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
    background-color: #f0f0f0; /* 背景改为浅灰色 */
    flex: 1;
}

/* 主要内容区域 */
.content {
    background-color: #f4f4f9;
    border-radius: 5px;
    flex: 1;
    padding: 20px;
    margin-left: 300px;
}

/* 古诗词网格布局 */
.poem-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 调整列数以适应诗歌数量 */
    gap: 1rem;
}

/* 单个诗歌项 */
.poem-item {
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 1rem;
}

/* 作文列表布局 */
.essay-container {
    display: flex;
    flex-wrap: wrap;
    margin-top: 20px;
}

.essay-item {
    display: flex;
    align-items: center;
    font-size: 16px;
    width: 45%; /* 每行显示两列 */
    margin-bottom: 10px;
}

.dot {
    font-size: 24px;
    margin-right: 10px;
    color: #333;
}

.essay-title {
    height: 34px;
    line-height: 34px;
    font-family: "kaiti", serif; /* 使用更美观的字体 */
    font-size: 18px; /* 增大字体 */
    font-weight: bold; /* 加粗字体 */
    color: #0066cc; /* 设置字体颜色 */
    text-decoration: none; /* 去掉下划线 */
    transition: color 0.3s; /* 添加平滑过渡效果 */
}

/* 鼠标悬停时改变颜色 */
.essay-title:hover {
    color: #66b1ff; /* 设置悬停时的颜色 */
}

/* 对象的PDF链接样式 */
.essay-title a {
    text-decoration: none; /* 去掉下划线 */
}

/* 用于未加载PDF时显示的链接 */
.essay-title a:hover {
    color: #0066cc; /* 设置悬停时的颜色 */
}

.essay-title span {
    font-size: 16px; /* 设置字号 */
    font-weight: 600; /* 设置字体粗细 */
    color: #555; /* 设置默认颜色 */
}

.essay-annotation {
    font-size: 14px;
    color: #666;
}

.essay-table th,
.essay-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.essay-table tr:nth-child(even) {
    background-color: #f2f2f2;
}

.essay-table thead {
    background-color: #f2f2f2;
    font-weight: bold;
}

.essay-table tbody {
    font-size: 0.9rem;
}

/* 标题样式 */
h1,
h2,
h3 {
    font-family: "Roboto Slab", serif; /* 使用更美观的字体 */
    margin-bottom: 0.5rem;
}

h1 {
    color: #333;
    font-size: 2rem;
}

h2 {
    color: #666;
    font-size: 1.5rem;
}

h3 {
    color: #777;
    font-size: 1.2rem;
}

/* 段落文本样式 */
p {
    font-family: kaiti, sans-serif;
    line-height: 1.6;
    color: #444;
}

/* 错误提示样式 */
.error {
    color: red;
    margin-top: 1rem;
}

</style>
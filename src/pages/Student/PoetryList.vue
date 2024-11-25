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
                        <table class="essay-table">
                            <thead>
                            <tr>
                                <th>标题</th>
                                <th>点评</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="essay in essays" :key="essay.id">
                                <td>
                                    <router-link :to="{ name: 'EssayDetail', params: { id: essay.id } }">
                                        {{ essay.title }}
                                    </router-link>
                                </td>
                                <td>{{ essay.annotation }}</td>
                            </tr>
                            </tbody>
                        </table>
                        <div v-if="error" class="error">{{ error }}</div>
                    </div>
                </section>
            </main>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
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
            error: null
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
                console.log('API Response:', response.data); // 打印 API 返回的数据
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
        }
    }
};
</script>

<style scoped>
.page-container {
    display: flex;
    flex-wrap: wrap;
    grid-template-columns: auto minmax(auto, 800px);
    gap: 2rem;
}

.main-container {
    display: flex;
    flex-grow: 1;
    flex-basis: calc(100% - 200px); /* 减去 sidebar 宽度 */
}

/* 主要内容区域 */
.content {
    background-color: #f4f4f9;
    border-radius: 5px;
    padding: 2rem;
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

/* 表格样式 */
.essay-table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'kaiti', sans-serif;
    font-size: 16px;
    color: #333;
    line-height: 1.5;
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
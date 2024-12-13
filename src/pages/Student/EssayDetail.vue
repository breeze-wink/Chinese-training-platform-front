<template>
    <div class="page-container">
        <Header />

        <div class="main-container">
            <Sidebar />

            <div class="essay-detail">
                <div v-if="loading" class="loading">
                    <p>Loading...</p>
                </div>
                <div v-else-if="error" class="error">
                    <p>Error: {{ error.message }}</p>
                </div>
                <div v-else-if="pdfUrl" class="essay-content">
                    <h1 class="essay-title">作文详情</h1>
                    <p class="essay-annotation">点击下方链接查看作文内容 (PDF)</p>
                    <div class="essay-text-container">
                        <a :href="pdfUrl" target="_blank">查看作文内容 (PDF)</a>
                    </div>
                    <!-- 或者使用嵌入的 PDF 查看器 -->
                    <embed :src="pdfUrl" type="application/pdf" width="100%" height="600px" />
                </div>
                <div v-else class="not-found">
                    <p>Essay not found.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";
import axios from 'axios';  // 引入 axios
import { mapGetters } from 'vuex';

export default {
    name: 'EssayDetail',
    components: { Sidebar, Header },
    data() {
        return {
            loading: true,
            error: null,
            pdfUrl: null
        };
    },
    computed: {
        ...mapGetters(['getUserId'])  // 从 Vuex store 获取学生 ID
    },
    created() {
        this.fetchEssayPdf();
    },
    methods: {
        async fetchEssayPdf() {
            const studentId = this.getUserId; // 从 Vuex store 获取学生 ID
            const essayId = this.$route.params.id; // 从路由参数获取作文 ID
            try {
                // 获取作文的 PDF 内容
                const response = await axios.get(`/api/student/${studentId}/essay/get-info/${essayId}`, {
                    responseType: 'blob'  // 设置响应类型为 blob
                });

                // 创建一个 URL 对象
                const url = window.URL.createObjectURL(response.data);
                this.pdfUrl = url;

                this.loading = false;
            } catch (error) {
                this.error = error;
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
    flex: 1;
}

.essay-detail {
    flex: 1;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 2rem;
    margin-left: 2rem;
}

.essay-title {
    font-size: 1.5rem; /* 标题字体大小 */
    margin-bottom: 0.5rem; /* 标题底部外边距 */
}

.essay-annotation {
    font-size: 0.9rem; /* 注解字体大小 */
    color: #666; /* 注解字体颜色 */
    margin-bottom: 1rem; /* 注解底部外边距 */
}

.essay-text-container {
    padding: 1rem; /* 内容容器内边距 */
    border: 1px solid #ddd; /* 边框 */
    border-radius: 0.25rem; /* 圆角 */
    background-color: #f9f9f9; /* 背景颜色 */
}

.loading {
    font-size: 1.5rem; /* 加载提示字体大小 */
    color: #aaa; /* 加载提示字体颜色 */
    text-align: center; /* 文本居中 */
    padding-top: 1rem; /* 顶部内边距 */
}
</style>
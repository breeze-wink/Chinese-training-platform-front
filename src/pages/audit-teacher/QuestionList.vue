<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header/>
        <div class="main-container">
            <!-- 引入侧边栏通用组件 -->
            <Sidebar/>
            <!-- 主要内容区域 -->
            <div class="content">
                <div class="question-list">
                    <h2>题目审核列表</h2>
                    <el-table :data="questions" style="width: 100%">
                        <el-table-column prop="id" label="ID" width="180"></el-table-column>
                        <el-table-column prop="type" label="类型" width="180">
                            <template #default="scope">
                                <span>{{ scope.row.type === 'small' ? '单选题' : '组合题' }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="uploadTime" label="上传时间"></el-table-column>
                        <el-table-column prop="uploadTeacher" label="上传教师"></el-table-column>
                        <el-table-column label="操作" width="200">
                            <template #default="scope">
                                <el-button size="mini" type="primary" @click="handleAudit(scope.row)">审核</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div v-if="loading" class="loading">加载中...</div>
                    <div v-if="error" class="error">{{ error }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";

export default {
    components: {Header, Sidebar},
    data() {
        return {
            questions: [],
            loading: false,
            error: null,
        };
    },
    setup() {
        const router = useRouter();
        return {
            router
        };
    },
    methods: {
        async fetchQuestions() {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get('/api/teacher/get-all-questions');
                if (response.status === 200) {
                    this.questions = response.data.questions;
                    console.log('获取题目成功:', this.questions);
                } else {
                    throw new Error('获取题目失败');
                }
            } catch (err) {
                this.error = err.message || '无法连接到服务器，请稍后再试';
                ElMessage.error(this.error);
            } finally {
                this.loading = false;
            }
        },
        handleAudit(row) {
            // 使用编程式导航跳转至审核页面，并携带参数
            this.router.push({
                name: 'AuditStrategy',
                query: {
                    questionId: row.id,
                    type: row.type
                }
            });
        }
    },
    created() {
        this.fetchQuestions();
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

.content {
    max-width: 1000px; /* 最大宽度为 1000px */
    width: 100%; /* 宽度在正常情况下可以随着窗口大小缩放 */
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin-right: 50px; /* 如果需要右侧留空隙，可以保留这行，或者可以根据实际情况调整 */
}

.question-list {
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.loading {
    font-size: 16px;
    color: #aaa;
    text-align: center;
    margin-top: 50px;
}

.error {
    font-size: 16px;
    color: red;
    text-align: center;
    margin-top: 50px;
}
</style>
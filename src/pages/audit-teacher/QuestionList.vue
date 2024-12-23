<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header />
        <div class="main-container">
            <!-- 引入侧边栏通用组件 -->
            <Sidebar />
            <!-- 主要内容区域 -->
            <div class="content">
                <div class="question-list">
                    <h2>题目审核列表</h2>
                    <!-- 选择框，切换已审核和未审核题目 -->
                    <el-radio-group v-model="questionType" @change="handleTypeChange">
                        <el-radio label="access">已审核</el-radio>
                        <el-radio label="waiting">未审核</el-radio>
                    </el-radio-group>

                    <!-- 表格 -->
                    <el-table :data="paginatedQuestions" style="width: 100%; max-width: 1050px; margin: 0 auto;">
                        <!-- 设置每一列的最小宽度和内边距来增大横向间距 -->
                        <el-table-column prop="questionId" label="ID" min-width="200" :show-overflow-tooltip="true">
                            <template #default="scope">
                                <div style="padding: 12px;">{{ scope.row.questionId }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="type" label="类型" min-width="200" :show-overflow-tooltip="true">
                            <template #default="scope">
                                <div style="padding: 12px;">
                                    <span>{{ scope.row.type === 'small' ? '单题' : '组合题' }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="uploadTime" label="上传时间" min-width="200" :show-overflow-tooltip="true">
                            <template #default="scope">
                                <div style="padding: 12px;">{{ scope.row.uploadTime }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="uploadTeacher" label="上传教师" min-width="200" :show-overflow-tooltip="true">
                            <template #default="scope">
                                <div style="padding: 12px;">{{ scope.row.uploadTeacher }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" min-width="250">
                            <template #default="scope">
                                <!-- 对于未审核题目，显示审核按钮 -->
                                <el-button
                                    v-if="questionType === 'waiting'"
                                    size="mini"
                                    type="primary"
                                    @click="handleAudit(scope.row)"
                                    style="margin-right: 8px;">
                                    审核
                                </el-button>

                                <!-- 对于已审核题目，显示查看、删除和修改按钮 -->
                                <el-button
                                    v-if="questionType === 'access'"
                                    size="mini"
                                    type="primary"
                                    @click="viewQuestionDetail(scope.row.questionId, scope.row.type)"
                                    style="margin-right: 8px;">
                                    查看
                                </el-button>
                                <el-button
                                    v-if="questionType === 'access'"
                                    size="mini"
                                    type="danger"
                                    @click="handleDelete(scope.row)"
                                    style="margin-right: 8px;">
                                    删除
                                </el-button>
                                <el-button
                                    v-if="questionType === 'access'"
                                    size="mini"
                                    type="primary"
                                    @click="handleEdit(scope.row)">
                                    修改
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <!-- 分页组件 -->
                    <el-pagination
                        :current-page="currentPage"
                        :page-size="pageSize"
                        :total="totalQuestions"
                        @current-change="handlePageChange"
                        layout="prev, pager, next, jumper">
                    </el-pagination>

                    <div v-if="isAccess || isWait" class="loading-modal">
                        <div class="modal-content">
                            <p v-if="isAccess">正在加载已审核题目，请稍候...</p>
                            <p v-if="isWait">正在加载未审核题目，请稍候...</p>
                            <div class="spinner"></div>
                        </div>
                    </div>

                    <!-- 遮罩层 -->
                    <div v-if="isProcessing" class="overlay"></div>
                </div>
            </div>
        </div>
        <!-- 加载提示 -->

    </div>
</template>

<script>
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';  // 导入 ElMessageBox
import { useRouter } from 'vue-router';
import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";

export default {
    components: { Header, Sidebar },
    data() {
        return {
            questions: [],
            paginatedQuestions: [],
            questionType: 'waiting', // 'waiting' 或 'access'
            currentPage: 1,
            pageSize: 10,
            totalQuestions: 0,
            isAccess: false,
            isWait: false,
            isProcessing: false
        };
    },
    setup() {
        const router = useRouter();
        return {
            router
        };
    },
    methods: {
        // 获取题目列表
        async fetchQuestions() {

            if (this.questionType === 'access') {
                this.isAccess = true;
                this.isProcessing = true;
            } else if (this.questionType === 'waiting') {
                this.isWait = true;
                this.isProcessing = true;
            }
            try {
                const token = this.$store.getters.getToken;
                if (!token) {
                    throw new Error('用户未登录或 Token 不存在');
                }

                const apiPath =
                    this.questionType === 'access'
                        ? '/api/teacher/get-all-access-questions'
                        : '/api/teacher/get-all-waiting-questions';

                // 发送请求获取题目
                const response = await axios.get(apiPath, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    this.questions = response.data.questions;
                    this.totalQuestions = this.questions.length;
                    this.updatePaginatedQuestions(); // 更新分页数据
                } else {
                    throw new Error('获取题目失败');
                }
            } catch (err) {
                this.error =
                    err.response?.data?.message || err.message || '无法连接到服务器，请稍后再试';
                ElMessage.error(this.error);
            } finally {
                if (this.questionType === 'access') {
                    this.isAccess = false;
                    this.isProcessing = false;
                } else if (this.questionType === 'waiting') {
                    this.isWait = false;
                    this.isProcessing = false;
                }
            }
        },

        // 更新分页数据
        updatePaginatedQuestions() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            this.paginatedQuestions = this.questions.slice(start, end);
        },

        // 选择题目类型时切换
        handleTypeChange() {
            // 清空当前列表
            this.questions = [];
            this.paginatedQuestions = [];
            this.currentPage = 1;

            // 重新获取数据
            this.fetchQuestions();
        },

        // 分页切换
        handlePageChange(page) {
            this.currentPage = page;
            this.updatePaginatedQuestions();
        },

        async handleDelete(row) {
            const token = this.$store.getters.getToken;
            if (!token) {
                ElMessage.error('Token 不存在，请登录');
                return;
            }

            // 提示用户是否确认删除
            ElMessageBox.confirm('确定要删除这道题目吗?', '删除题目', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    // 发送 DELETE 请求，传递查询参数
                    const response = await axios.delete(`/api/teacher/delete-question`, {
                        params: {
                            questionId: row.questionId,  // Question ID
                            type: row.type // Question type
                        },
                        headers: {
                            Authorization: `Bearer ${token}` // 传递 Authorization header
                        }
                    });

                    if (response.status === 200) {
                        ElMessage.success('题目已删除');
                        this.questions = []; // 清空当前的题目列表
                        this.paginatedQuestions = []; // 清空当前的分页列表
                        this.fetchQuestions(); // 重新加载题目列表
                    } else {
                        throw new Error('删除失败');
                    }
                } catch (err) {
                    // 打印错误的详细信息，查看返回的具体错误信息
                    console.error('Request error:', err.response ? err.response.data : err.message);
                    const errorMessage = err.response?.data?.message || err.message || '未知错误';
                    if (err.response && err.response.status === 403) {
                        ElMessage.error('您没有权限删除');
                    } else if (err.response && err.response.data.message === '该题目没有使用记录，无法删除') {
                        ElMessage.error('该题目没有使用记录，无法删除');
                    } else {
                        ElMessage.error('删除失败: ' + errorMessage);
                    }
                }
            }).catch(() => {
                // 用户点击取消时不做任何事
                console.log("User canceled the deletion");
            });
        },

        viewQuestionDetail(questionId, type) {
            this.$router.push({
                name: 'SeeQuestion',
                query: {
                    questionId: questionId,
                    type: type
                }
            });
        },

        // 审核操作
        handleAudit(row) {

            this.router.push({
                name: 'AuditStrategy',
                query: {
                    id: row.id,
                    questionId: row.questionId,
                    type: row.type,
                    source: 'audit',
                }
            });
        },

        // 编辑操作
        handleEdit(row) {
            this.router.push({
                name: 'AuditStrategy',
                query: {
                    id: row.id,
                    questionId: row.questionId,
                    type: row.type,
                    source: 'edit'
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
    background-color: #f0f0f0; /* 背景改为浅灰色 */
    margin-bottom: 30px;
}

.content {
    max-width: 1200px; /* 最大宽度为 1000px */
    width: 100%; /* 宽度在正常情况下可以随着窗口大小缩放 */
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin-right: 50px; /* 如果需要右侧留空隙，可以保留这行，或者可以根据实际情况调整 */
    margin-left: 300px;
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

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
    z-index: 999; /* 确保遮罩层在最上层 */
    display: flex;
    justify-content: center;
    align-items: center;
}

.loading-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; /* 确保模态窗在遮罩层之上 */
}

.modal-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    text-align: center;
    max-width: 300px;
    width: 100%;
}

.modal-content p {
    margin: 0 0 10px;
    font-size: 16px;
    color: #333;
}

.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 20px auto;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>

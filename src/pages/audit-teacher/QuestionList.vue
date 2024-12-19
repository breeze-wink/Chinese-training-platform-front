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

                    <el-table :data="paginatedQuestions" style="width: 100%">
                        <el-table-column prop="id" label="ID" width="180"></el-table-column>
                        <el-table-column prop="type" label="类型" width="180">
                            <template #default="scope">
                                <span>{{ scope.row.type === 'small' ? '单题' : '组合题' }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="uploadTime" label="上传时间"></el-table-column>
                        <el-table-column prop="uploadTeacher" label="上传教师"></el-table-column>
                        <el-table-column label="操作" width="300">
                            <template #default="scope">
                                <!-- 对于未审核题目，显示审核按钮 -->
                                <el-button
                                    v-if="questionType === 'waiting'"
                                    size="mini"
                                    type="primary"
                                    @click="handleAudit(scope.row)">
                                    审核
                                </el-button>

                                <!-- 对于已审核题目，显示拒绝上传按钮 -->
                                <el-button
                                    v-if="questionType === 'access'"
                                    size="mini"
                                    type="primary"
                                    @click="viewQuestionDetail(scope.row.questionId, scope.row.type)">
                                    查看
                                </el-button>
                                <el-button
                                    v-if="questionType === 'access'"
                                    size="mini"
                                    type="danger"
                                    @click="handleDelete(scope.row)">
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

                    <div v-if="loading" class="loading">加载中...</div>
                    <div v-if="error" class="error">{{ error }}</div>
                </div>
            </div>
        </div>
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
            loading: false,
            error: null,
            questionType: 'waiting', // 'waiting' 或 'access'
            currentPage: 1,
            pageSize: 10,
            totalQuestions: 0
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
            this.loading = true;
            this.error = null;

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
                    console.log('获取题目成功:', this.questions);
                } else {
                    throw new Error('获取题目失败');
                }
            } catch (err) {
                this.error =
                    err.response?.data?.message || err.message || '无法连接到服务器，请稍后再试';
                ElMessage.error(this.error);
            } finally {
                this.loading = false;
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

        // 拒绝上传
        async handleDelete(row) {
            const token = this.$store.getters.getToken;
            console.log("Current token:", token); // 打印 token
            if (!token) {
                ElMessage.error('Token 不存在，请登录');
                return;
            }

            ElMessageBox.prompt('请输入拒绝上传的备注', '拒绝上传', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern: /.*/,
                inputErrorMessage: '备注不能为空'
            }).then(async ({ value }) => {
                try {
                    const response = await axios.put(`/api/teacher/deny-upload-question`,{
                            id: row.id,
                            comment: value || '上传被拒绝'
                    },{
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if (response.status === 200) {
                        ElMessage.success('题目上传已被拒绝');
                        this.questions = []; // 清空当前的题目列表
                        this.paginatedQuestions = []; // 清空当前的分页列表
                        this.fetchQuestions(); // 重新加载题目列表
                    } else {
                        throw new Error('拒绝上传失败');
                    }
                } catch (err) {
                    // 打印错误的详细信息，查看返回的具体错误信息
                    console.error('Request error:', err.response ? err.response.data : err.message);
                    const errorMessage = err.response?.data?.message || err.message || '未知错误';
                    if (err.response && err.response.status === 403) {
                        ElMessage.error('您没有权限拒绝该上传');
                    } else {
                        ElMessage.error('拒绝上传失败: ' + errorMessage);
                    }
                }
            }).catch(() => {});  // 用户点击取消时不做任何事
        },

        viewQuestionDetail(questionId, type) {
            const formattedType = type === '单题' ? 'small' : 'big';
            console.log(questionId, formattedType); // 验证转换是否正确
            this.$router.push({
                name: 'SeeQuestion',
                query: {
                    questionId: questionId,
                    type: formattedType
                }
            });
        },

        // 审核操作
        handleAudit(row) {
            console.log(row.questions);
            this.router.push({
                name: 'AuditStrategy',
                query: {
                    id: row.id,
                    questionId: row.questionId,
                    type: row.type,
                    source: 'audit'
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
}

.content {
    max-width: 1000px; /* 最大宽度为 1000px */
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
</style>

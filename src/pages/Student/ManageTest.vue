<template>
    <div class="page-container">
        <Header />
        <div class="main-container">
            <Sidebar />
            <div class="content">
                <el-card class="info-card">
                <section>
                    <h2>{{ headerText }}</h2>
                    <div>
                        <label>
                            <input type="radio" name="status" value="作业" v-model="selectedStatus">
                            作业
                        </label>
                        <label>
                            <input type="radio" name="status" value="练习" v-model="selectedStatus">
                            练习
                        </label>
                    </div>

                    <table v-if="pendingItems[selectedStatus]?.length > 0">
                        <thead>
                        <tr>
                            <th>序号</th>
                            <th>试卷名称</th>
                            <th v-if="selectedStatus === '作业'">试卷分数</th>
                            <th v-if="selectedStatus === '作业'">开始时间</th>
                            <th v-if="selectedStatus === '作业'">截止时间</th>
                            <th>操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(item, index) in pendingItems[selectedStatus]" :key="index">
                            <td>{{ index + 1 }}</td>
                            <td>{{ item.title || item.practiceName }}</td>
                            <td v-if="selectedStatus === '作业'">{{ item.score }}</td>
                            <td v-if="selectedStatus === '作业'">{{ item.startTime || item.dueTime }}</td>
                            <td v-if="selectedStatus === '作业'">{{ item.endTime || item.dueTime }}</td>

                            <td>
                                <button :disabled="isDeleting || isProcessing" @click="selectedStatus === '作业' ? continueHomework(item) : performContinueTraining(item)">
                                    {{ selectedStatus === '作业' ? '继续作业' : '继续练习' }}
                                </button>
                                <button v-if="selectedStatus === '练习'" :disabled="isDeleting || isProcessing" @click= "showSystemConfirmDelete(item)">删除练习</button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <p v-else>暂无数据</p>
                </section>



                <section>
                    <h2>{{ headerTextFor }}</h2>
                    <div>
                        <label>
                            <input type="radio" name="completedStatus" value="作业" v-model="selectedCompletedStatus">
                            作业
                        </label>
                        <label>
                            <input type="radio" name="completedStatus" value="练习" v-model="selectedCompletedStatus">
                            练习
                        </label>
                    </div>
                    <table v-if="completedItems[selectedCompletedStatus]?.length > 0">
                        <thead>
                        <tr>
                            <th>序号</th>
                            <th>试卷名称</th>
                            <th>提交时间</th>
                            <th v-if="selectedCompletedStatus === '作业'">试卷分数</th>
                            <th>得分</th>
                            <th>操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(item, index) in completedItems[selectedCompletedStatus]" :key="index">
                            <td>{{ index + 1 }}</td>
                            <td>{{ item.title || item.practiceName }}</td>
                            <td>{{ item.endTime || item.practiceTime }}</td>
                            <td v-if="selectedCompletedStatus === '作业'">{{ item.score }}</td>
                            <td>{{ item.totalScore }}</td>
                            <td>
                                <button @click="selectedCompletedStatus === '作业' ? showSystemConfirmViewHomeworkAnswers(item) : showSystemConfirmViewAnswers(item)" :disabled="isProcessing">
                                    {{ selectedCompletedStatus === '作业' ? '答案查询' : '答案查询' }}
                                </button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <p v-else>暂无数据</p>
                </section>
                </el-card>
            </div>
        </div>

        <!-- 加载提示 -->
        <div v-if="isDeleting || isContinuing || isViewingAnswers" class="loading-modal">
            <div class="modal-content">
                <p v-if="isDeleting">正在删除，请稍候...</p>
                <p v-if="isContinuing">正在加载题目，请稍候...</p>
                <p v-if="isViewingAnswers">正在加载答案，请稍候...</p>
                <div class="spinner"></div>
            </div>
        </div>

        <!-- 遮罩层 -->
        <div v-if="isProcessing" class="overlay"></div>
    </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";
import axios from 'axios';
import router from '@/router'; // 引入路由模块
import { mapGetters } from 'vuex';
import {useRouter} from "vue-router";
import {ElMessageBox, ElNotification} from "element-plus";

export default {
    components: { Header, Sidebar },
    data() {
        return {
            selectedStatus: '作业',
            headerText: '未截止',
            headerTextFor: '已截止',
            selectedCompletedStatus: '作业',
            pendingItems: {
                作业: [],
                练习: []
            },
            completedItems: {
                作业: [],
                练习: []
            },
            isDeleting: false,
            isContinuing: false,
            isViewingAnswers: false,
            isProcessing: false, // 新增：用于跟踪是否正在处理请求
            practiceToDelete: null,
            practiceToContinue: null,
            answersToView: null,
            teacherComments: null, // 存储老师评语
            assignmentToContinue: null
        };
    },
    computed: {
        ...mapGetters(['getUserId']),
        headerText() {
            return this.selectedStatus === '作业' ? '未截止' : '待完成';
        },
        headerTextFor() {
            return this.selectedCompletedStatus === '作业' ? '已截止' : '已完成';
        }
    },
    methods: {
        async fetchPendingPractices() {
            try {
                const response = await axios.get(`/api/student/${this.getUserId}/get-unfinished-practice-list`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    this.pendingItems.练习 = response.data.data.map(item => ({
                        practiceId: item.practiceId,
                        practiceName: item.practiceName,
                        dueTime: item.dueTime
                    }));
                } else {
                    console.error('获取未完成练习列表失败', response.data.message);
                }
            } catch (error) {
                console.error('获取未完成练习列表失败', error);
            }
        },
        async fetchPendingAssignments() {
            try {
                const response = await axios.get(`/api/student/${this.getUserId}/get-unfinished-assignment-list`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    this.pendingItems.作业 = response.data.data.map(item => ({
                        assignmentId: item.assignmentId,
                        title: item.title,
                        description: item.description,
                        startTime: item.startTime,
                        endTime: item.endTime,
                        score: item.score
                    }));
                } else {
                    console.error('获取未完成作业列表失败', response.data.message);
                }
            } catch (error) {
                console.error('获取未完成作业列表失败', error);
            }
        },
        async fetchCompletedPractices() {
            try {
                const response = await axios.get(`/api/student/${this.getUserId}/get-finished-practice-list`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    this.completedItems.练习 = response.data.data.map(item => ({
                        practiceId: item.practiceId,
                        practiceName: item.practiceName,
                        practiceTime: item.practiceTime,
                        totalScore: item.totalScore
                    }));
                } else {
                    console.error('获取已完成练习列表失败', response.data.message);
                }
            } catch (error) {
                console.error('获取已完成练习列表失败', error);
            }
        },
        async fetchCompletedAssignments() {
            try {
                const response = await axios.get(`/api/student/${this.getUserId}/get-finished-assignment-list`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    this.completedItems.作业 = response.data.data.map(item => ({
                        assignmentId: item.assignmentId,
                        title: item.title,
                        description: item.description,
                        startTime: item.startTime,
                        endTime: item.endTime,
                        score: item.score,
                        totalScore: item.totalScore
                    }));
                } else {
                    console.error('获取已完成作业列表失败', response.data.message);
                }
            } catch (error) {
                console.error('获取已完成作业列表失败', error);
            }
        },
        async continueHomework(item) {
            const router = useRouter();
            try {
                this.isContinuing = true;
                this.isProcessing = true;
                const endpoint = `/api/student/${this.getUserId}/homework/get-detail`;
                const params = { assignmentId: item.assignmentId };


                const response = await axios.get(endpoint, { params });

                if (response.status === 200) {
                    const questions = response.data.data;
                    this.$router.push({
                        name: 'AnswerHomework',
                        query: {
                            assignmentId: item.assignmentId,
                            questions: JSON.stringify(questions),
                            assignmentName: item.title
                        }
                    });
                } else {
                    ElNotification.error({ title: '获取作业详情失败', message: '获取作业详情失败，请稍后重试' });
                }
            } catch (error) {
                ElNotification.error({ title: '获取作业详情失败', message: '获取作业详情失败，请稍后重试' });
            } finally {
                this.isContinuing = false;
                this.isProcessing = false;
            }
        },
        showSystemConfirmContinue(item) {
            if (window.confirm(`确定要继续训练 "${item.practiceName || item.title}" 吗？`)) {
                this.practiceToContinue = item;
                this.isContinuing = true; // 显示加载提示
                this.isProcessing = true; // 设置为正在处理
                this.performContinueTraining();
            }
        },
        async performContinueTraining(item) {
            const router = useRouter();
            try {
                this.isContinuing = true;
                this.isProcessing = true;
                const endpoint = `/api/student/${this.getUserId}/continue-practice`;
                const params = { practiceId: item.practiceId };


                const response = await axios.post(endpoint, params, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    const questions = response.data.data;

                    this.$router.push({ // 使用 this.$router 来访问路由
                        name: 'AnswerTemporary',
                        query: {
                            practiceId: item.practiceId,
                            questions: JSON.stringify(questions),
                            mode: item.mode,
                            practiceName: item.practiceName
                        }
                    });
                } else {
                    console.error('获取题目失败', response.data.message);
                }
            } catch (error) {
                console.error('获取题目失败', error.response ? error.response.data : error.message);
            } finally {
                this.isContinuing = false; // 隐藏加载提示
                this.isProcessing = false; // 结束处理状态
            }
        },
        showSystemConfirmViewHomeworkAnswers(item) {
            this.answersToView = item;
            this.isViewingAnswers = true; // 显示加载提示
            this.isProcessing = true; // 设置为正在处理
            this.performViewHomeworkAnswers();
        },
        performViewHomeworkAnswers() {
            this.viewHomeworkAnswers(this.answersToView);
        },
        async viewHomeworkAnswers(item) {

            if (!item || !item.assignmentId) {
                this.$message.error('无法查看答案：作业ID缺失');
                return;
            }

            try {
                // 设置加载状态
                this.isProcessing = true;

                // 跳转到 HomeworkDetail 页面，并通过路由传递 assignmentId 参数
                this.$router.push({
                    name: 'HomeworkDetail',
                    params: {
                        assignmentId: item.assignmentId,
                        assignmentName: item.title
                    }
                });
            } catch (error) {
                console.error('跳转到作业详情页面失败', error);
                this.$message.error('跳转失败，请重试');
            } finally {
                // 取消加载状态
                this.isProcessing = false;
            }
        },
        showSystemConfirmViewAnswers(item) {
            this.answersToView = item;
            this.isViewingAnswers = true; // 显示加载提示
            this.isProcessing = true; // 设置为正在处理
            this.performViewAnswers();
        },
        viewAnswers(item) {
            try {

                if (!item.practiceId) {
                    console.error('Missing required param "practiceId"', item);
                    return;
                }

                router.push({
                    name: 'AnswerDetail',
                    params: {
                        practiceId: item.practiceId // 传递 practiceId 作为路径参数
                    }
                });
            } catch (error) {
                console.error('获取答案失败', error);
            } finally {
                this.isViewingAnswers = false; // 隐藏加载提示
                this.isProcessing = false; // 结束处理状态
            }
        },
        performViewAnswers() {
            this.viewAnswers(this.answersToView);
        },
        async showSystemConfirmDelete(item) {
            await ElMessageBox.confirm(
                `确定要删除练习 "${item.practiceName || item.title}" 吗？`,
                '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            );

            this.practiceToDelete = item;
            this.isDeleting = true; // 显示加载提示
            this.isProcessing = true; // 设置为正在处理

            // 执行删除操作
            await this.performDelete();
        },
        async performDelete() {
            if (!this.practiceToDelete) {
                console.error('No practice to delete');
                this.isDeleting = false; // 隐藏加载提示
                this.isProcessing = false; // 结束处理状态
                return;
            }

            const userId = this.getUserId; // 从vuex获取当前用户的ID
            const practiceId = this.practiceToDelete.practiceId; // 获取要删除的练习ID

            if (!practiceId) {
                console.error('Missing required param "practiceId"', this.practiceToDelete);
                this.isDeleting = false; // 隐藏加载提示
                this.isProcessing = false; // 结束处理状态
                return;
            }

            try {
                const response = await axios.delete(`/api/student/${userId}/delete-practice?practiceId=${practiceId}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    // 删除成功后，更新本地数据
                    this.pendingItems.练习 = this.pendingItems.练习.filter(p => p.practiceId !== practiceId);
                    this.completedItems.练习 = this.completedItems.练习.filter(p => p.practiceId !== practiceId);


                    ElNotification.success({ title: '删除练习成功', message: response.data.message });
                } else {
                    console.error('删除练习失败', response.data.message);
                    ElNotification.error({ title: '删除练习失败', message: response.data.message });
                }
            } catch (error) {
                console.error('删除练习失败', error.response ? error.response.data : error.message);
                ElNotification.error({ title: '删除练习失败', message: '删除练习失败，请稍后再试' });
            } finally {
                this.isDeleting = false; // 隐藏加载提示
                this.isProcessing = false; // 结束处理状态
            }
        }
    },
    created() {
        this.fetchPendingPractices();
        this.fetchPendingAssignments();
        this.fetchCompletedPractices();
        this.fetchCompletedAssignments();
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
    overflow-y: auto;
}

.content {
    flex: 1;
    padding: 20px;
    margin-left: 300px;
    margin-right: 50px;
    max-width: 1000px;
}

section {
    margin-bottom: 40px;
}

h2 {
    margin-bottom: 10px;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

.info-card {
    padding: 30px;
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease-in-out;

}

.info-card:hover {
    transform: scale(1.01);
}

th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

th {
    background-color: #f2f2f2;
}

button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 10px;
}

button:hover {
    background-color: #0056b3;
}

p {
    text-align: center;
    color: #888;
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
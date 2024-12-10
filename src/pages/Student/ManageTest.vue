<template>
    <div class="page-container">
        <Header />
        <div class="main-container">
            <Sidebar />
            <div class="content">
                <section>
                    <h2>待完成</h2>
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
                    <table v-if="pendingItems[selectedStatus].length > 0">
                        <thead>
                        <tr>
                            <th>序号</th>
                            <th>试卷名称</th>
                            <th>开始时间</th>
                            <th>截止时间</th>
                            <th>操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(item, index) in pendingItems[selectedStatus]" :key="index">
                            <td>{{ index + 1 }}</td>
                            <td>{{ item.title || item.practiceName }}</td>
                            <td>{{ item.startTime || item.dueTime }}</td>
                            <td>{{ item.endTime || item.dueTime }}</td>
                            <td>
                                <button @click="continueHomework(item)" :disabled="isProcessing">继续练习</button>
                                <button :disabled="isDeleting || isProcessing" v-if="selectedStatus === '作业'" @click="showSystemConfirmContinue(item)">继续练习</button>
                                <button :disabled="isDeleting || isProcessing" @click="showSystemConfirmDelete(item)">删除练习</button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <p v-else>暂无数据</p>
                </section>

                <section>
                    <h2>已完成</h2>
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
                    <table v-if="completedItems[selectedCompletedStatus].length > 0">
                        <thead>
                        <tr>
                            <th>序号</th>
                            <th>试卷名称</th>
                            <th>提交时间</th>
                            <th>分数</th>
                            <th>操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(item, index) in completedItems[selectedCompletedStatus]" :key="index">
                            <td>{{ index + 1 }}</td>
                            <td>{{ item.title || item.practiceName }}</td>
                            <td>{{ item.endTime || item.practiceTime }}</td>
                            <td>{{ item.totalScore }}</td>
                            <td>
                                <button @click="showSystemConfirmViewAnswers(item)" :disabled="isProcessing">答案查询</button>
                                <button v-if="selectedCompletedStatus === '作业'" :disabled="isProcessing" @click="showTeacherComments(item)">老师评语</button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <p v-else>暂无数据</p>
                </section>
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

export default {
    components: { Header, Sidebar },
    data() {
        return {
            selectedStatus: '练习',
            selectedCompletedStatus: '练习',
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
        ...mapGetters(['getUserId'])
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
                        endTime: item.endTime
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
                    console.log('Fetched completed practices:', this.completedItems.练习); // 调试日志
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
                        totalScore: item.totalScore
                    }));
                } else {
                    console.error('获取已完成作业列表失败', response.data.message);
                }
            } catch (error) {
                console.error('获取已完成作业列表失败', error);
            }
        },
        async continueHomework() {
            try {
                // 构造请求的 endpoint 和参数
                const endpoint = `/api/student/${this.getUserId}/homework/get-detail`;
                const params = { assignmentId: this.assignmentToContinue.assignmentId };

                console.log(`Sending GET request to ${endpoint} with params:`, params); // 调试日志

                // 发送 GET 请求获取作业详情
                const response = await axios.get(endpoint, { params });

                if (response.status === 200) {
                    const questions = response.data.data; // 从响应中提取问题列表
                    console.log('Received homework details:', questions); // 调试日志

                    // 将题目和其他必要信息传递给答题页面
                    router.push({
                        name: 'AnswerHomework',
                        query: {
                            assignmentId: this.assignmentToContinue.assignmentId,
                            questions: JSON.stringify(questions),
                            assignmentName: this.assignmentToContinue.assignmentName
                        }
                    });
                } else {
                    console.error('获取作业详情失败', response.data.message);
                    alert('获取作业详情失败，请稍后重试');
                }
            } catch (error) {
                console.error('获取作业详情失败', error.response ? error.response.data : error.message);
                alert('获取作业详情失败，请稍后重试');
            } finally {
                this.isContinuing = false; // 隐藏加载提示
                this.isProcessing = false; // 结束处理状态
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
        async performContinueTraining() {
            try {
                const endpoint = `/api/student/${this.getUserId}/continue-practice`;
                const params = { practiceId: this.practiceToContinue.practiceId };

                console.log(`Sending POST request to ${endpoint} with params:`, params); // 调试日志

                const response = await axios.post(endpoint, params, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    const questions = response.data.data;
                    console.log('Received questions:', questions); // 调试日志

                    // 将题目和其他必要信息传递给答题页面
                    router.push({
                        name: 'AnswerTemporary',
                        query: {
                            practiceId: this.practiceToContinue.practiceId,
                            questions: JSON.stringify(questions),
                            mode: this.practiceToContinue.mode,
                            practiceName: this.practiceToContinue.practiceName
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
        showSystemConfirmViewAnswers(item) {
            if (window.confirm(`确定要查看 "${item.practiceName || item.title}" 的答案吗？`)) {
                this.answersToView = item;
                this.isViewingAnswers = true; // 显示加载提示
                this.isProcessing = true; // 设置为正在处理
                this.performViewAnswers();
            }
        },
        viewAnswers(item) {
            try {
                console.log('Item passed to viewAnswers:', item); // 调试日志

                if (!item.practiceId) {
                    console.error('Missing required param "practiceId"', item);
                    return;
                }

                console.log('Navigating to AnswerDetail with practiceId:', item.practiceId); // 调试日志
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
        showSystemConfirmDelete(item) {
            if (window.confirm(`确定要删除练习 "${item.practiceName || item.title}" 吗？`)) {
                this.practiceToDelete = item;
                this.isDeleting = true; // 显示加载提示
                this.isProcessing = true; // 设置为正在处理
                this.performDelete();
            }
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

                    console.log('Pending items after deletion:', this.pendingItems.练习); // 调试日志
                    console.log('Completed items after deletion:', this.completedItems.练习); // 调试日志

                    alert(response.data.message); // 显示成功消息
                } else {
                    console.error('删除练习失败', response.data.message);
                    alert(response.data.message); // 显示错误消息
                }
            } catch (error) {
                console.error('删除练习失败', error.response ? error.response.data : error.message);
                alert('网络错误或服务器错误，请稍后再试');
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
}

.content {
    flex: 1;
    padding: 20px;
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
    color: white;
    font-size: 1.2em;
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
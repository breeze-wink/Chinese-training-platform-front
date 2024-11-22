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
                                <button @click="continueTraining(item)">继续训练</button>
                                <button @click="deletePractice(item)">删除练习</button>
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
                                <button @click="viewAnswers(item)">答案查询</button>
                                <button @click="teacherComment(item)">老师评语</button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <p v-else>暂无数据</p>
                </section>
            </div>
        </div>
    </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";
import axios from 'axios';
import router from '@/router'; // 引入路由模块

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
            studentId: '123456' // 假设学生的ID为123456，实际使用时从Vuex或其他地方获取
        };
    },
    methods: {
        async fetchPendingPractices() {
            try {
                const response = await axios.get(`/api/student/${this.studentId}/get-unfinished-practice-list`, {
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
                const response = await axios.get(`/api/student/${this.studentId}/get-unfinished-assignment-list`, {
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
                const response = await axios.get(`/api/student/${this.studentId}/get-finished-practice-list`, {
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
                const response = await axios.get(`/api/student/${this.studentId}/get-finished-assignment-list`, {
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
        async continueTraining(item) {
            try {
                const response = await axios.post(`/api/student/${this.studentId}/continue-practice`, {
                    practiceId: item.practiceId
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    const questions = response.data.data;
                    // 将题目传递给答题页面
                    router.push({
                        name: 'AnswerPractice',
                        params: {
                            practiceId: item.practiceId,
                            questions: questions
                        }
                    });
                } else {
                    console.error('获取练习题目失败', response.data.message);
                }
            } catch (error) {
                console.error('获取练习题目失败', error);
            }
        },
        async viewAnswers(item) {
            try {
                const response = await axios.get(`/api/student/${this.studentId}/practice/get-answer`, {
                    params: {
                        practiceId: item.practiceId
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    const answers = response.data.data;
                    // 将答案传递给答案页面
                    router.push({
                        name: 'AnswerDetail',
                        params: {
                            practiceId: item.practiceId,
                            answers: answers
                        }
                    });
                } else {
                    console.error('获取练习答案失败', response.data.message);
                }
            } catch (error) {
                console.error('获取练习答案失败', error);
            }
        },
        deletePractice(item) {
            // 实现删除练习的功能
            console.log(`删除练习：${item.practiceName}`);
        },
        teacherComment(item) {
            // 实现查看老师评语的功能
            console.log(`查看老师评语：${item.practiceName}`);
        }
    },
    created() {
        this.fetchPendingPractices(); // 在组件创建时获取未完成练习列表
        this.fetchPendingAssignments(); // 在组件创建时获取未完成作业列表
        this.fetchCompletedPractices(); // 在组件创建时获取已完成练习列表
        this.fetchCompletedAssignments(); // 在组件创建时获取已完成作业列表
    }
};
</script>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
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

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

th {
    background-color: #f2f2f2;
    font-weight: bold;
}

button {
    margin: 0 5px;
    padding: 5px 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #45a049;
}
</style>
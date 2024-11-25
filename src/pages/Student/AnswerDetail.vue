<template>
    <div class="answer-detail-page">
        <Header />
        <div class="main-container">
            <Sidebar />
            <div class="content">
                <div v-if="isLoading" class="loading">
                    <p>加载中...</p>
                </div>
                <div v-else-if="answers.length > 0" class="answers-container">
                    <h2>{{ practiceName }} 的详细答案</h2>
                    <div v-for="(group, groupName) in groupedAnswers" :key="groupName" class="question-group">
                        <h3>{{ groupName }}</h3>
                        <div v-for="answer in group" :key="answer.practiceQuestionId" class="answer">
                            <h4>{{ answer.questionContent }}</h4>
                            <p><strong>题型:</strong> {{ answer.questionType }}</p>
                            <ul v-if="answer.questionOptions" class="options-list">
                                <li v-for="option in getOptions(answer.questionOptions)" :key="option.label" class="option">
                                    {{ option.text }}
                                </li>
                            </ul>
                            <p><strong>你的答案:</strong> {{ answer.studentAnswer }}</p>
                            <p><strong>正确答案:</strong> {{ answer.answer }}</p>
                        </div>
                    </div>
                </div>
                <div v-else-if="!isLoading && answers.length === 0">
                    <p>没有找到答案。</p>
                </div>
                <div v-else>
                    <p>加载答案时发生错误。</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import axios from 'axios';
import { mapGetters } from 'vuex';

export default {
    components: {
        Header,
        Sidebar,
    },
    props: ['practiceId', 'practiceName'], // 确保这里接收 practiceId 和 practiceName
    data() {
        return {
            answers: [],
            isLoading: true,
            groupedAnswers: {}
        };
    },
    computed: {
        ...mapGetters(['getUserId'])
    },
    created() {
        if (!this.practiceId) {
            console.error('practiceId 未定义');
            this.$message.error('练习ID未定义，请重试。');
            this.isLoading = false;
            return;
        }

        const studentId = this.getUserId;

        if (!studentId) {
            console.error('studentId 未定义');
            this.$message.error('学生ID未定义，请重试。');
            this.isLoading = false;
            return;
        }

        console.log('PracticeId:', this.practiceId); // 增加日志以查看 practiceId
        this.fetchAnswers(studentId);
    },
    methods: {
        async fetchAnswers(studentId) {
            try {
                const response = await axios.get(`/api/student/${studentId}/practice/get-answer`, {
                    params: {
                        practiceId: this.practiceId
                    }
                });

                console.log('响应状态码:', response.status); // 增加日志以查看响应状态码
                console.log('响应数据:', response.data); // 增加日志以查看响应内容

                if (response.status === 200 && response.data.message === '答案获取成功') {
                    this.answers = response.data.data || [];
                    this.groupAndReorderAnswers();
                    this.isLoading = false;
                } else {
                    console.error('获取答案失败', response.data.message);
                    this.$message.error(`获取答案失败: ${response.data.message}`);
                    this.isLoading = false;
                }
            } catch (error) {
                console.error('获取答案失败', error);
                this.$message.error(`获取答案失败: ${error.response ? error.response.data.message : error.message}`);
                this.isLoading = false;
            }
        },
        groupAndReorderAnswers() {
            this.groupedAnswers = this.answers.reduce((acc, answer, originalIndex) => {
                if (!acc[answer.questionType]) {
                    acc[answer.questionType] = [];
                }
                answer.id = this.answers.findIndex(a => a === answer); // 为每个答案分配一个唯一的 ID
                acc[answer.questionType].push(answer);
                return acc;
            }, {});

            // 重新分配连续的 ID
            let currentId = 0;
            for (const group of Object.values(this.groupedAnswers)) {
                for (const answer of group) {
                    answer.id = currentId++;
                }
            }
        },
        getOptions(optionsString) {
            const options = [];
            const regex = /([A-Z])\.\s*(.*?)(?=[A-Z]\.|$)/g;
            let match;
            while ((match = regex.exec(optionsString)) !== null) {
                options.push({
                    label: match[1],
                    text: match[2].trim()
                });
            }
            return options;
        }
    }
};
</script>

<style scoped>
.answer-detail-page {
    padding: 20px;
}

.main-container {
    display: flex;
}

.sidebar {
    width: 25%;
    margin-right: 20px;
}

.content {
    width: 75%;
}

.loading {
    margin-top: 20px;
}

.answers-container {
    margin-bottom: 20px;
}

.question-group {
    margin-bottom: 20px;
}

.answer h4 {
    margin-top: 0;
}

.options-list {
    list-style-type: none;
    padding: 0;
}

.option {
    margin-bottom: 10px;
}
</style>







<template>
    <div class="answer-detail-page">
        <Header />
        <div class="main-container">
            <Sidebar />
            <div class="content">
                <div v-if="completedQuestions.length > 0" class="completed-questions">
                    <h2>{{ practiceName }}</h2>
                    <div v-for="(question, index) in completedQuestions" :key="index" class="question">
                        <h3>{{ index + 1 }}. {{ question.questionContent }}</h3>
                        <p><strong>题型:</strong> {{ question.questionType }}</p>
                        <p><strong>选项:</strong> {{ question.questionOptions }}</p>
                        <p><strong>正确答案:</strong> {{ question.answerContent }}</p>
                        <p><strong>你的答案:</strong> {{ question.studentAnswer }}</p>
                    </div>
                </div>
                <div v-else>
                    <p>没有找到已完成的试卷。</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import axios from 'axios';

export default {
    components: {
        Header,
        Sidebar,
    },
    props: ['practiceId', 'score'],
    data() {
        return {
            completedQuestions: [],
            practiceName: '',
        };
    },
    created() {
        this.fetchCompletedPractice();
    },
    methods: {
        async fetchCompletedPractice() {
            try {
                const response = await axios.post(`/api/student/${this.$route.params.practiceId}/continue-practice`, {
                    practiceId: this.practiceId
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    this.completedQuestions = response.data.data.map(question => ({
                        ...question,
                        answerContent: question.answerContent, // 正确答案
                        studentAnswer: question.studentAnswer // 学生答案
                    }));
                    this.practiceName = this.completedQuestions[0]?.practiceName || '练习名称未知';
                } else {
                    console.error('获取完成的试卷失败', response.data.message);
                }
            } catch (error) {
                console.error('获取完成的试卷失败', error);
            }
        }
    }
};
</script>

<style scoped>
.answer-detail-page {
    padding: 20px;
}

h2 {
    margin-bottom: 20px;
}

.question {
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 20px;
    background-color: #f9f9f9;
}

.question h3 {
    margin-top: 0;
}

.question p {
    margin: 5px 0;
}

.question strong {
    font-weight: bold;
    color: #333;
}
</style>
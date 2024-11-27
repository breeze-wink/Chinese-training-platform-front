<template>
    <div class="page-container">
        <Header />
        <div class="main-container">
            <Sidebar />
            <div class="content-and-nav">
                <div class="content">
                    <div v-if="isLoading" class="loading">
                        <p>加载中...</p>
                    </div>
                    <div v-else-if="answers.length > 0" class="answers-container">
                        <h2>{{ practiceName }} 练习答案</h2>
                        <p class="score-text"><strong>客观题得分: {{ score }}</strong></p>
                        <div v-for="(group, groupName) in groupedAnswers" :key="groupName" :id="'group-' + groupName" class="question-group">
                            <h3>{{ getGroupName(groupName) }}</h3>
                            <div v-for="answer in group" :key="answer.id" :id="'question-' + answer.questionNumber" class="answer">
                                <h4>{{ answer.questionNumber }}. {{ answer.questionContent }}</h4>
                                <ul v-if="answer.questionOptions" class="options-list">
                                    <li v-for="option in getOptions(answer.questionOptions)" :key="option.label" class="option">
                                        <span class="option-label">{{ option.label }}</span>. {{ option.text }}
                                    </li>
                                </ul>
                                <p><strong class="highlight">你的答案:</strong>
                                    <span class="answer-text" v-if="answer.questionType === 'CHOICE'">
                                        {{ answer.studentAnswer }}
                                    </span>
                                    <span class="answer-text" v-else>
                                        {{ answer.studentAnswer }}
                                    </span>
                                </p>
                                <p><strong class="highlight">正确答案:</strong> <span class="answer-text">{{ answer.answer }}</span></p>
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
                <div class="sidebar-nav">
                    <h3>题目导航</h3>
                    <ul>
                        <li v-for="(group, groupName) in groupedAnswers" :key="groupName">
                            <a :href="'#group-' + groupName" class="group-title">{{ getGroupName(groupName) }}</a>
                            <ul class="questions-list">
                                <li v-for="answer in group" :key="answer.id">
                                    <a :href="'#question-' + answer.questionNumber" class="question-number">{{ answer.questionNumber }}</a>
                                </li>
                            </ul>
                        </li>
                    </ul>
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
    props: {
        practiceId: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            answers: [],
            isLoading: true,
            groupedAnswers: {},
            score: null,
            practiceName: ''  // 将 practiceName 移到 data 中
        };
    },
    computed: {
        ...mapGetters(['getUserId']),
        flatAnswers() {
            // 扁平化所有答案
            return this.answers;
        }
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

        // 从路由参数中获取 score 和 practiceName
        this.score = this.$route.query.score;
        this.practiceName = this.$route.query.practiceName || this.practiceName;  // 初始化 practiceName

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

                    // 处理 studentAnswer，只保留字母
                    this.answers.forEach(answer => {
                        if (answer.questionType === 'CHOICE' && answer.studentAnswer) {
                            const options = this.getOptions(answer.questionOptions);
                            let matchedOption = null;

                            // 尝试匹配选项
                            for (const option of options) {
                                if (answer.studentAnswer.includes(option.text)) {
                                    matchedOption = option;
                                    break;
                                }
                            }

                            if (matchedOption) {
                                answer.studentAnswer = matchedOption.label; // 只保留字母
                            } else {
                                console.warn(`无法匹配到选项: ${answer.studentAnswer} for question: ${answer.questionContent}`);
                            }
                        }
                    });

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
                acc[answer.questionType].push(answer);
                return acc;
            }, {});

            // 按照题型排序
            for (const group of Object.values(this.groupedAnswers)) {
                group.sort((a, b) => a.id - b.id);
            }

            // 分配题号
            let questionNumber = 1;
            for (const group of Object.values(this.groupedAnswers)) {
                for (const answer of group) {
                    answer.questionNumber = questionNumber++;
                }
            }

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
                    label: match[1],  // 提取字母
                    text: match[2].trim()  // 提取选项文本
                });
            }
            return options;
        },
        getGroupName(groupName) {
            switch (groupName) {
                case 'CHOICE':
                    return '一、选择题';
                case 'FILL_IN_BLANK':
                    return '二、填空题';
                case 'SHORT_ANSWER':
                    return '三、简答题';
                default:
                    return groupName;
            }
        }
    }
};
</script>

<style scoped>
/* 使用柔和的色调和优雅的字体 */
body {
    font-family: 'Georgia', serif; /* 优雅的衬线字体 */
    background-color: #f5f5f5; /* 浅灰色背景 */
    color: #333; /* 深灰色文字 */
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0ibm9uZSI+PC9yZWN0PjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJub25lIiBzdHlsZT0ic3Ryb2tlOiAjZmZmOyBzdHJva2Utd2lkdGg6IDE7IHN0cm9rZS1vcGFjaXR5OiAxLjA7IHN0cm9rZS1kYXNoYXJyYXk6IDEwOyBzdHJva2UtbGluZWNhcDpyb3VuZCI+PC9yZWN0Pjwvc3ZnPg=='); /* 轻微的网格背景 */
    background-size: 20px 20px;
}

.page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 20px;
    box-sizing: border-box;
}

.main-container {
    display: flex;
    flex: 1;
    padding: 20px; /* 为主要内容区域添加内边距 */
    background: linear-gradient(135deg, #e0eafc, #cfdef3); /* 渐变背景 */
    border-radius: 16px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

.content-and-nav {
    display: flex;
    width: 100%;
}

.content {
    width: 75%;
    background-color: #fff;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 添加阴影 */
    background: linear-gradient(135deg, #ffffff, #f5f5f5); /* 内容区域的渐变背景 */
}

.sidebar-nav {
    width: 25%;
    background-color: #f9f9f9;
    border-radius: 16px;
    padding: 20px;
    margin-left: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 添加阴影 */
    background: linear-gradient(135deg, #f9f9f9, #eaeaea); /* 侧边栏的渐变背景 */
}

.sidebar-nav h3 {
    font-size: 1.5em;
    margin-bottom: 10px;
    color: #555; /* 更柔和的文字颜色 */
}

.sidebar-nav ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.sidebar-nav li {
    margin-bottom: 5px;
}

.sidebar-nav a {
    text-decoration: none;
    color: #333;
    font-size: 1.2em;
    transition: all 0.3s ease; /* 平滑过渡效果 */
}

.sidebar-nav .group-title {
    font-weight: bold;
    margin-bottom: 10px;
    display: block;
    /* 取消边框 */
    border: none;
    padding: 0;
    color: #555; /* 更柔和的文字颜色 */
}

.sidebar-nav .question-number {
    display: inline-block;
    padding: 5px 10px;
    border: 1px solid #ddd; /* 添加边框 */
    border-radius: 8px; /* 圆角边框 */
    margin-right: 10px; /* 为题号之间增加间距 */
    margin-bottom: 10px; /* 为题号之间增加垂直间距 */
    background: linear-gradient(135deg, #ffffff, #f5f5f5); /* 题号链接的渐变背景 */
}

.sidebar-nav .question-number:hover {
    background-color: #e0eafc; /* 链接悬停时的背景颜色 */
    border-color: #007bff; /* 链接悬停时的边框颜色 */
    color: #007bff; /* 链接悬停时的文字颜色 */
}

.sidebar-nav .questions-list {
    display: flex;
    flex-wrap: wrap; /* 自动换行 */
}

.sidebar-nav ul ul {
    margin-left: 20px;
}

.loading {
    margin-top: 20px;
    text-align: center;
    animation: fadeIn 2s infinite;
}

@keyframes fadeIn {
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
}

.answers-container {
    margin-bottom: 20px;
}

.question-group {
    margin-bottom: 20px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
}

h2, h3, h4, .option-label, .option, .highlight, .answer-text {
    font-family: 'Georgia', serif; /* 优雅的衬线字体 */
}

h2 {
    font-size: 2em;
    color: #333;
    margin-bottom: 10px;
}

h3 {
    font-size: 1.75em;
    color: #333;
    margin-bottom: 10px;
}

h4 {
    font-size: 1.5em;
    color: #333;
    margin-bottom: 10px;
}

.option-label {
    font-size: 1.4em;
    margin-right: 5px;
    color: #555;
}

.options-list {
    list-style-type: none;
    padding: 0;
}

.option {
    margin-bottom: 10px;
    font-size: 1.4em;
    color: #555;
}

.highlight {
    font-size: 1.4em;
    color: #555;
}

.answer-text {
    font-size: 1.4em;
    color: #555;
}

/* 增加得分文本的字体大小 */
.score-text {
    font-size: 1.8em; /* 调整字体大小 */
    color: #333; /* 保持深灰色文字 */
    margin-bottom: 10px; /* 增加底部间距 */
}

/* 响应式布局 */
@media (max-width: 768px) {
    .main-container {
        flex-direction: column;
    }

    .content-and-nav {
        flex-direction: column;
    }

    .content, .sidebar-nav {
        width: 100%;
        margin-left: 0;
    }

    .sidebar-nav {
        margin-top: 20px;
    }
}
</style>
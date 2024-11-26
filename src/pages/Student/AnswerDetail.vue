<template>
    <div class="page-container">
        <Header />
        <div class="main-container">
            <Sidebar />
            <div class="content">
                <div v-if="isLoading" class="loading">
                    <p>加载中...</p>
                </div>
                <div v-else-if="answers.length > 0" class="answers-container">
                    <h2>练习答案</h2>
                    <div v-for="(group, groupName) in groupedAnswers" :key="groupName" class="question-group">
                        <h3>{{ getGroupName(groupName) }}</h3>
                        <div v-for="answer in group" :key="answer.id" class="answer">
                            <h4>{{ answer.questionNumber }}. {{ answer.questionContent }}</h4>
                            <ul v-if="answer.questionOptions" class="options-list">
                                <li v-for="option in getOptions(answer.questionOptions)" :key="option.label" class="option">
                                    <span class="option-label">{{ option.label }}</span>. {{ option.text }}
                                </li>
                            </ul>
                            <p><strong class="highlight">你的答案:</strong> <span class="answer-text">{{ answer.studentAnswer }}</span></p>
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
        },
        practiceName: {
            type: String,
            required: true
        }
    },
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
                    label: match[1],
                    text: match[2].trim()
                });
            }
            return options;
        },
        getGroupName(groupName) {
            switch (groupName) {
                case 'CHOICE':
                    return '选择题';
                case 'FILL_IN_BLANK':
                    return '填空题';
                case 'SHORT_ANSWER':
                    return '简答题';
                default:
                    return groupName;
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
}

.main-container {
    display: flex;
    flex: 1;
    padding: 20px; /* 为主要内容区域添加内边距 */
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

h2, h3, h4, .option-label, .option, .highlight, .answer-text {
    font-family: "楷体", "KaiTi"; /* 设置所有指定元素的字体为楷体 */
}

h2 {
    font-size: 2em; /* 最大的字体 */
}

h3 {
    font-size: 1.75em; /* 其次的字体 */
}

h4 {
    font-size: 1.5em; /* 第三大的字体 */
}

.option-label {
    font-size: 1.4em; /* 放大选项标签 */
    margin-right: 5px; /* 添加间距 */
}

.options-list {
    list-style-type: none; /* 去掉列表项前面的点 */
    padding: 0;
}

.option {
    margin-bottom: 10px;
    font-size: 1.4em; /* 确保选项内容的字体大小与标签一致 */
}

.highlight {
    font-size: 1.4em; /* 放大“你的答案”和“正确答案”的标签 */
}

.answer-text {
    font-size: 1.4em; /* 放大答案文本的字体 */
}
</style>







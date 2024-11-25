<template>
    <div class="page-container">
        <Header />
        <div class="main-container">
            <div class="content">
                <div class="generated-questions">
                    <h2 class="practice-name">{{ practiceName }}</h2>
                    <form @submit.prevent="submitAnswers">
                        <div v-for="(group, groupName) in groupedQuestions" :key="groupName" class="question-group">
                            <h3 class="group-name">{{ getGroupName(groupName) }}</h3>
                            <div v-for="(question, index) in group" :key="index" class="question" :id="'question-' + question.id" ref="questionElements">
                                <h4>{{ question.id + 1 }}. {{ question.questionContent }}</h4>
                                <div v-if="question.type === 'CHOICE'" class="options">
                                    <label v-for="(option, optionIndex) in getOptions(question.questionOptions)" :key="optionIndex" class="option">
                                        <input type="radio" :name="`question-${question.id}`" :value="option.text" v-model="studentAnswers[question.id]">
                                        <span>{{ option.label }}. {{ option.text }}</span>
                                    </label>
                                </div>
                                <div v-else-if="question.type === 'FILL_IN_BLANK'" class="input-field">
                                    <input type="text" v-model="studentAnswers[question.id]" placeholder="请输入答案">
                                </div>
                                <div v-else-if="question.type === 'SHORT_ANSWER'" class="input-field">
                                    <textarea v-model="studentAnswers[question.id]" placeholder="请输入答案"></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="button-group">
                            <button type="submit" class="submit-button">提交答案</button>
                            <button type="button" class="save-button" @click="saveAnswers">暂存答案</button>
                        </div>
                    </form>
                </div>
            </div>
            <div class="navigation">
                <ul>
                    <li v-for="(group, groupName) in groupedQuestions" :key="groupName" :class="{ active: currentGroup === groupName }">
                        <h3 class="group-name">{{ getGroupName(groupName) }}</h3>
                        <ul>
                            <li v-for="(question, index) in group" :key="index" :class="{ active: currentIndex === question.id }">
                                <a :href="'#question-' + question.id" class="nav-link" @click.prevent="scrollToQuestion(index)">
                                    <div class="nav-option">
                                        {{ question.id + 1 }}
                                    </div>
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header.vue';
import axios from 'axios';
import { nextTick } from 'vue';

export default {
    components: {
        Header,
    },
    props: ['practiceId', 'mode', 'practiceName'],
    data() {
        return {
            studentAnswers: {},
            parsedQuestions: [],
            groupedQuestions: {},
            currentIndex: 0,
            currentGroup: '',
            observer: null
        };
    },
    created() {
        const questionsFromQuery = this.$route.query.questions;
        if (questionsFromQuery) {
            try {
                this.parsedQuestions = JSON.parse(decodeURIComponent(questionsFromQuery));
                this.groupAndReorderQuestions();
                this.studentAnswers = this.parsedQuestions.reduce((acc, question) => {
                    acc[question.id] = '';
                    return acc;
                }, {});
            } catch (error) {
                console.error('解析题目失败', error);
                this.parsedQuestions = [];
            }
        } else {
            console.error('questions 未定义');
            this.parsedQuestions = [];
        }
    },
    mounted() {
        // 初始设置 IntersectionObserver 可能会失败，因此我们将其放在 updated 钩子中
    },
    updated() {
        this.setupIntersectionObserver();
    },
    beforeDestroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    },
    methods: {
        groupAndReorderQuestions() {
            this.groupedQuestions = this.parsedQuestions.reduce((acc, question, originalIndex) => {
                if (!acc[question.type]) {
                    acc[question.type] = [];
                }
                question.id = this.parsedQuestions.findIndex(q => q === question); // 为每个题目分配一个唯一的 ID
                acc[question.type].push(question);
                return acc;
            }, {});

            // 重新分配连续的 ID
            let currentId = 0;
            for (const group of Object.values(this.groupedQuestions)) {
                for (const question of group) {
                    question.id = currentId++;
                }
            }
        },
        async submitAnswers() {
            console.log('开始提交答案'); // 添加调试信息

            if (!this.practiceId) {
                console.error('practiceId 未定义');
                this.$message.error('练习ID未定义，请重试。');
                return;
            }

            const answers = this.parsedQuestions.map((question) => ({
                practiceQuestionId: question.practiceQuestionId,
                answerContent: this.studentAnswers[question.id]
            }));

            try {
                const response = await axios.post(`/api/student/${this.practiceId}/practice/complete`, {
                    data: answers
                });

                console.log('响应数据:', response.data); // 增加日志以查看响应内容

                if (response.status === 200 && response.data.message === '练习提交成功') {
                    const score = response.data.score; // 假设后端返回的分数字段名为 score

                    if (score !== undefined && score !== null) {
                        this.$router.push({
                            name: 'AnswerDetail',
                            params: {
                                practiceId: this.practiceId
                            },
                            query: {
                                score: score,
                                practiceName: this.practiceName
                            }
                        });
                    } else {
                        console.error('响应中缺少 score 字段', response.data);
                        this.$message.error('提交答案失败: 响应中缺少 score 字段');
                    }
                } else {
                    console.error('提交答案失败', response.data.message);
                    this.$message.error(`提交答案失败: ${response.data.message}`);
                }
            } catch (error) {
                console.error('提交答案失败', error.response ? error.response.data : error.message);
                this.$message.error(`提交答案失败: ${error.response ? error.response.data.message : error.message}`);
            }
        },
        async saveAnswers() {
            console.log('开始保存答案'); // 添加调试信息

            const answers = this.parsedQuestions.map((question) => ({
                practiceQuestionId: question.practiceQuestionId,
                answerContent: this.studentAnswers[question.id]
            }));

            try {
                const response = await axios.post(`/api/student/${this.practiceId}/practice/save`, {
                    data: answers
                });

                if (response.status === 200) {
                    this.$message.success('暂存成功');
                    this.$router.push({name: 'QuestionOptions'});
                } else {
                    this.$message.error('暂存失败');
                }
            } catch (error) {
                console.error('暂存答案失败', error.response ? error.response.data : error.message);
                this.$message.error('暂存答案失败');
            }
        },
        setupIntersectionObserver() {
            if (this.observer) {
                this.observer.disconnect();
            }

            this.observer = new IntersectionObserver((entries) => {
                let firstVisibleEntry = entries.find(entry => entry.isIntersecting);
                if (firstVisibleEntry) {
                    const targetElement = firstVisibleEntry.target;
                    this.currentIndex = parseInt(targetElement.id.split('-')[1], 10);
                    this.currentGroup = Object.keys(this.groupedQuestions).find(groupName =>
                        this.groupedQuestions[groupName].some(q => q.id === this.currentIndex)
                    );
                }
            }, { threshold: 0.5 });

            nextTick(() => {
                console.log('Checking $refs:', this.$refs.questionElements); // 调试日志
                if (this.$refs.questionElements && this.$refs.questionElements.length > 0) {
                    this.$refs.questionElements.forEach(question => {
                        this.observer.observe(question);
                    });
                } else {
                    console.warn('没有找到问题元素');
                }
            });
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
        scrollToQuestion(index) {
            const questionElement = this.$refs.questionElements[index];
            if (questionElement) {
                questionElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    },
    computed: {
        getGroupName() {
            return (groupName) => {
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
            };
        }
    }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

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
    flex: 3; /* 增加题目区域的宽度比例 */
    padding: 20px; /* 为题目区域添加内边距 */
    padding-left: 200px; /* 与最左方空出一些距离 */
    height: calc(100vh - 80px); /* 调整高度以适应视口 */
}

.generated-questions {
    background: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 20px;
    width: 100%;
    text-align: left;
    transition: transform 0.3s ease-in-out;
}

.practice-name {
    font-size: 28px;
    margin-bottom: 20px;
    font-family: 'SimHei', sans-serif; /* 黑体 */
}

.question-group {
    margin-bottom: 20px;
}

.group-name {
    font-size: 24px;
    margin-bottom: 10px;
    font-family: 'KaiTi', sans-serif; /* 楷体 */
}

.question {
    margin-bottom: 20px;
    font-family: 'kaiti', 'Times New Roman', sans-serif; /* 中文宋体，英文新罗马 */
    font-size: 20px; /* 增大字体大小 */
}

.options {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.option {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    transition: background 0.3s ease-in-out;
    font-family: 'kaiti', 'Times New Roman', sans-serif; /* 中文宋体，英文新罗马 */
    font-size: 18px; /* 增大选项字体大小 */
}

.option:hover {
    background: #f0f0f0;
}

.option input {
    appearance: none;
    width: 20px;
    height: 20px;
    border: 2px solid #ccc;
    border-radius: 50%;
    outline: none;
    cursor: pointer;
    position: relative;
    transition: border 0.3s ease-in-out;
}

.option input:checked {
    border-color: #007BFF;
}

.option input:checked::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    background: #007BFF;
    border-radius: 50%;
}

.input-field {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

input[type="text"], textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-family: 'kaiti', 'Times New Roman', sans-serif; /* 中文宋体，英文新罗马 */
    font-size: 18px; /* 增大输入框字体大小 */
    transition: border 0.3s ease-in-out;
}

input[type="text"]:focus, textarea:focus {
    border-color: #007BFF;
    outline: none;
}

.button-group {
    display: flex;
    justify-content: center; /* 居中对齐按钮 */
    gap: 10px;
    margin-top: 20px;
}

.submit-button, .save-button {
    padding: 10px 20px;
    background-color: #007BFF; /* 设置按钮背景颜色 */
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.submit-button:hover, .save-button:hover {
    background-color: #0056b3; /* 更深的蓝色背景 */
    transform: translateY(-2px);
}

.navigation {
    flex: 1; /* 减少导航栏的宽度比例 */
    background: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 20px;
    width: 100%;
    text-align: left;
    transition: transform 0.3s ease-in-out;
    margin-left: 20px; /* 添加左边距，使导航栏与题目区域有间隔 */
    font-family: 'SimHei', sans-serif; /* 黑体 */
    color: #000; /* 黑色 */
}

.navigation ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.navigation li {
    margin-bottom: 10px;
}

.nav-link {
    text-decoration: none;
    color: #000; /* 黑色 */
    display: block;
}

.nav-option {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    background: #007BFF; /* 纯蓝色背景 */
    border: 1px solid #ddd;
    border-radius: 5px;
    color: white; /* 白色文字 */
    font-family: 'SimHei', sans-serif; /* 黑体 */
    transition: background 0.3s ease-in-out, transform 0.3s ease-in-out;
    cursor: pointer;
}

.nav-option:hover {
    background-color: #0056b3; /* 鼠标悬停时背景颜色变暗 */
    transform: scale(1.1); /* 鼠标悬停时放大效果 */
}

.nav-link:hover .nav-option {
    background: #0056b3; /* 更深的蓝色背景 */
}

.navigation li.active .nav-option {
    background: #0056b3; /* 更深的蓝色背景 */
    color: white; /* 白色文字 */
}

/* 新增样式：使导航栏内的数字并排放置 */
.navigation ul ul {
    display: flex;
    flex-wrap: wrap; /* 允许换行 */
    gap: 10px; /* 项目之间的间距 */
}

.navigation ul ul li {
    margin: 0;
}
</style>







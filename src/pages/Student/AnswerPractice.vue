<template>
    <div class="answer-page">
        <div class="container">
            <div class="left-section">
                <div v-if="parsedQuestions.length > 0" class="generated-questions card">
                    <h2>{{ practiceName }}</h2>
                    <form @submit.prevent="submitAnswers">
                        <div v-for="(question, index) in parsedQuestions" :key="index" class="question" :id="'question-' + index" ref="questions">
                            <h3>{{ index + 1 }}. {{ question.questionContent }}</h3>
                            <div v-if="question.type === '选择题'" class="options">
                                <label v-for="(option, optionIndex) in question.questionOptions.split('|')" :key="optionIndex" class="option">
                                    <input type="radio" :name="`question-${index}`" :value="option" v-model="studentAnswers[index]">
                                    <span>{{ option }}</span>
                                </label>
                            </div>
                            <div v-else-if="question.type === '填空题'" class="input-field">
                                <input type="text" v-model="studentAnswers[index]" placeholder="请输入答案">
                            </div>
                            <div v-else-if="question.type === '简答题'" class="input-field">
                                <textarea v-model="studentAnswers[index]" placeholder="请输入答案"></textarea>
                            </div>
                        </div>
                        <div class="button-group">
                            <button type="submit" class="submit-button">提交答案</button>
                            <button @click="saveAnswers" class="save-button">暂存答案</button>
                        </div>
                    </form>
                </div>
                <div v-else class="no-questions">
                    <p>没有找到题目。</p>
                </div>
            </div>
            <div class="right-section">
                <nav class="navigation">
                    <ul>
                        <li v-for="(question, index) in parsedQuestions" :key="index" :class="{ active: currentIndex === index }">
                            <a :href="'#question-' + index">{{ index + 1 }}</a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import router from '@/router';

export default {
    props: ['practiceId', 'questions', 'mode'],
    data() {
        return {
            studentAnswers: [],
            practiceName: '',
            parsedQuestions: [], // 初始化为一个空数组
            currentIndex: 0,
            observer: null
        };
    },
    created() {
        // 检查 questions 是否有效
        if (this.questions) {
            try {
                this.parsedQuestions = JSON.parse(this.questions);
                this.studentAnswers = Array(this.parsedQuestions.length).fill('');
            } catch (error) {
                console.error('解析题目失败', error);
                this.parsedQuestions = []; // 解析失败时初始化为一个空数组
            }
        } else {
            console.error('questions 未定义');
            this.parsedQuestions = []; // questions 未定义时初始化为一个空数组
        }
        this.fetchPracticeName();
    },
    mounted() {
        this.setupIntersectionObserver();
    },
    beforeDestroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    },
    methods: {
        async fetchPracticeName() {
            try {
                const response = await axios.get(`/api/student/${this.practiceId}/practice/${this.practiceId}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    this.practiceName = response.data.data.practiceName;
                } else {
                    console.error('获取练习名称失败', response.data.message);
                }
            } catch (error) {
                console.error('获取练习名称失败', error);
            }
        },
        async submitAnswers() {
            const answers = this.parsedQuestions.map((question, index) => ({
                practiceQuestionId: question.practiceQuestionId,
                answerContent: this.studentAnswers[index]
            }));

            try {
                const response = await axios.post(`/api/student/${this.practiceId}/practice/complete`, {
                    data: answers
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    router.push({
                        name: 'AnswerDetail',
                        params: {
                            practiceId: this.practiceId,
                            score: response.data.score
                        }
                    });
                } else {
                    console.error('提交答案失败', response.data.message);
                }
            } catch (error) {
                console.error('提交答案失败', error);
            }
        },
        async saveAnswers() {
            const answers = this.parsedQuestions.map((question, index) => ({
                practiceQuestionId: question.practiceQuestionId,
                answerContent: this.studentAnswers[index]
            }));

            try {
                const response = await axios.post(`/api/student/${this.practiceId}/practice/save`, {
                    data: answers
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    this.$message.success('暂存成功');
                    router.push({ name: 'QuestionOptions' });
                } else {
                    this.$message.error('暂存失败');
                }
            } catch (error) {
                console.error('暂存答案失败', error);
                this.$message.error('暂存答案失败');
            }
        },
        setupIntersectionObserver() {
            this.observer = new IntersectionObserver((entries) => {
                let firstVisibleEntry = entries.find(entry => entry.isIntersecting);
                if (firstVisibleEntry) {
                    this.currentIndex = this.parsedQuestions.indexOf(firstVisibleEntry.target.__vue__);
                }
            }, { threshold: 0.5 });

            this.$refs.questions.forEach(question => {
                this.observer.observe(question);
            });
        }
    }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.answer-page {
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
}

.container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 1200px;
}

.left-section {
    flex: 1;
    padding-right: 20px;
    overflow-y: auto;
    height: calc(100vh - 40px); /* 调整高度以适应视口 */
}

.right-section {
    flex: 0.3;
    padding-left: 20px;
    position: fixed;
    top: 20px;
    right: 20px;
    bottom: 20px;
    width: 20%; /* 根据需要调整宽度 */
    background-color: #f5f5f5;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 20px;
    overflow: hidden; /* 去掉右侧滑动的设计 */
}

.card {
    background: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 20px;
    width: 100%;
    text-align: left;
    transition: transform 0.3s ease-in-out;
}

.card:hover {
    transform: translateY(-5px);
}

h2 {
    margin-bottom: 20px;
    text-align: center;
    font-family: 'Roboto', sans-serif;
    font-weight: 700;
    color: #333;
}

.question {
    margin-bottom: 20px;
    font-family: 'Roboto', sans-serif;
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
    border-color: #4CAF50;
}

.option input:checked::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    background: #4CAF50;
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
    font-family: 'Roboto', sans-serif;
    transition: border 0.3s ease-in-out;
}

input[type="text"]:focus, textarea:focus {
    border-color: #4CAF50;
    outline: none;
}

.button-group {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

.submit-button, .save-button {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
    transition: background 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.submit-button:hover, .save-button:hover {
    background-color: #45a049;
    transform: translateY(-2px);
}

.no-questions {
    text-align: center;
    font-family: 'Roboto', sans-serif;
    color: #666;
}

.navigation {
    background: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 20px;
    width: 100%;
    text-align: left;
    transition: transform 0.3s ease-in-out;
}

.navigation ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.navigation li {
    margin-bottom: 10px;
}

.navigation li a {
    text-decoration: none;
    color: lightblue;
    display: block;
    padding: 5px 10px;
    border-radius: 5px;
    transition: background 0.3s ease-in-out;
}

.navigation li a:hover {
    background: #f0f0f0;
}

.navigation li.active a {
    color: blue;
}
</style>
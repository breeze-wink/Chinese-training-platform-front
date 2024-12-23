<template>
    <div class="page-container">
        <Header />
        <div class="main-container">
            <div class="content">
                <div class="generated-questions">
                    <h2 class="practice-name">{{ practiceName }}</h2>
                    <form @submit.prevent="submitAnswers">
                        <template v-for="question in displayedQuestions" :key="question.practiceQuestionId">
                            <div :id="'question-' + question.practiceQuestionId" ref="questionElements" class="question">
                                <div v-if="question.showBody" class="question-body">
                                    <strong>{{ question.number }}. </strong>
                                      <span v-html="question.questionBody"></span>
                                </div>
                                <div class="question-sequence-content">
                                    <span class="sequence">{{ question.sequence }}. </span>
                                    <span v-html="question.questionContent" class="question-content"></span>
                                </div>
                                <div v-if="question.type === 'CHOICE'" class="options">
                                    <label v-for="(option, optionIndex) in getOptions(question.questionOptions)" :key="optionIndex" class="option">
                                        <input type="radio" :name="`question-${question.practiceQuestionId}`" :value="option.text" v-model="studentAnswers[question.practiceQuestionId]" @change="logQuestionsInfo">
                                        <span>{{ option.label }}. {{ option.text }}</span>
                                    </label>
                                </div>
                                <div v-else-if="question.type === 'FILL_IN_BLANK' || question.type === 'SHORT_ANSWER' || question.questionType === 'ESSAY'" class="input-field">
                                    <textarea v-model="studentAnswers[question.practiceQuestionId]" :placeholder="'请输入第 ' + question.sequence + ' 题的答案'" class="answer-textarea"></textarea>
                                </div>
                            </div>
                        </template>

                        <div class="button-group">
                            <button type="submit" class="submit-button" @click="showLoading">提交答案</button>
                            <button :disabled="isProcessing" type="button" class="save-button" @click="saveAnswers">暂存答案</button>
                        </div>
                    </form>
                </div>
            </div>
            <div class="navigation">
                <ul>
                    <li v-for="question in displayedQuestions" :key="question.practiceQuestionId" :class="{ active: currentIndex === question.practiceQuestionId }">
                        <a :href="'#question-' + question.practiceQuestionId" class="nav-link" @click.prevent="scrollToQuestion(question.practiceQuestionId)">
                            <div class="nav-option">
                                {{ question.sequence }}
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <div v-if="isProcessing" class="loading-modal">
            <div class="modal-content">
                <p>正在处理，请稍候...</p>
                <div class="spinner"></div>
            </div>
        </div>

        <div v-if="isProcessing" class="overlay"></div>
    </div>
</template>

<script>
import Header from '@/components/Header.vue';
import axios from 'axios';
import { nextTick } from 'vue';
import Quill from 'quill';
import user from "@/store/user.js";
import router from "@/router/index.js";
import {mapGetters} from "vuex";

export default {
    components: {
        Header,
    },
    props: ['practiceId', 'mode', 'practiceName'],
    data() {
        return {
            studentAnswers: {},
            parsedQuestions: [],
            displayedQuestions: [],
            currentIndex: 0,
            observer: null,
            quillEditors: {},
            isProcessing: false  // 新增的状态变量
        };
    },
    created() {
        const studentId = this.getUserId;

        if (!studentId) {
            console.error('studentId 未定义');
            this.$message.error('学生ID未定义，请重试。');
            this.isLoading = false;
            return;
        }
        const questionsFromQuery = this.$route.query.questions;
        const mode = this.$route.query.mode || 'default';

        if (questionsFromQuery) {
            try {
                this.parsedQuestions = JSON.parse(decodeURIComponent(questionsFromQuery));

                // 初始化学生答案对象，如果有预设答案则使用预设答案
                this.studentAnswers = this.parsedQuestions.reduce((acc, question) => {
                    acc[question.practiceQuestionId] = question.answerContent || '';  // 使用预设答案或空字符串
                    return acc;
                }, {});


            } catch (error) {
                console.error('解析题目失败', error);
                this.parsedQuestions = [];
            }
        } else {
            console.error('questions 未定义');
        }
        // 其他初始化逻辑
    },
    mounted() {
        this.setupIntersectionObserver();
        this.loadImagesForQuestions();
    },
    beforeDestroy() {
        if (this.observer) this.observer.disconnect();
    },

    methods: {
        async replaceImageSrcUtil(htmlContent) {
            if (!htmlContent) return htmlContent;

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;

            const images = tempDiv.querySelectorAll('img');

            const replacePromises = Array.from(images).map(async (img) => {
                const src = img.getAttribute('src');

                if (src && src.startsWith('/uploads/content/')) {
                    const imageName = src.replace('/uploads/content/', '');
                    const imageUrl = `/api/uploads/images/content/${imageName}`;

                    const token = this.$store.getters.getToken; // 获取 token

                    if (!token) {
                        console.error('Missing authentication token');
                        return;
                    }

                    try {
                        const response = await axios.get(imageUrl, {
                            responseType: 'blob',
                            headers: {
                                Authorization: `Bearer ${token}`, // Ensure the token is included
                            },
                        });

                        if (response.status === 200) {
                            const blobUrl = URL.createObjectURL(response.data);
                            img.setAttribute('src', blobUrl);
                        } else {
                            console.error(`Failed to fetch image: ${imageUrl}`);
                        }
                    } catch (error) {
                        console.error(`Error fetching image: ${imageUrl}`, error);
                    }
                }
            });

            await Promise.all(replacePromises);

            return tempDiv.innerHTML;
        },

        async loadImagesForQuestions() {

            const promises = this.parsedQuestions.map(async (question) => {
                if (question.questionContent) {
                    question.questionContent = await this.replaceImageSrcUtil(question.questionContent);
                }
                if (question.questionBody) {
                    question.questionBody = await this.replaceImageSrcUtil(question.questionBody);
                }
            });

            await Promise.all(promises);

        },

        showLoading() {
            this.isProcessing = true;
            document.body.style.overflow = 'hidden'; // 禁止页面滚动
        },

        hideLoading() {
            this.isProcessing = false;
            document.body.style.overflow = ''; // 恢复页面滚动
        },

        async submitAnswers() {
            this.showLoading();

            this.isProcessing = true;  // 请求开始前设置为 true


            if (!this.practiceId) {
                console.error('practiceId 未定义');
                this.$message.error('练习ID未定义，请重试。');
                this.isProcessing = false;  // 请求结束时设置为 false
                return;
            }

            const studentId = this.getUserId;
            if (!studentId) {
                console.error('studentId 未定义');
                this.$message.error('学生ID未定义，请重试。');
                this.isProcessing = false;
                return;
            }

            const answers = this.parsedQuestions.map((question) => ({
                practiceQuestionId: question.practiceQuestionId,
                answerContent: this.studentAnswers[question.practiceQuestionId]  // 使用 practiceQuestionId 作为键
            }));

            answers.forEach(answer => {
                const question = this.parsedQuestions.find(q => q.practiceQuestionId === answer.practiceQuestionId);
                if (question && question.type === 'CHOICE' && answer.answerContent) {
                    const options = this.getOptions(question.questionOptions);
                    const matchedOption = options.find(option => option.text === answer.answerContent);
                    if (matchedOption) {
                        answer.answerContent = matchedOption.label; // 修正为选项字母
                    } else {
                        console.warn(`无法匹配到选项: ${answer.answerContent} for question: ${question.content}`);
                    }
                }
            });


            try {
                const response = await axios.post(`/api/student/${studentId}/practice/complete`, {
                    data: answers
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200 && response.data.message === '练习提交成功') {
                    const score = response.data.score;

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
                if (error.response) {
                    console.error('提交答案失败', error.response.data);
                    this.$message.error(`提交答案失败: ${error.response.data.message || '未知错误'}`);
                } else {
                    console.error('提交答案失败', error.message);
                    this.$message.error(`提交答案失败: ${error.message}`);
                }
            } finally {
                this.isProcessing = false;  // 请求结束后设置为 false
            }
        },

        async saveAnswers() {
            this.showLoading();

            this.isProcessing = true;  // 请求开始前设置为 true


            const studentId = this.getUserId;
            if (!studentId) {
                console.error('studentId 未定义');
                this.$message.error('学生ID未定义，请重试。');
                this.isProcessing = false;
                return;
            }

            // 构建答案数组，使用 practiceQuestionId 作为键
            const answers = this.parsedQuestions.map((question) => ({
                practiceQuestionId: question.practiceQuestionId,
                answerContent: this.studentAnswers[question.practiceQuestionId]
            }));

            // 对于选择题，转换为选项字母
            answers.forEach(answer => {
                const question = this.parsedQuestions.find(q => q.practiceQuestionId === answer.practiceQuestionId);
                if (question && question.type === 'CHOICE' && answer.answerContent) {
                    const options = this.getOptions(question.questionOptions);
                    const matchedOption = options.find(option =>
                        option.text.trim() === answer.answerContent.trim()
                    );
                    if (matchedOption) {
                        answer.answerContent = matchedOption.label; // 修正为选项字母
                    } else {
                        console.warn(`无法匹配到选项: ${answer.answerContent} for question: ${question.content}`);
                    }
                }
            });

            try {
                const response = await axios.post(`/api/student/${studentId}/practice/save`, {
                    data: answers
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
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
            } finally {
                this.isProcessing = false;  // 请求结束后设置为 false
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
                }
            }, {threshold: 0.5});

            nextTick(() => {
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
                // 去掉选项文本中的逗号
                const textWithoutCommas = match[2].replace(/,/g, '').trim();
                options.push({
                    label: match[1],
                    text: textWithoutCommas
                });
            }
            return options;
        },

        scrollToQuestion(id) {
            this.currentIndex = id;
            const element = this.$refs.questionElements.find(el => el.id === 'question-' + id);
            if (element) {
                element.scrollIntoView({behavior: 'smooth', block: 'center'}); // 改为居中滚动
                this.currentIndex = id;
            }
        },

        logQuestionsInfo() {
            this.parsedQuestions.forEach((question, index) => {
            });
        },

        getTypeTitle(type) {
            switch (type) {
                case 'CHOICE':
                    return '一、选择题';
                case 'FILL_IN_BLANK':
                    return '二、填空题';
                case 'SHORT_ANSWER':
                    return '三、简答题';
                default:
                    return type;
            }
        },
    },
    computed: {
        ...mapGetters(['getUserId']),


        displayedQuestions() {
            const seenNumbers = new Set();
            const seenTypes = new Set();

            return this.parsedQuestions.map(question => {
                const [number, subNumber] = question.sequence.split('.');
                const showBody = subNumber ? !seenNumbers.has(number) : false;
                if (showBody && subNumber) {
                    seenNumbers.add(number);
                }

                // 检查是否是同类型题目的第一个
                const isFirstOfType = !seenTypes.has(question.type);
                if (isFirstOfType) {
                    seenTypes.add(question.type);
                }

                // 检查是否是第一个组合题
                const isCombination = subNumber !== undefined;
                const showCombinationTitle = isCombination;

                return {
                    ...question,
                    showBody,
                    number,
                    isFirstOfType,
                    isCombination,
                    showCombinationTitle,
                    typeTitle: this.getTypeTitle(question.type)
                };
            });
        }
    },
    watch: {
        studentAnswers: {
            handler(newVal, oldVal) {
                console.log('Student Answers Updated:', newVal);
            },
            deep: true
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
    overflow: hidden; /* 禁止整个页面滚动 */
}

.main-container {
    display: flex;
    flex: 1;
}

.content {
    flex: 3;
    padding: 20px;
    padding-left: 200px;
    height: calc(100vh - 80px);
    overflow-y: auto; /* 保持内容区可滚动 */
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
    font-family: 'SimHei', sans-serif;
}

.question {
    margin-bottom: 20px;
    font-family: 'kaiti', 'Times New Roman', sans-serif;
    font-size: 20px;
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
    font-family: 'kaiti', 'Times New Roman', sans-serif;
    font-size: 18px;
}

.option input {
    appearance: none; /* 移除默认样式 */
    width: 20px;
    height: 20px;
    border: 2px solid #ccc; /* 默认边框颜色 */
    border-radius: 50%;
    outline: none;
    cursor: pointer;
    position: relative;
    transition: border 0.3s ease-in-out, background-color 0.3s ease-in-out;
}

.option input:checked {
    border-color: #007BFF; /* 边框颜色变为蓝色 */
    background-color: #007BFF; /* 点击时背景填充为蓝色 */
}

.option input:checked::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    background-color: white; /* 圆圈内部的白色圆点 */
    border-radius: 50%;
}

.option input:checked:hover {
    background-color: #0056b3; /* 鼠标悬停时的背景色 */
    border-color: #0056b3; /* 悬停时边框颜色加深 */
}

.option:hover {
    background: #f0f0f0;
}

.input-field {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.input-field input,
.input-field textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 18px;
}

.answer-textarea {
    width: 100%;
    height: 100px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    resize: vertical;
}

.answer-box {
    margin: 20px 0;
    position: relative;
}

.line {
    border-top: 1px solid #000;
    margin-bottom: 10px;
    text-align: center;
    position: relative;
}

.line .answer-label {
    position: absolute;
    top: -10px;
    background-color: #fff;
    padding: 0 10px;
    font-family: 'SimSun', '宋体', serif;  /* 使用宋体字体 */
}

.text-box-container {
    margin-bottom: 20px;
}

.answer-box-text {
    width: 100%;
    height: 100px;
    border: 1px solid #000;
    padding: 10px;
    box-sizing: border-box;
    font-size: 14px;
    line-height: 1.6;
}

.button-group {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
}

.submit-button, .save-button {
    padding: 10px 20px;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.submit-button:hover, .save-button:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
}

.navigation {
    flex: 1;
    background: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 20px;
    width: 100%;
    text-align: left;
    transition: transform 0.3s ease-in-out;
    margin-left: 20px;
    font-family: 'SimHei', sans-serif;
    color: #000;
}

.navigation ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.navigation li {
    margin: 0;
}

.nav-link {
    text-decoration: none;
    color: #000;
    display: block;
}

.nav-option {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    background: #007BFF;
    border: 1px solid #ddd;
    border-radius: 5px;
    color: white;
    font-family: 'SimHei', sans-serif;
    transition: background 0.3s ease-in-out, transform 0.3s ease-in-out;
    cursor: pointer;
}

.nav-option:hover,
.nav-link:hover .nav-option,
.navigation li.active .nav-option {
    background-color: #0056b3;
    transform: scale(1.1);
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
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
    z-index: 1000;
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

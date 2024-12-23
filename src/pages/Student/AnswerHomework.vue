<template>
    <div class="page-container">
        <Header />
        <div class="main-container">
            <div class="content">
                <div class="generated-questions">
                    <h2 class="practice-name">{{ assignmentName }}</h2>
                    <form @submit.prevent="submitAnswers">
                        <div v-for="(question, index) in parsedQuestions" :key="index" class="question" :id="'question-' + question.submissionAnswerId" ref="questionElements">
                            <div v-if="shouldShowQuestionBody(question)" class="question-body">
                                {{ getPrefixOfSequence(question.sequence) }}
                                <span v-html="question.body" class="question-content"></span>
                            </div>
                            <div class="question-sequence-content">
                                <span class="sequence" v-if="question.questionType !== 'ESSAY'">{{ question.sequence }}. </span>
                                <span v-html="question.questionContent" class="question-content"></span>
                            </div>
                            <div v-if="question.questionType === 'CHOICE'" class="options">
                                <label v-for="option in getOptions(question.questionOptions)" :key="option.label" class="option">
                                    <input type="radio"
                                           :name="`question-${question.submissionAnswerId}`"
                                           :value="option.label"
                                           v-model="studentAnswers[question.submissionAnswerId]">
                                    <span>{{ option.label }}. {{ option.text }}</span>
                                </label>
                            </div>
                            <!-- 将富文本框替换为普通文本框 -->
                            <div v-else-if="question.questionType === 'FILL_IN_BLANK' || question.questionType === 'SHORT_ANSWER' || question.questionType === 'ESSAY'" class="text-editor-container">
                                <textarea
                                    :id="'textarea-' + question.submissionAnswerId"
                                    v-model="studentAnswers[question.submissionAnswerId]"
                                    class="answer-textarea"
                                    rows="4"
                                    placeholder="请输入答案...">
                                </textarea>
                            </div>
                        </div>
                        <div class="button-group">
                            <button type="submit" class="submit-button">提交答案</button>
                        </div>
                    </form>
                </div>
            </div>
            <div class="navigation">
                <ul>
                    <li v-for="(question, index) in parsedQuestions" :key="index" :class="{ active: currentIndex === question.submissionAnswerId }">
                        <a :href="'#question-' + question.submissionAnswerId" class="nav-link" @click.prevent="scrollToQuestion(index, question.submissionAnswerId)">
                            <div class="nav-option">
                                {{ question.sequence }}
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <!-- 加载提示 -->
        <div v-if="isSubmit" class="loading-modal">
            <div class="modal-content">
                <p v-if="isSubmit">正在提交作业，请稍候...</p>
                <div class="spinner"></div>
            </div>
        </div>

        <!-- 遮罩层 -->
        <div v-if="isProcessing" class="overlay"></div>
    </div>
</template>

<script>
import Header from '@/components/Header.vue';
import axios from 'axios';
import { nextTick } from 'vue';
import Quill from 'quill';
import {mapGetters} from "vuex";

export default {
    components: {
        Header,
    },
    props: ['assignmentId', 'assignmentName'],
    data() {
        return {
            studentAnswers: {},
            parsedQuestions: [],
            currentIndex: 0,
            observer: null,
            quillEditors: {},
            isProcessing: false,
            isSubmit: false
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

        this.initialize();

        this.parsedQuestions.forEach((question) => {
            const questionId = question.submissionAnswerId || 'Unknown ID';
            const type = question.questionType || 'Unknown Type';
            const content = question.questionContent || 'No content available';
            const options = question.questionOptions || [];

        });

        this.logQuestionsInfo();
    },
    mounted() {
        this.loadImagesForQuestions(); // 确保DOM更新完成后再加载图片
    },
    beforeDestroy() {
        if (this.observer) this.observer.disconnect();
        Object.values(this.quillEditors).forEach((editor) => editor.destroy());
    },
    watch: {
        parsedQuestions: {
            handler(newVal) {
                if (newVal.length > 0) {
                    this.$nextTick(() => {  // 确保DOM已更新后再初始化
                        this.initQuillEditors();
                    });
                }
            },
            immediate: true,
            deep: true
        }
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

                    question.body = await this.replaceImageSrcUtil(question.body);
                }
            });

            await Promise.all(promises);
        },

        initialize() {
            const questionsFromQuery = this.$route.query.questions;
            if (questionsFromQuery) {
                try {
                    this.parsedQuestions = JSON.parse(decodeURIComponent(questionsFromQuery));

                    this.parsedQuestions.forEach(question => {

                        this.studentAnswers[question.submissionAnswerId] = question.answerContent || '';
                    });
                } catch (error) {
                    console.error('解析题目失败', error);
                    this.parsedQuestions = [];
                }
            } else {
                console.error('questions 未定义');
                this.parsedQuestions = [];
            }
        },
        async submitAnswers() {

            this.isSubmit = true;
            this.isProcessing = true;
            const studentId = this.getUserId;
            if (!studentId) {
                console.error('studentId 未定义');
                this.$message.error('学生ID未定义，请重试。');
                this.isProcessing = false;
                return;
            }

            if (!this.assignmentId) {
                console.error('assignmentId 未定义');
                this.$message.error('作业ID未定义，请重试。');
                return;
            }

            // 构建提交的答案数据
            const answers = this.parsedQuestions.map((question) => ({
                submissionAnswerId: question.submissionAnswerId, // 假设每个问题都有 submissionAnswerId
                answerContent: this.studentAnswers[question.submissionAnswerId]
            }));

            try {
                // 发送 POST 请求
                const response = await axios.post(`/api/student/${studentId}/homework/complete`, {
                    data: answers
                });

                // 检查接口返回状态和数据
                if (response.status === 200) {
                    const message = response.data.message || ''; // 确保 message 存在
                    if (message === 'success' || message === '练习提交成功') {
                        // 成功时跳转到 ManageTest 页面
                        this.$router.push({ name: 'ManageTest' });
                    } else {
                        console.error('提交答案失败：未预期的响应信息', message);
                        this.$message.error(`提交答案失败：${message}`);
                    }
                } else {
                    console.error('提交答案失败：HTTP 状态码非 200', response);
                    this.$message.error(`提交答案失败：HTTP 状态码 ${response.status}`);
                }
            } catch (error) {
                console.error('提交答案失败', error);
                const errorMessage = error.response?.data?.message || error.message || '未知错误';
                this.$message.error(`提交答案失败：${errorMessage}`);
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
                options.push({
                    label: match[1],
                    text: match[2].trim()
                });
            }
            return options;
        },
        scrollToQuestion(index, id) {
            this.currentIndex = id;
            const element = this.$refs.questionElements.find(el => el.id === 'question-' + id);
            if (element) {
                element.scrollIntoView({behavior: 'smooth'});
            }
        },
        logQuestionsInfo() {
            this.parsedQuestions.forEach((question, index) => {
            });
        },
        shouldShowQuestionBody(question) {
            if (question.sequence.includes('.')) {
                const [base, sub] = question.sequence.split('.');
                const baseNumber = parseInt(base, 10);
                for (let i = 0; i < this.parsedQuestions.length; i++) {
                    const q = this.parsedQuestions[i];
                    if (q.sequence.startsWith(`${baseNumber}.`) && i < this.parsedQuestions.indexOf(question)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        },
        getPrefixOfSequence(sequence) {
            const parts = sequence.split('.');
            return parts[0];
        },
    },
    computed: {
        ...mapGetters(['getUserId']),

        displayedQuestions() {
            return this.parsedQuestions.map(question => ({
                ...question,
                showBody: !this.parsedQuestions.some(q => q.sequence.startsWith(question.sequence.split('.')[0]) && q.sequence !== question.sequence)
            }));
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
    overflow: hidden;
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
    font-family: 'SimHei', sans-serif; /* 黑体 */
}

.quill-editor-container {
    min-height: 150px; /* 确保编辑框有高度 */
    border: none;
    padding: 16px; /* 增加内边距，让内容不紧贴边缘 */
    margin: 24px 0; /* 增加上下间距，确保与前后题目有足够间隔 */
    border-radius: 8px; /* 较大的圆角，使外观更圆润 */
    background-color: #f9f9f9; /* 柔和的背景颜色 */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); /* 添加轻微阴影 */
    transition: box-shadow 0.3s ease, background-color 0.3s ease; /* 平滑过渡效果 */
}

/* 当用户点击编辑器时，应用激活状态样式 */
.quill-editor-container:focus-within {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 更明显的阴影 */
    background-color: #ffffff; /* 改变背景颜色，表示当前处于编辑状态 */
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
    display: flex; /* 使用Flexbox布局 */
    flex-wrap: wrap; /* 允许换行 */
    gap: 10px; /* 项目之间的间距 */
}

.navigation li {
    margin: 0; /* 移除默认的margin */
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

.nav-option:hover,
.nav-link:hover .nav-option,
.navigation li.active .nav-option {
    background-color: #0056b3; /* 更深的蓝色背景 */
    transform: scale(1.1); /* 鼠标悬停时放大效果 */
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
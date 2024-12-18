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
                        <h2>{{ assignmentName }} 作业答案</h2>
                        <p class="score-text"><strong>分数: {{ score }}</strong></p>
                        <div v-for="(answer, index) in answers" :key="index" :id="'question-' + answer.sequence" class="answer">
                            <div v-if="answer.showQuestionContent" class="question-body">
                                <span class="question-prefix">{{ getMainQuestionNumber(answer.sequence) }}</span>
                                <div v-html="answer.body" class="question-content"></div>
                            </div>
                            <div class="question-sequence-content">
                                <span class="sequence">{{ answer.sequence }}. </span>
                                <span v-html="answer.questionContent" class="question-content"></span>
                            </div>
                            <ul v-if="answer.questionOptions" class="options-list">
                                <li v-for="option in getOptions(answer.questionOptions)" :key="option.text" class="option">
                                    {{ option.text }}
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
                            <p v-if="answer.analysis" class="analysis">
                                <strong class="highlight">解析:</strong> <span class="answer-text"> {{ answer.analysis }}</span>
                            </p>
                            <p v-if="answer.feedback"><strong class="highlight">教师反馈:</strong> <span class="answer-text">{{ answer.feedback }}</span></p>
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
                    <div class="questions-list">
                        <a v-for="(answer, index) in answers" :key="index" :href="'#question-' + answer.sequence" class="question-number">{{ answer.sequence }}</a>
                    </div>
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
    data() {
        return {
            answers: [],
            isLoading: true,
            score: null,
            assignmentId: null,
            assignmentName: '',
            displayedQuestions: new Set() // 用于存储已经显示过的题目编号
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
        this.assignmentId = this.$route.params.assignmentId;
        this.assignmentName = this.$route.params.assignmentName;
        console.log('从路由中获取的 assignmentId:', this.assignmentId); // 增加调试日志
        console.log('从路由中获取的 assignmentName:', this.assignmentName); // 增加调试日
        if (!this.assignmentId) {
            console.error('assignmentId 未定义');
            this.$message.error('作业ID未定义，请重试。');
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

        console.log('AssignmentId:', this.assignmentId); // 增加日志以查看 assignmentId

        // 从路由参数中获取 score 和 assignmentName
        this.score = this.$route.query.score || null;
        this.assignmentName = this.$route.query.assignmentName || '';  // 初始化 assignmentName

        this.fetchAnswers(studentId);
    },
    methods: {
        async fetchAnswers(studentId) {
            try {
                const response = await axios.get(`/api/student/${studentId}/homework/get-answer`, {
                    params: {
                        assignmentId: this.assignmentId
                    }
                });

                console.log('响应状态码:', response.status); // 增加日志以查看响应状态码
                console.log('响应数据:', response.data); // 增加日志以查看响应内容

                if (response.status === 200 && response.data.message === 'success') {
                    this.score = response.data.totalScore;  // 更新为 totalScore
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

                        // 标记需要显示 questionContent 的题目
                        if (answer.sequence.includes('.')) {
                            const [mainQuestion, subQuestion] = answer.sequence.split('.');
                            if (!this.displayedQuestions.has(mainQuestion)) {
                                this.displayedQuestions.add(mainQuestion);
                                answer.showQuestionContent = true;
                            } else {
                                answer.showQuestionContent = false;
                            }
                        } else {
                            answer.showQuestionContent = true;
                        }
                    });

                    // 调用 loadImagesInContent 方法
                    this.loadImagesInContent();

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
        getOptions(optionsArray) {
            const options = [];
            if (optionsArray && Array.isArray(optionsArray)) {
                optionsArray.forEach((optionText, index) => {
                    options.push({
                        label: String.fromCharCode(65 + index), // A, B, C, D...
                        text: optionText
                    });
                });
            }
            return options;
        },
        getMainQuestionNumber(sequence) {
            if (sequence.includes('.')) {
                return sequence.split('.')[0];
            }
            return '';
        },
        async loadImagesInContent() {
            console.log('开始加载题目中的图片');
            for (let i = 0; i < this.answers.length; i++) {
                const answer = this.answers[i];
                // 确保 answer.questionContent 是一个字符串
                if (typeof answer.questionContent !== 'string' || !answer.questionContent) {
                    console.error(`问题 ${answer.practiceQuestionId} 的 questionContent 不是有效的字符串:`, typeof answer.questionContent);
                    continue;
                }

                // 使用替换图片 src 的工具方法
                answer.questionContent = await this.replaceImageSrcUtil(answer.questionContent);

                // 确保图片总是放在新的 <p> 标签中
                answer.questionContent = answer.questionContent.replace(/<p><\/p>/g, '');
            }
        },

        async replaceImageSrcUtil(htmlContent) {
            if (!htmlContent) return htmlContent;

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;

            const images = tempDiv.querySelectorAll('img');
            console.log(`Found ${images.length} images to replace.`);  // 查看找到的图片数量
            const replacePromises = Array.from(images).map(async (img) => {
                const src = img.getAttribute('src');
                console.log('Original image src:', src);  // 输出原始的 src

                if (src && src.startsWith('/uploads/content/')) {
                    const imageName = src.replace('/uploads/content/', '');
                    const imageUrl = `/api/uploads/images/content/${imageName}`;
                    console.log('Fetching image from:', imageUrl);  // 查看请求的 URL

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
                            console.log('Generated Blob URL:', blobUrl);  // 查看生成的 blob URL
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
            console.log('开始加载问题中的图片');  // 添加调试日志

            const promises = this.parsedQuestions.map(async (question) => {
                if (question.questionContent) {
                    console.log(`正在处理问题内容: ${question.practiceQuestionId}`);  // 新增日志
                    question.questionContent = await this.replaceImageSrcUtil(question.questionContent);
                }
                if (question.questionBody) {
                    console.log(`正在处理问题体: ${question.practiceQuestionId}`);  // 新增日志
                    question.questionBody = await this.replaceImageSrcUtil(question.questionBody);
                }
            });

            await Promise.all(promises);

            console.log('图片加载完成');  // 确认加载完成
        },
    }
}
</script>

<style scoped>
/* 使用柔和的色调和优雅的字体 */
body {
    font-family: 'Arial', sans-serif; /* 使用统一的无衬线字体，现代简洁 */
    background-color: #f8f8f8; /* 浅灰色背景 */
    color: #444; /* 更柔和的灰色文字，避免过于深色 */
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0ibm9uZSI+PC9yZWN0PjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJub25lIiBzdHlsZT0ic3Ryb2tlOiAjZmZmOyBzdHJva2Utd2lkdGg6IDE7IHN0cm9rZS1vcGFjaXR5OiAxLjA7IHN0cm9rZS1kYXNoYXJyYXk6IDEwOyBzdHJva2UtbGluZWNhcDpyb3VuZCI+PC9yZWN0Pjwvc3ZnPg=='); /* 轻微的网格背景 */
    background-size: 20px 20px;
}

.page-container {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: 100vh;
}

.main-container {
    display: flex;
    flex: 1;
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
    margin-left: 300px;
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
    font-size: 1.6em; /* 调整字体大小 */
    margin-bottom: 15px;
    color: #333; /* 更柔和的文字颜色 */
    font-weight: 600; /* 加粗 */
}

.questions-list {
    display: flex;
    flex-wrap: wrap; /* 自动换行 */
    gap: 15px; /* 增加间距 */
}

.questions-list a {
    text-decoration: none;
    color: #444;
    font-size: 1.1em; /* 适中字体大小 */
    transition: all 0.3s ease; /* 平滑过渡效果 */
    padding: 8px 15px;
    border: 1px solid #ddd; /* 边框颜色稍微调整 */
    border-radius: 8px; /* 圆角边框 */
    background: linear-gradient(135deg, #ffffff, #f5f5f5); /* 题号链接的渐变背景 */
}

.questions-list a:hover {
    background-color: #e0eafc; /* 链接悬停时的背景颜色 */
    border-color: #007bff; /* 链接悬停时的边框颜色 */
    color: #007bff; /* 链接悬停时的文字颜色 */
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

h2, h3, h4, .option-label, .option, .highlight, .answer-text, .question-body, .analysis {
    font-family: 'Arial', sans-serif; /* 统一字体 */
    line-height: 1.6; /* 提高可读性 */
}

.question-content, .question-sequence-content, .sequence {
    font-size: 1.1em;
}

h2 {
    font-size: 2.2em; /* 增加主标题字体大小 */
    color: #333;
    margin-bottom: 20px; /* 增加底部间距 */
    font-weight: 600; /* 加粗 */
}

h3 {
    font-size: 1.8em;
    color: #444;
    margin-bottom: 15px;
    font-weight: 500;
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
    color: #007bff; /* 使用蓝色高亮 */
}

.answer-text {
    font-size: 1.4em;
    color: #333; /* 深色文字 */
}

/* 增加得分文本的字体大小 */
.score-text {
    font-size: 1.6em; /* 调整字体大小 */
    color: #444; /* 更柔和的灰色 */
    margin-bottom: 15px; /* 增加底部间距 */
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
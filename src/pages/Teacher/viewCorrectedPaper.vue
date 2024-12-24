<template >
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header/>
        <div class="main-container">


            <!-- 内容区 -->
            <div class="content">
                <h2>试卷预览</h2>

                <div class="question-list">
                    <div
                            v-for="(question, index) in processedQuestions"
                            :key="question.submissionAnswerId"
                            class="question-item"
                    >
                        <!-- 大题处理 -->
                        <div v-if="question.type === null">
                            <strong>题目 {{ index + 1 }} ({{question.score}}分): <span v-html="question.body"></span></strong>
                            <div class="sub-questions">
                                <div
                                        v-for="(sub, subIndex) in question.subQuestions"
                                        :key="sub.submissionAnswerId"
                                        class="sub-question"
                                >
                                    <p>{{ subIndex + 1 }}. {{ sub.question }} ({{sub.subScore}}分)</p>

                                    <div v-if="sub.options && sub.options.length > 0" class="options">
                                        <p><strong>选项：</strong></p>
                                        <ul>
                                            <li v-for="(option, optionIndex) in sub.options" :key="optionIndex">
                                                {{ String.fromCharCode(65 + optionIndex) }}. {{ option }}
                                            </li>
                                        </ul>
                                    </div>

                                    <p><strong>学生回答：</strong>{{ sub.studentAnswer }}</p>
                                    <p  >学生得分：{{ sub.studentScore }}</p>

                                    <div v-if="showExplanations" class="explanation">
                                        <p><strong>答案：</strong>{{ sub.answer }}</p>
                                        <p><strong>解析：</strong>{{ sub.explanation }}</p>
                                    </div>


                                </div>
                            </div>
                        </div>

                        <!-- 小题处理 -->
                        <div v-else>
                            <strong>
                                题目 {{ index + 1 }} ({{question.score}}分):
                                <span v-html="question.body ? question.body : question.question"></span>
                            </strong>

                            <p v-if="question.body" style="margin-left: 20px;">{{ question.question }}</p>


                            <div style="margin-left: 20px;">
                                <div v-if="question.options && question.options.length > 0" class="options">
                                    <p><strong>选项：</strong></p>
                                    <ul>
                                        <li v-for="(option, optionIndex) in question.options" :key="optionIndex">
                                            {{ String.fromCharCode(65 + optionIndex) }}. {{ option }}
                                        </li>
                                    </ul>
                                </div>
                                <p v-if="!question.body" >学生回答：{{ question.studentAnswer }}</p>
                                <p>学生得分：{{ question.studentScore }}</p>

                                <div v-if="showExplanations" class="explanation">
                                    <p><strong>答案：</strong>{{ question.answer }}</p>
                                    <p><strong>解析：</strong>{{ question.explanation }}</p>
                                </div>



                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 固定右上和右下内容部分 -->
            <div class="right-content top">
                <button @click="toggleExplanations">
                    {{ showExplanations ? '隐藏解析' : '查看解析' }}
                </button>
                <button @click="returnToHomeworkList">返回作业列表</button>
            </div>
            <div class="right-content bottom">
                <p>学生姓名：{{ studentName }}</p>
                <p>总得分：{{ studentTotalScore }}</p>
                <p>试卷总分：{{ totalScore }}</p>





                <el-button type="primary" @click="markCompleted">查看下一份</el-button>

            </div>
        </div>
        <!-- 加载提示 -->
        <div v-if="isSubmitAndGetNext" class="loading-modal">
            <div class="modal-content">
                <p v-if="isSubmitAndGetNext">正在获取，请稍候...</p>
                <div class="spinner"></div>
            </div>
        </div>

        <!-- 遮罩层 -->
        <div v-if="isSubmitAndGetNext" class="overlay"></div>

    </div>
</template>

<script setup>
import Header from "@/components/Header.vue";

import { computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from "element-plus";
import axios from 'axios';

// 获取 Vuex Store
const store = useStore();
const router = useRouter();
const route = useRoute();

// 状态变量
const showExplanations = ref(false); // 控制是否显示解析

// 获取查询参数
const assignmentId = computed(() => route.query.assignmentId);
const studentId = computed(() => route.query.studentId);

// 当前学生信息
const studentName = ref('');
const processedQuestions = ref([]);
const currentTotalScore = computed(() => calculateTotalScore(processedQuestions.value));
const feedback = ref('');
const totalScore = ref(0);
const studentTotalScore = ref(0);

// 添加当前索引状态
const currentIndex = ref(0);
const isSubmitAndGetNext = ref(false);

// 获取当前 submission details
const fetchSubmissionDetails = async () => {

    const currentIndex = computed(() => store.getters.getCurrentSubmissionIndex);

    const assignmentIdValue = assignmentId.value;
    const studentIdValue = studentId.value;

    if (!assignmentIdValue || !studentIdValue) {
        ElMessage.error('缺少必要的参数');
        await router.push('/teacher/homework-manage');
        return;
    }

    try {
        const response = await axios.get(`/api/teacher/${store.state.user.id}/watch-submission`, {
            params: {
                assignmentId: assignmentIdValue,
                studentId: studentIdValue
            }
        });


        if (response.status === 200 && response.data.message === 'success') {
            const submissionData = response.data;
            totalScore.value= submissionData.totalScore;
            studentTotalScore.value = submissionData.studentTotalScore;



            const unmarkedSubmissions = computed(() => store.getters.getUnmarkedSubmissions);


            const student = unmarkedSubmissions.value.find((s, idx) => {
                if (s.studentId === Number(studentId.value)) {
                    currentIndex.value = idx;
                    return true;
                }
                return false;
            });

            studentName.value = student ? student.studentName : '未知学生';

            // 替换 <img> 标签
            const processed = await replaceImageSrcInQuestions(submissionData.questions);

            processedQuestions.value = processed;

            // 初始化 markScore
            processedQuestions.value.forEach(question => {
                // 对于主题（大题）
                if (question.type === null && question.subQuestions) {
                    question.subQuestions.forEach(sub => {
                        if (sub.type === 'CHOICE') {

                            if (sub.answer === sub.studentAnswer) {
                                sub.markScore = sub.subScore;
                            } else {
                                sub.markScore = 0;
                            }
                        }else{
                            sub.markScore = 0;
                        }
                    });
                }

                // 对于独立题（小题）
                if (question.type === 'CHOICE') {
                    if (question.answer === question.studentAnswer) {
                        question.markScore = question.score;
                    } else {
                        question.markScore = 0;
                    }
                }else{
                    question.markScore = 0;
                }
            });




        } else {
            ElMessage.error('获取作答详情失败');
            await router.push('/teacher/homework-manage');
        }
    } catch (error) {
        console.error(error);
        ElMessage.error('获取作答详情失败，请稍后再试');
        await router.push('/teacher/homework-manage');
    }
};

// 替换 <img> 标签函数
const replaceImageSrcInQuestions = async (questions) => {
    const replaceImageSrc = async (htmlContent) => {
        if (!htmlContent) return htmlContent;

        // 创建一个临时的 DOM 元素来解析 HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        // 查找所有 img 标签
        const images = tempDiv.querySelectorAll('img');

        // 遍历所有 img 标签并替换 src
        const replacePromises = Array.from(images).map(async (img) => {
            const src = img.getAttribute('src');
            if (src && src.startsWith('/uploads/content/')) {
                const imageName = src.replace('/uploads/content/', '');
                const imageUrl = `/api/uploads/images/content/${imageName}`;
                const token = store.getters.getToken; // 直接使用 store 实例访问 getters

                try {
                    // 使用 Axios 获取图片数据，设置响应类型为 blob
                    const response = await axios.get(imageUrl, {
                        responseType: 'blob',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.status === 200) {
                        // 创建 Blob URL
                        const blobUrl = URL.createObjectURL(response.data);
                        img.setAttribute('src', blobUrl);
                    } else {
                        console.error(`获取图片失败: ${imageUrl}`);
                        // 可以设置一个占位图或保留原始 src
                    }
                } catch (error) {
                    console.error(`获取图片失败: ${imageUrl}`, error);
                    // 可以设置一个占位图或保留原始 src
                }
            }
        });

        // 等待所有图片替换完成
        await Promise.all(replacePromises);

        return tempDiv.innerHTML;
    };

    // 遍历所有问题，替换 <img> 标签
    const processedQuestions = await Promise.all(questions.map(async (question) => {
        if (question.body) {
            question.body = await replaceImageSrc(question.body);
        } else if (question.question) {
            question.question = await replaceImageSrc(question.question);
        }

        return question;
    }));

    return processedQuestions;
};

// 计算总分
const calculateTotalScore = (questions) => {
    let total = 0;
    questions.forEach(q => {
        if (q.type === null) {
            q.subQuestions.forEach(sub => {
                total += sub.markScore || 0;
            });
        } else {
            total += q.markScore || 0;
        }
    });
    return total;
};

// 切换显示解析
const toggleExplanations = () => {
    showExplanations.value = !showExplanations.value;
};

// 返回作业列表
const returnToHomeworkList = () => {
    router.push('/teacher/homework-manage');
};

// 判断题目是否自动标记
const isAutoMarked = (question) => {
    return question.type === 'CHOICE';

};

// 监听 markScore 的变化，自动计算得分
const handleMarkScoreChange = (question) => {
    if (question.type === 'CHOICE') {
        if (question.answer === question.studentAnswer) {
            question.markScore = question.score;
        }else{
            question.markScore = 0;
        }
    }
};

// 批阅完成
const markCompleted = async () => {


    await store.dispatch('removeUnmarkedSubmission', Number(studentId.value));
    // 导航到下一份批阅
    await nextSubmission();
};

// 更新提交状态为已批阅


// 下一份
const nextSubmission = async () => {
    // 获取所有提交列表
    const unmarkedSubmissions = computed(() => store.getters.getUnmarkedSubmissions);
    isSubmitAndGetNext.value = false;

    if (!unmarkedSubmissions || unmarkedSubmissions.value.length === 0) {
        ElMessage.info('所有作业已查看完毕');
        await router.push('/teacher/homework-manage');
        return;
    }

    const nextSubmission = unmarkedSubmissions.value[0];

    await router.push({
        path: '/teacher/paper-corrected-view',
        query: {
            assignmentId: assignmentId.value,
            studentId: nextSubmission.studentId
        }
    });
    isSubmitAndGetNext.value = true;
    await fetchSubmissionDetails();
    isSubmitAndGetNext.value = false;
};

// 页面加载时获取批阅的题目
onMounted(async () => {
    isSubmitAndGetNext.value = true;
    await fetchSubmissionDetails();
    const basket = computed(() => store.getters.getBasket);
    isSubmitAndGetNext.value = false;

});
</script>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh; /* 确保至少填充满视口 */
    background-color: #f0f0f0; /* 背景改为浅灰色 */
}

.main-container {
    display: flex;
    flex: 1;
    background-color: #f0f0f0; /* 背景改为浅灰色 */
    margin-right: 100px;
    margin-left: 100px;
}

.content {
    display: flex;
    flex-direction: column; /* 让内容和页脚垂直排列 */
    background-color: #ffffff;
    width: 75%;
    padding: 10px;
    margin-right: 20px;
    margin-bottom: 30px;
}

.question-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    background-color: white;
}

.question-item {
    border: 1px solid #ddd;
    padding: 15px;
    border-radius: 8px;
    background-color: #fff;
    display: flex;
    flex-direction: column;
}

.sub-questions {
    margin-left: 20px;
    margin-top: 0px;
}

.sub-question {
    display: flex;
    flex-direction: column;
    gap: 0px;
    margin-bottom: 0px;
}

.explanation {
    margin-top: 10px;
    padding: 10px;
    background-color: #f9f9f9;
    border-left: 3px solid #409EFF;
}

.score-input {
    margin-top: 10px;
}

.bottom-buttons {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

/* 固定右上和右下内容部分样式 */
.right-content.top {
    position: fixed;
    top: 100px;
    right: 100px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: #ffffff;
    padding: 10px;
    width: 200px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.right-content.bottom {
    position: fixed;
    bottom: 100px;
    right: 100px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    background-color: #ffffff;
    padding: 10px;
    width: 200px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.right-content.top button,
.right-content.bottom button {
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.right-content.top button:first-child {
    background-color: #409EFF;
    color: white;
}

.right-content.top button:last-child {
    background-color: #67c23a;
    color: white;
}

.right-content.top button:first-child:hover {
    background-color: #66b1ff;
}

.right-content.top button:last-child:hover {
    background-color: #85d587;
}

.right-content.bottom p {
    font-size: 16px;
    margin: 5px 0;
}

.comment-section {
    margin-top: 10px;
}

.comment-label {
    display: inline-block;
    margin-bottom: 8px;
    font-weight: bold;
}

.el-input__inner {
    resize: none; /* 禁止用户手动调整文本框大小 */
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
</style>

<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header/>
        <div class="main-container">
            <!-- 内容区 -->
            <div class="content">
                <h2>试卷预览</h2>

                <div class="question-list">
                    <div v-for="(question, index) in basket" :key="question.id" class="question-item">
                        <div v-if="question.type === 'big'">
                            <strong>题目 {{ index + 1 }} ({{question.score}}分): <span v-html="question.body"></span></strong>
                            <div class="sub-questions">
                                <div v-for="(sub, subIndex) in question.subQuestions" :key="sub.id"
                                     class="sub-question">
                                    <p>{{ subIndex + 1 }}. <span v-html="sub.content"></span> ({{sub.score}}分)</p>

                                    <div v-if="sub.options && sub.options.length > 0" class="options">
                                        <p><strong>选项：</strong></p>
                                        <ul>
                                            <li v-for="(option, optionIndex) in sub.options" :key="optionIndex">
                                                {{ String.fromCharCode(65 + optionIndex) }}. {{ option }}
                                            </li>
                                        </ul>
                                    </div>

                                    <!-- 分数选择器 -->
                                    <div class="action-buttons">
                                        <p><strong>分值:</strong></p>
                                        <input
                                                type="number"
                                                v-model.number="sub.score"
                                                min="1"
                                                placeholder="设置分数"
                                        />
                                    </div>

                                    <div v-if="showExplanations" class="explanation">
                                        <p><strong>涉及知识点：</strong>{{ sub.knowledgePoint }}</p>
                                        <p><strong>答案：</strong>{{ sub.answer }}</p>
                                        <p><strong>解析：</strong>{{ sub.explanation }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div  v-else-if="question.type !== 'essay'">
                            <strong>
                                题目 {{ index + 1 }} ({{question.score}}分):
                                <!-- 如果有题干，紧跟在序号后面显示题干 -->
                                <span v-if="question.content" v-html="question.content"></span>
                            </strong>

                            <div>
                                <div v-if="question.options && question.options.length > 0" class="options">
                                    <p><strong>选项：</strong></p>
                                    <ul>
                                        <li v-for="(option, optionIndex) in question.options" :key="optionIndex">
                                            {{ String.fromCharCode(65 + optionIndex) }}. {{ option }}
                                        </li>
                                    </ul>
                                </div>

                            </div>
                            <!-- 分数选择器和删除按钮紧跟在单题下面 -->
                            <div class="action-buttons">
                                <p><strong>分值:</strong></p>
                                <input
                                        type="number"
                                        v-model.number="question.score"
                                        min="1"
                                        placeholder="设置分数"
                                />
                            </div>

                            <div v-if="showExplanations" class="explanation">
                                <p><strong>涉及知识点：</strong>{{ question.knowledgePoint }}</p>
                                <p><strong>答案：</strong>{{ question.answer }}</p>
                                <p><strong>解析：</strong>{{ question.explanation }}</p>
                            </div>
                        </div>

                        <div v-else-if="question.type === 'essay'">
                            <strong>题目 {{ index + 1 }} ({{ question.score }}分): <span v-html="question.content"></span></strong>

                            <!-- 分数选择器 -->
                            <div class="action-buttons">
                                <p><strong>分值:</strong></p>
                                <input
                                        type="number"
                                        v-model.number="question.score"
                                        min="1"
                                        placeholder="设置分数"
                                />
                            </div>

                            <div v-if="showExplanations" class="explanation">
                                <p><strong>涉及知识点：</strong>{{ question.knowledgePoint }}</p>
                                <p><strong>解析：</strong>{{ question.explanation }}</p>
                            </div>

                        </div>

                    </div>
                </div>
            </div>

            <!-- 固定右上和右下内容部分 -->
            <div class="right-content top">
                <button @click="regeneratePaper" class="regenerate-button">重新生成</button>
                <button @click="toggleExplanations" class="toggle-explanation-button">{{ showExplanations ? '隐藏解析' : '查看解析' }}</button>
            </div>
            <div class="right-content bottom">
                <div class="paper-name">
                    <label for="paperName">试卷命名：</label>
                    <input type="text" id="paperName" v-model="paperName" placeholder="请输入试卷名称"
                           style="width: 280px;margin-top: 10px"/>
                </div>
                <p>题目数量：{{ questionCount }}</p>
                <p>试卷总分：{{ totalScore }}</p>
                <p>难度系数：{{ difficultyCoefficient }}</p>

                <button @click="generatePaper" class="generate-button">生成试卷</button>
                <button @click="returnToPaperList" class="return-button">返回选择出卷界面</button>
            </div>
        </div>

        <!-- 加载提示 -->
        <div v-if="isLoading " class="loading-modal">
            <div class="modal-content">
                <p v-if="isLoading">正在加载，请稍候...</p>

                <div class="spinner"></div>
            </div>
        </div>

        <!-- 遮罩层 -->
        <div v-if="isLoading" class="overlay"></div>
    </div>
</template>

<script setup>
import Header from "@/components/Header.vue";
import { computed, ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { ElNotification } from "element-plus";
import axios from "axios";


// 获取 Vuex Store 和 Router 实例
const store = useStore();
const router = useRouter();
const route = useRoute();
const imageCache = [];
const isLoading = ref(false);
// 获取认证 Token
const token = store.getters.getToken;

// 状态变量
const showExplanations = ref(false); // 控制是否显示解析
const paperName = ref(''); // 试卷名称

// 计算试卷总分
const totalScore = computed(() => {
    let total = 0;
    basket.value.forEach(question => {
        if (question.type === 'big') {
            question.subQuestions.forEach(sub => {
                total += Number(sub.score) || 0;
            });
        } else {
            total += Number(question.score) || 0;
        }
    });
    return total;
});

// 计算难度系数
const difficultyCoefficient = computed(() => {
    if (totalScore.value === 0) return 0;
    let total = 0;
    basket.value.forEach(question => {
        if (question.type === 'big') {
            question.subQuestions.forEach(sub => {
                total += (Number(sub.score) || 0) * (sub.difficulty || 0);
            });
        } else {
            total += (Number(question.score) || 0) * (question.difficulty || 0);
        }
    });
    return (total / totalScore.value).toFixed(2);
});

// 获取试卷篮中的题目
const basket = computed(() => store.getters.getBasket);

// 监视试卷篮中的变化，初始化分数
const initializeScores = () => {
    basket.value.forEach(question => {
        if (question.type === 'big') {
            question.subQuestions.forEach(sub => {
                if (sub.score === undefined ) sub.score = 1;
            });
        } else {
            if (question.score === undefined ) question.score = 1;
        }
    });
};
initializeScores();

const returnToPaperList = () => {
    store.dispatch('clearBasket');
    router.push('/teacher/test-generation-strategy'); // 根据实际路由调整
};
// 监视试卷篮变化，重新初始化分数
watch(basket, () => {
    initializeScores();
});

// 计算题目数量（大题算1题）
const questionCount = computed(() => {
    return basket.value.length;
});

// 切换显示解析
const toggleExplanations = () => {
    showExplanations.value = !showExplanations.value;
};
watch(
        basket,
        () => {
            basket.value.forEach(question => {
                if (question.type === 'big') {
                    let totalSubScore = 0;
                    question.subQuestions.forEach(sub => {
                        totalSubScore += Number(sub.score) || 0;
                    });
                    question.score = totalSubScore; // 动态更新大题的分数
                }
            });
        },
        { deep: true } // 深度监听，以监听嵌套的 subQuestions
);
// 生成试卷的逻辑
const generatePaper = async () => {
    //验证试卷名称
    if (!paperName.value.trim()) {
        ElNotification.error({
            title: '生成失败',
            message: '请为试卷命名。',
            duration: 2000,
        });
        return;
    }


    // 验证分数是否设置
    for (let question of basket.value) {
        if (question.type === 'big') {
            for (let sub of question.subQuestions) {
                if (!sub.score || sub.score <= 0) {
                    ElNotification.error({
                        title: '生成失败',
                        message: '请为所有小题设置有效分数。',
                        duration: 2000,
                    });
                    return;
                }
            }
        } else {
            if (!question.score || question.score <= 0) {
                ElNotification.error({
                    title: '生成失败',
                    message: '请为所有题目设置有效分数。',
                    duration: 2000,
                });
                return;
            }
        }
    }



    // 构建请求数据
    const paperData = {
        name: paperName.value,
        creatorId: store.state.user.id,  // 假设用户ID在 Vuex 中
        totalScore: totalScore.value,
        difficulty: difficultyCoefficient.value,
        questions: basket.value.map((question, index) => ({
            id: question.id,
            type: (question.type === 'big') ? 'big' : 'small',
            sequence: index + 1,
            score: question.type === 'big'
                    ? question.subQuestions.reduce((sum, sub) => sum + (sub.score || 0), 0)  // 小题的分数加起来作为大题分数
                    : question.score,
            ...(question.type === 'big' && {
                subScores: question.subQuestions.map(sub => sub.score), // 直接用 sub-score 数组传回
            }),
        })),
    };


    try {
        // 发送 POST 请求
        const response = await axios.post('/api/teacher/generate-paper', paperData);

        // 处理响应
        if (response.status === 200) {
            ElNotification.success({
                title: '生成成功',
                message: '试卷已成功生成。',
                duration: 2000,
            });

        } else {
            ElNotification.error({
                title: '生成失败',
                message: response.data.message || '未知错误',
                duration: 2000,
            });
        }
    } catch (error) {
        ElNotification.error({
            title: '生成失败',
            message: '试卷生成失败，请稍后再试。',
            duration: 2000,
        });
        console.error(error);
    }
};

// 重新生成试卷的逻辑
const regeneratePaper = async () => {
    isLoading.value=true;
    try {
        const response = await axios.get('/api/teacher/paper/auto', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 200 && response.data) {
            const data = response.data;

            // 处理 bigQuestions
            const processedBigQuestions = await Promise.all(
                    (data.bigQuestions || []).map(async (bigQuestion) => ({
                        ...bigQuestion,
                        showExplanation: false, // 默认不显示解析
                        body: await replaceImageSrc(bigQuestion.body),
                        subQuestions: await Promise.all(
                                (bigQuestion.subQuestions || []).map(async (sub) => ({
                                    ...sub,
                                    showExplanation: false, // 默认不显示解析
                                    content: await replaceImageSrc(sub.content),
                                    options: sub.options || [],
                                    score: 1
                                }))
                        )
                    }))
            );

            // 处理 questions
            const processedQuestions = await Promise.all(
                    (data.questions || []).map(async (question) => ({
                        ...question,
                        showExplanation: false, // 默认不显示解析
                        content: await replaceImageSrc(question.content),
                        options: question.options || [],
                        score: 1
                    }))
            );

            // 处理 essay
            const processedEssay = data.essay ? {
                ...data.essay,
                showExplanation: false, // 默认不显示解析
                content: await replaceImageSrc(data.essay.content),
                options: data.essay.options || [],
                score: 1
            } : null;

            // 清空现有试题篮
            await store.dispatch('clearBasket');

            // 构建试题篮数据
            const basketQuestions = [
                ...processedQuestions.map(q => ({
                    id: q.id, // 确保唯一性，可以根据实际数据调整
                    type: q.type || 'small',
                    content: q.content,
                    answer: q.answer,
                    explanation: q.explanation,
                    options: q.options,
                    score: 1, // 初始化分数
                    difficulty: q.difficulty || 0,
                    knowledgePoint: q.knowledgePoint || ''
                })),
                ...processedBigQuestions.map(bq => ({
                    id: bq.id, // 确保唯一性，可以根据实际数据调整
                    type: 'big',
                    body: bq.body,
                    subQuestions: bq.subQuestions.map(sub => ({
                        id: sub.id, // 确保唯一性
                        content: sub.content,
                        answer: sub.answer,
                        explanation: sub.explanation,
                        options: sub.options,
                        score: 1, // 初始化分数
                        knowledgePoint: sub.knowledgePoint || '',
                        difficulty: sub.difficulty || 0,
                    })),
                    score: 0, // 可以根据子题分数计算
                    difficulty: bq.difficulty || 0,
                    knowledgePoint: bq.knowledgePoint || ''
                }))
            ];
            // 添加 essay 题目到试题篮
            if (processedEssay) {
                basketQuestions.push({
                    id: processedEssay.id, // 确保唯一性
                    type: 'essay',
                    content: processedEssay.content,
                    answer: processedEssay.answer,
                    explanation: processedEssay.explanation,
                    options: processedEssay.options,
                    score: processedEssay.score,
                    difficulty: processedEssay.difficulty || 0,
                    knowledgePoint: processedEssay.knowledgePoint
                });
            }

            // 将试题添加到试题篮
            basketQuestions.forEach(question => {
                store.dispatch('addQuestionToBasket', question);
            });

            ElNotification.success({
                title: '重新生成成功',
                message: '试卷已成功重新生成并添加到试题篮。',
                duration: 2000,
            });

            // 跳转到预览页面
            router.push('/teacher/preview-paper/auto');
        } else {
            ElNotification.error({
                title: '重新生成失败',
                message: response.data.message || '试卷重新生成失败。',
                duration: 2000,
            });
        }
    } catch (error) {
        ElNotification.error({
            title: '生成失败',
            message: '试卷生成失败，请稍后再试。',
            duration: 2000,
        });
        console.error(error);
    }
    isLoading.value=false;
};

// 辅助函数：替换图片路径
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
                    img.setAttribute('src', '/path/to/placeholder.png'); // 设置占位图路径
                }
            } catch (error) {
                console.error(`获取图片失败: ${imageUrl}`, error);
                // 设置占位图
                img.setAttribute('src', '/path/to/placeholder.png'); // 设置占位图路径
            }
        }
    });

    // 等待所有图片替换完成
    await Promise.all(replacePromises);

    return tempDiv.innerHTML;
};


// 在脚本部分添加
onMounted(() => {

    imageCache.forEach((blobUrl) => {
        URL.revokeObjectURL(blobUrl);
    });

    regeneratePaper();

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
    margin-right: 100px;
    margin-left: 100px;
    background-color: #f0f0f0; /* 背景改为浅灰色 */
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

}

.sub-question {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-bottom: 0;
}

.explanation {
    font-style: italic; /* 设置斜体 */
    color: #96a8e7; /* 设置灰色 */
    margin-top: 10px;
    padding: 10px;
    background-color: #f9f9f9;
    border-left: 3px solid #babcec;
}

.action-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 0;
}

.action-buttons input[type="number"] {
    width: 100px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
}



/* 固定右上和右下内容部分样式 */

.right-content {
    display: flex;
    flex-direction: column;
    flex: 1; /* 让右侧内容区的每个子项占据空间 */
    gap: 20px;
    background-color: #a2bbe7;
}

.right-content.top {
    position: fixed;
    top: 100px;
    right: 100px;
    display: flex;
    gap: 10px;
    background-color: #fffbe8;
    padding: 10px;
    width: 300px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.right-content.bottom {
    position: fixed;
    bottom: 100px;
    right: 100px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    background-color: #fffbe8;
    padding: 10px;
    width: 300px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}



.right-content.top button,
.right-content.bottom button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.regenerate-button {
    background-color: #67c23a; /* 重新生成按钮的颜色 */
    color: white;
}
.return-button {
    background-color: #f89e44;
    color: white;
    margin-top: 10px;
}

.return-button:hover {
    background-color: #ecaa69;
}

.toggle-explanation-button {
    background-color: #409EFF; /* 查看解析按钮的颜色 */
    color: white;
}

.regenerate-button:hover {
    background-color: #85d587;
}

.toggle-explanation-button:hover {
    background-color: #66b1ff;
}

.paper-name {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
}

.paper-name label {
    margin-bottom: 5px;
    font-weight: bold;
}

.paper-name input {
    padding: 5px 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}



.generate-button {
    background-color: #67c23a;
    color: white;
    margin-top: 10px;
}

.generate-button:hover {
    background-color: #85d587;
}

.right-content.bottom p {
    font-size: 16px;
    margin: 5px 0;
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

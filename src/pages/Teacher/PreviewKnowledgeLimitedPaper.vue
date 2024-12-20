<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header/>
        <div class="main-container">
            <!-- 内容区 -->
            <div class="content">
                <h2>试卷预览</h2>

                <div class="question-list">
                    <div v-for="(question, index) in basket" :key="question.id" :class="['question-item', { 'essay': question.type === 'essay' }]">
                        <!-- 大题渲染 -->
                        <div v-if="question.type === 'big'">
                            <strong>题目 {{ index + 1 }} ({{question.score}}分): <span v-html="question.body"></span></strong>
                            <div class="sub-questions">
                                <div v-for="(sub, subIndex) in question.subQuestions" :key="sub.id" class="sub-question">
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
                                                min="0"
                                                placeholder="设置分数"
                                        />
                                    </div>

                                    <div v-if="showExplanations" class="explanation">
                                        <p><strong>答案：</strong>{{ sub.answer }}</p>
                                        <p><strong>解析：</strong>{{ sub.explanation }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 小题渲染 -->
                        <div v-else-if="question.type !== 'ESSAY'">
                            <strong>
                                题目 {{ index + 1 }} ({{question.score}}分):
                                <!-- 如果有题干，紧跟在序号后面显示题干 -->
                                <span v-if="question.body" v-html="question.body"></span> <!-- 修改此处，从 content 改为 body -->
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

                                <div v-if="showExplanations" class="explanation">
                                    <p><strong>答案：</strong>{{ question.answer }}</p>
                                    <p><strong>解析：</strong>{{ question.explanation }}</p>
                                </div>
                            </div>
                            <!-- 分数选择器 -->
                            <div class="action-buttons">
                                <p><strong>分值:</strong></p>
                                <input
                                        type="number"
                                        v-model.number="question.score"
                                        min="0"
                                        placeholder="设置分数"
                                />
                            </div>
                        </div>

                        <!-- 论文题目渲染 -->
                        <div v-else-if="question.type === 'ESSAY'">
                            <strong>论文题目 {{ index + 1 }} ({{ question.score }}分): <span v-html="question.content"></span></strong>

                            <div v-if="showExplanations" class="explanation">
                                <p><strong>答案：</strong>{{ question.answer }}</p>
                                <p><strong>解析：</strong>{{ question.explanation }}</p>
                            </div>

                            <!-- 分数选择器 -->
                            <div class="action-buttons">
                                <p><strong>分值:</strong></p>
                                <input
                                        type="number"
                                        v-model.number="question.score"
                                        min="0"
                                        placeholder="设置分数"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 固定右上和右下内容部分 -->
            <div class="right-content top">
                <button @click="regeneratePaper" class="regenerate-button">重新生成</button>
                <button @click="toggleExplanations" class="toggle-explanation-button">
                    {{ showExplanations ? '隐藏解析' : '查看解析' }}
                </button>
                <!-- 新增：重新设置知识点按钮 -->
                <button @click="resetKnowledgePoints" class="reset-knowledge-button">重新设置知识点</button>
            </div>
            <div class="right-content bottom">
                <div class="paper-name">
                    <label for="paperName">试卷命名：</label>
                    <input type="text" id="paperName" v-model="paperName" placeholder="请输入试卷名称"
                           style="width: 280px; margin-top: 10px"/>
                </div>
                <p>题目数量：{{ questionCount }}</p>
                <p>试卷总分：{{ totalScore }}</p>
                <p>难度系数：{{ difficultyCoefficient }}</p>

                <button @click="generatePaper" class="generate-button">生成试卷</button>
                <button @click="returnToPaperList" class="return-button">返回选择出卷界面</button>
            </div>
        </div>

        <!-- 知识点选择弹窗 -->
        <el-dialog
                title="选择知识点大类及设定题目数量"
                v-model="knowledgePointModalVisible"
                width="50%"
                @close="handleModalClose"
        >
            <div v-for="(points, category) in knowledgePoints" :key="category" class="knowledge-point-category">
                <el-checkbox
                        v-model="selectedCategories"
                        :label="category"
                        @change="handleCategoryChange(category)"
                >
                    {{ category }}
                </el-checkbox>

                <div class="action-buttons">
                    <p v-if="selectedCategories.includes(category)"><strong>题目数量:</strong></p>
                    <input
                            v-if="selectedCategories.includes(category)"
                            v-model.number="selectedNumbers[category]"
                            type="number"
                            min="1"
                            placeholder="设置题目数量"
                            style="margin-left: 20px;"
                    />
                </div>

            </div>
            <span slot="footer" class="dialog-footer">
        <el-button @click="handleModalCancel">取消</el-button>
        <el-button type="primary" @click="confirmKnowledgePoints">确认</el-button>
      </span>
        </el-dialog>
    </div>
</template>

<script setup>
import Header from "@/components/Header.vue";
import { computed, ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { ElNotification, ElMessage } from "element-plus";
import axios from "axios";
import { onBeforeUnmount } from "vue-demi";
const imageCache = [];

// 获取 Vuex Store 和 Router 实例
const store = useStore();
const router = useRouter();
const route = useRoute();

// 获取认证 Token
const token = store.getters.getToken;

// 状态变量
const showExplanations = ref(false); // 控制是否显示解析
const paperName = ref(''); // 试卷名称

// 新增：知识点选择弹窗相关状态
const knowledgePointModalVisible = ref(false); // 控制弹窗显示
const knowledgePoints = ref({}); // 存储从API获取的知识点
const selectedCategories = ref([]); // 选中的知识点大类
const selectedNumbers = ref({}); // 选中的知识点大类对应的题目数量
const savedKnowledgePoints = ref({ types: [] }); // 保存最终选择的知识点

// 获取试卷篮中的题目
const basket = computed(() => store.getters.getBasket);

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
                total += (Number(sub.score) || 0) * (question.difficulty || 0);
            });
        } else {
            total += (Number(question.score) || 0) * (question.difficulty || 0);
        }
    });
    return (total / totalScore.value).toFixed(2);
});

// 监视试卷篮中的变化，初始化分数
const initializeScores = () => {
    basket.value.forEach(question => {
        if (question.type === 'big') {
            let totalSubScore = 0;
            question.subQuestions.forEach(sub => {
                if (sub.score === undefined) sub.score = 0;
                totalSubScore += Number(sub.score) || 0;
            });
            question.score = totalSubScore; // 更新大题的分数
        } else {
            if (question.score === undefined) question.score = 0;
        }
    });
};
initializeScores();

// 监视试卷篮变化，重新初始化分数
watch(basket, () => {
    initializeScores();
});
// 新增：监听 basket 的变化，动态更新大题的分数
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
        { deep: true } // 深度监听，以便监听嵌套的 subQuestions
);


// 计算题目数量（大题算1题）
const questionCount = computed(() => {
    return basket.value.length;
});

// 切换显示解析
const toggleExplanations = () => {
    showExplanations.value = !showExplanations.value;
};

// 新增：获取知识点列表
const fetchKnowledgePoints = async () => {
    try {
        const teacherId = store.state.user.id; // 假设用户ID在 Vuex 中
        const response = await axios.get(`/api/teacher/${teacherId}/list-knowledge-point`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 200 && response.data.knowledgePoints) {
            knowledgePoints.value = response.data.knowledgePoints;
            // 自动打开弹窗
            knowledgePointModalVisible.value = true;
        } else {
            ElNotification.error({
                title: '获取失败',
                message: response.data.message || '无法获取知识点信息。',
                duration: 2000,
            });
        }
    } catch (error) {
        ElNotification.error({
            title: '请求失败',
            message: '无法连接服务器，请稍后再试。',
            duration: 2000,
        });
        console.error(error);
    }
};

// 新增：处理大类选择变化
const handleCategoryChange = (category) => {
    if (!selectedCategories.value.includes(category)) {
        delete selectedNumbers.value[category];
    } else {
        if (!selectedNumbers.value[category]) {
            selectedNumbers.value[category] = 1; // 默认数量
        }
    }
};

// 新增：确认选择知识点
const confirmKnowledgePoints = async () => {
    if (selectedCategories.value.length === 0) {
        ElMessage.warning('请至少选择一个知识点大类。');
        return;
    }

    // 构建请求数据
    const types = selectedCategories.value.map(category => ({
        type: category,
        number: selectedNumbers.value[category] || 1
    }));

    console.log(types);

    try {
        const response = await axios.post('/api/teacher/generate-paper-with-types',  {types} );

        if (response.status === 200 && response.data.questions) {
            const data = response.data;
            console.log('后端返回',data);

            // 处理 questions
            const processedQuestions = await Promise.all(
                    (data.questions || []).map(async (question) => ({
                        ...question,
                        showExplanation: false, // 默认不显示解析
                        body: await replaceImageSrc(question.body), // 修改此处，使用 body 处理图片
                        options: question.options || [],
                        score: 0,
                        subQuestions: question.subQuestions || [],
                        difficulty: question.difficulty || 0,
                        knowledgePoint: question.knowledgePoint || ''
                    }))
            );

            // 处理 essays
            const processedEssays = await Promise.all(
                    (data.essays || []).map(async (essay) => ({
                        ...essay,
                        showExplanation: false,
                        content: await replaceImageSrc(essay.content),
                        score: 0,
                        difficulty: essay.difficulty || 0,
                        knowledgePoint: essay.knowledgePoint || ''
                    }))
            );

            // 清空现有试题篮
            await store.dispatch('clearBasket');

            // 构建试题篮数据
            const basketQuestions = [
                ...processedQuestions.map(q => ({
                    id: q.id, // 确保唯一性，使用 'big-' 前缀
                    type: q.type || 'big', // 确保大题类型
                    body: q.body, // 使用 body 属性
                    answer: q.answer,
                    explanation: q.explanation,
                    options: q.options,
                    score: q.score, // 已初始化为0
                    difficulty: q.difficulty,
                    knowledgePoint: q.knowledgePoint,
                    subQuestions: q.subQuestions.map(sub => ({
                        ...sub,
                        score: 0, // 初始化分数
                        difficulty: q.difficulty,
                        knowledgePoint: sub.knowledgePoint
                    }))
                })),
                ...processedEssays.map(e => ({
                    id: e.id,
                    type: e.type,
                    content: e.content,
                    answer: e.answer,
                    explanation: e.explanation,
                    options: e.options,
                    score: e.score,
                    difficulty: e.difficulty,
                    knowledgePoint: e.knowledgePoint
                }))
            ];

            // 将试题添加到试题篮
            basketQuestions.forEach(question => {
                store.dispatch('addQuestionToBasket', question);
            });
            const ba = store.getters.getBasket;
            console.log('ba',ba);

            ElNotification.success({
                title: '生成成功',
                message: '试卷题目已成功生成并添加到试题篮。',
                duration: 2000,
            });

            // 关闭弹窗
            knowledgePointModalVisible.value = false;

            // 保存选择的知识点，用于重新生成
            savedKnowledgePoints.value = { types };

            // 跳转到预览页面（如果需要）
            // router.push('/teacher/preview-paper/auto');
        }else if(response.status === 200){
            ElNotification.warning({
                title: '抱歉',
                message: '此知识点题库中暂无题目',
                duration: 2000,
            });
        }
        else {
            ElNotification.error({
                title: '生成失败',
                message: response.data.message || '试卷题目生成失败。',
                duration: 2000,
            });
        }
    } catch (error) {
        ElNotification.error({
            title: '请求失败',
            message: '无法连接服务器，请稍后再试。',
            duration: 2000,
        });
        console.error(error);
    }
};

// 新增：处理弹窗关闭
const handleModalCancel = () => {
    // 如果需要，可以在取消时执行一些操作
    knowledgePointModalVisible.value = false;
};

// 修改 regeneratePaper 以使用 savedKnowledgePoints
const regeneratePaper = async () => {
    if (!savedKnowledgePoints.value.types || savedKnowledgePoints.value.types.length === 0) {
        // 如果没有保存的知识点选择，提示用户选择
        ElMessage.warning('请先选择知识点大类并设定数量。');
        knowledgePointModalVisible.value = true;
        return;
    }

    try {
        const response = await axios.post('/api/teacher/generate-paper-with-types', savedKnowledgePoints.value, {
            headers: {
                'Content-Type': 'application/json', // 确保请求头正确
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 200 && response.data.questions) {
            const data = response.data;
            console.log(data);

            // 处理 questions
            const processedQuestions = await Promise.all(
                    (data.questions || []).map(async (question) => ({
                        ...question,
                        showExplanation: false, // 默认不显示解析
                        body: await replaceImageSrc(question.body), // 修改此处，使用 body 处理图片
                        options: question.options || [],
                        score: 0,
                        subQuestions: question.subQuestions || [], // 确保 subQuestions 存在
                        difficulty: question.difficulty || 0,
                        knowledgePoint: question.knowledgePoint || ''
                    }))
            );

            // 处理 essays
            const processedEssays = await Promise.all(
                    (data.essays || []).map(async (essay) => ({
                        ...essay,
                        showExplanation: false,
                        content: await replaceImageSrc(essay.content),
                        score: 0,
                        difficulty: essay.difficulty || 0,
                        knowledgePoint: essay.knowledgePoint || ''
                    }))
            );

            // 清空现有试题篮
            await store.dispatch('clearBasket');

            // 构建试题篮数据
            const basketQuestions = [
                ...processedQuestions.map(q => ({
                    id: `big-${q.id}`, // 确保唯一性，使用 'big-' 前缀
                    type: q.type || 'big', // 确保大题类型
                    body: q.body, // 使用 body 属性
                    answer: q.answer,
                    explanation: q.explanation,
                    options: q.options,
                    score: q.score, // 已初始化为0
                    difficulty: q.difficulty,
                    knowledgePoint: q.knowledgePoint,
                    subQuestions: q.subQuestions.map(sub => ({
                        ...sub,
                        score: 0, // 初始化分数
                        difficulty: q.difficulty,
                        knowledgePoint: sub.knowledgePoint
                    }))
                })),
                ...processedEssays.map(e => ({
                    id: `essay-${e.id}`,
                    type: e.type,
                    content: e.content,
                    answer: e.answer,
                    explanation: e.explanation,
                    options: e.options,
                    score: e.score,
                    difficulty: e.difficulty,
                    knowledgePoint: e.knowledgePoint
                }))
            ];

            // 将试题添加到试题篮
            basketQuestions.forEach(question => {
                store.dispatch('addQuestionToBasket', question);
            });

            ElNotification.success({
                title: '重新生成成功',
                message: '试卷已成功重新生成并添加到试题篮。',
                duration: 2000,
            });

            // 跳转到预览页面（如果需要）
            // router.push('/teacher/preview-paper/auto');
        } else {
            ElNotification.error({
                title: '重新生成失败',
                message: response.data.message || '试卷重新生成失败。',
                duration: 2000,
            });
        }
    } catch (error) {
        ElNotification.error({
            title: '请求失败',
            message: '无法连接服务器，请稍后再试。',
            duration: 2000,
        });
        console.error(error);
    }
};

// 新增：重置知识点选择
const resetKnowledgePoints = () => {
    // 清空已保存的知识点选择
    savedKnowledgePoints.value = { types: [] };
    selectedCategories.value = [];
    selectedNumbers.value = {};
    // 重新打开弹窗选择
    knowledgePointModalVisible.value = true;
};

// 在组件挂载时获取知识点
onMounted(() => {
    fetchKnowledgePoints();
});

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
                    // 缓存 Blob URL
                    imageCache.push(blobUrl);
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
onBeforeUnmount(() => {
    imageCache.forEach((blobUrl) => {
        URL.revokeObjectURL(blobUrl);
    });
});

const returnToPaperList = () => {
    store.dispatch('clearBasket');
    router.push('/teacher/test-generation-strategy'); // 根据实际路由调整
};
// 新增：generatePaper 函数
const generatePaper = async () => {
    if (!paperName.value.trim()) {
        ElMessage.warning('请填写试卷名称。');
        return;
    }

    // 构建请求数据
    const payload = {
        name: paperName.value,
        creatorId: store.state.user.id, // 假设用户ID在 Vuex 中
        totalScore: totalScore.value,
        difficulty: difficultyCoefficient.value,
        questions: []
    };

    // 构建 questions 数组
    let sequence = 1;
    basket.value.forEach(question => {
        if (question.type === 'big') {
            // 添加大题
            payload.questions.push({
                id: question.id,
                type: 'big',
                sequence: sequence++,
                score: question.score,
                subScores: question.subQuestions.map(sub => sub.score) // 添加 subScores 数组
            });


        } else if (question.type === 'essay') {
            // 添加作文题
            payload.questions.push({
                id: question.id,
                type: 'small',
                sequence: sequence++,
                score: question.score
            });
        } else {
            // 添加小题
            payload.questions.push({
                id: question.id,
                type: 'small', // 所有非 big 类型题目设置为 'small'
                sequence: sequence++,
                score: question.score
            });
        }
    });
    console.log(payload);

    try {
        const response = await axios.post('/api/teacher/generate-paper', payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 200 && response.data.message === 'success') {
            ElNotification.success({
                title: '生成成功',
                message: '试卷已成功生成。',
                duration: 2000,
            });
            // 你可以在这里执行其他操作，比如跳转到试卷列表页面
        } else {
            ElNotification.error({
                title: '生成失败',
                message: response.data.message || '试卷生成失败。',
                duration: 2000,
            });
        }
    } catch (error) {
        ElNotification.error({
            title: '请求失败',
            message: '无法连接服务器，请稍后再试。',
            duration: 2000,
        });
        console.error(error);
    }
};

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

.question-item.essay {
    background-color: #fffbe6; /* 浅黄色背景 */
    border-left: 4px solid #ffec3d; /* 左侧黄色边框 */
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
    margin-left: 20px;
}

.right-content.top {
    position: fixed;
    top: 100px;
    right: 100px;
    display: flex;
    flex-direction: column;
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

.toggle-explanation-button {
    background-color: #409EFF; /* 查看解析按钮的颜色 */
    color: white;
}

.reset-knowledge-button {
    background-color: #e6a23c; /* 重新设置按钮的颜色 */
    color: white;
}

.regenerate-button:hover {
    background-color: #85d587;
}

.toggle-explanation-button:hover {
    background-color: #66b1ff;
}

.reset-knowledge-button:hover {
    background-color: #d19b28;
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

.return-button {
    background-color: #f89e44;
    color: white;
    margin-top: 10px;
}

.return-button:hover {
    background-color: #ecaa69;
}

.right-content.bottom p {
    font-size: 16px;
    margin: 5px 0;
}

/* 新增：知识点选择弹窗样式 */
.knowledge-point-category {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}
</style>

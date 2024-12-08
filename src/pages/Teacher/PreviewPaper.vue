<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header />
        <div class="main-container">
            <div class="content">
                <h2>试卷预览</h2>
                <div class="question-list">
                    <div v-for="(question, index) in basket" :key="question.id" class="question-item">
                        <div v-if="question.type === 'big'">
                            <strong>大题 {{ index + 1 }}: {{ question.body }}</strong>
                            <div class="sub-questions">
                                <div v-for="(sub, subIndex) in question.subQuestions" :key="sub.id" class="sub-question">
                                    <p>{{ subIndex + 1 }}. {{ sub.question }}</p>
                                    <div v-if="showExplanations" class="explanation">
                                        <p><strong>答案：</strong>{{ sub.answer }}</p>
                                        <p><strong>解析：</strong>{{ sub.explanation }}</p>
                                    </div>
                                    <!-- 分数选择器和删除按钮紧跟在小题下面 -->
                                    <div class="action-buttons">
                                        <input
                                                type="number"
                                                v-model.number="sub.score"
                                                min="0"
                                                placeholder="设置分数"
                                        />
                                        <button @click="removeSubQuestion(question.id, sub.id)">删除该小题</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else>
                            <p>{{ index + 1 }}. {{ question.question }}</p>
                            <div v-if="showExplanations" class="explanation">
                                <p><strong>答案：</strong>{{ question.answer }}</p>
                                <p><strong>解析：</strong>{{ question.explanation }}</p>
                            </div>
                            <!-- 分数选择器和删除按钮紧跟在单题下面 -->
                            <div class="action-buttons">
                                <input
                                        type="number"
                                        v-model.number="question.score"
                                        min="0"
                                        placeholder="设置分数"
                                />
                                <button @click="removeQuestion(question.id)">删除该题</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 固定右上和右下内容部分 -->
            <div class="right-content top">

                <button @click="continueAdding">继续添加</button>
                <button @click="toggleExplanations">{{ showExplanations ? '隐藏解析' : '查看解析' }}</button>
            </div>
            <div class="right-content bottom">
                <div class="paper-name">
                    <label for="paperName">试卷命名：</label>
                    <input type="text" id="paperName" v-model="paperName" placeholder="请输入试卷名称" style="width: 280px"/>
                </div>
                <p>题目数量：{{ questionCount }}</p>
                <p>试卷总分：{{ totalScore }}</p>
                <p>难度系数：{{ difficultyCoefficient }}</p>
                <button @click="clearBasket">清空题目</button>
                <button @click="generatePaper">生成试卷</button>
            </div>
        </div>
    </div>
</template>



<script setup>
    import Header from "@/components/Header.vue";
    import { computed, ref, watch } from 'vue';
    import { useStore } from 'vuex';
    import { useRouter } from 'vue-router';

    const store = useStore();
    const router = useRouter();

    // 获取试卷篮中的题目
    const basket = computed(() => store.getters.getBasket);

    // 状态变量
    const showExplanations = ref(false); // 控制是否显示解析
    const paperName = ref(''); // 试卷名称

    // 监视试卷篮中的变化，初始化分数
    const initializeScores = () => {
    basket.value.forEach(question => {
        if (question.type === 'big') {
            question.subQuestions.forEach(sub => {
                if (sub.score === undefined) sub.score = 0;
            });
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

    // 计算题目数量（大题算1题）
    const questionCount = computed(() => {
    return basket.value.filter(q => q.type === 'big').length + basket.value.filter(q => q.type !== 'big').length;
});

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

    // 删除单题
    const removeQuestion = (id) => {
    store.dispatch('removeQuestionFromBasket', id);
};

    // 删除小题
    const removeSubQuestion = (parentId, subId) => {
    const parent = basket.value.find(q => q.id === parentId);
    if (parent) {
    parent.subQuestions = parent.subQuestions.filter(sub => sub.id !== subId);
    // 如果所有小题都被删除，移除整个大题
    if (parent.subQuestions.length === 0) {
    store.dispatch('removeQuestionFromBasket', parentId);
}
}
};

    // 清空试卷篮
    const clearBasket = () => {
    store.dispatch('clearBasket');
};

    // 继续添加，跳转回主页面
    const continueAdding = () => {
    router.push('/teacher/paper-creation/manual');
};

    // 切换显示解析
    const toggleExplanations = () => {
    showExplanations.value = !showExplanations.value;
};

    // 生成试卷的逻辑
    const generatePaper = () => {
    // 验证试卷名称
    if (!paperName.value.trim()) {
    alert('请为试卷命名。');
    return;
}

    // 验证分数是否设置
    for (let question of basket.value) {
    if (question.type === 'big') {
    for (let sub of question.subQuestions) {
    if (!sub.score || sub.score <= 0) {
    alert('请为所有小题设置有效分数。');
    return;
}
}
} else {
    if (!question.score || question.score <= 0) {
    alert('请为所有题目设置有效分数。');
    return;
}
}
}

    // 生成试卷的逻辑，例如发送请求到服务器或保存到本地
    // 这里以简单的 alert 作为示例
    alert(`试卷 "${paperName.value}" 已生成！`);

    // 可选：清空试卷篮或导航到其他页面
    // clearBasket();
    // router.push('/some-other-page');
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
}

.content {
    display: flex;
    flex-direction: column; /* 让内容和页脚垂直排列 */
    background-color: #ffffff;
    width: 75%;
    padding: 10px;
    margin-right: 20px;
}

.right {
    display: flex;
    flex-direction: column; /* 让右侧内容区域的子项垂直排列 */
    flex: 1; /* right 占据剩余空间 */
}

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
    background-color: #ffffff;
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
    background-color: #a2bbe7;
    padding: 10px;
    width: 300px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.right-content.top button:nth-child(1) {
    background-color: #f56c6c; /* 继续添加按钮的颜色 */
    color: white;
}

.right-content.top button:nth-child(2) {
    background-color: #409EFF; /* 查看解析按钮的颜色 */
    color: white;
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
    margin-top: 10px;
}

.sub-question {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 10px;
}

.explanation {
    margin-top: 10px;
    padding: 10px;
    background-color: #f9f9f9;
    border-left: 3px solid #409EFF;
}

.action-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

.action-buttons input[type="number"] {
    width: 100px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.action-buttons button {
    padding: 5px 10px;
    background-color: #f56c6c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.action-buttons button:hover {
    background-color: #d9363e;
}

/* 固定右上和右下内容部分样式 */
.right-content.top button,
.right-content.bottom button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.right-content.top button:first-child {
    background-color: #f56c6c;
    color: white;
}

.right-content.top button:nth-child(2) {
    background-color: #409EFF;
    color: white;
}

.right-content.top button:nth-child(3) {
    background-color: #66b1ff;
    color: white;
}

.right-content.top button:first-child:hover {
    background-color: #d9363e;
}

.right-content.top button:nth-child(2):hover {
    background-color: #66b1ff;
}

.right-content.top button:nth-child(3):hover {
    background-color: #409EFF;
}

.right-content.bottom p {
    font-size: 16px;
    margin: 5px 0;
}

.right-content.bottom button {
    background-color: #67c23a;
    color: white;
}

.right-content.bottom button:hover {
    background-color: #85d587;
}

.paper-name input {
    width: 100%;
    padding: 5px 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>

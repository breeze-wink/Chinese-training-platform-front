<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header/>
        <div class="main-container">
            <!-- 引入侧边栏通用组件 -->

            <!-- 内容区 -->
            <div class="content">
                <h2>试卷预览</h2>

                <div class="question-list">
                    <div v-for="(question, index) in basket" :key="question.id" class="question-item">
                        <div v-if="question.type === 'big'">
                            <strong>题目 {{ index + 1 }}({{question.score}}分): <span v-html="question.body"></span></strong>
                            <div class="sub-questions">
                                <div v-for="(sub, subIndex) in question.subQuestions" :key="sub.id"
                                     class="sub-question">
                                    <p>{{ subIndex + 1 }}. {{ sub.question }} ({{sub.score}}分)</p>

                                    <div v-if="sub.options && sub.options.length > 0" class="options">
                                        <p><strong>选项：</strong></p>
                                        <ul>
                                            <li v-for="(option, optionIndex) in sub.options" :key="optionIndex">
                                                {{ String.fromCharCode(65 + optionIndex) }}. {{ option }}
                                            </li>
                                        </ul>
                                    </div>

                                    <div v-if="showExplanations" class="explanation">
                                        <p><strong>答案：</strong>{{ sub.answer }}</p>
                                        <p><strong>解析：</strong>{{ sub.explanation }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else>

                            <strong>
                                题目{{ index + 1 }}
                              ({{question.score}}分) .
                                <!-- 如果有题干，紧跟在序号后面显示题干 -->
                                <span v-if="question.body" v-html="question.body"></span>
                                <!-- 如果没有题干，紧跟在序号后面显示问题 -->
                                <span v-if="!question.body" v-html="question.question"></span>
                            </strong>

                            <!-- 如果有题干，则将 sub.question 换行显示 -->
                            <p v-if="question.body" style="margin-left: 20px;">{{ question.question }}</p>
                            <div style="margin-left: 20px;">

                                <div v-if="question.options && question.options.length > 0" style="margin-left: 20px;">
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
                        </div>
                    </div>
                </div>
            </div>

            <!-- 固定右上和右下内容部分 -->
            <div class="right-content top">
                <button @click="toggleExplanations">{{ showExplanations ? '隐藏解析' : '查看解析' }}</button>
                <button @click="returnToPaperList">返回试卷列表</button>
            </div>
            <div class="right-content bottom">
                <p>试卷名称：{{ paperName }}</p>
                <p>试卷总分：{{ paperTotalScore }}</p>
                <p>难度系数：{{ difficultyCoefficient }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import Header from "@/components/Header.vue";
import Sidebar from "@/components/Sidebar.vue";
import { computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from "element-plus";

// 获取 Vuex Store
const store = useStore();
const router = useRouter();
const route = useRoute();

// 获取传递的试卷名称和难度系数（通过 route.query 传递）
const paperName = ref('');
const difficultyCoefficient = ref('');

// 在组件挂载时获取路由查询参数
onMounted(() => {
    const { name, difficulty, totalScore } = route.query;
    if (!name || !difficulty || !totalScore) {
        ElMessage.error('缺少试卷名称或难度系数参数。');
        router.push('/teacher/paper-management'); // 返回试卷管理界面
        return;
    }
    paperName.value = name;
    difficultyCoefficient.value = difficulty;
    paperTotalScore.value = totalScore;
});

// 获取试卷篮中的题目
const basket = computed(() => store.getters.getBasket);

// 状态变量
const showExplanations = ref(false); // 控制是否显示解析

// 计算试卷总分
const paperTotalScore = ref('');

// 切换显示解析
const toggleExplanations = () => {
    showExplanations.value = !showExplanations.value;
};

// 返回试卷列表
const returnToPaperList = () => {
    store.dispatch('clearBasket');
    router.push('/teacher/paper-manage'); // 根据实际路由调整
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

.paper-info {
    margin-bottom: 20px;
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
    font-style: italic; /* 设置斜体 */
    color: #96a8e7; /* 设置灰色 */
    margin-top: 10px;
    padding: 10px;
    background-color: #f9f9f9;
    border-left: 3px solid #babcec;
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
</style>

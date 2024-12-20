<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header/>
        <div class="main-container">
            <div class="content">
                <h2>试卷预览</h2>
                <div class="question-list">
                    <div v-for="(question, index) in basket" :key="question.id" class="question-item">
                        <div v-if="question.type === 'big'">

                          <strong>题目 {{ index + 1 }}: <span v-html="question.body"></span></strong>
                            <div class="sub-questions">
                                <div v-for="(sub, subIndex) in question.subQuestions" :key="sub.id"
                                     class="sub-question">
                                    <p>{{ subIndex + 1 }}. {{ sub.question }}</p>

                                    <div v-if="sub.options && sub.options.length > 0" class="options">
                                        <p><strong>选项：</strong></p>
                                        <ul>
                                            <li v-for="(option, optionIndex) in sub.options" :key="optionIndex">
                                                {{ String.fromCharCode(65 + optionIndex) }}. {{ option }}
                                            </li>
                                        </ul>
                                    </div>


                                    <!-- 分数选择器和删除按钮紧跟在小题下面 -->
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
                        <div v-else>

                            <strong>
                                题目{{ index + 1 }}.
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

                            <!-- 分数选择器和删除按钮紧跟在单题下面 -->
                            <div class="action-buttons">
                                <p><strong>分值:</strong></p>
                                <input
                                        type="number"
                                        v-model.number="question.score"
                                        min="0"
                                        placeholder="设置分数"
                                />
                            </div>
                                <div v-if="showExplanations" class="explanation">
                                    <p><strong>答案：</strong>{{ question.answer }}</p>
                                    <p><strong>解析：</strong>{{ question.explanation }}</p>
                                </div>
                            </div>
                        </div>
                        <!-- 删除按钮放在卡片的右下角 -->
                        <div class="card-actions">
                            <button @click="removeQuestion(question.id)"  class="delete-button">删除该题</button>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 固定右上和右下内容部分 -->
            <div class="right-content top">

                <button @click="continueAdding">继续添加</button>

                <button @click="toggleExplanations">{{ showExplanations ? '隐藏解析' : '查看解析' }}</button>

                <el-popconfirm
                        title="确定要清空题目吗？"
                        @confirm="clearBasket"
                >
                    <template #reference>
                <button  >清空题目</button>
                    </template>
                </el-popconfirm>
            </div>
            <div class="right-content bottom">
                <div class="paper-name">
                    <label for="paperName">试卷命名：</label>
                    <input type="text" id="paperName" v-model="paperName" placeholder="请输入试卷名称"
                           style="width: 280px"/>
                </div>
                <p>题目数量：{{ questionCount }}</p>
                <p>试卷总分：{{ totalScore }}</p>
                <p>难度系数：{{ difficultyCoefficient }}</p>

                <button @click="generatePaper">生成试卷</button>
            </div>
        </div>
    </div>
</template>


<script setup>
import Header from "@/components/Header.vue";
import {computed, ref, watch} from 'vue';
import {useStore} from 'vuex';
import {useRouter} from 'vue-router';
import {ElNotification, ElPopconfirm} from "element-plus";
import axios from "axios";

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


const  generatePaper = async () => {
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
            id: question.type === 'big' ? question.id : question.id, // 根据题目类型判断使用的ID
            type: question.type === 'big' ? question.type : 'small' ,
            sequence: index + 1,
            score: question.type === 'big'
                    ? question.subQuestions.reduce((sum, sub) => sum + (sub.score || 0), 0)  // 小题的分数加起来作为大题分数
                    : question.score,
            // 可以根据需要进一步处理题目信息，例如处理小题等
            ...(question.type === 'big' && {
                subScores: question.subQuestions.map(sub => sub.score), // 直接用 sub-score 数组传回
            }),
        })),
    };

    console.log(paperData);

    try {
        // 发送 POST 请求
        const response = await axios.post('/api/teacher/generate-paper', paperData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // 处理响应
        if (response.status === 200) {
            ElNotification.success({
                title: '生成成功',
                message: '试卷已成功生成。',
                duration: 2000,
            });
            // 跳转或清空试卷篮等操作
            await store.dispatch('clearBasket');
            await router.push('/teacher/paper-creation/manual');  // 假设生成试卷后跳转到试卷列表页
        } else {
            ElNotification.error({
                title: '生成失败',
                message: response.data.message || '未知错误',
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

.card-actions {
    display: flex;
    justify-content: flex-end; /* 将内容对齐到右侧 */

}

.delete-button {
    background-color: #f56c6c;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.delete-button:hover {
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
    background-color: #67c23a;
    color: white;
}

.right-content.top button:nth-child(2) {
    background-color: #409EFF;
    color: white;
}
.right-content.top button:nth-child(3) {
    background-color:   #f56c6c;
    color: white;
}

.right-content.top button:first-child:hover {
    background-color: #85d587;
}

.right-content.top button:nth-child(2):hover {
    background-color: #66b1ff;
}

.right-content.top button:nth-child(3):hover {
    background-color: #d9363e;
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

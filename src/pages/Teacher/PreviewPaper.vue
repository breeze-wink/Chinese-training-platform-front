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
                                    <input type="number" v-model.number="sub.score" min="0" placeholder="设置分数" />
                                    <button @click="removeSubQuestion(question.id, sub.id)">删除该小题</button>
                                </div>
                            </div>
                        </div>
                        <div v-else>
                            <p>{{ index + 1 }}. {{ question.question }}</p>
                            <input type="number" v-model.number="question.score" min="0" placeholder="设置分数" />
                            <button @click="removeQuestion(question.id)">删除该题</button>
                        </div>
                    </div>
                </div>




            </div>
            <div class="content right">
                <div class="right-content top">
                    <button @click="clearBasket">清空题目</button>
                    <button @click="continueAdding">继续添加</button>
                </div>
                <div class="right-content bottom">
                    <p>题目数量：{{ questionCount }}</p>
                    <p>试卷总分：{{ totalScore }}</p>
                    <p>难度系数：{{ difficultyCoefficient }}</p>
                    <button @click="generatePaper">生成试卷</button>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>

import Header from "@/components/Header.vue";
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

// 获取试卷篮中的题目
const basket = computed(() => store.getters.getBasket);

// 为每个题目设置分数
const setScores = () => {
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
setScores();

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

// 生成试卷的逻辑
const generatePaper = () => {
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
    alert('试卷已生成！');
};

</script>


<style scoped>

.page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f0f0f0; /* 背景改为浅灰色 */

}

.main-container {
    display: flex;
    flex: 1;
    margin-right: 100px;
    margin-left: 100px;

}
.content{
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

}

.right-content.top {
    display: flex;
    gap: 10px;
}

.right-content.bottom {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.question-list {
    display: flex;
    flex-direction: column;
    gap: 20px;

}

.question-item {
    border: 1px solid #ddd;
    padding: 15px;
    border-radius: 8px;
    background-color: #fff;
}

.sub-questions {
    margin-left: 20px;
    margin-top: 10px;
}

.sub-question {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.question-item input[type="number"] {
    width: 60px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.question-item button {
    padding: 5px 10px;
    background-color: #f56c6c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.question-item button:hover {
    background-color: #d9363e;
}

.right-content.top button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.right-content.top button:first-child {
    background-color: #f56c6c;
    color: white;
}

.right-content.top button:last-child {
    background-color: #409EFF;
    color: white;
}

.right-content.top button:first-child:hover {
    background-color: #d9363e;
}

.right-content.top button:last-child:hover {
    background-color: #66b1ff;
}

.right-content.bottom p {
    font-size: 16px;
    margin: 5px 0;
}

.right-content.bottom button {
    padding: 10px 20px;
    background-color: #67c23a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.right-content.bottom button:hover {
    background-color: #85d587;
}
</style>
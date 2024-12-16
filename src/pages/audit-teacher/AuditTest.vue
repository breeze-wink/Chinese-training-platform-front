<template>
    <div class="page-container">
        <Header/>
        <div class="main-container">
            <Sidebar />
            <div class="content">
                <h2 class="title">题目审核</h2>
                <div v-if="loading" class="loading">加载中...</div>
                <div v-else-if="error" class="error">{{ error }}</div>
                <div v-else class="question-detail">
                    <form @submit.prevent="submitChanges" class="form-container">
                        <!-- 卡片：题目内容 -->
                        <div class="card">
                            <textarea
                                id="body"
                                v-model="question.body"
                                ref="bodyTextarea"
                                placeholder="请输入题目内容"
                                class="form-control large-textarea"
                                @input="adjustTextareaHeight"
                            ></textarea>
                        </div>

                        <!-- 卡片：选项 -->
                        <div v-if="question.options?.length" class="card">
                            <h3 class="card-title">选项</h3>
                            <ul class="option-list">
                                <li
                                    v-for="(option, index) in question.options"
                                    :key="index"
                                    class="option-item"
                                >
                                    <label>选项 {{ index + 1 }}：</label>
                                    <textarea
                                        v-model="question.options[index]"
                                        :ref="'optionTextarea' + index"
                                        class="form-control large-textarea"
                                        placeholder="输入选项内容"
                                        @input="adjustTextareaHeight"
                                    ></textarea>
                                </li>
                            </ul>
                        </div>

                        <!-- 卡片：子题 -->
                        <div v-if="question.subQuestions?.length" class="card">
                            <div
                                v-for="(subQ, index) in question.subQuestions"
                                :key="index"
                                class="sub-question"
                            >
                                <label :for="'subQContent' + index" class="card-title">子题内容：</label>
                                <textarea
                                    :id="'subQContent' + index"
                                    v-model="subQ.content"
                                    :ref="'subQContentTextarea' + index"
                                    placeholder="请输入子题内容"
                                    class="form-control large-textarea"
                                    @input="adjustTextareaHeight"
                                ></textarea>

                                <div class="two-column">
                                    <div>
                                        <label :for="'subQAnswer' + index" class="card-title">答案：</label>
                                        <textarea
                                            :id="'subQAnswer' + index"
                                            v-model="subQ.answer"
                                            :ref="'subQAnswerTextarea' + index"
                                            class="form-control large-textarea"
                                            placeholder="输入子题答案"
                                            @input="adjustTextareaHeight"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label :for="'subQKnowledgePoint' + index" class="card-title">知识点：</label>
                                        <textarea
                                            :id="'subQKnowledgePoint' + index"
                                            v-model="subQ.knowledgePoint"
                                            :ref="'subQKnowledgePointTextarea' + index"
                                            class="form-control large-textarea"
                                            placeholder="输入知识点"
                                            @input="adjustTextareaHeight"
                                        ></textarea>
                                    </div>
                                </div>

                                <label :for="'subQExplanation' + index" class="card-title">解释：</label>
                                <textarea
                                    :id="'subQExplanation' + index"
                                    v-model="subQ.explanation"
                                    :ref="el => setSubQExplanationRef(el, index)"
                                    placeholder="请输入解释"
                                    class="form-control large-textarea"
                                    @input="adjustTextareaHeight"
                                ></textarea>

                                <div v-if="subQ.options?.length" class="form-group options">
                                    <p class="section-title">选项：</p>
                                    <ul>
                                        <li
                                            v-for="(option, idx) in subQ.options"
                                            :key="idx"
                                        >
                                            <textarea
                                                v-model="subQ.options[idx]"
                                                :ref="'subQOptionTextarea' + index + '-' + idx"
                                                class="form-control large-textarea"
                                                placeholder="输入选项内容"
                                                @input="adjustTextareaHeight"
                                            ></textarea>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- 提交按钮 -->
                        <button type="submit" class="submit-btn">提交更改</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { ElNotification } from 'element-plus';
import { useStore } from 'vuex';
import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";

const route = useRoute();
const store = useStore();
const loading = ref(true);
const error = ref(null);
const question = ref({
    body: '', // 默认空内容
});
const bodyTextarea = ref(null); // 引用 body 的 textarea
const subQExplanationRefs = ref([])

onMounted(async () => {
    await fetchQuestion();
    await nextTick(() => {
        adjustAllTextareasHeight(); // 初始化时调整高度
    });
});

function setSubQExplanationRef(el, index) {
    if (el) {
        // 如果元素存在，则添加到 refs 数组中
        subQExplanationRefs.value[index] = el;
    }
}

async function fetchQuestion() {
    try {
        const token = store.getters['getToken'];
        const teacherId = store.state.user.id;
        const role = store.state.user.role;

        if (!token || !teacherId || role !== 'teacher') {
            throw new Error('缺少必要的认证信息或权限不足');
        }

        const response = await axios.get(`/api/teacher/get-question`, {
            params: {
                questionId: route.query.questionId,
                type: route.query.type,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            question.value = response.data;
            nextTick(() => {
                adjustBodyTextareaHeight(); // 初始化时根据内容调整高度
            });
        } else {
            throw new Error('获取题目失败');
        }
    } catch (err) {
        const errorMessage =
            err.response?.data?.message || err.message || '无法连接到服务器，请稍后再试';
        error.value = errorMessage;
        ElNotification.error({
            title: '错误',
            message: errorMessage,
        });
    } finally {
        loading.value = false;
    }
}

function adjustTextareaHeight(event) {
    const textarea = event.target;
    textarea.style.height = 'auto'; // 重置高度以便重新计算
    textarea.style.height = `${textarea.scrollHeight}px`; // 动态设置高度为内容高度
}

function adjustAllTextareasHeight() {
    // 调整单个 textarea 的高度
    if (bodyTextarea.value) {
        adjustTextareaHeight({ target: bodyTextarea.value });
    }

    // 调整 v-for 循环中生成的 textarea 的高度
    subQExplanationRefs.value.forEach((textarea, index) => {
        if (textarea) {
            adjustTextareaHeight({ target: textarea });
        }
    });

    // 如果有更多类型的 textarea，可以在这里继续添加类似的逻辑
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
.page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f0f0f0; /* 背景改为浅灰色 */
}

.main-container {
    display: flex;
    flex: 1;
}

.content {
    max-width: 1000px; /* 最大宽度为 1000px */
    width: 100%; /* 宽度在正常情况下可以随着窗口大小缩放 */
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin-right: 50px; /* 如果需要右侧留空隙，可以保留这行，或者可以根据实际情况调整 */
}

.title {
    font-size: 30px;
    font-weight: bold;
    /*color: #34495e;*/
    /*text-align: center;*/
    margin-bottom: 30px;
}

textarea {
    transition: height 0.2s ease, box-shadow 0.2s ease; /* 添加高度和阴影变化的过渡动画 */
}

textarea:focus {
    box-shadow: 0 0 8px rgba(52, 152, 219, 0.5); /* 聚焦时的阴影效果 */
    outline: none; /* 去掉默认的 outline */
}

/* 表单布局 */
.form-container {
    display: flex;
    flex-direction: column;
    /*gap: 40px; !* 调整题目与题目之间的间距 *!*/
}

/* 卡片样式 */
.card {
    background: #ffffff;
    padding: 30px;
    border-radius: 12px;
    border: 1px solid #e8e8e8;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-title {
    font-size: 22px;
    font-weight: 600;
    color: #2980b9;
    margin-bottom: 15px;
}

.sub-question {
    margin-bottom: 20px; /* 增加子题间距 */
    display: flex;
    flex-direction: column;
}

/* 表单控件 */
.form-label {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 10px;
}

.form-control {
    padding: 15px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 8px;
    width: 100%;
    background-color: #fff;
    box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px; /* 控件之间的间距 */
}

.large-textarea {
    width: 100%;
    font-size: 16px;
    line-height: 1.6; /* 增加行高 */
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 8px;
    resize: none; /* 禁止用户手动调整大小 */
    box-sizing: border-box; /* 包括内边距和边框 */
    overflow: hidden; /* 隐藏滚动条 */
    transition: height 0.2s ease; /* 高度变化时添加平滑过渡 */
}

.submit-btn {
    padding: 15px 40px; /* 调整左右填充使按钮更紧凑 */
    font-size: 18px;
    background: linear-gradient(90deg, #43cea2, #185a9d);
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(67, 206, 162, 0.3);
    transition: transform 0.2s, box-shadow 0.3s;
    text-align: center;
    align-self: center;
    margin-top: 20px;
    width: 200px; /* 设置固定宽度 */
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(67, 206, 162, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .two-column {
        flex-direction: column;
        gap: 20px;
    }
}
</style>

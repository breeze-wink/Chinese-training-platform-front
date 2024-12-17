<template>
    <div class="page-container">
        <Header />
        <div class="main-container">
            <Sidebar />
            <div class="content">
                <h2 class="title">题目审核</h2>
                <div v-if="loading" class="loading">加载中...</div>
                <div v-else-if="error" class="error">{{ error }}</div>
                <div v-else class="question-detail">
                    <form @submit.prevent="submitChanges" class="form-container">
                        <div v-if="question.body">
                            <!-- 显示 question.body 内容 -->
                            <div class="card">
                                <div v-html="question.body"></div>
                            </div>
                        </div>
                        <div v-else>
                            <!-- 初始显示状态 -->
                            <div v-if="!editMode.content">
                                <!-- 显示HTML内容 -->
                                <div v-html="question.content"></div>
                                <!-- 编辑按钮 -->
                                <div class="buttons-container d-flex justify-content-end">
                                    <button @click="toggleEdit('content')" class="edit-btn">进入编辑</button>
                                </div>
                            </div>

                            <!-- 编辑模式 -->
                            <div v-else>
                                <!-- 富文本编辑器 -->
                                <quill-editor
                                    v-model:content="question.content"
                                    contentType="html"
                                    @ready="onEditorReady"
                                    @change="onEditorChange"
                                    :options="editorOptions"
                                    @input="adjustTextareaHeight"
                                />
                                <!-- 保存按钮 -->
                                <div class="buttons-container d-flex justify-content-end">
                                    <button @click="toggleEdit('content')" class="edit-btn">保存</button>
                                </div>
                            </div>
                        </div>

                            <!-- 选项部分 -->
                        <div v-if="question.options?.length" class="card">
                            <h3 class="card-title">选项</h3>
                            <ul class="option-list">
                                <li
                                    v-for="(option, index) in question.options"
                                    :key="index"
                                    class="d-flex flex-column justify-content-start align-items-start w-100"
                                >
                                    <!-- 选项文本，占满整行 -->
                                    <div class="d-flex w-100">
                                        <span class="option-label me-2">{{ String.fromCharCode(65 + index) }}.</span>
                                        <div v-text="option" v-if="!editMode.options[index]" class="option-content flex-grow-1"></div>
                                        <textarea
                                            v-model="question.options[index]"
                                            class="form-control large-textarea w-100"
                                            placeholder="输入选项内容"
                                            @input="adjustTextareaHeight"
                                            v-if="editMode.options[index]"
                                        ></textarea>
                                    </div>

                                    <!-- 按钮放置在文本框的下方并靠右对齐 -->
                                    <div class="buttons-container mt-2">
                                        <button @click="toggleEdit('options', index)" class="edit-btn">
                                            {{ editMode.options[index] ? '保存' : '进入编辑' }}
                                        </button>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <!-- 子题部分 -->
                        <div v-if="question.subQuestions?.length" class="card">
                            <div
                                v-for="(subQ, index) in question.subQuestions"
                                :key="index"
                                class="sub-question"
                            >
                                <!-- 使用可选链操作符来安全访问 subQ 的属性 -->
                                <label :for="'subQContent' + index" class="card-title">子题内容：</label>
                                <div v-text="subQ?.content" v-if="!editMode.subQuestions[index]?.content"></div>
                                <textarea
                                    :id="'subQContent' + index"
                                    v-model="subQ.content"
                                    placeholder="请输入子题内容"
                                    class="form-control large-textarea"
                                    @input="adjustTextareaHeight"
                                    v-if="editMode.subQuestions[index]?.content"
                                ></textarea>
                                <div class="buttons-container d-flex justify-content-end">
                                    <button @click="toggleEdit('subQuestions', index, 'content')" class="edit-btn">{{ editMode.subQuestions[index]?.content ? '保存' : '进入编辑' }}</button>
                                </div>

                                <div v-if="subQ?.options?.length" class="form-group options">
                                    <h3 class="card-title">选项</h3>
                                    <ul>
                                        <li
                                            v-for="(option, optionIndex) in subQ.options"
                                            :key="optionIndex"
                                            class="d-flex justify-content-between align-items-start"
                                        >
                                            <span class="option-label me-2">{{ String.fromCharCode(65 + optionIndex) }}.</span>
                                            <div v-text="option" v-if="!editMode.subQuestions[index]?.options[optionIndex]"></div>
                                            <textarea
                                                v-model="subQ.options[optionIndex]"
                                                class="form-control large-textarea"
                                                placeholder="输入选项内容"
                                                @input="adjustTextareaHeight"
                                                v-if="editMode.subQuestions[index]?.options[optionIndex]"
                                            ></textarea>
                                            <div class="buttons-container d-flex justify-content-end">
                                                <button @click="toggleEdit('subQuestions', index, 'options', optionIndex)" class="edit-btn">{{ editMode.subQuestions[index]?.options[optionIndex] ? '保存' : '进入编辑' }}</button>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <div class="two-column">
                                    <div>
                                        <label :for="'subQAnswer' + index" class="card-title">答案：</label>
                                        <div v-text="subQ?.answer" v-if="!editMode.subQuestions[index]?.answer"></div>
                                        <textarea
                                            :id="'subQAnswer' + index"
                                            v-model="subQ.answer"
                                            class="form-control large-textarea"
                                            placeholder="输入子题答案"
                                            @input="adjustTextareaHeight"
                                            v-if="editMode.subQuestions[index]?.answer"
                                        ></textarea>
                                        <div class="buttons-container d-flex justify-content-end">
                                            <button @click="toggleEdit('subQuestions', index, 'answer')" class="edit-btn">{{ editMode.subQuestions[index]?.answer ? '保存' : '进入编辑' }}</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label :for="'subQKnowledgePoint' + index" class="card-title">知识点：</label>
                                        <div v-text="subQ.knowledgePoint" v-if="!editMode.subQuestions[index].knowledgePoint"></div>
                                        <textarea
                                            v-model="subQ.knowledgePoint"
                                            class="form-control large-textarea"
                                            placeholder="输入知识点"
                                            @input="adjustTextareaHeight"
                                            v-if="editMode.subQuestions[index].knowledgePoint"
                                            disabled
                                        ></textarea>
                                    </div>
                                </div>

                                <!-- 增加知识点与解释之间的间距 -->
                                <div style="height: 40px;"></div> <!-- 可以根据需要调整高度 -->

                                <label :for="'subQExplanation' + index" class="card-title">解释：</label>
                                <div v-text="subQ.explanation" v-if="!editMode.subQuestions[index].explanation"></div>
                                <textarea
                                    :id="'subQExplanation' + index"
                                    v-model="subQ.explanation"
                                    placeholder="请输入解释"
                                    class="form-control large-textarea"
                                    @input="adjustTextareaHeight"
                                    v-if="editMode.subQuestions[index].explanation"
                                ></textarea>
                                <div class="buttons-container d-flex justify-content-end">
                                    <button @click="toggleEdit('subQuestions', index, 'explanation')" class="edit-btn">{{ editMode.subQuestions[index].explanation ? '保存' : '进入编辑' }}</button>
                                </div>
                            </div>
                        </div>

                        <button type="submit" class="submit-btn">批准</button>
                        <button type="submit" class="submit-btn">驳回</button>
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
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";

const route = useRoute();
const store = useStore();
const loading = ref(true);
const error = ref(null);
const question = ref({
    body: '', // 默认空内容
    options: [],
    subQuestions: [],
});

// 编辑状态控制
const editMode = ref({
    body: false,
    content: false,
    options: [],
    subQuestions: []
});

const editorOptions = {
    theme: "snow",
    placeholder: "请输入题目内容",
    modules: {
        toolbar: [
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ header: [1, 2, 3, false] }],
            [{ align: [] }],
        ],
    },
};
// 初始化编辑状态
onMounted(() => {
    if (question.value.subQuestions?.length) {
        editMode.value.subQuestions = question.value.subQuestions.map(() => ({
            content: false,
            answer: false,
            knowledgePoint: false,
            explanation: false,
            options: []
        }));
    }
});

// 富文本编辑器内容变化时调整高度
function onEditorChange() {
    nextTick(() => adjustTextareaHeight({ target: document.querySelector(".ql-editor") }));
}

// 获取题目信息
onMounted(async () => {
    await fetchQuestion();
    await nextTick(() => {
        adjustAllTextareasHeight();
        if (question.value.subQuestions?.length) {
            editMode.value.subQuestions = question.value.subQuestions.map(() => ({
                content: false,
                answer: false,
                knowledgePoint: false,
                explanation: false,
                options: []
            }));
            // 更新每个子题的 options 编辑模式
            question.value.subQuestions.forEach((subQ, index) => {
                editMode.value.subQuestions[index].options = Array(subQ.options?.length || 0).fill(false);
            });
        }
    });
});

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
        });

        if (response.status === 200) {
            const questionData = response.data;

            if (!questionData || !questionData.content) {
                throw new Error('题目数据未找到');
            }

            question.value = {
                ...response.data,
                body: response.data.body,
                options: response.data.options || [],
                subQuestions: response.data.subQuestions?.map(subQ => ({
                    ...subQ,
                    options: subQ.options || []
                })) || []
            };
            nextTick(() => adjustAllTextareasHeight());
        } else {
            throw new Error('获取题目失败');
        }
    } catch (err) {
        let errorMessage = '';
        if (err.response) {
            if (err.response.status === 403) {
                errorMessage = '您没有权限访问该题目。请确认您的权限设置。';
            } else {
                errorMessage = err.response?.data?.message || err.message || '无法连接到服务器，请稍后再试';
            }
        } else {
            errorMessage = '无法连接到服务器，请稍后再试';
        }
        error.value = errorMessage;
        ElNotification.error({ title: '错误', message: errorMessage });
    } finally {
        loading.value = false;
    }
}

// 调整所有文本框高度
function adjustTextareaHeight(event) {
    const textarea = event.target;
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
}

function adjustAllTextareasHeight() {
    document.querySelectorAll("textarea").forEach(textarea => {
        adjustTextareaHeight({ target: textarea });
    });
}

// 编辑状态切换
function toggleEdit(section, index = null, field = null, optionIndex = null) {
    if (section === 'content') {
        // 切换 content 编辑模式
        editMode.value.content = !editMode.value.content;
    } else if (section === 'body') {
        editMode.value.body = !editMode.value.body;
    } else if (section === 'options') {
        editMode.value.options[index] = !editMode.value.options[index];
    } else if (section === 'subQuestions') {
        if (field === 'options') {
            editMode.value.subQuestions[index][field][optionIndex] =
                !editMode.value.subQuestions[index][field][optionIndex];
        } else {
            editMode.value.subQuestions[index][field] = !editMode.value.subQuestions[index][field];
        }
    }

    // 调整文本框高度
    nextTick(() => {
        adjustAllTextareasHeight();
    });
}

// 提交表单
function submitChanges() {
    // 处理提交逻辑
}
</script>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f0f0f0;
}

.main-container {
    display: flex;
    flex: 1;
}

.content {
    max-width: 1000px;
    width: 100%;
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin-right: 50px;
}

.title {
    font-size: 30px;
    font-weight: bold;
    margin-bottom: 30px;
}

textarea {
    transition: height 0.2s ease, box-shadow 0.2s ease;
}

textarea:focus {
    box-shadow: 0 0 8px rgba(52, 152, 219, 0.5);
    outline: none;
}

.form-container {
    display: flex;
    flex-direction: column;
    gap: 20px; /* 确保子项之间有合理的间距 */
}

.card {
    background: #ffffff;
    padding: 30px;
    border-radius: 12px;
    border: 1px solid #e8e8e8;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px; /* 确保卡片之间有足够的间距 */
}

.card-title {
    font-size: 22px;
    font-weight: 600;
    color: #2980b9;
    margin-bottom: 15px;
}

.sub-question {
    margin-bottom: 20px;
}

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
    margin-bottom: 20px;
}

.large-textarea {
    width: 100%;
    font-size: 16px;
    line-height: 1.6;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 8px;
    resize: none;
    box-sizing: border-box;
    overflow: hidden;
    transition: height 0.2s ease;
}

.two-column {
    gap: 20px; /* 确保两列之间有合理的间距 */
}

/* 新增样式，用于控制知识点与解释之间的间距 */
.spacer {
    height: 40px; /* 根据需要调整 */
}

.edit-btn {
    background-color: #3498db;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    margin-top: 10px;
}

.edit-btn:hover {
    background-color: #2980b9;
}

.submit-btn {
    padding: 15px 40px;
    font-size: 18px;
    background: linear-gradient(90deg, #43cea2, #185a9d);
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.3s;
    text-align: center;
    align-self: center;
    margin-top: 20px;
    width: 200px;
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(67, 206, 162, 0.5);
}

.d-flex {
    display: flex;
    width: 100%;
}

.w-100 {
    width: 100%;
}

.flex-grow-1 {
    flex-grow: 1; /* 让内容占据剩余空间 */
}

.justify-content-between {
    justify-content: flex-end;
}

.mt-2 {
    margin-top: 10px; /* 给按钮增加适当的上间距 */
}

.align-items-start {
    align-items: flex-start;
}

.justify-content-end {
    justify-content: flex-end;
}

.option-label {
    font-weight: bold;
}
.option-content {
    text-align: left;
}

.buttons-container {
    display: flex;
    justify-content: flex-end; /* 按钮对齐到右侧 */
    width: 100%; /* 确保按钮占据整行宽度 */
    margin-top: 15px;
}

@media (max-width: 768px) {
    .two-column {
        flex-direction: column;
        gap: 20px;
    }
}
</style>

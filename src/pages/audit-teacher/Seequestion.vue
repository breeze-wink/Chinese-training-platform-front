<template>
    <div class="page-container">
        <Header />
        <div class="main-container">
            <Sidebar />
            <div class="content">
                <h2 class="title">题目查看</h2>
                <div v-if="loading" class="loading">加载中...</div>
                <div v-else-if="error" class="error">{{ error }}</div>
                <div v-else class="question-detail">
                    <form @submit.prevent="submitChanges" class="form-container">
                        <div v-if="question.body">
                            <!-- 显示 question.body 内容 -->
                            <div class="card">
                                <div v-html="question.body"></div>
                                <hr class="section-divider" /> <!-- 分割线 -->
                            </div>
                        </div>

                        <div v-else>
                            <!-- 初始显示状态 -->
                            <div v-if="!editMode.content">
                                <!-- 显示HTML内容 -->
                                <div v-html="question.content"></div>
                                <hr class="section-divider" /> <!-- 分割线 -->
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
                                        <div class="option-label me-2">{{ String.fromCharCode(65 + optionIndex) }}. {{ option }}</div>
                                    </div>
                                </li>
                            </ul>
                            <hr class="section-divider" /> <!-- 分割线 -->
                        </div>

                        <!-- 答案部分 -->
                        <div class="card" v-if="question.answer">
                            <h3 class="card-title">答案</h3>
                            <div v-text="question.answer" v-if="!editMode.answer"></div>
                            <hr class="section-divider" /> <!-- 分割线 -->
                        </div>

                        <!-- 知识点部分 -->
                        <div class="card" v-if="question.knowledgePoint">
                            <h3 class="card-title">知识点</h3>
                            <div v-text="question.knowledgePoint" v-if="!editMode.knowledgePoint"></div>
                            <hr class="section-divider" /> <!-- 分割线 -->
                        </div>

                        <!-- 解释部分 -->
                        <div class="card" v-if="question.explanation">
                            <h3 class="card-title">解释</h3>
                            <div v-text="question.explanation" v-if="!editMode.explanation"></div>
                            <div class="buttons-container d-flex justify-content-end">
                            </div>
                            <hr class="section-divider" /> <!-- 分割线 -->
                        </div>

                        <!-- 题目类型部分 -->
                        <div class="card" v-if="question.type">
                            <h3 class="card-title">题目类型</h3>
                            <div v-if="!editMode.type">{{ getQuestionTypeLabel(question.type) }}</div>
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

                                <div v-if="subQ?.options?.length" class="form-group options">
                                    <h3 class="card-title">选项</h3>
                                    <ul>
                                        <li
                                                v-for="(option, optionIndex) in subQ.options"
                                                :key="optionIndex"
                                                class="d-flex justify-content-between align-items-start"
                                        >
                                            <div class="option-label me-2">{{ String.fromCharCode(65 + optionIndex) }}. {{ option }}</div>
                                        </li>
                                    </ul>
                                </div>

                                <hr class="section-divider" /> <!-- 分割线 -->

                                <div class="two-column">
                                    <div>
                                        <label :for="'subQAnswer' + index" class="card-title">答案：</label>
                                        <div v-text="subQ?.answer" v-if="!editMode.subQuestions[index]?.answer"></div>
                                    </div>

                                    <hr class="section-divider" /> <!-- 分割线 -->

                                    <div>
                                        <label :for="'subQKnowledgePoint' + index" class="card-title">知识点：</label>
                                        <div v-text="subQ.knowledgePoint" v-if="!editMode.subQuestions[index].knowledgePoint"></div>
                                    </div>
                                </div>
                                <!-- 增加知识点与解释之间的间距 -->
                                <div style="height: 40px;"></div> <!-- 可以根据需要调整高度 -->
                                <hr class="section-divider" /> <!-- 分割线 -->
                                <label :for="'subQExplanation' + index" class="card-title">解释：</label>
                                <div v-text="subQ.explanation" v-if="!editMode.subQuestions[index].explanation"></div>
                                <hr class="section-divider" /> <!-- 分割线 -->
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import {useRoute, useRouter} from 'vue-router';
import axios from 'axios';
import { ElMessageBox, ElNotification } from 'element-plus';
import { useStore } from 'vuex';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";
import { defineProps } from 'vue';

const route = useRoute();
const store = useStore();
const router = useRouter();
const source = route.query.source; // 获取 source 参数
const loading = ref(true);
const error = ref(null);
const id = ref(null);
const initialImages = ref([]); // 存储初始图片列表
const question = ref({
    body: '', // 默认空内容
    options: [],
    subQuestions: [],
    content: '',
    answer: '',
    explanation: '',
    type: '',
    knowledgePoint: '',
});

// 编辑状态控制
const editMode = ref({
    body: false,
    content: false,
    options: [],
    subQuestions: [],
    answer: false,
    explanation: false,
    type: false,
});

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

// 获取当前 HTML 中的图片列表
function extractImageList(htmlContent) {
    if (!htmlContent) return [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    return Array.from(tempDiv.querySelectorAll('img')).map(img => img.getAttribute('src'));
}

// 获取题目信息
onMounted(async () => {
    await fetchQuestion();
    initialImages.value = extractImageList(question.value.content);
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

function getQuestionTypeLabel(type) {
    const typeMapping = {
        CHOICE: '选择题',
        FILL_IN_BLANK: '填空题',
        SHORT_ANSWER: '简答题',
    };
    return typeMapping[type] || '未知类型'; // 默认值为“未知类型”
}

// 图片路径替换工具
async function replaceImageSrcUtil(htmlContent) {
    if (!htmlContent) return htmlContent;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    const images = tempDiv.querySelectorAll('img');

    const replacePromises = Array.from(images).map(async (img) => {
        const src = img.getAttribute('src');


        if (src && src.startsWith('/uploads/content/')) {
            const imageName = src.replace('/uploads/content/', '');
            const imageUrl = `/api/uploads/images/content/${imageName}`;


            const token = store.getters.getToken;

            if (!token) {
                console.error('Missing authentication token');
                return;
            }

            try {
                const response = await axios.get(imageUrl, {
                    responseType: 'blob',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    const blobUrl = URL.createObjectURL(response.data);

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
}

// 删除图片的 API 调用
async function deleteImage(type, imageName) {
    try {
        const token = store.getters.getToken;
        if (!token) {
            console.error('Missing authentication token');
            return;
        }

        const response = await axios.delete(`/api/uploads/image/${type}/${imageName}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200) {

        } else {
            console.error(`Failed to delete image: ${imageName}`);
        }
    } catch (error) {
        console.error(`Error deleting image: ${imageName}`, error);
    }
}

// 在保存内容时，比较初始图片列表与当前图片列表，并删除多余的图片
async function saveEditedContent() {
    const currentImages = extractImageList(question.value.content);
    const deletedImages = initialImages.value.filter(src => !currentImages.includes(src));


    // 删除已删除的图片
    for (const imageSrc of deletedImages) {
        if (imageSrc.startsWith('/uploads/content/')) {
            // const imageName = imageSrc.split('/').pop(); // 获取图片名称
            const imageName = imageSrc.match(/\/([^\/?#]+)(?:[?#]|$)/i)?.[1];
            await deleteImage('content', imageName);
        }
    }
    // 更新初始图片列表
    initialImages.value = currentImages;
}

// 加载题目中的图片
async function loadImagesForQuestions() {

    const promises = question.value.subQuestions.map(async (subQuestion) => {
        if (subQuestion.content) {

            subQuestion.content = await replaceImageSrcUtil(subQuestion.content);
        }
        if (subQuestion.body) {

            subQuestion.body = await replaceImageSrcUtil(subQuestion.body);
        }
    });

    // 处理主题的图片
    if (question.value.content) {

        question.value.content = await replaceImageSrcUtil(question.value.content);
    }
    if (question.value.body) {

        question.value.body = await replaceImageSrcUtil(question.value.body);
    }

    await Promise.all(promises);

    console.log('图片加载完成');
}

async function fetchQuestion() {
    try {
        const token = store.getters['getToken'];
        const teacherId = store.state.user.id;
        const role = store.state.user.role;

        if (!token || !teacherId || role !== 'audit-teacher') {
            const errorMessage = '缺少必要的认证信息或权限不足';
            ElNotification.error({ title: '错误', message: errorMessage });
            throw new Error(errorMessage);
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
            const questionData = response.data;

            // 验证返回的数据是否完整
            if (!questionData || (!questionData.content && !questionData.subQuestions)) {
                throw new Error('题目数据未找到或数据不完整');
            }

            question.value = {
                ...response.data,
                body: response.data.body,
                options: response.data.options || [],
                content: response.data.content,
                answer: response.data.answer,
                explanation: response.data.explanation,
                type: response.data.type,
                subQuestions: response.data.subQuestions?.map(subQ => ({
                    ...subQ,
                    options: subQ.options || []
                })) || []
            };

            // 在获取题目信息后加载图片
            await loadImagesForQuestions();

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
    background-color: #f0f0f0;
    margin-bottom: 30px;

}

.content {
    max-width: 1000px;
    width: 100%;
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin-right: 50px;
    margin-left: 300px;
}

.title {
    font-size: 28px; /* Increased title font size */
    font-weight: bold;
    margin-bottom: 15px; /* Reduced margin */
}

textarea {
    transition: height 0.2s ease, box-shadow 0.2s ease;
    font-size: 18px; /* Increased textarea font size */
}

textarea:focus {
    box-shadow: 0 0 8px rgba(52, 152, 219, 0.5);
    outline: none;
}

.form-container {
    display: flex;
    flex-direction: column;
    gap: 10px; /* Reduced gap between items */
}

.card {
    background: #ffffff;
    padding: 15px; /* Reduced padding */
    border-radius: 8px;
    border: 1px solid #e8e8e8;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 10px; /* Reduced margin between cards */
}

.card-title {
    font-size: 22px; /* Increased font size for card titles */
    font-weight: 600;
    color: #2980b9;
    margin-bottom: 8px; /* Reduced margin */
}

.sub-question {
    margin-bottom: 10px; /* Reduced margin between sub-questions */
}

.section-divider {
    border: 0;
    height: 1px;
    background: #dcdcdc;
    margin: 15px 0; /* Reduced margin around divider */
}

.custom-select {
    padding: 10px 15px;
    font-size: 16px;
    color: #333;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 6px;
    appearance: none;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.custom-select:hover {
    border-color: #aaa;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.custom-select:focus {
    border-color: #409eff;
    box-shadow: 0 0 8px rgba(64, 158, 255, 0.4);
}

.custom-select option {
    font-size: 14px;
    padding: 8px 10px;
}

.form-label {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px; /* Reduced margin */
}

.form-control {
    padding: 12px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 8px;
    width: 100%;
    background-color: #fff;
    box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 16px; /* Reduced margin bottom */
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
    gap: 15px; /* Reduced gap between columns */
}

.edit-btn {
    background-color: #3498db;
    color: white;
    padding: 12px 24px; /* Made buttons larger */
    border: none;
    border-radius: 6px; /* Rounded corners */
    cursor: pointer;
    font-size: 16px; /* Increased font size */
    margin-top: 12px; /* Increased space between buttons */
}

.edit-btn:hover {
    background-color: #2980b9;
}

.submit-btn {
    padding: 15px 40px;
    font-size: 20px; /* Increased font size */
    background: linear-gradient(90deg, #43cea2, #185a9d);
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.3s;
    text-align: center;
    align-self: center;
    margin-top: 20px;
    width: 220px; /* Adjusted width */
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
    flex-grow: 1;
}

.justify-content-between {
    justify-content: flex-end;
}

.mt-2 {
    margin-top: 10px;
}

.mt-4 {
    margin-top: 16px;
}

.align-items-start {
    align-items: flex-start;
}

.justify-content-end {
    justify-content: flex-end;
}

.option-label {
    /*font-weight: bold;*/
    font-size: 18px;
    margin-right: 10px; /* Adds space between the label and the content */
}

.option-content {
    flex-grow: 1; /* Ensures the option content takes up the remaining space */
    text-align: left; /* Aligns the content to the left */
}

.option-list {
    padding-left: 0; /* Removes default padding to prevent unnecessary indentations */
}

.d-flex {
    display: flex;
    flex-direction: column; /* Ensure the list of options is stacked vertically */
    width: 100%;
}

.d-flex > .option-label {
    margin-bottom: 5px; /* Adds space between the label and the option content */
}

.buttons-container {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    margin-top: 10px; /* Reduced margin */
}

@media (max-width: 768px) {
    .two-column {
        flex-direction: column;
        gap: 15px; /* Reduced gap in two-column layout */
    }
}
</style>

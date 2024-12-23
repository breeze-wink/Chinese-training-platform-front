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
                                <hr class="section-divider" /> <!-- 分割线 -->
                            </div>
                        </div>

                        <div v-else>
                            <!-- 初始显示状态 -->
                            <div v-if="!editMode.content">
                                <!-- 显示HTML内容 -->
                                <div v-html="question.content"></div>
                                <!-- 编辑按钮 -->
                                <div class="buttons-container d-flex justify-content-end">
                                    <button @click="toggleEdit('content')" class="edit-btn">编辑</button>
                                </div>
                                <hr class="section-divider" /> <!-- 分割线 -->
                            </div>

                            <!-- 编辑模式 -->
                            <div v-else>


                                <QuillEditor
                                    v-model:content="question.content"
                                    contentType="html"
                                    @ready="onEditorReady"
                                    :options="editorOptions"
                                    @input="onEditorInput"
                                />

                                <!-- 保存按钮 -->
                                <div class="buttons-container d-flex justify-content-end">
                                    <button type="button" @click="saveContent('content')" class="edit-btn">保存</button>
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
                                    <div class="buttons-container mt-4">
                                        <button @click="toggleEdit('options', index)" class="edit-btn">
                                            {{ editMode.options[index] ? '保存' : '编辑' }}
                                        </button>
                                    </div>
                                </li>
                            </ul>
                            <hr class="section-divider" /> <!-- 分割线 -->
                        </div>

                        <!-- 答案部分 -->
                        <div class="card" v-if="question.answer">
                            <h3 class="card-title">答案</h3>
                            <div v-text="question.answer" v-if="!editMode.answer"></div>
                            <textarea
                                v-model="question.answer"
                                class="form-control large-textarea"
                                placeholder="请输入答案"
                                @input="adjustTextareaHeight"
                                v-if="editMode.answer"
                            ></textarea>
                            <div class="buttons-container d-flex justify-content-end">
                                <button @click="toggleEdit('answer')" class="edit-btn">
                                    {{ editMode.answer ? '保存' : '编辑' }}
                                </button>
                            </div>
                            <hr class="section-divider" /> <!-- 分割线 -->
                        </div>

                        <!-- 知识点部分 -->
                        <div class="card" v-if="question.knowledgePoint">
                            <h3 class="card-title">知识点</h3>
                            <div v-text="question.knowledgePoint" v-if="!editMode.knowledgePoint"></div>
                            <textarea
                                v-model="question.knowledgePoint"
                                class="form-control large-textarea"
                                placeholder="请输入知识点"
                                @input="adjustTextareaHeight"
                                v-if="editMode.knowledgePoint"
                            ></textarea>
                            <hr class="section-divider" /> <!-- 分割线 -->
                        </div>

                        <!-- 解释部分 -->
                        <div class="card" v-if="question.explanation">
                            <h3 class="card-title">解释</h3>
                            <div v-text="question.explanation" v-if="!editMode.explanation"></div>
                            <textarea
                                v-model="question.explanation"
                                class="form-control large-textarea"
                                placeholder="请输入解释"
                                @input="adjustTextareaHeight"
                                v-if="editMode.explanation"
                            ></textarea>
                            <div class="buttons-container d-flex justify-content-end">
                                <button @click="toggleEdit('explanation')" class="edit-btn">
                                    {{ editMode.explanation ? '保存' : '编辑' }}
                                </button>
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
                                            <div class="buttons-container d-flex justify-content-end mt-4">
                                                <button @click="toggleEdit('subQuestions', index, 'options', optionIndex)" class="edit-btn">{{ editMode.subQuestions[index]?.options[optionIndex] ? '保存' : '进入编辑' }}</button>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <hr class="section-divider" /> <!-- 分割线 -->

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

                                    <hr class="section-divider" /> <!-- 分割线 -->

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

                                <hr class="section-divider" /> <!-- 分割线 -->

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
                                <hr class="section-divider" /> <!-- 分割线 -->
                            </div>
                        </div>

                        <div class="button-style">
                            <button v-if="source === 'audit'" @click="rejectQuestion" type="submit" class="submit-btn reject-btn">驳回</button>
                            <button @click="approval" type="submit" class="submit-btn approve-btn">{{ source === 'edit' ? '确认' : '批准' }}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, onMounted, nextTick, watch} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessageBox, ElNotification } from 'element-plus';
import { useStore } from 'vuex';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";

import Quill from 'quill';
import { ImageDrop } from 'quill-image-drop-module';
import BlotFormatter from 'quill-blot-formatter';

// 注册模块
Quill.register('modules/imageDrop', ImageDrop);
Quill.register('modules/blotFormatter', BlotFormatter);

import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';


import { watchEffect } from 'vue';


// 定义状态
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

// 从富文本内容中提取图片
const extractBase64ImagesFromContent = (content) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const images = [];

    // 查找所有 img 标签
    const imgTags = doc.querySelectorAll('img');
    imgTags.forEach(img => {
        const src = img.getAttribute('src');
        if (src && src.startsWith('data:image/')) {  // 判断是否为Base64图像
            images.push(src);
        }
    });

    return images;
};


// 将Base64数据转换为Blob对象
const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64.split(',')[1]); // 解码Base64数据
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset++) {
        const byte = byteCharacters.charCodeAt(offset);
        byteArrays.push(byte);
    }

    const byteArray = new Uint8Array(byteArrays);
    return new Blob([byteArray], { type: mimeType });
};

const editorOptions = {
    placeholder: '请输入问题内容',
    theme: 'snow',
    modules: {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline'],
            [{ 'align': [] }],
            ['link', 'image', 'video'], // 超链接 图片 视频
        ],
        blotFormatter: {
            toolbar: {
                mainClassName: 'blot-formatter__toolbar'
            }
        },
    }
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

function onEditorReady(editor) {
    if (question.value.content) {
        editor.root.innerHTML = question.value.content;
    }
}

// 富文本编辑器内容变化时调整高度
function onEditorInput() {
    adjustTextareaHeight({ target: document.querySelector(".ql-editor") });
}
watch(() => question.value.content, (newContent) => {
    adjustTextareaHeight({ target: document.querySelector(".ql-editor") });
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
    await loadImagesForQuestions();
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
const replaceImageSrcUtil = async (htmlContent) => {
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
};

// 删除图片的 API 调用
const deleteImage = async (type, imageName) => {
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
};

// 图片上传函数
const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'content'); // 图片类型为内容图片

    const token = store.getters.getToken;
    if (!token) {
        ElNotification.error({ title: '错误', message: '缺少认证令牌，无法上传图片' });
        return null;
    }

    try {
        const response = await axios.post('/api/uploads/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200 && response.data && response.data.imageUrl) {
            const imageUrl = response.data.imageUrl;
            return imageUrl; // 返回图片 URL
        } else {
            console.error('图片上传失败，服务器未返回 imageUrl');
            throw new Error('上传图片失败');
        }
    } catch (error) {
        console.error('图片上传错误:', error);
        ElNotification.error({ title: '错误', message: error.message || '图片上传失败' });
        return null; // 上传失败时返回 null
    }
};

// 处理内容中的图片
const processContentImages = async (content) => {
    const base64Images = extractBase64ImagesFromContent(content);
    for (const base64Image of base64Images) {
        const mimeType = base64Image.split(';')[0].split(':')[1];
        const blob = base64ToBlob(base64Image, mimeType);
        const file = new File([blob], 'image.png', { type: mimeType });
        const newImageUrl = await uploadImage(file);
        if (newImageUrl) {
            content = replaceImagePlaceholder(content, base64Image, newImageUrl);
        } else {
            ElNotification.error({ title: '错误', message: '图片上传失败，请重试' });
            throw new Error('图片上传失败');
        }
    }
    return content;
};

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

}

async function fetchQuestion() {
    try {
        const token = store.getters['getToken'];
        const teacherId = store.state.user.id;
        const role = store.state.user.role;


        if (!token || !teacherId || role !== 'audit-teacher') {
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
                errorMessage = err.response?.data?.message || err.message || '获取题目失败，请稍后再试';
            }
        } else {
            errorMessage = '获取题目失败，请稍后再试';
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
        editMode.value.content = !editMode.value.content;
        question.value.content = question.value.content || ''; // 确保内容更新

    } else if (section === 'body') {
        editMode.value.body = !editMode.value.body;
        question.value.body = question.value.body || '';
    } else if (section === 'options') {
        editMode.value.options[index] = !editMode.value.options[index];
        question.value.options[index] = question.value.options[index] || '';
    } else if (section === 'answer') {
        editMode.value.answer = !editMode.value.answer;
        question.value.answer = question.value.answer || '';
    } else if (section === 'explanation') {
        editMode.value.explanation = !editMode.value.explanation;
        question.value.explanation = question.value.explanation || '';
    } else if (section === 'type') {
        editMode.value.type = !editMode.value.type;
        question.value.type = question.value.type || '';
    } else if (section === 'subQuestions') {
        if (field === 'options') {
            editMode.value.subQuestions[index][field][optionIndex] =
                    !editMode.value.subQuestions[index][field][optionIndex];
            question.value.subQuestions[index].options[optionIndex] = question.value.subQuestions[index].options[optionIndex] || '';
        } else {
            editMode.value.subQuestions[index][field] = !editMode.value.subQuestions[index][field];
            question.value.subQuestions[index][field] = question.value.subQuestions[index][field] || '';
        }
    }

    // 调整文本框高度
    nextTick(() => {
        adjustAllTextareasHeight();
    });
}

// 保存并切换编辑模式
async function saveContent(section) {
    toggleEdit(section);
}

// 替换内容中的Base64图片为新上传的图片URL
const replaceImagePlaceholder = (content, oldSrc, newSrc) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // 查找所有 img 标签
    const imgs = doc.querySelectorAll('img');
    imgs.forEach(img => {
        const src = img.getAttribute('src');
        if (src && src === oldSrc) {
            img.setAttribute('src', newSrc); // 替换 src
        }
    });
    // 返回修改后的 HTML 字符串
    return doc.body.innerHTML;
};

async function approval() {
    if (source === "edit") {
        // 调用 Modify Question 接口
        const payload = {
            id: route.query.id,
            body: question.value.body,
            questions: [],
        };

        payload.questions = []; // 清空问题数组

        if (route.query.type === 'small') {
            if (question.value.content && question.value.answer) {
                try {
                    let content = await processContentImages(question.value.content);

                    // 只有一个问题
                    payload.questions.push({
                        problem: content,
                        choices: question.value.options.length ? question.value.options : [], // 如果是选择题，提供选项
                        answer: question.value.answer,
                        analysis: question.value.explanation
                    });
                } catch (error) {
                    return;
                }
            } else {
                ElNotification.error({ title: '错误', message: '题目内容或答案不能为空' });
                return;
            }
        } else {
            // 大题，可能有多个子题
            if (question.value.body) {
                try {
                    const processedBody = await processContentImages(question.value.body);
                    payload.body = processedBody; // 大题的描述
                } catch (error) {
                    return;
                }
            }
            for (let i = 0; i < question.value.subQuestions.length; i++) {
                const subQuestion = question.value.subQuestions[i];
                if (subQuestion.content && subQuestion.answer) {
                    try {
                        let subContent = await processContentImages(subQuestion.content);
                        payload.questions.push({
                            problem: subContent,
                            choices: subQuestion.options.length ? subQuestion.options : [], // 如果是选择题，提供选项
                            answer: subQuestion.answer,
                            analysis: subQuestion.explanation
                        });
                    } catch (error) {
                        return;
                    }
                } else {
                    ElNotification.error({ title: '错误', message: '子题内容或答案不能为空' });
                    return;
                }
            }
        }


        try {
            const response = await axios.put('/api/teacher/modify-question', payload, {
                headers: {
                    Authorization: `Bearer ${store.getters.getToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                ElNotification.success({ title: '成功', message: '题目修改成功' });
                router.push({ name: 'QuestionList' });
            } else {
                throw new Error('请求失败');
            }
        } catch (error) {
            let errorMessage = '';
            if (error.response) {
                console.error('Error details:', error.response);
                errorMessage = error.response.data?.message || '提交失败';
            } else {
                errorMessage = '提交失败，请稍后再试';
            }
            ElNotification.error({ title: '错误', message: errorMessage });
        }
    } else {
        // 处理批准操作
        try {
            const requestPayload = {
                id: route.query.id,  // 确保此 ID 与后端匹配
                body: question.value.body || "",  // 大题的描述
                questions: []  // 存储小题内容
            };

            // 如果不是小题，处理大题的 body
            if (route.query.type !== 'small' && question.value.body) {
                requestPayload.body = await processContentImages(question.value.body);
            }

            if (route.query.type === 'small') {
                if (question.value.content && question.value.answer) {
                    try {
                        const content = await processContentImages(question.value.content);
                        requestPayload.questions.push({
                            problem: content,
                            choices: question.value.options.length ? question.value.options : [], // 如果是选择题，提供选项
                            answer: question.value.answer,
                            analysis: question.value.explanation
                        });
                    } catch (error) {
                        return;
                    }
                } else {
                    ElNotification.error({ title: '错误', message: '题目内容或答案不能为空' });
                    return;
                }
            } else {
                // 大题，可能有多个子题
                for (let i = 0; i < question.value.subQuestions.length; i++) {
                    const subQuestion = question.value.subQuestions[i];
                    if (subQuestion.content && subQuestion.answer) {
                        try {
                            const subContent = await processContentImages(subQuestion.content);
                            requestPayload.questions.push({
                                problem: subContent,
                                choices: subQuestion.options.length ? subQuestion.options : [], // 如果是选择题，提供选项
                                answer: subQuestion.answer,
                                analysis: subQuestion.explanation
                            });
                        } catch (error) {
                            return;
                        }
                    } else {
                        ElNotification.error({ title: '错误', message: '子题内容或答案不能为空' });
                        return;
                    }
                }
            }
            // 发送PUT请求到 approve-question
            const response = await axios.put('/api/teacher/approve-question', requestPayload, {
                headers: {
                    Authorization: `Bearer ${store.getters.getToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                ElNotification.success({ title: '成功', message: '题目审核已批准' });
                await router.push({name: 'QuestionList'});
            } else {
                throw new Error('请求失败');
            }
        } catch (error) {
            let errorMessage = '';
            if (error.response) {
                console.error('Error details:', error.response);
                errorMessage = error.response.data?.message || '题目审核失败';
            } else {
                errorMessage = '题目审核失败，请稍后再试';
            }
            ElNotification.error({ title: '错误', message: errorMessage });
        }
    }
};

// 驳回题目
function rejectQuestion() {
    ElMessageBox.prompt('请输入拒绝上传的备注', '拒绝上传', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.*/,
        inputErrorMessage: '备注不能为空'
    }).then(({ value }) => {
        // 用户输入的备注
        const requestPayload = {
            id: route.query.id, // 获取题目ID
            comment: value // 驳回理由
        };

        axios.put('/api/teacher/deny-upload-question', requestPayload)
                .then(response => {
                    if (response.status === 200) {
                        ElNotification.success({ title: '成功', message: '题目审核已驳回' });
                        // 成功后跳转到 QuestionList 页面
                        router.push({ name: 'QuestionList' });
                    } else {
                        throw new Error('请求失败');
                    }
                })
                .catch(error => {
                    let errorMessage = '';
                    if (error.response) {
                        errorMessage = error.response.data?.message || '题目驳回失败';
                    } else {
                        errorMessage = '题目驳回失败，请稍后再试';
                    }
                    ElNotification.error({ title: '错误', message: errorMessage });
                });
    }).catch(() => {
        ElNotification.info({ title: '提示', message: '驳回操作已取消' });
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
    background-color: #f0f0f0; /* 背景改为浅灰色 */
    flex: 1;
    background-color: #f0f0f0;
}

.content {
    max-width: 1000px;
    width: 100%;
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin-right: 50px; /* 如果需要右侧留空隙，可以保留这行，或者可以根据实际情况调整 */
    margin-bottom: 30px;

    margin-left: 300px;
    margin-bottom: 30px;
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

.button-style {
    display: flex;
    justify-content: space-between; /* 水平分布子元素 */
    align-items: center;            /* 垂直居中对齐 */
    margin-top: 20px;
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

/*.submit-btn {*/
/*    padding: 15px 40px;*/
/*    font-size: 20px;*/
/*    color: white;*/
/*    border: none;*/
/*    border-radius: 25px;*/
/*    cursor: pointer;*/
/*    transition: transform 0.2s, box-shadow 0.3s;*/
/*    text-align: center;*/
/*    width: 220px; !* Adjusted width *!*/
/*}*/

/* 驳回按钮样式 */
.reject-btn {
    background: linear-gradient(90deg, #ff7e7e, #d63031); /* 红色渐变 */
    margin-left: 200px;
}

/* 批准/确认按钮样式 */
.approve-btn {
    background: linear-gradient(90deg, #43cea2, #185a9d); /* 蓝绿色渐变 */
    margin-right: 200px;
}

/* 鼠标悬停效果 */
.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* 特定悬停效果 */
.reject-btn:hover {
    box-shadow: 0 8px 24px rgba(255, 126, 126, 0.5);
}

.approve-btn:hover {
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
    font-weight: bold;
    font-size: 18px; /* Increased option label font size */
}

.option-content {
    text-align: left;
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




<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header />

        <div class="main-container">
            <!-- 引入侧边栏通用组件 -->
            <Sidebar />

            <!-- 内容区 -->
            <div class="content">
                <h2>组合式题目上传</h2>

                <!-- 题干输入区域 -->
                <el-form :model="stemForm" label-width="80px" class="form-container">
                    <el-form-item label="题干">
                        <div style="max-width: 750px; overflow: hidden;">
                            <quill-editor
                                    ref="editorStem"
                                    placeholder="请输入问题内容"
                                    class="quill-editor"
                                    :options="quillOptions"
                            ></quill-editor>
                        </div>
                    </el-form-item>
                    <!-- 题干类型选择 -->
                    <el-form-item label="题干类型">
                        <el-select v-model="stemForm.questionType" placeholder="请选择题干类型" style="width: 300px;">
                            <el-option
                                    v-for="(category, index) in categories"
                                    :key="index"
                                    :label="category"
                                    :value="category"
                            />
                        </el-select>
                    </el-form-item>

                    <!-- 新增题目类型选择和按钮在同一行 -->
                    <el-form-item label="题目类型" style="display: flex; align-items: center;">
                        <el-select  v-model="selectedQuestionType" placeholder="选择" style="width: 200px; margin-right: 20px;">
                            <el-option label="选择" value="CHOICE" />
                            <el-option label="填空" value="FILL_IN_BLANK" />
                            <el-option label="问答" value="SHORT_ANSWER" />
                        </el-select>
                        <el-button type="primary" @click="addQuestion">添加</el-button>
                    </el-form-item>

                    <!-- 卡片展示区域 -->
                    <div class="card-container" style="overflow-y: auto; max-height: 400px;">
                        <!-- 未添加小题时显示灰色卡片 -->
                        <div v-if="questionCards.length === 0" class="no-questions-card">
                            <span>未添加小题</span>
                        </div>

                        <div v-for="(card, index) in questionCards" :key="index" class="question-card">
                            <div class="card-header">

                                <span>问题 {{ index + 1 }}</span>
                                <el-button @click="removeCard(index)" type="danger" icon="Delete" size="small" circle />
                            </div>
                            <div class="card-body">
                                <el-form :model="card" label-width="80px">
                                    <!-- 问题文本域 -->
                                    <el-form-item label="问题">
                                        <el-input v-model="card.question"
                                                  type="textarea"
                                                  :autosize="{ minRows: 2, maxRows:3 }"
                                                  placeholder="请输入问题" />
                                    </el-form-item>

                                    <!-- 根据题目类型展示不同的内容 -->
                                    <template v-if="card.questionType === 'CHOICE'">
                                        <el-form-item label="选项 A">
                                            <el-input v-model="card.options[0]"
                                                      class="input-width"
                                                      type="textarea"
                                                      :autosize="{ minRows: 1, maxRows:2 }"
                                                      placeholder="选项 A" />
                                        </el-form-item>
                                        <el-form-item label="选项 B">
                                            <el-input v-model="card.options[1]"
                                                      class="input-width"
                                                      type="textarea"
                                                      :autosize="{ minRows: 1, maxRows:2 }"
                                                      placeholder="选项 B" />
                                        </el-form-item>
                                        <el-form-item label="选项 C">
                                            <el-input v-model="card.options[2]"
                                                      class="input-width"
                                                      type="textarea"
                                                      :autosize="{ minRows: 1, maxRows:2 }"
                                                      placeholder="选项 C" />
                                        </el-form-item>
                                        <el-form-item label="选项 D">
                                            <el-input v-model="card.options[3]"
                                                      class="input-width"
                                                      type="textarea"
                                                      :autosize="{ minRows: 1, maxRows:3 }"
                                                      placeholder="选项 D" />
                                        </el-form-item>
                                        <el-form-item label="答案">
                                            <el-select v-model="card.answer"
                                                       style="width: 100px;"
                                                       placeholder="选择答案">
                                                <el-option label="A" value="A" />
                                                <el-option label="B" value="B" />
                                                <el-option label="C" value="C" />
                                                <el-option label="D" value="D" />
                                            </el-select>
                                        </el-form-item>
                                    </template>

                                    <template v-else-if="card.questionType === 'FILL_IN_BLANK'">
                                        <el-form-item label="填空个数">
                                            <el-input-number v-model="card.blankCount" :min="1" @change="updateInputs(card)" />
                                        </el-form-item>
                                        <div v-for="(blank, idx) in card.blanks" :key="idx">
                                            <el-form-item :label="'填空' + (idx + 1)">
                                                <el-input v-model="card.blanks[idx]"
                                                          style="width: 500px;"
                                                          placeholder="请输入答案" />
                                            </el-form-item>
                                        </div>
                                    </template>

                                    <template v-else-if="card.questionType === 'SHORT_ANSWER'">
                                        <el-form-item label="答案">
                                            <el-input v-model="card.answer"
                                                      style="width: 200px;"
                                                      placeholder="请输入答案" />
                                        </el-form-item>
                                    </template>

                                    <!-- 知识点选择下拉框 -->
                                    <el-form-item label="知识点" class="form-item-custom" style="width: 300px;">
                                        <el-select
                                                v-model="card.selectedPointId"
                                                placeholder="选择知识点"
                                                :disabled="!stemForm.questionType"
                                                class="custom-select"
                                        >
                                            <el-option
                                                    v-for="(point, index) in filteredPoints"
                                                    :key="point.id"
                                                    :label="point.name"
                                                    :value="point.id"
                                            />
                                        </el-select>
                                    </el-form-item>

                                    <!-- 解析 -->
                                    <el-form-item label="解析">
                                        <el-input v-model="card.analysis"
                                                  type="textarea"
                                                  :autosize="{ minRows: 2, maxRows:3 }"
                                                  placeholder="请输入解析" />
                                    </el-form-item>
                                </el-form>
                            </div>
                        </div>
                    </div>
                    <el-button type="primary" @click="uploadQuestions">上传题目</el-button>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import {computed, nextTick, onMounted, ref} from 'vue';

import { nanoid } from "nanoid"; // 用于生成唯一 ID
import Quill from "quill";
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import {ImageDrop} from 'quill-image-drop-module'
import BlotFormatter from 'quill-blot-formatter/dist/BlotFormatter';


import axios from "axios";
import {QuillEditor} from "@vueup/vue-quill";
import {useStore} from "vuex";

const editorStem = ref(null);
const store = useStore();
const teacherId = computed(() => store.state.user.id);
const selectedQuestionType = ref(""); // 临时存储当前选中的题目类型

// 题干数据
const stemForm = ref({
    stem: "",
    questionType: "", // 题干类型
    questionFormat: [] // 存储每道小题的类型
});
const questionCards = ref([]); // 存储所有题目卡片
const selectedPointId = ref(null); // 当前选择的知识点 ID
const knowledgePoints = ref({}); // 知识点数据（分类为键，知识点数组为值）
const categories = ref([]); // 所有分类
// 添加函数（暂时为空）

const test = () => {
    const quillInstance = editorStem.value.getQuill();
    const content = quillInstance.root.innerHTML; // 或者 quillInstance.getText(); 获取纯文本
    console.log('Quill 编辑器的内容:', content);
};
// 初始化获取知识点数据
onMounted(async () => {
    await fetchKnowledgePoints();
    await nextTick(() => {
        if (editorStem.value) {
            const quill = editorStem.value.getQuill(); // 获取 Quill 实例
            console.log(quill); // 输出 Quill 实例，验证是否成功获取
        }
    });

});
// 删除题目卡片
const removeCard = (index) => {
    questionCards.value.splice(index, 1);
};

// 更新填空输入框数量
const updateInputs = (card) => {
    card.blanks = Array(card.blankCount).fill("");
};

// 添加题目
const addQuestion = () => {
    const newCard = {
        question: "",
        analysis: "",
        options: ['', '', '', ''], // 选项
        answer: "", // 答案
        blankCount: 1, // 填空个数
        blanks: [""], // 填空答案
        selectedPointId: null, // 新增的知识点 ID 属性
        questionType: selectedQuestionType.value // 为每个卡片设置题目类型
    };

    // 根据题目类型添加卡片的具体结构
    if (selectedQuestionType.value === "CHOICE") {
        newCard.options = ['', '', '', ''];
        newCard.answer = "";
    } else if (selectedQuestionType.value === "FILL_IN_BLANK") {
        newCard.blanks = Array(newCard.blankCount).fill("");
    } else if (selectedQuestionType.value === "SHORT_ANSWER") {
        newCard.answer = "";
    }

    questionCards.value.push(newCard);
};

//上传组合式题目
const uploadQuestions = async () => {
    // 获取编辑器的内容
    const content = editorStem.value ? editorStem.value.getHTML() || editorStem.value.container.firstChild.innerHTML : '';
    let processedContent = content;

    // 处理图片上传
    const base64Images = extractBase64ImagesFromContent(content);
    for (const base64Image of base64Images) {
        const mimeType = base64Image.split(';')[0].split(':')[1];
        const blob = base64ToBlob(base64Image, mimeType);
        const file = new File([blob], 'image.png', { type: mimeType });
        const newImageUrl = await uploadImage(file);
        if (newImageUrl) {
            processedContent = replaceImagePlaceholder(processedContent, base64Image, newImageUrl);
        }
    }
    // 构建请求数据
    const requestData = {
        questionType: stemForm.value.questionType, // 题干类型
        body: processedContent, // 题干内容
        questions: questionCards.value.map(card => {
                // 根据题目类型处理答案
                const answer = card.questionType === 'CHOICE' ?
                        [card.answer ]: card.questionType === 'FILL_IN_BLANK' ?
                                card.blanks : [card.answer];
                return {
                    type: card.questionType, // 题目类型
                    problem: card.question, // 问题内容
                    choices: card.options, // 选项
                    answer: answer, // 题目答案
                    analysis: card.analysis, // 解析
                    knowledgePointId: card.selectedPointId // 知识点ID
            };
            })
    };
    console.log(requestData);

    // 上传请求
    try {
        const response = await axios.post(`/api/teacher/${teacherId.value}/upload-question`, requestData);
        if (response.status === 200) {
            // 上传成功，处理成功的操作，比如提示上传成功
            console.log('题目上传成功');
            // 你可以在此后清空表单或显示成功消息
        } else {
            console.error('上传失败', response.data.message);
            // 处理上传失败的情况
        }
    } catch (error) {
        console.error('上传过程中出现错误:', error);
        // 处理错误
    }
};

// ***************************************************************************
// 富文本注释：从此开始

Quill.register('modules/imageDrop', ImageDrop)
Quill.register('modules/blotFormatter', BlotFormatter)
//富文本选项配置
const quillOptions = {
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
        }
    }
};
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
//图片上传并接受返回的url
const uploadImage = async (imageSrc) => {
    try {
        const formData = new FormData();
        formData.append("image", imageSrc);  // 假设 imageSrc 是一个 File 对象
        formData.append("type", "content");  // 固定图片类型为 "content"

        const response = await axios.post('/api/uploads/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.status === 200) {
            console.log(response.data.imageUrl);
            return response.data.imageUrl;
        } else {
            console.error('图片上传失败');
        }
    } catch (error) {
        console.error('上传图片失败:', error);
        return null;
    }
};
//使用DOM替换富文本中的图片部分
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
// 富文本部分到此结束
// ***************************************************************************

// ***************************************************************************
// 获取知识点
const fetchKnowledgePoints = async () => {
    try {
        const response = await axios.get(`/api/teacher/${teacherId.value}/list-knowledge-point`);

        if (response.status === 200 && response.data) {
            const responseData = response.data.knowledgePoints || {};
            knowledgePoints.value = responseData;
            categories.value = Object.keys(responseData); // 提取所有分类
            console.log(knowledgePoints.value);
        } else {
            console.error('获取知识点失败：', response.data.message);
        }
    } catch (error) {
        console.error('获取知识点失败：', error.message);
    }
};
const filteredPoints = computed(() => {
    if (!stemForm.value.questionType) return [];
    return knowledgePoints.value[stemForm.value.questionType] || [];
});
// 题干类型变化时，更新可用的知识点
const handleQuestionTypeChange = () => {
    selectedPointId.value = null; // 清空已选知识点
};

</script>


<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f0f0f0; /* 浅灰色背景 */
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


.form-container {
    margin-bottom: 20px;
    margin-left: 40px;
}

.quill-editor {
    width: 800px; /* 设置你需要的宽度 */
    height: 300px; /* 你也可以设置高度 */
}


.strollbar-container {
    position: relative;
    height: 400px;
    overflow-y: auto;
}

.no-question-tip {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
    color: #888;
}

.question-card {
    margin-bottom: 20px;
}
.card-container {
    background-color: #ffffff;
    margin-top: 20px;
    max-height: 400px;
    overflow-y: auto;
    margin-right: 50px;
}

.question-card {
    margin: 20px 40px;
    background: linear-gradient(#ffffff, #dfe1f8);
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-body {
    margin-top: 10px;
    margin-right: 50px;
}

.input-width {
    width: 500px; /* 设置固定宽度 */
}

.no-questions-card {
    background-color: #f0f0f0;
    padding: 20px;
    text-align: center;
    border-radius: 8px;
    margin: 20px 0;
    font-size: 16px;
    color: #888;
}

</style>

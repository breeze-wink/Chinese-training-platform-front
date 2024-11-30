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
                                    ref="bodyEditor"
                                    placeholder="请输入问题内容"
                                    class="quill-editor"
                                    :options="quillOptions"
                            ></quill-editor>
                        </div>

                    </el-form-item>
                    <el-form-item label="选择类型">
                        <el-select v-model="stemForm.questionType" placeholder="请选择类型">
                            <el-option label="文言文阅读" value="文言文阅读"></el-option>
                            <el-option label="记叙文阅读" value="记叙文阅读"></el-option>
                            <el-option label="非连续性文本阅读" value="非连续性文本阅读"></el-option>
                            <el-option label="古诗词曲鉴赏" value="古诗词曲鉴赏"></el-option>
                            <el-option label="名著阅读" value="名著阅读"></el-option>
                            <el-option label="基础" value="基础"></el-option>
                        </el-select>
                    </el-form-item>



                    <!-- 题型选择与添加按钮 -->
                    <div class="add-section">
                        <el-select v-model="selectedType" placeholder="请选择题型" class="question-type-select">
                            <el-option label="选择题" value="CHOICE"></el-option>
                            <el-option label="填空题" value="FILL_IN_BLANK"></el-option>
                            <el-option label="问答题" value="SHORT_ANSWER"></el-option>
                        </el-select>
                        <el-button type="primary" @click="addQuestion">添加</el-button>
                    </div>
                </el-form>

                <!-- 滚动区域：显示所有子题表单 -->
                <div class="questions-container">
                    <div
                            v-for="(question, index) in questions"
                            :key="question.id"
                            class="question-card"
                    >
                        <el-card shadow="hover">
                            <!-- 子题标题与删除按钮 -->
                            <div class="card-header">
                                <h3>{{ questionTypeLabels[question.type] }}</h3>
                                <el-button
                                        type="danger"
                                        icon="el-icon-delete"
                                        @click="removeQuestion(index)"
                                ></el-button>
                            </div>

                            <!-- 动态子题表单 -->
                            <el-form :model="question.data" label-width="80px">
                                <template v-if="question.type === 'CHOICE'">
                                    <!-- 选择题表单 -->
                                    <el-form-item label="问题" class="form-item-margin">
                                        <el-input
                                                v-model="question.data.question"
                                                type="textarea"
                                                placeholder="请输入问题"
                                        ></el-input>
                                    </el-form-item>
                                    <el-form-item>
                                        <el-row>
                                            <el-col
                                                    v-for="(option, index) in question.data.options"
                                                    :key="index"
                                                    :span="24"
                                                    class="option-row"
                                            >
                                                <div class="option-container">
                                                    <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                                                    <el-input
                                                            v-model="question.data.options[index]"
                                                            placeholder="请输入选项内容"
                                                    ></el-input>
                                                </div>
                                            </el-col>
                                        </el-row>
                                    </el-form-item>
                                    <el-form-item label="答案">
                                        <el-select
                                                v-model="question.data.answer"
                                                placeholder="请选择答案"
                                                class="answer-select"
                                        >
                                            <el-option
                                                    v-for="(option, index) in question.data.options"
                                                    :key="index"
                                                    :label="String.fromCharCode(65 + index)"
                                                    :value="index"
                                            ></el-option>
                                        </el-select>
                                    </el-form-item>

                                    <!-- 所属知识点下拉框 -->
                                    <KnowledgePointSelector ref="knowledgePointSelector" />

                                    <el-form-item label="解析">
                                        <el-input
                                                v-model="question.data.explanation"
                                                type="textarea"
                                                placeholder="请输入解析"
                                                :rows="5"
                                        ></el-input>
                                    </el-form-item>
                                </template>

                                <template v-else-if="question.type === 'FILL_IN_BLANK'">
                                    <!-- 填空题表单 -->
                                    <el-form-item label="问题" class="form-item-margin">
                                        <el-input
                                                v-model="question.data.question"
                                                type="textarea"
                                                placeholder="请输入问题"
                                                :autosize="{ minRows: 3, maxRows: 10 }"
                                        ></el-input>
                                    </el-form-item>
                                    <el-form-item label="填空个数" class="form-item-spacing">
                                        <el-input-number
                                                v-model="question.data.fillCount"
                                                @change="updateFillAnswers(index)"
                                                min="1"
                                                placeholder="请输入填空个数"
                                        ></el-input-number>
                                    </el-form-item>
                                    <el-form-item label="答案">
                                        <div
                                                v-for="(answer, ansIndex) in question.data.answers"
                                                :key="ansIndex"
                                                class="answer-row"
                                        >
                                            <el-input
                                                    v-model="question.data.answers[ansIndex]"
                                                    placeholder="请输入第 {{ ansIndex + 1 }} 个填空的答案"
                                            ></el-input>
                                        </div>
                                    </el-form-item>

                                    <!-- 所属知识点下拉框 -->
                                    <KnowledgePointSelector ref="knowledgePointSelector" />

                                    <el-form-item label="解析">
                                        <el-input
                                                v-model="question.data.explanation"
                                                type="textarea"
                                                placeholder="请输入解析"
                                        ></el-input>
                                    </el-form-item>
                                </template>

                                <template v-else-if="question.type === 'SHORT_ANSWER'">
                                    <!-- 问答题表单 -->
                                    <el-form-item label="问题" class="form-item-spacing">
                                        <el-input
                                                v-model="question.data.question"
                                                type="textarea"
                                                placeholder="请输入问题"
                                                :autosize="{ minRows: 3, maxRows: 10 }"
                                        ></el-input>
                                    </el-form-item>
                                    <el-form-item label="答案" class="form-item-spacing">
                                        <el-input
                                                v-model="question.data.answer"
                                                type="textarea"
                                                placeholder="请输入答案"
                                                :autosize="{ minRows: 3, maxRows: 10 }"
                                        ></el-input>
                                    </el-form-item>

                                    <!-- 所属知识点下拉框 -->
                                    <KnowledgePointSelector ref="knowledgePointSelector" />

                                    <el-form-item label="解析" class="form-item-spacing">
                                        <el-input
                                                v-model="question.data.explanation"
                                                type="textarea"
                                                placeholder="请输入解析"
                                                :autosize="{ minRows: 4, maxRows: 10 }"
                                        ></el-input>
                                    </el-form-item>
                                </template>
                            </el-form>
                        </el-card>
                    </div>
                </div>

                <!-- 提交按钮 -->
                <div class="submit-section">
                    <el-button type="primary" @click="submitQuestions">上传题目</el-button>
                </div>
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
import KnowledgePointSelector from '@/pages/Teacher/TeacherPublicComponent/KnowledgePointSelector.vue';

import axios from "axios";
import {QuillEditor} from "@vueup/vue-quill";
import BodyEditor from "quill/blots/break.js";

// 题干数据
const stemForm = ref({
    stem: "",
    questionType: "", // 题干类型
});

// 当前选中的题型
const selectedType = ref(null);

// 子题数组
const questions = ref([]);

// 题型标签
const questionTypeLabels = {
    CHOICE: "选择",
    FILL_IN_BLANK: "填空",
    SHORT_ANSWER: "问答",
};
// 初始化获取知识点数据
onMounted(async () => {

    await nextTick(() => {
        // 通过 ref 获取 Quill 编辑器实例
        // 这里假设你的 quill-editor 组件的 ref 已经设置为 "editor"
        BodyEditor.value = document.querySelector('.quill-editor').getQuill();
        // 现在你可以使用 quillInstance 来做你需要的操作，例如获取内容等
    });

});
// ***************************************************************************
// 富文本注释：从此开始
const bodyEditor = ref(null)
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

// 添加题目
const addQuestion = () => {
    if (!selectedType.value) {
        return alert("请选择题型！");
    }
    // 根据题型生成对应的初始数据
    const newQuestion = {
        type: selectedType.value,
        data: selectedType.value === "CHOICE"
                ? { question: "", options: ["", "", "", ""], answer: null }
                : selectedType.value === "FILL_IN_BLANK"
                        ? { question: "", answers: [""] }
                        : { question: "", answer: "" },
    };

    questions.value.push(newQuestion);
    selectedType.value = null; // 清空下拉框选择
};

// 删除题目
const removeQuestion = (index) => {
    questions.value.splice(index, 1);
};

// 动态更新填空答案数组
const updateFillAnswers = (index) => {
    const currentQuestion = questions.value[index];
    const currentFillCount = currentQuestion.data.fillCount;
    const answers = currentQuestion.data.answers;

    if (currentFillCount > answers.length) {
        // 填空个数增加时，补充空字符串到答案数组
        for (let i = answers.length; i < currentFillCount; i++) {
            answers.push('');
        }
    } else if (currentFillCount < answers.length) {
        // 填空个数减少时，截断答案数组
        answers.splice(currentFillCount);
    }
};

// 提交所有题目
const submitQuestions = async () => {

    //html转化并取代
    let content = bodyEditor.value.getHTML() || bodyEditor.value.container.firstChild.innerHTML;

    const base64Images = extractBase64ImagesFromContent(content);

    for (const base64Image of base64Images) {
        const mimeType = base64Image.split(';')[0].split(':')[1];  // 获取图片的MIME类型，例如 image/png
        const blob = base64ToBlob(base64Image, mimeType);
        const file = new File([blob], 'image.png', {type: mimeType});  // 可以通过文件名调整，使用适当的扩展名
        const newImageUrl = await uploadImage(file);
        console.log(newImageUrl);
        console.log('000');
        if (newImageUrl) {
            content = replaceImagePlaceholder(content, base64Image, newImageUrl);
            console.log(content);
        }
    }



    const payload = {
        stem: stemForm.value.stem,
        questions: questions.value.map((q) => ({
            type: q.type,
            data: q.data,
        })),
    };

    console.log("提交数据:", payload);
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
    max-width: 1000px;
    width: 100%;
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin: 20px auto;
}

.form-container {
    margin-bottom: 20px;
}

.add-section {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.question-type-select {
    width: 200px;
}

.questions-container {
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 20px;
}

.question-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.option-row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.answer-row {
    margin-bottom: 10px;
}

.submit-section {
    display: flex;
    justify-content: flex-end;
}
</style>

<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header />

        <div class="main-container">
            <!-- 引入侧边栏通用组件 -->
            <Sidebar />
            <!-- 内容区 -->
            <div class="content">
                <h2>单题上传</h2>
                <el-tabs v-model="activeTab">
                    <!-- 选择题标签页 -->
                    <el-tab-pane label="选择题" name="choice">
                        <div class="tab-content">
                            <el-form :model="choiceForm" label-width="60px">
                                <el-form-item label="问题"  class="form-item-margin" >
                                    <div>
                                        <quill-editor
                                            v-model="choiceForm.question"
                                            :options="quillOptions"
                                            placeholder="请输入问题内容"
                                            theme="snow"
                                            class="ql-editor"
                                        />
                                    </div>
                                </el-form-item>
                                <el-form-item>
                                    <el-row>
                                        <el-col
                                                v-for="(option, index) in choiceForm.options"
                                                :key="index"
                                                :span="24"
                                                class="option-row"
                                        >
                                            <div class="option-container">
                                                <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                                                <el-input
                                                        v-model="choiceForm.options[index]"
                                                        placeholder="请输入选项内容"
                                                        class="option-input"
                                                ></el-input>
                                            </div>
                                        </el-col>

                                    </el-row>
                                </el-form-item>



                                <el-form-item label="答案">
                                    <el-select v-model="choiceForm.answer" placeholder="请选择答案"  class="answer-select">
                                        <el-option
                                                v-for="(option, index) in choiceForm.options"
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
                                            v-model="choiceForm.explanation"
                                            type="textarea"
                                            placeholder="请输入解析"
                                            :rows="5"
                                    ></el-input>
                                </el-form-item>
                            </el-form>
                        </div>
                    </el-tab-pane>


                    <!-- 填空题标签页 -->
                    <el-tab-pane label="填空题" name="fill">
                        <template #default>
                            <div class="tab-content">
                                <el-form :model="fillForm" label-width="80px">
                                    <el-form-item label="问题" class="form-item-margin">
                                        <el-input
                                                v-model="fillForm.question"
                                                type="textarea"
                                                placeholder="请输入问题"
                                                :autosize="{ minRows: 3, maxRows: 10 }"
                                        ></el-input>
                                    </el-form-item>
                                    <el-form-item label="填空个数" class="form-item-spacing">
                                        <el-input-number
                                                v-model="fillForm.fillCount"
                                                @change="updateFillAnswers"
                                                min="1"
                                                placeholder="请输入填空个数"
                                        ></el-input-number>
                                    </el-form-item>
                                    <el-form-item label="答案">
                                        <div v-for="(answer, index) in fillForm.answers" :key="index" class="answer-row">

                                            <el-input
                                                    v-model="fillForm.answers[index]"
                                                    placeholder="请输入第 {{ index + 1 }} 个填空的答案"
                                            ></el-input>

                                        </div>
                                    </el-form-item>

                                    <!-- 所属知识点下拉框 -->
                                    <KnowledgePointSelector ref="knowledgePointSelector" />

                                    <el-form-item label="解析">
                                        <el-input
                                                v-model="fillForm.explanation"
                                                type="textarea"
                                                placeholder="请输入解析"
                                        ></el-input>
                                    </el-form-item>

                                </el-form>
                            </div>
                        </template>
                    </el-tab-pane>

                    <!-- 问答题标签页 -->
                    <el-tab-pane label="问答题" name="qa">
                        <template #default>
                            <div class="tab-content">
                                <el-form :model="qaForm" label-width="80px">
                                    <el-form-item label="问题" class="form-item-spacing">
                                        <el-input
                                                v-model="qaForm.question"
                                                type="textarea"
                                                placeholder="请输入问题"
                                                :autosize="{ minRows: 3, maxRows: 10 }"
                                        ></el-input>
                                    </el-form-item>
                                    <el-form-item label="答案" class="form-item-spacing">
                                        <el-input
                                                v-model="qaForm.answer"
                                                type="textarea"
                                                placeholder="请输入答案"
                                                :autosize="{ minRows: 3, maxRows: 10 }"
                                        ></el-input>
                                    </el-form-item>

                                    <!-- 所属知识点下拉框 -->
                                    <KnowledgePointSelector ref="knowledgePointSelector" />

                                    <el-form-item label="解析" class="form-item-spacing">
                                        <el-input
                                                v-model="qaForm.explanation"
                                                type="textarea"
                                                placeholder="请输入解析"
                                                :autosize="{ minRows: 4, maxRows: 10 }"
                                        ></el-input>
                                    </el-form-item>
                                </el-form>
                            </div>
                        </template>
                    </el-tab-pane>

                    <!-- 作文标签页 -->
                    <el-tab-pane label="作文" name="essay">
                        <template #default>
                            <div class="tab-content">
                                <el-form :model="essayForm" label-width="80px">
                                    <el-form-item label="题目">
                                        <el-input
                                                v-model="essayForm.title"
                                                placeholder="请输入作文题目"
                                                type="textarea"
                                                :autosize="{ minRows: 3, maxRows: 10 }"
                                        ></el-input>
                                    </el-form-item>
                                    <el-form-item label="解析">
                                        <el-input
                                                v-model="essayForm.explanation"
                                                type="textarea"
                                                placeholder="请输入解析"
                                                :autosize="{ minRows: 4, maxRows: 10 }"
                                        ></el-input>
                                    </el-form-item>

                                    <!-- 所属知识点下拉框 -->
                                    <KnowledgePointSelector ref="knowledgePointSelector" />

                                    <el-form-item label="上传范文">
                                        <el-upload
                                                action="/api/upload/essay-sample"
                                                :on-success="handleUploadSuccess"
                                                :limit="1"
                                                accept=".pdf,.doc,.docx"
                                        >
                                            <el-button type="primary">点击上传</el-button>
                                        </el-upload>
                                    </el-form-item>
                                </el-form>
                            </div>
                        </template>
                    </el-tab-pane>



                </el-tabs>

                <!-- 确定上传按钮 -->
                <div class="submit-section">
                    <el-button type="primary" @click="submitQuestion">确定上传</el-button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import {computed, onMounted, ref} from 'vue';
import axios from "axios";
import {useStore} from "vuex";
import KnowledgePointSelector from '@/pages/Teacher/TeacherPublicComponent/KnowledgePointSelector.vue'; // 引入知识点选择组件
import { QuillEditor, Quill } from '@vueup/vue-quill'
import "quill/dist/quill.snow.css";
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.bubble.css'

const activeTab = ref('choice'); // 当前激活的标签页
const knowledgePoints = ref([]); // 后端返回的知识点
const categories = ref([]); // 所有分类（category）
const selectedCategory = ref(null); // 当前选择的分类
const selectedPointName = ref(null); // 当前选择的知识点名称
const filteredPoints = ref([]); // 当前分类下的知识点列表
const store = useStore();
const teacherId = computed(() => store.state.user.id);
const knowledgePointSelector = ref(null);

// 配置 Quill 编辑器的选项
const quillOptions = {
    theme: 'snow', // 主题样式
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline'], // 文本样式
            [{ list: 'ordered' }, { list: 'bullet' }, { align: [] }], 
            ['link', 'image'], // 插入链接和图片
        ],
    },
};

// 选择表单数据
const choiceForm = ref({
    question: '',
    options: ['', '', '', ''], // 默认四个选项
    answer: null,
    explanation: '',
});

// 填空题表单
const fillForm = ref({
    question: '',
    fillCount: 1,
    answers: [''],
    explanation: '',
});

// 更新填空答案数组
const updateFillAnswers = (count) => {
    fillForm.value.answers = Array.from({ length: count }, () => '');
};


// 问答题表单
const qaForm = ref({
    question: '',
    answer: '',
    explanation: '',
});

// 作文表单
const essayForm = ref({
    title: '',
    explanation: '',
});

// 上传成功回调
const handleUploadSuccess = (response, file) => {
    console.log('范文上传成功:', response, file);
};


// 提交表单
const submitQuestion = () => {
    const data =
            activeTab.value === 'choice'
                    ? choiceForm.value
                    : activeTab.value === 'fill'
                            ? fillForm.value
                            : activeTab.value === 'qa'
                                    ? qaForm.value
                                    : essayForm.value;

    console.log('提交数据:', data);
}
// 初始化获取知识点数据
onMounted(() => {

});
</script>

<style scoped>

.quill-editor {
    line-height: 20px !important;
}
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

.tab-content {
    padding: 40px;
    background-color: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    margin-top: 10px;
}

.submit-section {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.form-item-margin {
    margin-bottom: 40px; /* 在问题输入框下方增加空白 */
}


.custom-form-item .el-form-item__label {
    align-self: flex-start; /* 让“选项”标题和选项内容上下排列 */
    white-space: nowrap;   /* 确保标题不换行 */
    padding-top: 5px;      /* 可选：增加标题与内容的间距 */
}

.option-row {
    display: block; /* 强制让每个选项独占一行 */
    margin-bottom: 15px; /* 每个选项之间增加垂直间距 */
    max-width: 600px;
}
.option-container {
    display: flex; /* 使用弹性布局 */
    align-items: center; /* 垂直居中 */
    gap: 10px; /* 选项之间的间距 */
}

.option-label {
    font-weight: bold; /* 加粗字母 */
    margin-right: 10px; /* 字母和输入框之间的间距 */
    white-space: nowrap; /* 防止换行 */
}

.option-input {
    flex: 1; /* 输入框占据剩余宽度 */
}

.answer-select {
    width: 120px; /* 自定义宽度 */
}
/* ================== 填空 ================== */
.answer-row {
    width: 60%; /* 确保行宽 */
    display: block; /* 强制让每个选项独占一行 */
    margin-bottom: 15px; /* 设置每个输入框之间的垂直间距 */
}
.answer-row el-input {
    width: 60%; /* 输入框宽度适应父容器 */
}

.form-item-spacing {
    margin-bottom: 20px; /* 设置下方间距，可根据需求调整 */
}


</style>

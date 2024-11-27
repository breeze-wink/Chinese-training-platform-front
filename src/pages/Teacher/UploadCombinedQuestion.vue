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
                        <el-input
                                v-model="stemForm.stem"
                                type="textarea"
                                placeholder="请输入题干"
                                :autosize="{ minRows: 3, maxRows: 10 }"
                        ></el-input>
                    </el-form-item>



                    <!-- 题型选择与添加按钮 -->
                    <div class="add-section">
                        <el-select v-model="selectedType" placeholder="请选择题型" class="question-type-select">
                            <el-option label="选择题" value="choice"></el-option>
                            <el-option label="填空题" value="fill"></el-option>
                            <el-option label="问答题" value="qa"></el-option>
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
                                <template v-if="question.type === 'choice'">
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

                                <template v-else-if="question.type === 'fill'">
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

                                <template v-else-if="question.type === 'qa'">
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
import { ref } from "vue";
import { nanoid } from "nanoid"; // 用于生成唯一 ID

// 题干数据
const stemForm = ref({
    stem: "",
});

// 当前选中的题型
const selectedType = ref(null);

// 子题数组
const questions = ref([]);
import KnowledgePointSelector from '@/pages/Teacher/TeacherPublicComponent/KnowledgePointSelector.vue'; // 引入知识点选择组件


// 题型标签
const questionTypeLabels = {
    choice: "选择",
    fill: "填空",
    qa: "问答",
};

// 添加题目
const addQuestion = () => {
    if (!selectedType.value) {
        return alert("请选择题型！");
    }

    // 根据题型生成对应的初始数据
    const newQuestion = {
        id: nanoid(),
        type: selectedType.value,
        data: selectedType.value === "choice"
                ? { question: "", options: ["", "", "", ""], answer: null }
                : selectedType.value === "fill"
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
const submitQuestions = () => {
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

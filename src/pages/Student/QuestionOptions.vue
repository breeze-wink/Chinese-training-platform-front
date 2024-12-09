<template>
    <div class="page-container">
        <Header />
        <div class="main-container">
            <Sidebar />
            <div class="content">
                <div class="question-options">
                    <h3>出题选项</h3>
                    <div class="option-buttons">
                        <label>
                            <input type="radio" name="questionOption" value="auto" v-model="selectedOption" />
                            自动
                        </label>
                        <label>
                            <input type="radio" name="questionOption" value="custom" v-model="selectedOption" />
                            自定义
                        </label>
                    </div>
                    <div class="practice-name-input" v-if="selectedOption === 'custom'">
                        <label for="practiceName">练习名称:</label>
                        <input type="text" id="practiceName" v-model="practiceName" placeholder="Custom Practice" />
                    </div>
                    <button @click="handleClick">确定出题</button>
                </div>
            </div>
        </div>

        <!-- 考点选择对话框 -->
        <el-dialog title="考点选择" v-model="dialogVisible" width="50%" :close-on-click-modal="false" :before-close="handleClose">
            <el-checkbox-group v-model="checkList">
                <div v-for="(group, type) in groupedKnowledgePoints" :key="type" class="knowledge-group">
                    <div class="knowledge-type">
                        <el-checkbox
                            :label="`${type}-all`"
                            @change="selectAllType(type, $event)"
                            class="type-checkbox"
                        >
                            {{ type }}
                        </el-checkbox>
                        <input
                            v-if="checkList.includes(`${type}-all`)"
                            type="number"
                            min="1"
                            max="10"
                            v-model.number="typeQuestionNumbers[type]"
                            class="type-question-number"
                            @focus="validateQuestionNumber"
                            @input="validateQuestionNumber"
                        />
                    </div>
                    <div class="knowledge-points">
                        <el-row :gutter="20">
                            <el-col :span="8" v-for="item in group" :key="item.id">
                                <div
                                    class="checkbox-with-input"
                                    :class="{ disabled: checkList.includes(`${type}-all`) }"
                                >
                                    <el-checkbox
                                        :label="item.id"
                                        @change="toggleQuestionInput(item.id)"
                                        :disabled="checkList.includes(`${type}-all`)"
                                    >
                                        {{ item.name }}
                                    </el-checkbox>
                                    <transition name="fade">
                                        <input
                                            v-if="questionInputs[item.id]"
                                            type="number"
                                            min="1"
                                            max="10"
                                            v-model.number="questionInputs[item.id].num"
                                            class="question-number"
                                            :disabled="checkList.includes(`${type}-all`)"
                                            @focus="validateQuestionNumber"
                                            @input="validateQuestionNumber"
                                        />
                                    </transition>
                                </div>
                            </el-col>
                        </el-row>
                    </div>
                </div>
            </el-checkbox-group>
            <span slot="footer" class="dialog-footer">
                <div class="button-container">
                    <el-button @click="dialogVisible = false" class="submit-button">取 消</el-button>
                    <el-button type="primary" @click="confirmSelection" class="submit-button" :loading="isProcessing">确 定</el-button>
                </div>
            </span>
        </el-dialog>

        <!-- 加载提示 -->
        <div v-if="isProcessing" class="loading-modal">
            <div class="modal-content">
                <p>正在加载题目，请稍候...</p>
                <div class="spinner"></div>
            </div>
        </div>

        <!-- 遮罩层 -->
        <div v-if="isProcessing" class="overlay"></div>
    </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import axios from 'axios';
import { mapGetters } from 'vuex';

export default {
    components: {
        Header,
        Sidebar,
    },
    data() {
        return {
            selectedOption: 'auto',
            dialogVisible: false,
            checkList: [],
            knowledgePoints: [],
            practiceName: 'Custom Practice',
            isProcessing: false,
            questionInputs: {},
            typeQuestionNumbers: {},
        };
    },
    computed: {
        ...mapGetters(['getUserId']),
        studentId() {
            return this.getUserId;
        },
        groupedKnowledgePoints() {
            const groups = {};
            this.knowledgePoints.forEach((item) => {
                const type = item.type || '未分类';
                if (!groups[type]) {
                    groups[type] = [];
                }
                groups[type].push(item);
            });
            return groups;
        },
    },
    created() {
        this.fetchKnowledgePoints();
    },
    methods: {
        async fetchKnowledgePoints() {
            try {
                const response = await axios.get(`/api/student/${this.studentId}/practice/get-knowledge-points`);
                if (response.status === 200) {
                    this.knowledgePoints = response.data.data;
                } else {
                    console.error('获取知识点失败', response.data.message);
                }
            } catch (error) {
                console.error('获取知识点失败', error.response ? error.response.data : error.message);
            }
        },
        handleClick() {
            if (this.selectedOption === 'auto') {
                this.generateAutoQuestions();
            } else {
                this.dialogVisible = true;
            }
        },
        async generateAutoQuestions() {
            try {
                const url = `/api/student/${this.studentId}/practice/generate-auto`;
                const response = await axios.post(url);
                const practiceId = response.data.practiceId;
                if (practiceId !== undefined) {
                    this.$router.push({
                        name: 'AnswerPractice',
                        query: { practiceId, mode: 'auto', practiceName: '自动练习' },
                    });
                }
            } catch (error) {
                console.error('题目发送失败', error);
            }
        },
        toggleQuestionInput(knowledgePointId) {
            // 如果某个 item.name 被选中，则显示或隐藏对应的输入框
            if (this.questionInputs[knowledgePointId]) {
                // 隐藏当前知识点的输入框
                delete this.questionInputs[knowledgePointId];
                this.checkList = this.checkList.filter((id) => id !== knowledgePointId);
            } else {
                // 显示当前知识点的输入框
                this.questionInputs[knowledgePointId] = { num: 1 };
                this.checkList.push(knowledgePointId);
            }
        },

        selectAllType(type, checked) {
            const group = this.groupedKnowledgePoints[type];

            if (checked) {
                // 全选该类型的所有知识点
                group.forEach((item) => {
                    if (!this.checkList.includes(item.id)) {
                        this.checkList.push(item.id);  // 将该知识点的ID加入选择列表
                    }
                });

                // 仅显示该类型下的题目数量输入框
                this.showOnlyTypeInputs(type);
            } else {
                // 取消全选该类型的所有知识点
                group.forEach((item) => {
                    this.checkList = this.checkList.filter((id) => id !== item.id); // 从选择列表中移除该知识点ID
                });

                // 清除该类型下的所有题目数量输入框
                this.clearTypeInputs(type);

                // 隐藏所有输入框
                this.hideAllInputs();
            }
        },

        showOnlyTypeInputs(type) {
            // 重置所有输入框状态为隐藏
            this.hideAllInputs();

            // 显示该类型的题目数量输入框
            this.typeQuestionNumbers[type] = 1; // 默认每个类型的题目数量为 1
        },

        hideAllInputs() {
            // 隐藏所有输入框
            for (let key in this.questionInputs) {
                delete this.questionInputs[key];
            }
        },

        clearTypeInputs(type) {
            const group = this.groupedKnowledgePoints[type];
            group.forEach((item) => {
                // 清除输入框数据
                if (this.questionInputs[item.id]) {
                    delete this.questionInputs[item.id];
                }
            });
        },

        async confirmSelection() {
            this.isProcessing = true;
            this.dialogVisible = false;

            const requestBody = {
                name: this.practiceName,
                knowledgePoints: [],
                questionBodyTypes: [],
            };

            for (const [type, group] of Object.entries(this.groupedKnowledgePoints)) {
                if (this.typeQuestionNumbers[type]) {
                    requestBody.questionBodyTypes.push({ type, num: this.typeQuestionNumbers[type] });
                } else {
                    group.forEach((item) => {
                        if (this.checkList.includes(item.id)) {
                            requestBody.knowledgePoints.push({
                                knowledgePointId: parseInt(item.id, 10),
                                num: this.questionInputs[item.id]?.num || 1,
                            });
                        }
                    });
                }
            }

            try {
                const url = `/api/student/${this.studentId}/practice/generate-define`;
                const response = await axios.post(url, requestBody, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const practiceId = response.data.practiceId;
                if (practiceId !== undefined) {
                    const questions = response.data.data;
                    this.$router.push({
                        name: 'AnswerPractice',
                        query: {
                            practiceId: practiceId,
                            questions: encodeURIComponent(JSON.stringify(questions)),
                            mode: 'custom',
                            practiceName: this.practiceName,
                        },
                    });
                } else {
                    console.error('PracticeId is undefined');
                }
            } catch (error) {
                console.error('考点和题目发送失败', error.response ? error.response.data : error.message);
            } finally {
                this.isProcessing = false;
            }
        },
        validateQuestionNumber(event) {
            const value = parseInt(event.target.value, 10);
            if (value > 10) {
                this.$message.error('最多只能选择10个题目。');
                event.target.value = 10;
            }
        },
    },
};
</script>

<style scoped>
/* 样式保持不变 */
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
    flex: 1;
    padding: 20px;
}

.question-options {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #f9f9f9;
}

.option-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
}

.practice-name-input {
    margin-bottom: 20px;
}

.practice-name-input label {
    margin-right: 10px;
}

.practice-name-input input {
    width: 200px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.type-selection {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px; /* 在类型选择之间增加间距 */
}

.type-selection .el-checkbox {
    margin-right: 20px; /* 增加复选框和文本间的间距 */
}

.type-selection .type-question-number {
    width: 50px; /* 增加输入框宽度 */
    padding: 6px 12px; /* 增加输入框内边距 */
    border: 1px solid #ccc;
    border-radius: 4px;
    text-align: center; /* 居中对齐输入框内的数字 */
    transition: all 0.3s ease; /* 添加过渡效果 */
}

.type-selection .type-question-number:focus {
    border-color: #007BFF; /* 输入框聚焦时改变边框颜色 */
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* 输入框聚焦时添加阴影 */
}

button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}

.generated-questions {
    margin-top: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 20px;
    background-color: #f9f9f9;
}

.submit-button {
    padding: 10px 20px;
    background-color: #007BFF; /* 设置按钮背景颜色 */
    color: white;
    border: none;
    border-radius: 5px;
    margin: 0 10px;
}

.submit-button:hover {
    background-color: #0056b3;
}

.generated-questions h3 {
    margin-top: 0;
}

.generated-questions .question {
    margin-bottom: 20px;
}

.el-row {
    margin-bottom: 20px;
}

/* 新增样式 */
.el-dialog__footer {
    text-align: center;
}

.button-container {
    display: flex;
    justify-content: center; /* 水平居中 */
    align-items: center; /* 垂直居中 */
}

.knowledge-group {
    margin-bottom: 20px;
}

.knowledge-type {
    font-size: 14px;
    color: #888;
    margin-bottom: 5px;
    text-align: left;
}

.knowledge-group h4 {
    margin-bottom: 10px;
    font-weight: bold;
    border-bottom: 1px solid #ddd; /* 添加下划线以区分不同的知识点类型 */
    padding-bottom: 5px;
    cursor: pointer; /* 使标题可点击 */
}

.checkbox-with-input {
    display: flex;
    align-items: center;
    margin-bottom: 10px; /* 在每个考点项之间增加间距 */
}

.checkbox-with-input .el-checkbox {
    margin-right: 20px; /* 增加复选框和文本间的间距 */
}

.checkbox-with-input .question-number {
    width: 50px; /* 增加输入框宽度 */
    padding: 6px 12px; /* 增加输入框内边距 */
    border: 1px solid #ccc;
    border-radius: 4px;
    text-align: center; /* 居中对齐输入框内的数字 */
    transition: all 0.3s ease; /* 添加过渡效果 */
}

.checkbox-with-input .question-number:focus {
    border-color: #007BFF; /* 输入框聚焦时改变边框颜色 */
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* 输入框聚焦时添加阴影 */
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
    opacity: 0;
}

/* 遮罩层样式 */
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
    z-index: 999; /* 确保遮罩层在最上层 */
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 加载提示模态窗样式 */
.loading-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; /* 确保模态窗在遮罩层之上 */
}

.modal-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    text-align: center;
    max-width: 300px;
    width: 100%;
}

.modal-content p {
    margin: 0 0 10px;
    font-size: 16px;
    color: #333;
}

.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 20px auto;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
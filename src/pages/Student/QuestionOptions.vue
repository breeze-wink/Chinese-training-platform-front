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
                    <div class="question-number-input" v-if="selectedOption === 'custom'">
                        <label for="questionNumber">题目数量:</label>
                        <input type="number" id="questionNumber" v-model.number="questionNum" min="1" max="100" />
                    </div>
                    <div class="practice-name-input" v-if="selectedOption === 'custom'">
                        <label for="practiceName">练习名称:</label>
                        <input type="text" id="practiceName" v-model="practiceName" placeholder="Custom Practice" />
                    </div>
                    <button @click="handleClick">确定出题</button>
                </div>
            </div>
        </div>
        <el-dialog title="考点选择" v-model="dialogVisible" width="50%">
            <el-checkbox-group v-model="checkList">
                <div v-for="(group, type) in groupedKnowledgePoints" :key="type" class="knowledge-group">
                    <h4 @click="logGroupType(type)">{{ type }}</h4>
                    <el-row :gutter="20">
                        <el-col :span="8" v-for="item in group" :key="item.id">
                            <el-checkbox :label="item.id">{{ item.name }}</el-checkbox>
                        </el-col>
                    </el-row>
                </div>
            </el-checkbox-group>
            <span slot="footer" class="dialog-footer">
                <div class="button-container">
                    <el-button @click="dialogVisible = false" class="submit-button">取 消</el-button>
                    <el-button type="primary" @click="confirmSelection" class="submit-button">确 定</el-button>
                </div>
            </span>
        </el-dialog>
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
            questionNum: 10,
            practiceName: 'Custom Practice', // 默认练习名称
        };
    },
    computed: {
        ...mapGetters(['getUserId']),
        studentId() {
            return this.getUserId;
        },
        groupedKnowledgePoints() {
            const groups = {};
            this.knowledgePoints.forEach(item => {
                const type = item.type; // 直接使用字符串类型的 type
                if (!groups[type]) {
                    groups[type] = [];
                }
                groups[type].push(item);
            });
            return groups;
        }
    },
    created() {
        this.fetchKnowledgePoints().then(() => {
            console.log('知识点数据:', this.knowledgePoints);
            console.log('分组后的知识点数据:', this.groupedKnowledgePoints);
        });
    },
    methods: {
        async fetchKnowledgePoints() {
            try {
                const response = await axios.get(`/api/student/${this.studentId}/practice/get-knowledge-points`);
                if (response.status === 200) {
                    const rawKnowledgePoints = response.data.data;
                    this.knowledgePoints = rawKnowledgePoints.map(item => ({
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        type: item.type // 保持 type 为字符串
                    }));
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
                const response = await axios.post(url, {}, {
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
                            mode: 'auto',
                            practiceName: '自动练习'
                        },
                    });
                } else {
                    console.error('PracticeId is undefined');
                }
            } catch (error) {
                console.error('题目发送失败', error.response ? error.response.data : error.message);
            }
        },
        async confirmSelection() {
            const requestBody = {
                num: this.questionNum,
                name: this.practiceName,
                data: this.checkList.map(knowledgePointId => ({ knowledgePointId })),
            };

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
                            practiceName: this.practiceName
                        },
                    });
                } else {
                    console.error('PracticeId is undefined');
                }
            } catch (error) {
                console.error('考点和题目发送失败', error.response ? error.response.data : error.message);
            }

            this.dialogVisible = false;
        },
        logGroupType(type) {
            console.log('Group Type:', type); // 控制台输出
        }
    }
};
</script>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
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

.question-number-input {
    margin-bottom: 20px;
}

.question-number-input label {
    margin-right: 10px;
}

.question-number-input input {
    width: 100px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
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
    padding: 10px 20px;
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

.button-container .el-button {
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    margin: 0 10px;
}

.button-container .el-button:hover {
    background-color: #0056b3;
}

.knowledge-group {
    margin-bottom: 20px;
}

.knowledge-group h4 {
    margin-bottom: 10px;
    font-weight: bold;
    border-bottom: 1px solid #ddd; /* 添加下划线以区分不同的知识点类型 */
    padding-bottom: 5px;
    cursor: pointer; /* 使标题可点击 */
}

.el-checkbox {
    display: block; /* 使复选框垂直排列 */
    margin-bottom: 10px;
}
</style>







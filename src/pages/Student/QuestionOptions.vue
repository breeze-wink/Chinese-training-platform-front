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
                    <div class="question-number-input">
                        <label for="questionNumber">题目数量:</label>
                        <input type="number" id="questionNumber" v-model.number="questionNum" min="1" max="100" />
                    </div>
                    <button @click="handleClick">确定出题</button>
                </div>
            </div>
        </div>
        <el-dialog title="考点选择" v-model="dialogVisible" width="50%">
            <el-checkbox-group v-model="checkList">
                <el-row :gutter="20">
                    <el-col :span="8" v-for="item in knowledgePoints" :key="item.id">
                        <el-checkbox :label="item.id">{{ item.name }}</el-checkbox>
                    </el-col>
                </el-row>
            </el-checkbox-group>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirmSelection">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import axios from 'axios';
import router from '@/router';

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
            studentId: '123456',
            questionNum: 10,
        };
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
                const response = await axios.post(`/api/student/${this.studentId}/practice/generate-auto`, {}, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                console.log('题目发送成功', response.data);
                const questions = response.data.data;
                router.push({
                    name: 'AnswerPractice',
                    params: {
                        practiceId: this.studentId,
                        questions: JSON.stringify(questions),
                        mode: 'auto',
                    },
                });
            } catch (error) {
                console.error('题目发送失败', error.response ? error.response.data : error.message);
            }
        },
        async confirmSelection() {
            const requestBody = {
                num: this.questionNum,
                name: 'Custom Practice',
                data: this.checkList.map(knowledgePointId => ({ knowledgePointId })),
            };

            try {
                const response = await axios.post(`/api/student/${this.studentId}/practice/generate-define`, requestBody, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                console.log('题目发送成功', response.data);
                const questions = response.data.data;
                router.push({
                    name: 'AnswerPractice',
                    params: {
                        practiceId: this.studentId,
                        questions: JSON.stringify(questions),
                        mode: 'custom',
                    },
                });
            } catch (error) {
                console.error('考点和题目发送失败', error.response ? error.response.data : error.message);
            }

            this.dialogVisible = false;
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

button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #45a049;
}

.generated-questions {
    margin-top: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 20px;
    background-color: #f9f9f9;
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
</style>
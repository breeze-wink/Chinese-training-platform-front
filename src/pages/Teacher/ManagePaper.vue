<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header />

        <div class="main-container">
            <!-- 引入侧边栏通用组件 -->
            <Sidebar />

            <!-- 内容区 -->
            <div class="content">
                <h2>试卷管理</h2>
                <div class="input-button-group">
                    <el-input v-model="search" placeholder="输入试卷名称" style="width: 300px;"></el-input>
                    <el-button type="primary" @click="searchPaper">查询</el-button>
                    <el-button type="warning" @click="resetSearch">重置</el-button>
                </div>

                <!-- 表格显示数据 -->
                <el-table :data="paginatedData" style="width: 100%; margin-top: 20px;"  @sort-change="handleSortChange">
                    <el-table-column prop="name" label="试卷名称" width="150"></el-table-column>
                    <el-table-column
                            prop="createTime"
                            label="生成时间"
                            width="250"
                            sortable
                            :sort-method="sortPapers">
                    </el-table-column>

                    <el-table-column
                            prop="difficulty"
                            label="难度"
                            width="120"
                            sortable
                            :sort-method="sortPapers">
                    </el-table-column>

                    <el-table-column
                            prop="totalScore"
                            label="总分" width="150"
                            sortable
                            :sort-method="sortPapers">
                    </el-table-column>

                    <el-table-column label="操作">
                        <template #default="{ row }">
                            <el-button size="small" type="primary" @click="previewPaper(row)">预览</el-button>
                            <el-button size="small" type="success" @click="showPublishDialog(row)">发布</el-button>

                            <el-popconfirm
                                    title="确定要清空题目吗？"
                                    @confirm="deletePaper(row)"
                            >
                                <template #reference>
                            <el-button size="small" type="danger" >删除</el-button>
                                </template>
                            </el-popconfirm>

                        </template>
                    </el-table-column>
                </el-table>

                <!-- 分页 -->
              <div style="display: flex; justify-content: center; margin-top: 20px;">
                <el-pagination
                        style="margin-top: 20px;"
                        @current-change="handlePageChange"
                        :current-page="currentPage"
                        :page-size="pageSize"
                        layout="prev, pager, next,jumper"
                        :total="filteredData.length"
                />
              </div>
            </div>
        </div>
        <!-- 发布试卷弹窗 -->
        <el-dialog v-model="dialogVisible" title="发布试卷" width="500px" align-center>
            <el-form :model="publishForm">
                <el-form-item label="作业名称" :label-width="formLabelWidth">
                    <el-input v-model="publishForm.name" placeholder="请输入作业名称" style="width: 220px"></el-input>
                </el-form-item>

                <!-- 引用试卷 -->
                <el-form-item label="引用试卷" :label-width="formLabelWidth">
                    <el-input v-model="publishForm.referencePaper" :readonly="true" placeholder="引用试卷" style="width: 220px;"></el-input>
                </el-form-item>

                <!-- 作业描述 -->

                <el-form-item label="作业描述" :label-width="formLabelWidth">
                    <el-input
                            v-model="publishForm.description"
                            type="textarea"
                            placeholder="请输入此作业相关描述（若无，填写‘无’）"
                            :autosize="{ minRows: 4, maxRows: 10 }"
                            style="width: 220px;"></el-input>
                </el-form-item>




                <el-form-item label="发布对象" :label-width="formLabelWidth">
                    <el-radio-group v-model="publishForm.targetType">
                        <el-radio label="班级">班级</el-radio>
                        <el-radio label="小组">小组</el-radio>
                        <el-radio label="个人">个人</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item v-if="publishForm.targetType === '班级'" label="选择班级" :label-width="formLabelWidth">
                    <el-checkbox-group v-model="publishForm.classes">
                        <el-checkbox v-for="item in classes" :key="item.classId" :value="item.classId">{{ item.className }}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>

                <el-form-item v-if="publishForm.targetType === '小组'" label="选择小组" :label-width="formLabelWidth">
                    <el-checkbox-group v-model="publishForm.groups">
                        <el-checkbox v-for="item in groups" :key="item.groupId" :value="item.groupId">{{ item.groupName }} ({{ item.className }})</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>

                <el-form-item v-if="publishForm.targetType === '个人'" label="选择班级和学生" :label-width="formLabelWidth">
                    <el-select v-model="publishForm.selectedClass" placeholder="选择班级" @change="fetchStudents" style="width: 220px">
                        <el-option v-for="item in classes" :key="item.classId" :value="item.classId" :label="item.className"></el-option>
                    </el-select>
                    <el-checkbox-group v-model="publishForm.selectedStudents">
                        <el-checkbox v-for="student in students" :key="student.studentId" :value="student.studentId">{{ student.studentName }}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>


                <el-form-item label="发布时间" :label-width="formLabelWidth">
                    <el-date-picker v-model="publishForm.publishTime" type="datetime" placeholder="选择发布时间"></el-date-picker>
                </el-form-item>

                <el-form-item label="截止时间" :label-width="formLabelWidth">
                    <el-date-picker v-model="publishForm.dueTime" type="datetime" placeholder="选择截止时间"></el-date-picker>
                </el-form-item>

                <span slot="footer" class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="publishHomework">发布</el-button>
                </span>
            </el-form>
        </el-dialog>

        <!-- 加载提示 -->
        <div v-if="isLoading" class="loading-modal">
            <div class="modal-content">
                <p v-if="isLoading">正在加载试卷信息，请稍候...</p>
                <div class="spinner"></div>
            </div>
        </div>

        <!-- 遮罩层 -->
        <div v-if="isLoading" class="overlay"></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import {ElButton, ElInput, ElTable, ElTableColumn, ElMessage, ElPagination, ElPopconfirm} from 'element-plus';
import axios from 'axios';
import { useStore } from 'vuex';
import {toRaw} from "vue-demi";
import {useRouter} from "vue-router"; // 使用 Vuex 进行状态管理

// 获取 Vuex 状态
const store = useStore();
const isLoading = ref(false);
// 获取教师 ID
const teacherId = computed(() => store.state.user.id);

// 定义变量
const search = ref('');  // 搜索框输入的内容
const currentPage = ref(1);
const pageSize = ref(10);  // 每页显示的行数
const totalItems = ref(0);
const papers = ref([]);  // 存储所有试卷
const filteredData = ref([]);  // 存储筛选后的试卷数据

const sortBy = ref('createTime');  // 默认排序字段
const sortOrder = ref('ascending');  // 默认排序顺序：升序


// 获取教师所有试卷数据
const getPapers = async () => {
    try {
        const response = await axios.get(`/api/teacher/papers/${teacherId.value}`);
        if (response.status === 200) {
            // 检查返回的数据格式，并确保 papers 是一个数组

            if (Array.isArray(response.data.papers)) {
                papers.value = response.data.papers;
                totalItems.value = papers.value.length;
                filteredData.value = sortPapers(papers.value);  // 初始时，显示所有试卷
            } else {
                // 如果返回的数据不是数组，抛出错误
                papers.value = [];  // 处理错误情况，确保不会影响后续操作
            }

        } else {
            ElMessage({ message: '获取试卷信息失败：' + response.data.message, type: 'error' });
        }
    } catch (error) {
        console.error(error);
        ElMessage({ message: '获取试卷信息失败，请稍后再试', type: 'error' });
    }
};

// 页面加载时获取试卷数据
onMounted(() => {
    isLoading.value=true;
    Promise.all([getPapers(), fetchClasses(), fetchGroups()])
            .then(() => {
                isLoading.value = false;
            })
            .catch((error) => {
                console.error('Error loading data:', error);
                isLoading.value = false;
            });
});

// 按照查询条件过滤试卷
const searchPaper = () => {
    filteredData.value = papers.value.filter(paper =>
            paper.name && paper.name.includes(search.value)
    );
    ElMessage({ message: '查询成功', type: 'success' });
};

// 重置搜索
const resetSearch = () => {
    search.value = '';  // 清空搜索框
    filteredData.value = papers.value;  // 重置为所有试卷
};

// 获取分页数据
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredData.value.slice(start, end);
});

// 页码变更时触发
const handlePageChange = (page) => {
    currentPage.value = page;
};
const sortPapers = (papers) => {
    papers = toRaw(papers);
    if (!Array.isArray(papers)) {
        return [];
    }
    return papers.slice().sort((a, b) => {
        let valA = a[sortBy.value];
        let valB = b[sortBy.value];

        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (sortOrder.value === 'ascending') {
            return valA < valB ? -1 : valA > valB ? 1 : 0;
        } else {
            return valA > valB ? -1 : valA < valB ? 1 : 0;
        }
    });
};

//调整排序逻辑
const handleSortChange = (sort) => {
    sortBy.value = sort.prop;  // 当前排序字段
    sortOrder.value = sort.order === 'ascending' ? 'ascending' : 'descending';  // 当前排序顺序
    filteredData.value = sortPapers(papers.value);  // 重新排序
};



/*****************按钮逻辑：开始********************/

const replaceImageSrc = async (htmlContent) => {
    if (!htmlContent) return htmlContent;

    // 创建一个临时的 DOM 元素来解析 HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // 查找所有 img 标签
    const images = tempDiv.querySelectorAll('img');

    // 遍历所有 img 标签并替换 src
    const replacePromises = Array.from(images).map(async (img) => {
        const src = img.getAttribute('src');
        if (src && src.startsWith('/uploads/content/')) {
            const imageName = src.replace('/uploads/content/', '');
            const imageUrl = `/api/uploads/images/content/${imageName}`;
            const token = store.getters.getToken; // 直接使用 store 实例访问 getters

            try {
                // 使用 Axios 获取图片数据，设置响应类型为 blob
                const response = await axios.get(imageUrl, {
                    responseType: 'blob',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    // 创建 Blob URL
                    const blobUrl = URL.createObjectURL(response.data);
                    img.setAttribute('src', blobUrl);
                } else {
                    console.error(`获取图片失败: ${imageUrl}`);
                    // 可以设置一个占位图或保留原始 src
                }
            } catch (error) {
                console.error(`获取图片失败: ${imageUrl}`, error);
                // 可以设置一个占位图或保留原始 src
            }
        }
    });

    // 等待所有图片替换完成
    await Promise.all(replacePromises);

    return tempDiv.innerHTML;
};
// 在 <script setup> 标签内
const router = useRouter();
// 预览试卷
const previewPaper = async (paper) => {
    try {
        // 调用后端接口获取试卷详情
        const response = await axios.get('/api/teacher/paper', { params: { id: paper.id } });
        if (response.status === 200 && response.data.message === 'success') {
            const paperDetails = response.data;

            // 处理问题数据，确保每个问题都有唯一的 ID
            const formattedQuestions = await Promise.all(paperDetails.questions.map(async q => {
                if (q.subQuestions && q.subQuestions.length > 0) {

                    // 大题
                    return {
                        id: `paper-${paper.id}-seq-${q.sequence}`,
                        body: await replaceImageSrc(q.body),
                        sequence: q.sequence,
                        score: q.score,
                        type: 'big', // 标识为大题
                        subQuestions: q.subQuestions.map((sub, index) => ({
                            id: `paper-${paper.id}-seq-${q.sequence}-sub-${index + 1}`,
                            question: sub.question,
                            answer: sub.answer,
                            explanation: sub.explanation,
                            options: sub.options || [],
                            score: sub.score,
                            type: sub.type,
                            knowledge: sub.knowledge,
                            subScores: sub.subScores || []
                        }))
                    };
                } else {
                    // 单题
                    return {
                        id: `paper-${paper.id}-seq-${q.sequence}`,
                        question: await replaceImageSrc(q.question),
                        answer: q.answer,
                        explanation: q.explanation,
                        options: q.options || [],
                        type: q.type,
                        knowledge: q.knowledge,
                        score: q.score,
                        sequence: q.sequence
                    };
                }
            })
            );

            // 将试卷题目信息加入 basket
            await store.dispatch('addQuestionsToBasket', formattedQuestions);
            await router.push({
                name: 'PreviewGeneratedPaper', // 确保在路由中定义了这个名称
                query: {
                    name: paper.name,
                    difficulty: paper.difficulty, // 假设试卷对象中有 difficulty 字段
                    totalScore: paper.totalScore
                }
            });
            ElMessage.success(`试卷 "${paper.name}" 已添加到试卷篮`);
        } else {
            ElMessage.error('获取试卷详情失败');
        }
    } catch (error) {
        console.error(error);
        ElMessage.error('获取试卷详情失败');
    }
};



// 删除试卷
const deletePaper = async (paper) => {
    try {
        // 调用后端删除接口
        const response = await axios.delete(`/api/teacher/delete-paper/${paper.id}`);

        if (response.status === 200) {
           await getPapers();

            ElMessage.success(`试卷 ${paper.name} 已删除`);

        } else {
            ElMessage.error(`删除试卷失败：${response.data.message}`);
        }
    } catch (error) {
        ElMessage.error('删除试卷失败，请稍后再试');
    }

};

/*****************弹窗相关：开始********************/

const dialogVisible = ref(false);  // 弹窗显示与否
const classes = ref([]);
const groups = ref([]);
const students = ref([]);

// 设置表单标签宽度
const formLabelWidth = '150px';  // 设置表单项标签的宽度


// 点击发布按钮时，弹出发布弹窗
const showPublishDialog = (row) => {
    // 将当前试卷的相关信息填充到弹窗中
    publishForm.value.name = '';
    publishForm.value.referencePaper = row.name;
    publishForm.value.referencePaperId = row.id;
    publishForm.value.publishTime = '';
    publishForm.value.dueTime = '';
    publishForm.value.targetType = '班级';
    publishForm.value.classes = [];
    publishForm.value.groups = [];
    publishForm.value.selectedClass = '';
    publishForm.value.selectedStudents = [];

    dialogVisible.value = true;  // 打开弹窗

};


// 验证规则
const validationRules = {
    name: {
        validate: (value) => !!value,
        message: '请填写作业名称'
    },
    description: {
        validate: (value) => !!value,
        message: '请填写作业描述'
    },
    publishTime: {
        validate: (value) => !!value,
        message: '请选择发布时间'
    },


    dueTime: {
        validate: (value) => !!value && new Date(value) > new Date(),
        message: '截止时间必须晚于当前时间'

    },
    dueTimeAfterPublishTime: {
        validate: () => {
            const publishTime = new Date(publishForm.value.publishTime).getTime();
            const dueTime = new Date(publishForm.value.dueTime).getTime();
            return dueTime > publishTime;
        },
        message: '截止时间必须晚于发布时间'
    },
    targetType: {
        validate: (value) => !!value,
        message: '请选择发布对象'
    },
    classes: {
        validate: (value) => publishForm.value.targetType === '班级' ? value.length > 0 : true,
        message: '请选择班级'
    },
    groups: {
        validate: (value) => publishForm.value.targetType === '小组' ? value.length > 0 : true,
        message: '请选择小组'
    },
    selectedClass: {
        validate: (value) => publishForm.value.targetType === '个人' ? value !== '' : true,
        message: '请选择班级'
    },
    selectedStudents: {
        validate: (value) => publishForm.value.targetType === '个人' ? value.length > 0 : true,
        message: '请选择学生'
    }
};

const publishForm = ref({
    name: '',
    referencePaper: '',
    referencePaperId: '',
    publishTime: '',
    dueTime: '',
    targetType: '班级',
    classes: [],
    groups: [],
    selectedClass: '',
    selectedStudents: [],
    description: '无'
});
// 发布试卷
const publishHomework = async () => {
    // 遍历验证规则，进行验证
    for (const [field, rule] of Object.entries(validationRules)) {
        const value = publishForm.value[field];

        if (!rule.validate(value)) {
            ElMessage.error(rule.message);
            return;  // 终止发布
        }
    }

    const targetIds = publishForm.value.targetType === '班级' ? publishForm.value.classes :
            publishForm.value.targetType === '小组' ? publishForm.value.groups :
                    publishForm.value.selectedStudents;

    const payload = {
        name: publishForm.value.name,
        description: publishForm.value.description,
        referencedPaperId: publishForm.value.referencePaperId,
        targetIds:targetIds,
        targetType: publishForm.value.targetType,
        publishTime: publishForm.value.publishTime,
        dueTime: publishForm.value.dueTime
    };

    try {
        const response = await axios.post(`/api/teacher/homework/publish`, payload);
        if (response.status === 200) {
            ElMessage.success('试卷发布成功');
            dialogVisible.value = false;  // 关闭弹窗
        } else {
            ElMessage({ message: '试卷发布失败：' + response.data.message, type: 'error' });
        }

        // 其他成功操作（例如关闭弹窗等）
    } catch (error) {
        console.error('发布失败:', error.response.data)
        // 错误处理
    }

};

// 获取班级信息
const fetchClasses = async () => {
    try {
        const response = await axios.get(`/api/teacher/${teacherId.value}/get-classes`);
        if (response.status === 200) {
            classes.value = response.data.data;
        }
    } catch (error) {
        ElMessage.error('获取班级信息失败');
    }
};

// 获取小组信息
const fetchGroups = async () => {
    try {
        const response = await axios.get(`/api/teacher/${teacherId.value}/get-groups`);
        if (response.status === 200) {
            groups.value = response.data.data;
        }
    } catch (error) {
        ElMessage.error('获取小组信息失败');
    }
};

// 获取班级成员
const fetchStudents = async (classId) => {
    try {
        const response = await axios.get(`/api/teacher/${teacherId.value}/get-class-members`, { params: { classId } });
        if (response.status === 200) {
            students.value = response.data.data;
        }
    } catch (error) {
        ElMessage.error('获取班级成员信息失败');
    }
};

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
    background-color: #f0f0f0; /* 背景改为浅灰色 */
}

.content {
    max-width: 1000px;
    width: 100%;
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin-right: 50px;
    margin-bottom: 30px;

    margin-left: 300px;
}

.input-button-group {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}
.el-button {
    appearance: none;  /* 去掉浏览器默认样式 */
    -webkit-appearance: none; /* 适用于 Webkit 内核的浏览器（如 Safari） */
    -moz-appearance: none; /* 适用于 Firefox */
}

.dialog-footer {    /*弹窗底部*/
    display: flex;
    justify-content: center;  /* 居中 */
    gap: 10px;  /* 按钮之间的间距 */
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
    color: white;
    font-size: 1.2em;
}


</style>

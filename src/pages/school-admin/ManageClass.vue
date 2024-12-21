<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header />

        <div class="main-container">
            <!-- 引入侧边栏通用组件 -->
            <Sidebar />

            <!-- 内容区 -->
            <div class="content">
                <h2>班级管理</h2>

                <!-- 查询框 -->
                <div class="input-button-group">
                    <el-input v-model="search" placeholder="搜索班级名称或描述" style="width: 300px;"></el-input>
                    <el-input v-model="teacherSearch" placeholder="搜索老师姓名" style="width: 300px;"></el-input>
                </div>

                <!-- 班级表格 -->
                <el-table :data="paginatedClasses" style="width: 100%; margin-top: 20px;">
                    <el-table-column prop="classId" label="班级ID" width="180"></el-table-column>
                    <el-table-column prop="name" label="班级名称"></el-table-column>
                    <el-table-column prop="teacherName" label="老师姓名"></el-table-column>
                    <el-table-column prop="inviteCode" label="邀请码"></el-table-column>
                    <el-table-column label="操作">
                        <template #default="{ row }">
                            <div class="action-buttons">
                                <el-button size="small" type="primary" @click="viewClassDetails(row)">基本信息</el-button>
                                <el-button size="small" type="primary" @click="viewScore(row)">成绩详情</el-button>
                                <el-button size="small" type="danger" @click="openChangeTeacherDialog(row)">更换老师</el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 分页组件 -->
                <el-pagination
                    v-if="filteredClasses.length > 0"
                    :page-size="pageSize"
                    :current-page="currentPage"
                    :total="filteredClasses.length"
                    @current-change="handlePageChange"
                    layout="prev, pager, next, jumper"
                    background
                ></el-pagination>

                <!-- 班级详情弹窗 -->
                <el-dialog v-model="classDetailsDialogVisible" width="60%" title="基本信息">
                    <div v-if="classDetails">
                        <!-- 班级信息 -->
                        <div class="class-info">
                            <h3 class="class-info-title">班级信息</h3>
                            <p><strong>班级名称：</strong>{{ classDetails.className }}</p>
                            <p><strong>班级描述：</strong>{{ classDetails.classDescription || '暂无描述' }}</p>
                        </div>

                        <!-- 小组信息 -->
                        <div class="group-info">
                            <h4>小组信息</h4>
                            <el-table :data="classDetails.groups" style="width: 100%" stripe>
                                <el-table-column prop="groupId" label="小组ID" width="100"></el-table-column>
                                <el-table-column prop="groupName" label="小组名称"></el-table-column>
                                <el-table-column prop="groupDescription" label="小组描述"></el-table-column>
                            </el-table>
                        </div>

                        <!-- 学生信息 -->
                        <div class="student-info">
                            <h4>学生信息</h4>
                            <el-table :data="classDetails.students" style="width: 100%" stripe>
                                <el-table-column prop="studentId" label="学号" width="100"></el-table-column>
                                <el-table-column prop="studentName" label="学生姓名"></el-table-column>
                            </el-table>
                        </div>
                    </div>
                </el-dialog>

                <!-- 成绩详情弹窗 -->
                <el-dialog v-model="scoreDetailsDialogVisible" width="60%" title="成绩详情">
                    <div v-if="scoreDetails.length > 0">
                        <h4>班级成绩详情</h4>
                        <el-table :data="scoreDetails" style="width: 100%" stripe>
                            <el-table-column prop="name" label="知识点"></el-table-column>
                            <el-table-column prop="score" label="掌握情况" width="180"></el-table-column>
                        </el-table>
                    </div>
                    <div v-else>
                        <p>暂无成绩数据。</p>
                    </div>
                </el-dialog>

                <!-- 更换老师弹窗 -->
                <el-dialog v-model="changeTeacherDialogVisible" width="40%" align-center title="更换老师">
                    <el-form :model="changeTeacherForm" ref="changeTeacherFormRef">
                        <el-form-item label="选择新老师" prop="newTeacherId">
                            <el-select v-model="changeTeacherForm.newTeacherId" placeholder="请选择新老师">
                                <el-option
                                    v-for="teacher in teachers"
                                    :key="teacher.teacherId"
                                    :label="teacher.name"
                                    :value="teacher.teacherId">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                    <template #footer>
                        <span class="dialog-footer">
                            <el-button @click="closeChangeTeacherDialog">取 消</el-button>
                            <el-button type="primary" @click="submitChangeTeacher">确 定</el-button>
                        </span>
                    </template>
                </el-dialog>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import {ElButton, ElInput, ElTable, ElTableColumn, ElMessage, ElDialog, ElMessageBox} from 'element-plus';
import axios from 'axios';
import { useStore } from 'vuex';

// 定义变量
const search = ref('');
const teacherSearch = ref(''); // 用于按老师名字搜索
const classes = ref([]);
const classDetailsDialogVisible = ref(false);
const classDetails = ref(null);
const store = useStore();
const adminId = computed(() => store.state.user.id); // 获取管理员ID

// 获取所有班级信息
const getAllClasses = async () => {
    try {
        const response = await axios.get(`/api/school-admin/${adminId.value}/get-classes`);
        if (response.status === 200) {
            classes.value = response.data.data;
            ElMessage({ message: '班级获取成功', type: 'success' });
        }
    } catch (error) {
        ElMessage({ message: '班级获取失败', type: 'error' });
    }
};

// 过滤班级信息
const filteredClasses = computed(() => {
    return classes.value.filter(item =>
        (item.name.includes(search.value) || item.inviteCode.includes(search.value)) &&
        item.teacherName.includes(teacherSearch.value) // 添加按教师名字的本地筛选
    );
});
// 分页设置
const pageSize = ref(10); // 每页显示的数量
const currentPage = ref(1); // 当前页码

// 计算分页后的数据
const paginatedClasses = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredClasses.value.slice(start, end);
});

// 分页切换
const handlePageChange = (newPage) => {
    currentPage.value = newPage;
};

// 查看班级详情
const viewClassDetails = async (item) => {
    try {
        const response = await axios.get(`/api/school-admin/${adminId.value}/query-class`, {
            params: { classId: item.classId },
        });
        console.log(response.data);
        if (response.status === 200 && response.data.data) {
            classDetails.value = response.data.data;
            console.log(classDetails.value)
            console.log(classDetailsDialogVisible.value)
            classDetailsDialogVisible.value = true;  // 显示弹窗
            console.log(classDetailsDialogVisible.value)
            ElMessage({ message: '班级详情获取成功', type: 'success' });
        } else {
            ElMessage({ message: '班级详情为空', type: 'warning' });
        }
    } catch (error) {
        ElMessage({ message: '班级详情获取失败', type: 'error' });
        console.error("Error fetching class details:", error);
    }
};

// 定义成绩详情弹窗相关变量
const scoreDetailsDialogVisible = ref(false);  // 控制成绩详情弹窗的显示
const scoreDetails = ref([]);  // 存储成绩数据

// 查看成绩详情
const viewScore = async (item) => {
    const token = store.getters.getToken;
    console.log(item.classId)
    try {
        // 调用成绩详情 API
        const response = await axios.get('/api/school-admin/class/knowledge-point-status', {
            params: { classId: item.classId }
        });

        if (response.status === 200 && response.data.data) {
            scoreDetails.value = response.data.data.map(info => ({
                name: info.name || '未知知识点',
                score: info.score !== null && info.score !== undefined ? `${info.score}%` : '暂无数据', // 判断 score 是否为空
            }));
            scoreDetailsDialogVisible.value = true;  // 显示弹窗
            ElMessage({ message: '成绩详情获取成功', type: 'success' });
        } else {
            ElMessage({ message: '成绩详情获取失败', type: 'error' });
        }
    } catch (error) {
        ElMessage({ message: '成绩详情获取失败', type: 'error' });
        console.error("Error fetching score details:", error);
    }
};

// 更换老师相关逻辑
const changeTeacherDialogVisible = ref(false);
const changeTeacherForm = ref({
    newTeacherId: ''
});
const currentClassForChange = ref(null);
const teachers = ref([]);

const openChangeTeacherDialog = (row) => {
    currentClassForChange.value = row;
    if (teachers.value.length === 0) {
        getTeachers(); // 如果教师列表为空，加载教师列表
    }
    changeTeacherDialogVisible.value = true;
};

const closeChangeTeacherDialog = () => {
    changeTeacherForm.value.newTeacherId = '';
    currentClassForChange.value = null;
    changeTeacherDialogVisible.value = false;
};

const submitChangeTeacher = async () => {
    if (!changeTeacherForm.value.newTeacherId) {
        ElMessage({ message: '请选择新老师', type: 'warning' });
        return;
    }

    try {
        await ElMessageBox.confirm(
            `确定要将 "${currentClassForChange.value.name}" 的老师更换为新老师吗？`,
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        );

        const response = await axios.get(`/api/school-admin/change-teacher-of-class`, {
            params: {
                classId: currentClassForChange.value.classId,
                teacherId: changeTeacherForm.value.newTeacherId
            }
        });

        if (response.status === 200) {
            ElMessage({ message: '更换老师成功', type: 'success' });
            getAllClasses(); // 刷新班级列表
        } else {
            ElMessage({ message: '更换老师失败', type: 'error' });
        }
    } catch (error) {
        if (error && error.message !== 'cancel') {
            ElMessage({ message: '更换老师失败，请稍后再试', type: 'error' });
        }
    } finally {
        closeChangeTeacherDialog();
    }
};
// 获取所有教师列表
const getTeachers = async () => {
    try {
        const response = await axios.get(`/api/school-admin/${adminId.value}/query-all-teachers`);
        if (response.status === 200 && response.data.data) {
            teachers.value = response.data.data.map(teacher => ({
                teacherId: teacher.id,
                name: teacher.name,
                email: teacher.email,
                phoneNumber: teacher.phoneNumber
            }));
            ElMessage({ message: '教师账号信息查询成功', type: 'success' });
        } else {
            ElMessage({ message: '教师账号信息查询失败', type: 'error' });
        }
    } catch (error) {
        ElMessage({ message: '教师账号信息查询失败', type: 'error' });
        console.error("Error fetching teachers:", error);
    }
};
// 加载初始数据
onMounted(() => {
    getAllClasses();
});
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
}

.content {
    max-width: 1000px;
    width: 100%;
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin-right: 50px;
    margin-left: 300px;
    margin-bottom: 30px;
}

/* 确保弹窗背景不被遮挡 */
.el-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;  /* 确保弹窗显示在最上层 */
    border-radius: 8px; /* 添加圆角 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

/* 使标题更有视觉层次感 */
.el-dialog__header {
    background-color: #f4f7fc;
    color: #2c3e50;
    font-weight: 600;
}

/* 班级信息区域 */
.class-info {
    padding: 20px;
    border-bottom: 1px solid #e5e9f2;
}

.class-info-title {
    color: #409eff;
    font-size: 18px;
    margin-bottom: 10px;
}

/* 小组信息和学生信息区域 */
.group-info, .student-info {
    padding: 20px;
    margin-top: 20px;
}

/* 设置表格的样式 */
.el-table {
    border: none;
    border-radius: 8px;
    background-color: #f9f9f9;
}

/* 表格列标题样式 */
.el-table th {
    background-color: #409eff;
    color: #fff;
    font-weight: bold;
}

/* 表格内容 */
.el-table td {
    background-color: #fff;
}

/* 操作按钮样式 */
.el-button {
    font-weight: 500;
}

/* 弹窗底部按钮区域 */
.el-dialog__footer {
    display: flex;
    justify-content: flex-end;
    padding: 15px;
}

.el-pagination {
    margin-top: 20px;
    text-align: center;
}

.el-dialog__header {
    background-color: #f4f7fc;
    color: #2c3e50;
    font-weight: 600;
}

.el-dialog__footer {
    display: flex;
    justify-content: flex-end;
    padding: 15px;
}

.el-table {
    margin-top: 10px;
}

.el-table th {
    background-color: #409eff;
    color: #fff;
    font-weight: bold;
}
.action-buttons {
    display: flex;
    gap: 10px;  /* 增加按钮之间的间距 */
    flex-wrap: nowrap;  /* 确保按钮不换行 */
    justify-content: flex-start;  /* 左对齐 */
    width: 100%;  /* 容器宽度为100%，确保容纳所有按钮 */
    max-width: 450px;  /* 设置最大宽度，避免按钮被挤压 */
    overflow: hidden;  /* 确保按钮不溢出 */
}

/* 如果按钮文字过长，添加省略号 */
.action-buttons .el-button {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
</style>

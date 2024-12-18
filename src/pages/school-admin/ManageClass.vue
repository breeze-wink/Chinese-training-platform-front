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
                <el-table :data="filteredClasses" style="width: 100%; margin-top: 20px;">
                    <el-table-column prop="classId" label="班级ID" width="180"></el-table-column>
                    <el-table-column prop="name" label="班级名称"></el-table-column>
                    <el-table-column prop="teacherName" label="老师姓名"></el-table-column>
                    <el-table-column prop="inviteCode" label="邀请码"></el-table-column>
                    <el-table-column label="操作">
                        <template #default="{ row }">
                            <el-button size="small" type="primary" @click="viewClassDetails(row)">查看详情</el-button>
                            <el-button size="small" type="danger" @click="deleteClass(row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 班级详情弹窗 -->
                <el-dialog :visible.sync="classDetailsDialogVisible" width="100%" title="班级详情">
                    <div v-if="classDetails.value">
                        <h3>班级信息</h3>
                        <p><strong>班级名称：</strong>{{ classDetails.value.className }}</p>
                        <p><strong>班级描述：</strong>{{ classDetails.value.classDescription || '暂无描述' }}</p>

                        <h4>小组信息</h4>
                        <el-table :data="classDetails.value.groups" style="width: 100%">
                            <el-table-column prop="groupId" label="小组ID" width="100"></el-table-column>
                            <el-table-column prop="groupName" label="小组名称"></el-table-column>
                            <el-table-column prop="groupDescription" label="小组描述"></el-table-column>
                        </el-table>

                        <h4>学生信息</h4>
                        <el-table :data="classDetails.value.students" style="width: 100%">
                            <el-table-column prop="studentId" label="学号" width="100"></el-table-column>
                            <el-table-column prop="studentName" label="学生姓名"></el-table-column>
                        </el-table>
                    </div>
                </el-dialog>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import { ElButton, ElInput, ElTable, ElTableColumn, ElMessage, ElDialog } from 'element-plus';
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

// 删除班级
const deleteClass = async (item) => {
    try {
        const response = await axios.delete(`/api/class/${item.classId}/delete`);
        if (response.status === 200) {
            classes.value = classes.value.filter(i => i.classId !== item.classId);
            ElMessage({ message: '班级删除成功', type: 'success' });
        }
    } catch (error) {
        ElMessage({ message: '班级删除失败', type: 'error' });
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
}

.content {
    max-width: 1000px;
    width: 100%;
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin-right: 50px;
}

/* 确保弹窗背景不被遮挡 */
.el-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;  /* 确保弹窗显示在最上层 */
}

/* 避免父容器 overflow 限制弹窗显示 */
.page-container, .main-container, .content {
    overflow: visible;
}
</style>

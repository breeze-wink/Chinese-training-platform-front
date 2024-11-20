<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header />

        <div class="main-container">
            <!-- 引入侧边栏通用组件 -->
            <Sidebar />

            <!-- 内容区 -->
            <div class="content">
                <div class="title-and-button-container">
                    <h2>班级管理</h2>
                    <!-- 生成班级按钮 -->
                    <el-button
                            type="primary"
                            @click="createDialogVisible = true"
                            class="custom-button create-class-button">
                        <el-icon><CirclePlusFilled /></el-icon>
                        <span class="button-text">创建班级</span>
                    </el-button>
                </div>

                <el-table :data="classList" border style="width: 100%">
                    <el-table-column prop="classCode" label="班级码" width="80"></el-table-column>
                    <el-table-column prop="className" label="班级名称" width="200"></el-table-column>
                    <el-table-column prop="classDescription" label="班级描述"></el-table-column>
                    <el-table-column label="操作" width="320">
                        <template #default="scope">
                            <el-button type="primary" class="custom-button view-members-button" @click="viewMembers(scope.row)">查看成员</el-button>
                            <el-button type="success" class="custom-button view-stats-button" @click="viewStats(scope.row)">统计概况</el-button>
                            <el-button type="danger"  class="custom-button disband-button" @click="disbandClass(scope.row)">解散班级</el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 创建班级的对话框 -->
                <el-dialog title="创建班级" v-model="createDialogVisible" width="500px" align-center>
                    <el-form :model="newClassForm" label-width="100px" class="form-container">
                        <el-form-item label="班级描述" class="form-item-spacing">
                            <el-input v-model="newClassForm.className" placeholder="请输入班级名称"></el-input>
                        </el-form-item>
                        <el-form-item label="班级描述" class="form-item-spacing">
                            <!-- 使用文本域 -->
                            <el-input
                                type="textarea"
                                v-model="newClassForm.classDescription"
                                placeholder="请输入班级描述"
                                :rows="4"
                            ></el-input>
                        </el-form-item>
                    </el-form>

                    <div slot="footer" class="dialog-footer">
                        <el-button @click="createDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="createClass">创建</el-button>
                    </div>
                </el-dialog>

                <!-- 小组管理部分 -->
                <div class="title-and-button-container">
                    <h2>小组管理</h2>
                    <!-- 生成小组按钮 -->
                    <el-button
                            type="primary"
                            @click="createGroupDialogVisible = true"
                            class="custom-button create-group-button">
                        <el-icon><CirclePlusFilled /></el-icon>
                        <span class="button-text">创建小组</span>
                    </el-button>
                </div>

                <el-table :data="groupList" border style="width: 100%">
                    <el-table-column prop="groupName" label="小组名称" width="200"></el-table-column>
                    <el-table-column prop="className" label="所属班级" width="200"></el-table-column>
                    <el-table-column prop="groupDescription" label="小组描述"></el-table-column>
                    <el-table-column label="操作" width="320">
                        <template #default="scope">
                            <el-button type="primary" class="custom-button view-members-button" @click="viewGroupMembers(scope.row)">查看成员</el-button>
                            <el-button type="success" class="custom-button view-stats-button" @click="viewGroupStats(scope.row)">统计概况</el-button>
                            <el-button type="danger" class="custom-button disband-button" @click="disbandGroup(scope.row)">解散小组</el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 创建小组的对话框 -->
                <el-dialog title="创建小组" v-model="createGroupDialogVisible" width="500px" align-center>
                    <el-form :model="newGroupForm" label-width="100px" class="form-container">
                        <el-form-item label="小组名称" class="form-item-spacing">
                            <el-input v-model="newGroupForm.groupName" placeholder="请输入小组名称"></el-input>
                        </el-form-item>
                        <el-form-item label="所属班级" class="form-item-spacing">
                            <el-select v-model="newGroupForm.classId" placeholder="请选择所属班级">
                                <el-option v-for="classItem in classList" :key="classItem.classId" :label="classItem.className" :value="classItem.classId"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="小组描述" class="form-item-spacing">
                            <!-- 使用文本域 -->
                            <el-input
                                    type="textarea"
                                    v-model="newGroupForm.groupDescription"
                                    placeholder="请输入小组描述"
                                    :rows="4"
                            ></el-input>
                        </el-form-item>
                        <el-form-item label="选择成员" class="form-item-spacing">
                            <el-checkbox-group v-model="newGroupForm.selectedStudents">
                                <el-row>
                                    <el-col :span="12" v-for="member in classMembers" :key="member.studentId">
                                        <el-checkbox :label="member.studentId" class="blue-checkbox">{{ member.studentName }}</el-checkbox>
                                    </el-col>
                                </el-row>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-form>

                    <div slot="footer" class="dialog-footer">
                        <el-button @click="createGroupDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="createGroup">创建</el-button>
                    </div>
                </el-dialog>
            </div>
        </div>
    </div>
</template>

<script setup>
// 公共组件引入
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useStore } from 'vuex';
import { computed } from 'vue';
import {CirclePlus, CirclePlusFilled, Plus} from "@element-plus/icons-vue";


// classList 是一个班级信息的数组，每个对象包含classId, classCode, className, classDescription 等字段
const classList = ref([]);
const groupList = ref([]);

const store = useStore();
const teacherId = computed(() => store.state.user.id);

// 控制生成班级对话框的显示状态
const createDialogVisible = ref(false);
// 控制生成小组对话框的显示状态
const createGroupDialogVisible = ref(false);
// 控制成员对话框的显示状态
const membersDialogVisible = ref(false);

// 新建班级表单的数据
const newClassForm = ref({
    className: '',
    classDescription: ''
});

const newGroupForm = ref({
    groupName: '',
    classId: '',
    groupDescription: '',
    selectedStudents: [] // 选中的学生ID
});

// 班级成员列表
const classMembers = ref([]);

// 获取班级信息列表的函数
const fetchClassList = async () => {
    try {
        const response = await axios.get(`/api/teacher/${teacherId.value}/get-classes`);

        if (response.status === 200 && response.data.message === '班级信息获取成功') {
            classList.value = response.data.data;
            console.log('获取班级列表成功:', response.data);
        } else {
            console.error('获取班级列表失败:', response.data.message);
        }
    } catch (error) {
        console.error('获取班级列表失败:', error.message);
    }
};

// 获取小组信息列表的函数
const fetchGroupList = async () => {
    try {
        const response = await axios.get(`/api/teacher/${teacherId.value}/get-groups`);

        if (response.status === 200 && response.data.message === '小组信息获取成功') {
            groupList.value = response.data.data;
            console.log('获取小组列表成功:', response.data);
        } else {
            console.error('获取小组列表失败:', response.data.message);
        }
    } catch (error) {
        console.error('获取小组列表失败:', error.message);
    }
};


// 创建新班级的函数
const createClass = async () => {
    try {
        const response = await axios.post(`/api/teacher/${teacherId.value}/create-class`, {
            className: newClassForm.value.className,
            classDescription: newClassForm.value.classDescription
        });

        if (response.status === 200 && response.data.message === '班级创建成功') {
            // 创建成功后，获取新的班级码并添加到班级列表中
            const newClassId = response.data.classId; // 假设返回数据中包含新创建的班级详细信息
            const newClassCode = response.data.classCode; // 假设返回数据中包含新创建的班级详细信息
            const newClass = {
                classId: newClassId,
                classCode: newClassCode,
                className: newClassForm.value.className,
                classDescription: newClassForm.value.classDescription
            };
            classList.value.push(newClass);

            console.log('班级创建成功:', newClass);

            createDialogVisible.value = false; // 关闭对话框
        } else {
            console.error('创建班级失败:', response.data.message);
        }
    } catch (error) {
        console.error('创建班级失败:', error.message);
    }
};

// 创建新小组的函数
const createGroup = async () => {
    try {
        const response = await axios.post(`/api/teacher/${teacherId.value}/create-group`, {
            groupName: newGroupForm.value.groupName,
            classId: newGroupForm.value.classId,
            groupDescription: newGroupForm.value.groupDescription,
            studentIds: newGroupForm.value.selectedStudents // 选中的学生ID
        });

        if (response.status === 200 && response.data.message === '小组创建成功') {
            const newGroup = {
                groupId: response.data.groupId,
                groupName: newGroupForm.value.groupName,
                className: classList.value.find(item => item.classId === newGroupForm.value.classId).className,
                groupDescription: newGroupForm.value.groupDescription
            };
            groupList.value.push(newGroup);
            console.log('小组创建成功:', newGroup);
            createGroupDialogVisible.value = false; // 关闭对话框
        } else {
            console.error('创建小组失败:', response.data.message);
        }
    } catch (error) {
        console.error('创建小组失败:', error.message);
    }
};

// 查看成员的函数
const viewMembers = async (classInfo) => {
    try {
        const response = await axios.get(`/api/teacher/${teacherId.value}/get-class-members`, {
            params: { classId: classInfo.classId }
        });

        if (response.status === 200 && response.data.message === '班级成员信息获取成功') {
            classMembers.value = response.data.data;
            membersDialogVisible.value = true;
        } else {
            console.error('获取班级成员信息失败:', response.data.message);
        }
    } catch (error) {
        console.error('获取班级成员信息失败:', error.message);
    }
};

// 查看统计概况的函数
const viewStats = (classInfo) => {
    console.log(`查看班级 ${classInfo.className} 的统计概况`);
    // 在这里编写导航到统计页面的逻辑，或者打开一个对话框
};

// 解散班级的函数
const disbandClass = async (classInfo) => {
    try {
        const response = await axios.delete(`/api/teacher/classes/${classInfo.classCode}`);
        if (response.status === 200 && response.data.message === 'success') {
            // 更新班级列表
            classList.value = classList.value.filter(classItem => classItem.classCode !== classInfo.classCode);
            console.log(`班级 ${classInfo.className} 解散成功`);
        } else {
            console.error(`解散班级失败: ${response.data.message}`);
        }
    } catch (error) {
        console.error(`解散班级失败: ${error.message}`);
    }
};

// 在组件挂载时获取班级列表
onMounted(() => {
    fetchClassList();
    fetchGroupList();
});
</script>

<style scoped>
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
    max-width: 1000px; /* 最大宽度为 1000px */
    width: 100%; /* 宽度在正常情况下可以随着窗口大小缩放 */
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin-right: 50px; /* 如果需要右侧留空隙，可以保留这行，或者可以根据实际情况调整 */
}

.custom-button {
    border-radius: 12px;
    padding: 8px 16px;
    font-weight: bold;
}
.button-text {
    margin-left: 8px; /* 设置图标与文字之间的额外间距 */
}


.create-class-button {
    margin-bottom: 0px; /* 为生成班级按钮添加一些下方间距 */
}

.el-table {

    margin-bottom: 50px; /* 表格下方的间距 */
}

.form-container {
    margin-top: 20px; /* 给表单添加上方的间距，使标题与表单之间有间距 */
}

.form-item-spacing {
    margin-bottom: 30px; /* 设定表单项的底部间距 */
}

.dialog-footer {
    display: flex;
    justify-content: center;
    margin-top: 20px; /* 底部按钮与表单的间距 */
}

.title-and-button-container {
    display: flex;
    align-items: center;
    justify-content: space-between; /* 在容器中将标题和按钮分别放在两边 */
    margin-bottom: 20px; /* 设置标题和表格之间的间距 */
}

.create-class-button {
    margin-bottom: 0; /* 移除下方间距 */
    margin-right: 40px;
}
.create-group-button {
    margin-bottom: 0; /* 移除下方间距 */
    margin-right: 40px;
}

/* 小组成员复选框样式 */
.blue-checkbox .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: blue;
    border-color: blue;
}

.blue-checkbox .el-checkbox__input.is-focus .el-checkbox__inner {
    border-color: blue;
}

.blue-checkbox .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background-color: blue;
    border-color: blue;
}
</style>

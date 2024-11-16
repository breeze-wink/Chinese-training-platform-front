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

                <!-- 生成班级按钮 -->
                <el-button
                    type="primary"
                    @click="createDialogVisible = true"
                    class="custom-button create-class-button">
                    <el-icon><CirclePlusFilled /></el-icon>
                    <span class="button-text">创建班级</span>
                </el-button>

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
import {CirclePlus, CirclePlusFilled, Plus} from "@element-plus/icons-vue";

// classList 是一个班级信息的数组，每个对象包含classCode, className, classDescription 等字段
const classList = ref([]);


// 控制生成班级对话框的显示状态
const createDialogVisible = ref(false);

// 新建班级表单的数据
const newClassForm = ref({
    className: '',
    classDescription: ''
});

// 获取班级信息列表的函数
const fetchClassList = async () => {
    try {
        const response = await axios.get('/api/teacher/75/get-classes');
        if (response.status === 200 && response.data.message === 'success') {
            classList.value = response.data.data;
        } else {
            console.error('获取班级列表失败:', response.data.message);
        }
    } catch (error) {
        console.error('获取班级列表失败:', error.message);
    }
};

// 创建新班级的函数
const createClass = async () => {
    try {
        const response = await axios.post('/api/teacher/75/create-class', {
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

// 查看成员的函数
const viewMembers = (classInfo) => {
    console.log(`查看班级 ${classInfo.className} 的成员`);
    // 在这里编写导航到查看成员页面的逻辑，或者打开一个对话框
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
    margin-top: 20px;
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

</style>

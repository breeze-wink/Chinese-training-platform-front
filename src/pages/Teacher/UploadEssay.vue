<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header />

        <div class="main-container">
            <!-- 引入侧边栏通用组件 -->
            <Sidebar />

            <!-- 内容区 -->
            <div class="content">
                <h2>作文管理</h2>
                <div class="input-button-group">
                    <el-input v-model="search" placeholder="搜索作文" style="width: 300px;"></el-input>
                    <el-button type="primary" @click="uploadEssay">添加作文</el-button>
                </div>

                <el-table :data="filteredEssays" style="width: 100%; margin-top: 20px;">
                    <el-table-column prop="id" label="ID" width="130"></el-table-column>
                    <el-table-column prop="title" label="标题" width="400"></el-table-column>
                    <el-table-column prop="date" label="上传日期"></el-table-column>
                    <el-table-column label="操作">
                        <template #default="{ row }">
                            <el-button size="small"  class="view-essay-btn" @click="viewEssay(row)">查看作文</el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 文件上传组件 -->
                <input type="file" ref="fileInput" style="display: none;" @change="handleFileUpload" />

                <!-- 查看文件的 PDF 视图 -->
                <div v-if="pdfUrl" class="pdf-container">
                    <iframe :src="pdfUrl" type="application/pdf" width="100%" height="800px"></iframe>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import { ElButton, ElInput, ElTable, ElTableColumn, ElMessage } from 'element-plus';
import axios from 'axios';
import { useStore } from 'vuex';

// 定义变量
const search = ref('');
const essays = ref([]);
const fileInput = ref(null);
const currentItem = ref(null);
const pdfUrl = ref('');
const store = useStore();
const teacherId = computed(() => store.state.user.id);

// 获取所有作文信息
const getAllEssays = async () => {
    try {
        const response = await axios.get('/api/teacher/view-essays');
        if (response.status === 200 ) {
            console.log('7');
            essays.value = response.data.infoData;
            ElMessage({ message: '作文列表获取成功', type: 'success' });
        } else {
            ElMessage({ message: '作文列表获取失败', type: 'error' });
        }
    } catch (error) {
        ElMessage({ message: '作文列表获取失败', type: 'error' });
    }
};

// 过滤作文信息
const filteredEssays = computed(() => {

    return (essays.value || []).filter(item =>
            item.title.includes(search.value) || item.date.includes(search.value)
    );


});

// 打开文件上传选择器
const uploadEssay = () => {
    currentItem.value = null;
    fileInput.value.click();
};

// 处理文件上传
const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
        // 检查文件类型是否为PDF
        if (file.type !== 'application/pdf') {
            ElMessage({ message: '请上传pdf文件', type: 'warning' });
            fileInput.value.value = ''; // 清空文件输入
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('executedDate', new Date().toISOString().split('T')[0]); // 添加上传日期

        try {
            const response = await axios.post('/api/teacher/upload-essay', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.status === 200) {
                ElMessage({ message: '作文上传成功', type: 'success' });
                await getAllEssays();
            } else {
                ElMessage({ message: '作文上传失败', type: 'error' });
            }
        } catch (error) {
            ElMessage({ message: '作文上传失败', type: 'error' });
        } finally {
            fileInput.value.value = ''; // 清空文件输入
        }
    }
};

// 查看作文
const viewEssay = async (item) => {
    try {
        const response = await axios.get(`/api/teacher/get-essay`, {
            params: { essayId: item.id },
            responseType: 'blob',
        });
        if (response.status === 200) {
            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileUrl = URL.createObjectURL(file);
            window.open(fileUrl, '_blank'); // 在新标签页中打开 PDF
        } else {
            throw new Error('查看请求失败');
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            ElMessage({ message: '文件未找到，请检查ID是否正确', type: 'error' });
        } else if (error.message.includes('ERR_CONNECTION_REFUSED')) {
            ElMessage({ message: '文件未找到，请检查ID是否正确', type: 'error' });
        } else if (error.message.includes('CORS')) {
            ElMessage({ message: '文件未找到，请检查ID是否正确', type: 'error' });
        } else {
            ElMessage({ message: '文件查看失败: ' + error.message, type: 'error' });
        }
    }
};

onMounted(() => {
    console.log(`Teacher ID: ${teacherId.value}`);
    getAllEssays();
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
}

.input-button-group {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}

.pdf-container {
    margin-top: 20px;
}

iframe {
    border: none;
}

.view-essay-btn {
    background-color: #4CAF50; /* 绿色背景 */
    color: white; /* 白色字体 */
    border: 1px solid #4CAF50; /* 绿色边框 */
    border-radius: 4px; /* 圆角 */
    padding: 8px 16px; /* 内边距 */
    font-size: 14px; /* 字体大小 */
}

.view-essay-btn:hover {
    background-color: #45a049; /* 鼠标悬停时的背景色 */
    border-color: #45a049; /* 鼠标悬停时的边框颜色 */
}

.view-essay-btn:active {
    background-color: #388e3c; /* 按钮点击时的背景色 */
    border-color: #388e3c; /* 点击时的边框颜色 */
}

</style>

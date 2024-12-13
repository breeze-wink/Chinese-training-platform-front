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
                <el-table :data="paginatedData" style="width: 100%; margin-top: 20px;">
                    <el-table-column prop="name" label="试卷名称" width="200"></el-table-column>
                    <el-table-column prop="createTime" label="生成时间" width="200"></el-table-column>
                    <el-table-column prop="difficulty" label="难度" width="100"></el-table-column>

                    <el-table-column label="操作">
                        <template #default="{ row }">
                            <el-button size="small" type="primary" @click="previewPaper(row)">预览</el-button>
                            <el-button size="small" type="success" @click="publishPaper(row)">发布</el-button>
                            <el-button size="small" type="danger" @click="deletePaper(row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 分页 -->
                <el-pagination
                        style="margin-top: 20px;"
                        @current-change="handlePageChange"
                        :current-page="currentPage"
                        :page-size="pageSize"
                        layout="prev, pager, next"
                        :total="filteredData.length"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import { ElButton, ElInput, ElTable, ElTableColumn, ElMessage, ElPagination } from 'element-plus';
import axios from 'axios';
import { useStore } from 'vuex'; // 使用 Vuex 进行状态管理

// 获取 Vuex 状态
const store = useStore();

// 获取教师 ID
const teacherId = computed(() => store.state.user.id);

// 定义变量
const search = ref('');  // 搜索框输入的内容
const currentPage = ref(1);
const pageSize = ref(10);  // 每页显示的行数
const totalItems = ref(0);
const papers = ref([]);  // 存储所有试卷
const filteredData = ref([]);  // 存储筛选后的试卷数据

// 获取教师所有试卷数据
const getPapers = async () => {
    try {
        const response = await axios.get(`/api/teacher/papers/${teacherId.value}`);
        if (response.status === 200) {
            papers.value = response.data.papers;
            totalItems.value = response.data.papers.length;
            filteredData.value = papers.value;  // 初始时，显示所有试卷
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
    getPapers(); // 加载试卷数据
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

// 预览试卷
const previewPaper = (paper) => {
    // 这里可以根据需求进行跳转或其他操作
    ElMessage.info(`预览试卷: ${paper.name}`);
};

// 发布试卷
const publishPaper = (paper) => {
    // 这里可以进行试卷发布的 API 请求
    ElMessage.success(`试卷 ${paper.name} 已发布`);
};

// 删除试卷
const deletePaper = (paper) => {
    // 这里可以进行删除试卷的 API 请求
    ElMessage.success(`试卷 ${paper.name} 已删除`);
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
}

.content {
    max-width: 1000px;
    width: 100%;
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin-right: 50px;
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

</style>

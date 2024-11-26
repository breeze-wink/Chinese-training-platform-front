<!-- 系统管理员查看和删除题目页面 -->
<template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header />

    <div class="main-container">
      <!-- 引入侧边栏通用组件 -->
      <Sidebar />

      <!-- 内容区 -->
      <div class="content">
        <h2>题目管理</h2>
        <el-table :data="items" style="width: 100%; margin-top: 20px;">
          <el-table-column prop="id" label="ID" width="180"></el-table-column>
          <el-table-column prop="title" label="题目"></el-table-column>
          <el-table-column prop="description" label="描述"></el-table-column>
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button size="small" type="danger" @click="deleteItem(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import { ElButton, ElTable, ElTableColumn, ElMessage } from 'element-plus';
import axios from 'axios';

// 定义变量
const items = ref([]);

// 获取所有题目
const fetchQuestions = async () => {
  try {
    const response = await axios.get('/api/system-admin/get-all-questions');
    if (response.status === 200) {
      items.value = response.data.questions;
      ElMessage({ message: response.data.message, type: 'success' });
    }
  } catch (error) {
    ElMessage({ message: '题目获取失败', type: 'error' });
  }
};

// 删除题目
const deleteItem = async (item) => {
  try {
    await axios.delete(`/api/system-admin/delete-question/${item.id}`);
    items.value = items.value.filter(i => i.id !== item.id);
    ElMessage({ message: '删除成功', type: 'success' });
  } catch (error) {
    ElMessage({ message: '删除失败', type: 'error' });
  }
};

// 组件挂载时获取所有题目
onMounted(() => {
  fetchQuestions();
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
</style>

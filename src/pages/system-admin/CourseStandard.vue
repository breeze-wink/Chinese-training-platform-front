<template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header />

    <div class="main-container">
      <!-- 引入侧边栏通用组件 -->
      <Sidebar />

      <!-- 内容区 -->
      <div class="content">
        <h2>课标管理</h2>
        <div class="input-button-group">
          <el-input v-model="search" placeholder="搜索课标" style="width: 300px;"></el-input>
          <el-button type="primary" @click="uploadFile">新增课标</el-button>
        </div>

        <el-table :data="filteredData" style="width: 100%; margin-top: 20px;">
          <el-table-column prop="id" label="ID" width="180"></el-table-column>
          <el-table-column prop="title" label="标题"></el-table-column>
          <el-table-column prop="description" label="描述"></el-table-column>
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button size="small" @click="uploadFile(row)">更改文件</el-button>
              <el-button size="small" @click="downloadFile(row)">下载文件</el-button>
              <el-button size="small" type="danger" @click="deleteItem(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 文件上传组件 -->
        <input type="file" ref="fileInput" style="display: none;" @change="handleFileUpload" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import { ElButton, ElInput, ElTable, ElTableColumn, ElMessage } from 'element-plus';

// 定义变量
const search = ref('');
const currentItem = ref({ id: null, title: '', description: '' });
const items = ref([
  { id: 1, title: '课标1', description: '这是课标1的描述', fileUrl: 'file1.pdf' },
  { id: 2, title: '课标2', description: '这是课标2的描述', fileUrl: 'file2.pdf' },
]);
const fileInput = ref(null);

// 过滤搜索结果
const filteredData = computed(() => {
  return items.value.filter(item =>
      item.title.includes(search.value) || item.description.includes(search.value)
  );
});

// 打开文件上传选择器
const uploadFile = (item = null) => {
  if (item) {
    currentItem.value = { ...item };
  } else {
    currentItem.value = { id: null, title: '', description: '' };
  }
  fileInput.value.click();
};

// 处理文件上传
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // 假设上传文件成功后更新当前项的文件 URL
    currentItem.value.fileUrl = file.name;
    if (currentItem.value.id) {
      const index = items.value.findIndex(i => i.id === currentItem.value.id);
      if (index !== -1) {
        items.value.splice(index, 1, { ...currentItem.value });
      }
    } else {
      currentItem.value.id = Date.now(); // 简单的ID生成方式
      items.value.push({ ...currentItem.value });
    }
    ElMessage({ message: '文件上传成功', type: 'success' });
  }
};

// 下载文件
const downloadFile = (item) => {
  if (item.fileUrl) {
    // 模拟文件下载
    const link = document.createElement('a');
    link.href = item.fileUrl;
    link.download = item.fileUrl;
    link.click();
  } else {
    ElMessage({ message: '未找到可下载的文件', type: 'warning' });
  }
};

// 删除课标
const deleteItem = (item) => {
  items.value = items.value.filter(i => i.id !== item.id);
  ElMessage({ message: '删除成功', type: 'success' });
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
  appearance: button;
  -webkit-appearance: button;
  -moz-appearance: button;
}
</style>

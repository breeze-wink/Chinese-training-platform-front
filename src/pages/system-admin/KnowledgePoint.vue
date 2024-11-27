<template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header />

    <div class="main-container">
      <!-- 引入侧边栏通用组件 -->
      <Sidebar />

      <!-- 内容区 -->
      <div class="content">
        <h2>知识点管理</h2>
        <div class="input-button-group" style="display: flex; align-items: center;">
          <el-input v-model="search" placeholder="搜索知识点" style="width: 300px;"></el-input>
          <el-button type="primary" @click="addKnowledgePoint" style="margin-left: 10px;">新增知识点</el-button>
        </div>

        <!-- 新增知识点表单 -->
        <div class="add-knowledge-container" v-if="addMode">
          <el-form :model="currentItem" label-width="80px">
            <el-form-item label="标题">
              <el-input v-model="currentItem.name"></el-input>
            </el-form-item>
            <el-form-item label="类型">
              <el-input v-model="currentItem.type"></el-input>
            </el-form-item>
            <el-form-item label="描述">
              <el-input type="textarea" v-model="currentItem.description"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveItem">保存</el-button>
              <el-button @click="cancelAdd">取消</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 查看知识点详情 -->
        <div class="view-knowledge-container" v-if="viewMode">
          <el-form :model="currentItem" label-width="80px">
            <el-form-item label="标题">
              <el-input v-model="currentItem.name" disabled></el-input>
            </el-form-item>
            <el-form-item label="类型">
              <el-input v-model="currentItem.type" disabled></el-input>
            </el-form-item>
            <el-form-item label="描述">
              <el-input type="textarea" v-model="currentItem.description" disabled></el-input>
            </el-form-item>
            <el-form-item>
              <el-button @click="closeView">关闭</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 编辑知识点表单 -->
        <div class="add-knowledge-container" v-if="editMode">
          <el-form :model="currentItem" label-width="80px">
            <el-form-item label="标题">
              <el-input v-model="currentItem.name"></el-input>
            </el-form-item>
            <el-form-item label="类型">
              <el-input v-model="currentItem.type"></el-input>
            </el-form-item>
            <el-form-item label="描述">
              <el-input type="textarea" v-model="currentItem.description"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveItem">保存</el-button>
              <el-button @click="cancelEdit">取消</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 知识点列表 -->
        <el-table :data="filteredData" style="width: 100%; margin-top: 20px; max-height: 400px; overflow-y: auto;">
          <el-table-column prop="id" label="ID" width="180"></el-table-column>
          <el-table-column prop="name" label="标题"></el-table-column>
          <el-table-column prop="type" label="类型"></el-table-column>
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button size="small" @click="viewKnowledgePoint(row)">查看详情</el-button>
              <el-button size="small" @click="editKnowledgePoint(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteItem(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import { ElButton, ElInput, ElTable, ElTableColumn, ElForm, ElFormItem, ElMessage } from 'element-plus';
import axios from 'axios';

// 定义变量
const search = ref('');
const addMode = ref(false);
const viewMode = ref(false);
const editMode = ref(false);
const currentItem = ref({ id: null, name: '', type: '', description: '' });
const items = ref([]);

// 过滤搜索结果
const filteredData = computed(() => {
  return items.value.filter(item =>
      item.name.includes(search.value) || item.description.includes(search.value)
  );
});

// 获取所有知识点
const fetchKnowledgePoints = async () => {
  try {
    const response = await axios.get('/api/system-admin/get-all-knowledge-points');
    if (response.status === 200) {
      items.value = response.data.knowledgePointInfos;
      ElMessage({ message: response.data.message, type: 'success' });
    }
  } catch (error) {
    ElMessage({ message: '知识点获取失败', type: 'error' });
  }
};

// 新增知识点
const addKnowledgePoint = () => {
  currentItem.value = { id: null, name: '', type: '', description: '' };
  addMode.value = true;
};

// 编辑知识点
const editKnowledgePoint = (item) => {
  currentItem.value = { ...item };
  editMode.value = true;
};

// 保存项目
const saveItem = async () => {
  if (!currentItem.value.name || !currentItem.value.type || !currentItem.value.description) {
    ElMessage({ message: '标题、类型和描述不能为空', type: 'error' });
    return;
  }

  const url = currentItem.value.id
      ? `/api/system-admin/edit-knowledge-point/${currentItem.value.id}`
      : '/api/system-admin/add-knowledge-point';

  const method = currentItem.value.id ? 'put' : 'post';

  try {
    const response = await axios[method](url, currentItem.value);
    if (response.status === 200) {
      ElMessage({ message: response.data.message, type: 'success' });
      fetchKnowledgePoints();  // Refresh the list
      cancelAdd();  // Close the form after saving
    }
  } catch (error) {
    ElMessage({ message: '保存失败', type: 'error' });
  }
};

// 取消新增
const cancelAdd = () => {
  addMode.value = false;
  currentItem.value = { id: null, name: '', type: '', description: '' };
};

// 取消编辑
const cancelEdit = () => {
  editMode.value = false;
  currentItem.value = { id: null, name: '', type: '', description: '' };
};

// 关闭查看
const closeView = () => {
  viewMode.value = false;
  currentItem.value = { id: null, name: '', type: '', description: '' };
};

// 删除知识点
const deleteItem = async (item) => {
  try {
    const response = await axios.delete(`/api/system-admin/delete-knowledge-point/${item.id}`);
    if (response.status === 200) {
      ElMessage({ message: response.data.message, type: 'success' });
      fetchKnowledgePoints();  // Refresh the list after deletion
    }
  } catch (error) {
    ElMessage({ message: '删除失败', type: 'error' });
  }
};

// 初始化加载知识点数据
fetchKnowledgePoints();
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

.el-button {
  margin-top: 20px;
  appearance: auto;
  -webkit-appearance: button;
  -moz-appearance: button;
}

.input-button-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.add-knowledge-container, .view-knowledge-container {
  margin-top: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>

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
          <el-button type="primary" @click="addKnowledgePoint" style="margin-left: 10px; margin-bottom: 20px">新增知识点</el-button>
        </div>

        <!-- 新增知识点表单 -->
        <el-dialog title="添加知识点" v-model="addMode" width="40%" align-center>
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
              <el-button type="primary" @click="saveItem">确认</el-button>
              <el-button @click="cancelAdd">取消</el-button>
            </el-form-item>
          </el-form>
        </el-dialog>

        <!-- 查看知识点详情对话框 -->
        <el-dialog :title="`标题：${currentItem.name}`" v-model="viewMode" width="40%" align-center>
          <div class="knowledge-content">
            <p><strong>类型：</strong>{{ currentItem.type }}</p>
            <p><strong>描述：</strong>{{ currentItem.description }}</p>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="closeView">关闭</el-button>
          </span>
        </el-dialog>

        <!-- 编辑知识点对话框 -->
        <el-dialog title="编辑知识点" v-model="editMode" width="40%" align-center>
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
        </el-dialog>

        <!-- 知识点列表 -->
        <el-table :data="filteredData" style="width: 100%; margin-top: 20px; height: 630px; overflow-y: auto;">
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
import {ref, computed, onMounted} from 'vue';
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import { ElButton, ElInput, ElTable, ElTableColumn, ElForm, ElFormItem, ElMessage } from 'element-plus';
import axios from 'axios';

// 定义变量
const search = ref('');
const addMode = ref(false);
const viewMode = ref(false);
const editMode = ref(false);
const currentItem = ref({id: '',name: '', type: '', description: '' });
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
    }
  } catch (error) {
    ElMessage({ message: '知识点获取失败', type: 'error' });
  }
};

// 新增知识点
const addKnowledgePoint = () => {
  currentItem.value = { id: '',name: '', type: '', description: '' };
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

  const url = currentItem.value.id ?
      `/api/system-admin/update-knowledge-point/${currentItem.value.id}`:
      `/api/system-admin/create-knowledge-point` ;

  const method = currentItem.value.id ? 'put' : 'post';

  const requestData = {
    name: currentItem.value.name,
    type: currentItem.value.type,
    description: currentItem.value.description
  }
  try {
    const response = await axios[method](url, requestData);
    if (response.status === 200) {
      await fetchKnowledgePoints();  // Refresh the list
      cancelAdd();  // Close the form after saving
      cancelEdit();
    }
  } catch (error) {
    ElMessage({ message: '保存失败', type: 'error' });
  }
};

// 取消新增
const cancelAdd = () => {
  addMode.value = false;
  currentItem.value = {id: '', name: '', type: '', description: '' };
};

// 取消编辑
const cancelEdit = () => {
  editMode.value = false;
  currentItem.value = {id: '',name: '', type: '', description: '' };
};

// 关闭查看
const closeView = () => {
  viewMode.value = false;
  currentItem.value = {id: '', name: '', type: '', description: '' };
};

// 删除知识点
const deleteItem = async (item) => {
  try {
    const response = await axios.delete(`/api/system-admin/delete-knowledge-point/${item.id}`);
    if (response.status === 200) {
      ElMessage({ message: response.data.message, type: 'success' });
      await fetchKnowledgePoints();  // Refresh the list after deletion
    }
  } catch (error) {
    ElMessage({ message: '删除失败', type: 'error' });
  }
};
const viewKnowledgePoint = async (item) => {
  try {
    const response = await axios.get(`/api/system-admin/query-knowledge-point/${item.id}`)
    if (response.status === 200) {
        currentItem.value = response.data.data; // 确保这里直接赋值整个对象
        viewMode.value = true;
    }
  } catch (error) {
    ElMessage({ message: '查询失败', type: 'error' });
  }
}
onMounted(async () => {
  await fetchKnowledgePoints();
});
// 初始化加载知识点数据

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
  padding: 20px;
    background-color: #f0f0f0;
}

.content {
  max-width: 1000px;
  width: 100%;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
    margin-bottom:30px;
}

h2 {
  color: #333;
  margin-bottom: 20px;
}

.input-button-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.knowledge-card {
  margin-top: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.knowledge-content p {
  margin: 0;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.knowledge-content p:last-child {
  border-bottom: none;
}

.knowledge-actions {
  text-align: right;
  padding: 10px;
}

.knowledge-form {
  padding: 20px;
}

.el-input, .el-button {
  border-radius: 5px;
}

.el-button {
  margin-top: 20px;
  appearance: auto;
  -webkit-appearance: button;
  -moz-appearance: button;
}

.add-knowledge-container, .view-knowledge-container {
  margin-top: 20px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.el-table {
  margin-top: 20px;
  border-radius: 5px;
  overflow: hidden;
}

.el-table th, .el-table td {
  padding: 12px 0;
}

.el-table .el-button {
  margin-top: 0;
  margin-right: 5px;
}
</style>

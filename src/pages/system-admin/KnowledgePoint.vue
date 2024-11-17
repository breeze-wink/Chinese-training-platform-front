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
        <div class="input-button-group">
          <div class="input-button-group">
            <el-input v-model="search" placeholder="搜索知识点" style="width: 300px;"></el-input>
            <el-button type="primary" @click="openAddDialog">新增知识点</el-button>
          </div>
        </div>

        <el-table :data="filteredData" style="width: 100%; margin-top: 20px;">
          <el-table-column prop="id" label="ID" width="180"></el-table-column>
          <el-table-column prop="title" label="标题"></el-table-column>
          <el-table-column prop="description" label="描述"></el-table-column>
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button size="small" @click="openViewDialog(row)">查看</el-button>
              <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteItem(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 新增知识点弹窗 -->
        <el-dialog title="新增知识点" :visible="addDialogVisible" width="30%" @close="addDialogVisible = false">
          <el-form :model="currentItem">
            <el-form-item label="标题">
              <el-input v-model="currentItem.title"></el-input>
            </el-form-item>
            <el-form-item label="描述">
              <el-input type="textarea" v-model="currentItem.description"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveItem">保存</el-button>
          </span>
        </el-dialog>

        <!-- 查看知识点弹窗 -->
        <el-dialog title="查看知识点" :visible="viewDialogVisible" width="30%" @close="viewDialogVisible = false">
          <el-form :model="currentItem">
            <el-form-item label="标题">
              <el-input v-model="currentItem.title" disabled></el-input>
            </el-form-item>
            <el-form-item label="描述">
              <el-input type="textarea" v-model="currentItem.description" disabled></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="viewDialogVisible = false">关闭</el-button>
          </span>
        </el-dialog>

        <!-- 编辑知识点弹窗 -->
        <el-dialog title="编辑知识点" :visible="editDialogVisible" width="30%" @close="editDialogVisible = false">
          <el-form :model="currentItem">
            <el-form-item label="标题">
              <el-input v-model="currentItem.title"></el-input>
            </el-form-item>
            <el-form-item label="描述">
              <el-input type="textarea" v-model="currentItem.description"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveItem">保存</el-button>
          </span>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import { ElButton, ElDialog, ElInput, ElTable, ElTableColumn, ElForm, ElFormItem, ElMessage } from 'element-plus';

// 定义变量
const search = ref('');
const addDialogVisible = ref(false);
const viewDialogVisible = ref(false);
const editDialogVisible = ref(false);
const currentItem = ref({ id: null, title: '', description: '' });
const items = ref([
  { id: 1, title: '知识点1', description: '这是知识点1的描述' },
  { id: 2, title: '知识点2', description: '这是知识点2的描述' },
]);

// 过滤搜索结果
const filteredData = computed(() => {
  return items.value.filter(item =>
      item.title.includes(search.value) || item.description.includes(search.value)
  );
});

// 打开新增知识点弹窗
const openAddDialog = () => {
  currentItem.value = { id: null, title: '', description: '' };
  addDialogVisible.value = true;
};

// 打开查看知识点弹窗
const openViewDialog = (item) => {
  currentItem.value = { ...item };
  viewDialogVisible.value = true;
};

// 打开编辑知识点弹窗
const openEditDialog = (item) => {
  currentItem.value = { ...item };
  editDialogVisible.value = true;
};

// 删除项目
const deleteItem = (item) => {
  items.value = items.value.filter(i => i.id !== item.id);
  ElMessage({ message: '删除成功', type: 'success' });
};

// 保存项目
const saveItem = () => {
  if (!currentItem.value.title || !currentItem.value.description) {
    ElMessage({ message: '请填写所有必填项', type: 'warning' });
    return;
  }
  if (currentItem.value.id) {
    const index = items.value.findIndex(i => i.id === currentItem.value.id);
    if (index !== -1) {
      items.value.splice(index, 1, currentItem.value);
    }
  } else {
    currentItem.value.id = Date.now(); // 简单的ID生成方式
    items.value.push(currentItem.value);
  }
  addDialogVisible.value = false;
  editDialogVisible.value = false;
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

.el-button {
  margin-top: 20px;
  appearance: auto;
  -webkit-appearance: button;
  -moz-appearance: button;
}

.el-dialog {
  z-index: 9999; /* 保证弹窗浮在最上层 */
}
.input-button-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

</style>

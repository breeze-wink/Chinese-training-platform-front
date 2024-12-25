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

        <el-table
            :data="paginatedEssays"
            style="width: 100%; margin-top: 20px;"
            @sort-change="handleSortChange"
            :default-sort="{ prop: 'date', order: 'descending' }"
        >
          <el-table-column prop="id" label="ID" width="130"></el-table-column>
          <el-table-column prop="title" label="标题" width="400"></el-table-column>
          <el-table-column
              prop="date"
              label="上传日期"
              sortable
              :sort-method="sortDate"
          ></el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button
                  size="small"
                  class="view-essay-btn"
                  @click="viewEssay(row)"
              >查看作文</el-button>

              <el-popconfirm
                  title="确定要删除作文吗？"
                  @confirm="() => deleteEssay(row)"
              >
                <template #reference>
                  <el-button
                      size="small"
                      type="danger"
                      class="delete-essay-btn"
                      :disabled="row.canDelete === false"
                  >删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <div style="display: flex; justify-content: center; margin-top: 20px;">
        <el-pagination
            style="margin-top: 20px; "
            background
            layout="prev, pager, next, jumper"
            :current-page="currentPage"
            :page-size="pageSize"
            :total="filteredEssays.length"
            @current-change="handlePageChange"

        >
        </el-pagination>
        </div>

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
import {
  ElButton,
  ElInput,
  ElTable,
  ElTableColumn,
  ElMessage,
  ElPagination,
  ElPopconfirm,
  ElNotification
} from 'element-plus';
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

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);

// 排序相关
const sortOrder = ref('descending'); // 默认降序
const sortProp = ref('date');

// 获取所有作文信息
const getAllEssays = async () => {
  try {
    const response = await axios.get('/api/teacher/view-essays');
    if (response.status === 200 ) {
      essays.value = response.data.infoData;
      ElNotification({ title: '作文列表获取成功', type: 'success' });
    } else {
      ElNotification({ title: '作文列表获取失败', type: 'error' });
    }
  } catch (error) {
    ElNotification({ title: '作文列表获取失败', type: 'error' });
  }
};

// 过滤作文信息
const filteredEssays = computed(() => {
  return (essays.value || []).filter(item =>
      item.title.includes(search.value) || item.date.includes(search.value)
  );
});

// 分页后的作文数据
const paginatedEssays = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredEssays.value.slice(start, end);
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

// 删除作文
const deleteEssay = async (item) => {
  try {
    const response = await axios.delete('/api/teacher/delete-essay', {
      params: { essayId: item.id },
    });
    if (response.status === 200) {
      ElMessage({ message: '作文删除成功', type: 'success' });
      essays.value = essays.value.filter(essay => essay.id !== item.id);
      // 如果当前页没有数据且不是第一页，跳转到前一页
      const totalPages = Math.ceil(filteredEssays.value.length / pageSize.value);
      if (currentPage.value > totalPages && currentPage.value > 1) {
        currentPage.value = totalPages;
      }
    } else {
      ElMessage({ message: '作文删除失败', type: 'error' });
    }
  } catch (error) {
    ElMessage({ message: '作文删除失败: ' + error.message, type: 'error' });
  }
};

// 处理分页
const handlePageChange = (page) => {
  currentPage.value = page;
};

// 处理排序
const handleSortChange = ({ prop, order }) => {
  sortProp.value = prop;
  sortOrder.value = order;
  sortEssays();
};

// 排序方法
const sortEssays = () => {
  if (sortProp.value === 'date') {
    essays.value.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (sortOrder.value === 'ascending') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }
};

// 自定义排序函数（备用，可根据需要使用）
const sortDate = (a, b) => {
  const dateA = new Date(a.date);
  const dateB = new Date(b.date);
  return dateA - dateB;
};

onMounted(() => {
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
  margin-bottom: 30px;
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
  margin-right: 5px;
}

.view-essay-btn:hover {
  background-color: #45a049; /* 鼠标悬停时的背景色 */
  border-color: #45a049; /* 鼠标悬停时的边框颜色 */
}

.view-essay-btn:active {
  background-color: #388e3c; /* 按钮点击时的背景色 */
  border-color: #388e3c; /* 点击时的边框颜色 */
}

.delete-essay-btn {
  background-color: #f56c6c; /* 红色背景 */
  color: white; /* 白色字体 */
  border: 1px solid #f56c6c; /* 红色边框 */
  border-radius: 4px; /* 圆角 */
  padding: 8px 16px; /* 内边距 */
  font-size: 14px; /* 字体大小 */
}

.delete-essay-btn:hover {
  background-color: #f44336; /* 鼠标悬停时的背景色 */
  border-color: #f44336; /* 鼠标悬停时的边框颜色 */
}

.delete-essay-btn:active {
  background-color: #d32f2f; /* 按钮点击时的背景色 */
  border-color: #d32f2f; /* 点击时的边框颜色 */
}



.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 300px;
  width: 100%;
}

.modal-content p {
  margin: 0 0 10px;
  font-size: 16px;
  color: #333;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}


.loading-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* 确保模态窗在遮罩层之上 */
}


.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
  z-index: 999; /* 确保遮罩层在最上层 */
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.2em;
}
</style>

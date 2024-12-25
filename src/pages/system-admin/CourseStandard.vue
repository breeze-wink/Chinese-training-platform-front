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
          <el-button type="primary" @click="uploadFile">添加课标</el-button>
        </div>

        <el-table :data="filteredCourseStandards" style="width: 100%; margin-top: 20px;">
          <el-table-column prop="id" label="ID" width="180"></el-table-column>
          <el-table-column prop="title" label="标题"></el-table-column>
          <el-table-column prop="executedDate" label="执行日期"></el-table-column>
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button size="small" @click="viewFile(row)">查看文件</el-button>
              <el-button size="small" @click="updateFile(row)">更改文件</el-button>
              <el-button size="small" type="danger" @click="deleteItem(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 文件上传组件 -->
        <input type="file" ref="fileInput" style="display: none;" @change="handleFileUpload" />

        <!-- 查看文件的 PDF 视图 -->
        <div v-if="pdfUrl" class="pdf-container" >
          <iframe :src="pdfUrl" type="application/pdf" width="100%" height="800px"></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import {ElButton, ElInput, ElTable, ElTableColumn, ElMessage, ElMessageBox, ElNotification} from 'element-plus';
import axios from 'axios';
import {useStore} from "vuex";

// 定义变量
const search = ref('');
const courseStandards = ref([]);
const fileInput = ref(null);
const currentItem = ref(null);
const pdfUrl = ref('');
const store = useStore();
const teacherId = computed(() => store.state.user.id);

// 获取所有课标信息
const getAllCourseStandards = async () => {
  try {
    const response = await axios.get('/api/system-admin/get-all-course-standards');
    if (response.status === 200) {
      courseStandards.value = response.data.courseStandardInfos;
    }
  } catch (error) {
    ElMessage({ message: '课标获取失败', type: 'error' });
  }
};

// 过滤课标信息
const filteredCourseStandards = computed(() => {
  return courseStandards.value.filter(item =>
    item.title.includes(search.value) || item.executedDate.includes(search.value)
  );
});

// 打开文件上传选择器
const uploadFile = () => {
  currentItem.value = null;
  fileInput.value.click();
};

// 更改文件
const updateFile = (item) => {
  currentItem.value = item;
  fileInput.value.click();
};

// 处理文件上传
const handleFileUpload = async (event) => {

  const file = event.target.files[0];

    // 检查文件类型是否为 PDF
    if (file && file.type !== 'application/pdf') {
        ElMessage({ message: '只能上传PDF文件', type: 'warning' });
        return; // 终止上传操作
    }

    // 检查文件类型是否为 PDF
    if (file && file.type !== 'application/pdf') {
        ElMessage({ message: '只能上传PDF文件', type: 'warning' });
        return; // 终止上传操作
    }

  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('executedDate', new Date().toISOString().split('T')[0]); // 添加执行日期
    if (currentItem.value) {
      try {
        const response = await axios.put(`/api/system-admin/update-course-standard/${currentItem.value.id}`, formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        if (response.status === 200) {
          await getAllCourseStandards();
          ElMessage({ message: '文件更新成功', type: 'success' });
        }
      } catch (error) {
        ElMessage({ message: '文件更新失败', type: 'error' });
      }
    } else {
      try {
        const response = await axios.post('/api/system-admin/create-course-standard', formData,
                { headers: { 'Content-Type': 'multipart/form-data' } });
        if (response.status === 200) {
          await getAllCourseStandards();
          ElMessage({ message: '文件上传成功', type: 'success' });
        }
      } catch (error) {
        ElMessage({ message: '文件上传失败', type: 'error' });
      }
    }
  }
};

// 查看文件
const viewFile = async (item) => {

    try {
        const response = await axios.get(`/api/system-admin/query-course-standard/${item.id}`, {
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
            ElMessage({ message: '文件未找到，请检查文件位置是否正确', type: 'error' });
        } else if (error.message.includes('CORS')) {
            ElMessage({ message: '文件未找到，请检查文件位置是否正确', type: 'error' });
        } else {
            ElMessage({ message: '文件查看失败: ' + error.message, type: 'error' });
        }
    }

};

// 删除课标
const deleteItem = async (item) => {
    ElMessageBox.confirm(
            '您确定要删除该课标吗？',
            '警告',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
    ).then(async () => {
        try {
            const response = await axios.delete(`/api/system-admin/delete-course-standard/${item.id}`);
            if (response.status === 200) {
                courseStandards.value = courseStandards.value.filter(i => i.id !== item.id);
                ElNotification.success({ message: response.data.message });
            }
        } catch (error) {
          ElNotification.error({ title: '删除失败', message: error.response.data.message });
        }
    }).catch(() => {
        ElMessage({ message: '删除操作已取消', type: 'info' });
    });
};

onMounted(() => {
  getAllCourseStandards();
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


</style>

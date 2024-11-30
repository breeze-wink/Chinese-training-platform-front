<template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header />

    <div class="main-container">
      <!-- 引入侧边栏通用组件 -->
      <Sidebar />

      <!-- 内容区 -->
      <div class="content">
        <h2>学生管理</h2>
        <div class="input-button-group">
          <el-input v-model="search" placeholder="输入学生姓名" style="width: 300px;"></el-input>
          <el-button type="primary" @click="searchStudent">查询</el-button>
          <el-button type="warning" @click="resetSearch">重置</el-button>
        </div>

        <!-- 表格显示数据 -->
        <el-table :data="paginatedData" style="width: 100%; margin-top: 20px;">
          <el-table-column prop="id" label="序号" width="80"></el-table-column>
          <el-table-column prop="name" label="姓名" width="150"></el-table-column>
          <el-table-column prop="email" label="邮箱" width="250"></el-table-column>
          <el-table-column prop="username" label="用户名"></el-table-column>
          <el-table-column prop="grade" label="年级"></el-table-column>
          <el-table-column prop="schoolId" label="学校ID"></el-table-column>

          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button size="small" type="danger" @click="deleteStudent(row)">删除</el-button>
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
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import { ElButton, ElInput, ElTable, ElTableColumn, ElMessage, ElPagination } from 'element-plus';
import axios from 'axios';
import { useStore } from 'vuex'; // 使用 Vuex 进行状态管理

// 获取 Vuex 状态
const store = useStore();

// 计算属性获取用户 ID (动态获取)
const adminId = computed(() => store.state.user.id);

// 定义变量
const search = ref('');
const currentPage = ref(1);
const pageSize = ref(10);  // 每页显示 10 行
const totalItems = ref(0);
const students = ref([]);

// 获取学生数据
const getStudents = async () => {
  try {
    const response = await axios.get(`/api/school-admin/${adminId.value}/query-all-students`);
    if (response.status === 200 && response.data.message === '全校学生信息查询成功') {
      students.value = response.data.data;
      totalItems.value = response.data.data.length;
    } else {
      ElMessage({ message: '学生账号信息查询失败：' + response.data.message, type: 'error' });
    }
  } catch (error) {
    ElMessage({ message: '获取学生信息失败，请稍后再试', type: 'error' });
  }
};

// 页面加载时获取学生数据
onMounted(() => {
  getStudents();
});

// 过滤后的数据
const filteredData = computed(() => {
  return students.value.filter(student => student.name && student.name.includes(search.value));
});

// 根据当前页和每页的行数来获取显示的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

// 查询学生
const searchStudent = () => {
  ElMessage({ message: '查询成功', type: 'success' });
};

// 重置搜索
const resetSearch = () => {
  search.value = '';
  ElMessage({ message: '重置成功', type: 'success' });
};

// 删除学生
// 删除学生
const deleteStudent = async (student) => {
  try {
    // 调用后端 API 删除学生
    const response = await axios.delete(`/api/school-admin/${adminId.value}/delete-student/${student.id}`);

    // 如果删除成功
    if (response.status === 200 && response.data.message === '学生账号删除成功') {
      // 从前端数据列表中移除该学生
      students.value = students.value.filter(s => s.id !== student.id);
      ElMessage({ message: '学生删除成功', type: 'success' });
    } else {
      // 删除失败时显示错误消息
      ElMessage({ message: '删除失败：' + response.data.message, type: 'error' });
    }
  } catch (error) {
    // 请求失败时显示错误消息
    ElMessage({ message: '删除失败，请稍后再试', type: 'error' });
  }
};


// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page;
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
  appearance: auto;
  -webkit-appearance: auto;
  -moz-appearance: auto;
}
</style>

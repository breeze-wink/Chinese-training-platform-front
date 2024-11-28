<template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header />

    <div class="main-container">
      <!-- 引入侧边栏通用组件 -->
      <Sidebar />

      <!-- 内容区 -->
      <div class="content">
        <h2>教师管理</h2>
        <div class="input-button-group">
          <el-input v-model="search" placeholder="输入教师姓名" style="width: 300px;"></el-input>
          <el-button type="primary" @click="searchTeacher">查询</el-button>
          <el-button type="warning" @click="resetSearch">重置</el-button>
        </div>

        <el-table :data="paginatedData" style="width: 100%; margin-top: 20px;">
          <el-table-column prop="id" label="序号" width="80"></el-table-column>
          <el-table-column prop="name" label="姓名" width="150"></el-table-column>
          <el-table-column prop="email" label="邮箱" width="250"></el-table-column>
          <el-table-column prop="phoneNumber" label="联系方式"></el-table-column>
          <el-table-column prop="schoolId" label="学校ID" width="120"></el-table-column>

          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button size="small" type="danger" @click="deleteTeacher(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

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
import { useStore } from 'vuex'; // 引入 Vuex

// 获取 Vuex 状态
const store = useStore();

// 计算属性获取用户 ID (动态获取)
const adminId = computed(() => store.state.user.id);

// 定义变量
const search = ref('');
const currentPage = ref(1);
const pageSize = ref(10);  // 每页显示 7 行
const totalItems = ref(0);
const teachers = ref([]);
const filteredData = ref([]);  // 用来存储筛选后的数据

// 获取教师数据
const getTeachers = async () => {
  try {
    const response = await axios.get(`/api/school-admin/${adminId.value}/query-all-teachers`);
    if (response.status === 200) {
      teachers.value = response.data.data;
      totalItems.value = response.data.data.length;
      filteredData.value = teachers.value;  // 默认加载所有数据
    } else {
      ElMessage({ message: '教师账号信息查询失败：' + response.data.message, type: 'error' });
    }
  } catch (error) {
    console.error(error);
    ElMessage({ message: '获取教师信息失败，请稍后再试', type: 'error' });
  }
};

// 页面加载时获取教师数据
onMounted(() => {
  getTeachers(); // 使用动态的 adminId 获取信息
});

// 根据当前页和每页的行数来获取显示的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

// 查询教师
const searchTeacher = () => {
  // 执行筛选操作
  filteredData.value = teachers.value.filter(teacher =>
      teacher.name.includes(search.value)
  );
  ElMessage({ message: '查询成功', type: 'success' });
};

// 重置搜索
const resetSearch = () => {
  search.value = '';
  filteredData.value = teachers.value;  // 重置筛选结果为所有教师
  ElMessage({ message: '重置成功', type: 'success' });
};

// 删除教师
const deleteTeacher = async (teacher) => {
  try {
    const response = await axios.delete(`/api/school-admin/${adminId.value}/delete-teacher/${teacher.id}`);
    if (response.status === 200) {
      // 删除成功后，从 teachers 数组中移除该教师
      teachers.value = teachers.value.filter(t => t.id !== teacher.id);
      filteredData.value = filteredData.value.filter(t => t.id !== teacher.id); // 更新筛选后的数据
      totalItems.value -= 1;  // 更新总条目数
      ElMessage({ message: '教师删除成功', type: 'success' });
    } else {
      ElMessage({ message: '删除失败：' + response.data.message, type: 'error' });
    }
  } catch (error) {
    console.error(error);
    ElMessage({ message: '删除教师失败，请稍后再试', type: 'error' });
  }
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

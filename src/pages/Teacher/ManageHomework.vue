<template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header />

    <div class="main-container">
      <!-- 引入侧边栏通用组件 -->
      <Sidebar />

      <!-- 内容区 -->
      <div class="content">
        <h2>作业管理</h2>
        <div class="input-button-group">
          <el-select v-model="selectedStatus" placeholder="筛选状态" style="width: 200px" @change="filterByStatus">
            <el-option label="全部" value=""></el-option>
            <el-option label="未发布" value="未发布"></el-option>
            <el-option label="未截止" value="未截止"></el-option>
            <el-option label="待批阅" value="待批阅"></el-option>
          </el-select>
          <el-button type="primary" @click="fetchAssignments">刷新</el-button>
        </div>

        <!-- 表格显示数据 -->
        <el-table :data="paginatedData" style="width: 100%; margin-top: 20px;">
          <el-table-column prop="assignmentTitle" label="作业标题" width="200"></el-table-column>
          <el-table-column prop="startTime" label="开始时间" width="180" :formatter="formatDate"></el-table-column>
          <el-table-column prop="endTime" label="结束时间" width="180" :formatter="formatDate"></el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="viewCompletion(row)">查看完成情况</el-button>
              <el-button size="small" type="success" @click="reviewAssignment(row)">批阅</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
            style="margin-top: 20px; justify-content: center;"
            @current-change="handlePageChange"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="prev, pager, next,jumper"
            :total="filteredAssignments.length"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import { ElButton, ElSelect, ElTable, ElTableColumn, ElTag, ElMessage, ElPagination } from 'element-plus';
import axios from 'axios';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

// 获取 Vuex 状态
const store = useStore();

// 获取教师 ID
const teacherId = computed(() => store.state.user.id);

// 定义变量
const assignments = ref([]); // 存储所有作业
const filteredAssignments = ref([]); // 存储筛选后的作业
const selectedStatus = ref(''); // 选择的状态筛选

const currentPage = ref(1);
const pageSize = ref(10);

// 获取教师所有作业数据
const fetchAssignments = async () => {
  try {
    const response = await axios.get(`/api/teacher/${teacherId.value}/get-assignment-list`);
    if (response.status === 200 ) {
      // 处理作业数据
      assignments.value = response.data.data.map(assignment => ({
        ...assignment,
        status: determineStatus(assignment.startTime, assignment.endTime)
      }));
      filteredAssignments.value = assignments.value;
    } else {
      ElMessage.error('获取作业列表失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('获取作业列表失败，请稍后再试');
  }
};

// 页面加载时获取作业数据
onMounted(() => {
  fetchAssignments();
});

// 根据当前时间和作业时间确定状态
const determineStatus = (startTime, endTime) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (now < start) {
    return '未发布';
  } else if (now >= start && now <= end) {
    return '未截止';
  } else {
    return '待批阅';
  }
};

// 格式化日期
const formatDate = (row, column, cellValue) => {
  const date = new Date(cellValue);
  return date.toLocaleString();
};

// 获取状态标签的类型
const getStatusTagType = (status) => {
  switch (status) {
    case '未发布':
      return 'warning';
    case '未截止':
      return 'success';
    case '待批阅':
      return 'info';
    default:
      return 'default';
  }
};

// 状态筛选
const filterByStatus = () => {
  if (selectedStatus.value) {
    filteredAssignments.value = assignments.value.filter(assignment => assignment.status === selectedStatus.value);
  } else {
    filteredAssignments.value = assignments.value;
  }
  currentPage.value = 1; // 重置到第一页
};

// 获取分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredAssignments.value.slice(start, end);
});

// 页码变更时触发
const handlePageChange = (page) => {
  currentPage.value = page;
};

// 操作按钮逻辑（暂时只显示提示）
const viewCompletion = (assignment) => {
  ElMessage.info(`查看作业 "${assignment.assignmentTitle}" 的完成情况`);
  // 这里可以添加跳转到完成情况页面的逻辑
};

const reviewAssignment = (assignment) => {
  ElMessage.info(`批阅作业 "${assignment.assignmentTitle}"`);
  // 这里可以添加批阅作业的逻辑
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
  background-color: #f0f0f0; /* 背景改为浅灰色 */
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
  appearance: none; /* 去掉浏览器默认样式 */
  -webkit-appearance: none; /* 适用于 Webkit 内核的浏览器（如 Safari） */
  -moz-appearance: none; /* 适用于 Firefox */
}

.dialog-footer { /*弹窗底部*/
  display: flex;
  justify-content: center; /* 居中 */
  gap: 10px; /* 按钮之间的间距 */
}
</style>

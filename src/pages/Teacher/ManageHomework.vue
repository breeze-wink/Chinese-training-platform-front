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

            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
            style="margin-top: 20px; justify-content: center;"
            @current-change="handlePageChange"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="prev, pager, next, jumper"
            :total="filteredAssignments.length"
        />
      </div>
    </div>

    <!-- 查看完成情况弹窗 -->
    <el-dialog title="查看完成情况" v-model="dialogVisible" width="800px" center>
      <div class="filter-group">
        <el-select v-model="filterSubmitted" placeholder="选择提交状态" style="width: 200px" @change="filterSubmissions">
          <el-option label="全部" value=""></el-option>
          <el-option label="已提交" value="1"></el-option>
          <el-option label="未提交" value="0"></el-option>
        </el-select>
        <el-select v-model="filterMarked" placeholder="选择批阅状态" style="width: 200px" @change="filterSubmissions">
          <el-option label="全部" value=""></el-option>
          <el-option label="已批阅" value="2"></el-option>
          <el-option label="待提交" value="1"></el-option>
          <el-option label="未批阅" value="0"></el-option>
        </el-select>
      </div>

      <el-table :data="paginatedSubmissions" style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" width="150"></el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="180" :formatter="formatDate"></el-table-column>
        <el-table-column prop="totalScore" label="总分" width="100"></el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.isSubmitted === 1 ? '已提交' : '未提交')">
              {{ row.isSubmitted === 1 ? '已提交' : '未提交' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="批阅状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.isMarked === 2 ? '已批阅' : row.isMarked === 1 ? '待提交' : '未批阅')">
              {{ row.isMarked === 2 ? '已批阅' : row.isMarked === 1 ? '待提交' : '未批阅' }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 新增操作列 -->
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
                size="small"
                type="primary"
                :disabled="row.isMarked !== 0"
                @click="reviewAssignment(row)"
            >
              批阅
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
          style="margin-top: 20px; justify-content: center;"
          @current-change="handleSubmissionPageChange"
          :current-page="currentSubmissionPage"
          :page-size="submissionPageSize"
          layout="prev, pager, next, jumper"
          :total="filteredSubmissions.length"
      />

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>

      <!-- 加载提示 -->
      <div v-if="isLoadSubmit " class="loading-modal">
          <div class="modal-content">
              <p v-if="isLoadSubmit">正在加载作业完成情况，请稍候...</p>
              <div class="spinner"></div>
          </div>
      </div>
      <!-- 遮罩层 -->
      <div v-if="isLoadSubmit" class="overlay"></div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, nextTick} from 'vue';
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import { ElButton, ElSelect, ElTable, ElTableColumn, ElTag, ElMessage, ElPagination, ElDialog } from 'element-plus';
import axios from 'axios';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

// 获取 Vuex 状态
const store = useStore();

//加载
const isLoadSubmit = ref(false);

// 获取教师 ID
const teacherId = computed(() => store.state.user.id);

// 定义变量
const assignments = ref([]); // 存储所有作业
const filteredAssignments = ref([]); // 存储筛选后的作业
const selectedStatus = ref(''); // 选择的状态筛选

const currentPage = ref(1);
const pageSize = ref(10);

// 弹窗数据
const dialogVisible = ref(false);
const selectedAssignmentId = ref(null);
const submissions = ref([]);
const filteredSubmissions = ref([]);
const filterSubmitted = ref('');
const filterMarked = ref('');
const currentSubmissionPage = ref(1);
const submissionPageSize = ref(10);

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
    case '已批阅':
      return 'success';
    case '待提交':
      return 'warning';
    case '未提交':
      return 'danger';
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

// 查看完成情况
const viewCompletion = (assignment) => {

  selectedAssignmentId.value = assignment.assignmentId;
  dialogVisible.value = true;

    nextTick(() => {
        // 延迟显示加载动画，确保弹窗已经渲染
        setTimeout(() => {
            isLoadSubmit.value = true;
            // 请求提交数据
            fetchSubmissions(assignment.assignmentId);
        }, 200); // 可以调整 50ms，确保弹窗已经渲染
    });




};

// 获取提交数据
const fetchSubmissions = async (assignmentId) => {

  try {
    const response = await axios.get(`/api/teacher/${teacherId.value}/get-submission-list`, {
      params: { assignmentId: assignmentId }
    });



    if (response.status === 200) {
      submissions.value = response.data.data;
      filteredSubmissions.value = submissions.value;
    } else {
      ElMessage.error('获取提交列表失败');
    }
  } catch (error) {
    ElMessage.error('获取提交列表失败，请稍后再试');
  }finally {
      // 数据加载完成后关闭加载动画
      isLoadSubmit.value = false;
  }
};

// 获取分页数据
const paginatedSubmissions = computed(() => {
  const start = (currentSubmissionPage.value - 1) * submissionPageSize.value;
  const end = start + submissionPageSize.value;
  return filteredSubmissions.value.slice(start, end);
});

// 页码变更时触发
const handleSubmissionPageChange = (page) => {
  currentSubmissionPage.value = page;
};

// 筛选提交状态
const filterSubmissions = () => {
  filteredSubmissions.value = submissions.value.filter(submission => {
    const isSubmitted = filterSubmitted.value !== '' ? submission.isSubmitted === Number(filterSubmitted.value) : true;
    const isMarked = filterMarked.value !== '' ? submission.isMarked === Number(filterMarked.value) : true;
    return isSubmitted && isMarked;
  });
};

// 批阅作业
const routerInstance = useRouter();
const reviewAssignment = (submission) => {
  // 获取所有未批阅的学生
  const unmarkedSubmissions = submissions.value
      .filter(s => s.isMarked === 0)
      .map(s => ({
        studentId: s.studentId,
        studentName: s.studentName
      }));

  if (unmarkedSubmissions.length === 0) {
    ElMessage.warning('没有未批阅的学生');
    return;
  }


  // 将未批阅的学生列表存入 Vuex
  store.dispatch('setUnmarkedSubmissions', unmarkedSubmissions);
  const unmarked = computed(() => store.getters.getUnmarkedSubmissions);
  console.log('存起来的',unmarked.value);
  // 找到当前批阅的学生索引
  const currentIndex = unmarkedSubmissions.findIndex(s => s.studentId === submission.studentId);
  if (currentIndex === -1) {
    ElMessage.error('未找到该学生的提交');
    return;
  }
  store.dispatch('setCurrentSubmissionIndex', currentIndex);

  // 设置当前学生信息
  store.dispatch('setCurrentStudent', {
    studentId: submission.studentId,
    studentName: submission.studentName,
    totalScore: submission.totalScore
  });

  // 跳转到批阅页面，并传递 assignmentId 作为查询参数
  routerInstance.push({
    path: '/teacher/correcting-paper',
    query: {
      assignmentId: selectedAssignmentId.value,
      studentId: submission.studentId
    }
  });
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
    margin-bottom: 30px;
    margin-left: 300px;
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

.filter-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
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
    z-index: 9999; /* 高的 z-index 确保它位于最上层 */
}


.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
    z-index: 9998; /* 确保它比内容区域低于加载动画 */
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 1.2em;

}
</style>

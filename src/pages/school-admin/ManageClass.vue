<template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header />

    <div class="main-container">
      <!-- 引入侧边栏通用组件 -->
      <Sidebar />

      <!-- 内容区 -->
      <div class="content">
        <h2>班级管理</h2>

        <!-- 查询框 -->
        <div class="input-button-group">
          <el-input v-model="search" placeholder="搜索班级名称或描述" style="width: 300px;"></el-input>
        </div>

        <!-- 班级表格 -->
        <el-table :data="filteredClasses" style="width: 100%; margin-top: 20px;">
          <el-table-column prop="id" label="班级ID" width="180"></el-table-column>
          <el-table-column prop="name" label="班级名称"></el-table-column>
          <el-table-column prop="description" label="班级描述"></el-table-column>
          <el-table-column prop="inviteCode" label="邀请码"></el-table-column>
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button size="small" @click="viewClassDetails(row)">查看详情</el-button>
              <el-button size="small" type="danger" @click="deleteClass(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 班级详情弹窗 -->
        <el-dialog :visible.sync="classDetailsDialogVisible" width="50%" title="班级详情">
          <div v-if="classDetails">
            <h3>班级信息</h3>
            <p><strong>班级名称：</strong>{{ classDetails.name }}</p>
            <p><strong>班级描述：</strong>{{ classDetails.description }}</p>
            <p><strong>邀请码：</strong>{{ classDetails.inviteCode }}</p>

            <h4>小组信息</h4>
            <el-table :data="classDetails.groups" style="width: 100%">
              <el-table-column prop="id" label="小组ID" width="100"></el-table-column>
              <el-table-column prop="name" label="小组名称"></el-table-column>
              <el-table-column prop="description" label="小组描述"></el-table-column>
            </el-table>

            <h4>学生信息</h4>
            <el-table :data="classDetails.students" style="width: 100%">
              <el-table-column prop="studentid" label="学号" width="100"></el-table-column>
              <el-table-column prop="name" label="学生姓名"></el-table-column>
            </el-table>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import { ElButton, ElInput, ElTable, ElTableColumn, ElMessage, ElDialog } from 'element-plus';
import axios from 'axios';
import { useStore } from 'vuex';

// 定义变量
const search = ref('');
const classes = ref([]);
const classDetailsDialogVisible = ref(false);
const classDetails = ref(null);
const store = useStore();
const adminId = computed(() => store.state.user.id); // 获取管理员ID

// 获取所有班级信息
const getAllClasses = async () => {
  try {
    const response = await axios.get(`/api/school/${adminId.value}/get-classes`);
    if (response.status === 200) {
      classes.value = response.data.data.classes;
      ElMessage({ message: '班级获取成功', type: 'success' });
    }
  } catch (error) {
    ElMessage({ message: '班级获取失败', type: 'error' });
  }
};

// 过滤班级信息
const filteredClasses = computed(() => {
  return classes.value.filter(item =>
      item.name.includes(search.value) || item.description.includes(search.value)
  );
});

// 查看班级详情
const viewClassDetails = async (item) => {
  try {
    const response = await axios.get(`/api/class/${item.id}/details`);
    if (response.status === 200) {
      classDetails.value = response.data.data.classDetails;
      classDetailsDialogVisible.value = true;
      ElMessage({ message: '班级详情获取成功', type: 'success' });
    }
  } catch (error) {
    ElMessage({ message: '班级详情获取失败', type: 'error' });
  }
};

// 删除班级
const deleteClass = async (item) => {
  try {
    const response = await axios.delete(`/api/class/${item.id}/delete`);
    if (response.status === 200) {
      classes.value = classes.value.filter(i => i.id !== item.id);
      ElMessage({ message: '班级删除成功', type: 'success' });
    }
  } catch (error) {
    ElMessage({ message: '班级删除失败', type: 'error' });
  }
};

onMounted(() => {
  getAllClasses();
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

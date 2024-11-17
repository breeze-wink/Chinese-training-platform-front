<template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header />

    <div class="main-container">
      <!-- 引入侧边栏通用组件 -->
      <Sidebar />

      <!-- 内容区 -->
      <div class="content">
        <h2>生成授权码</h2>
        <div class="authorization-code-container">
          <el-input v-model="authorizationCode" placeholder="生成的授权码" readonly style="width: 300px; margin-right: 10px;"></el-input>
          <el-button type="primary" @click="generateOrUpdateCode">{{ authorizationCode ? '更新授权码' : '生成授权码' }}</el-button>
        </div>

        <!-- 管理员和学校信息展示 -->
        <div class="admin-info-container">
          <p>管理员名称: {{ adminName }}</p>
          <p>学校名称: {{ schoolName }}</p>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import { ElButton, ElInput, ElMessage } from 'element-plus';
import axios from 'axios';

// 定义变量
const adminName = ref('');
const schoolName = ref('');
const authorizationCode = ref('');
const schoolAdminId = ref(null);
const errorMessage = ref('');

// 页面加载时获取管理员信息
const getAdminInfo = async (id) => {
  try {
    const response = await axios.get(`/api/school-admin/${id}`);
    if (response.status === 200 && response.data.message === 'success') {
      schoolAdminId.value = id;
      adminName.value = response.data.data.username;
      schoolName.value =response.data.data.schoolName;
    } else {
      errorMessage.value = '获取管理员信息失败：' + response.data.message;
      console.error(errorMessage.value);
    }
  } catch (error) {
    errorMessage.value = '获取管理员信息失败';
    console.error(errorMessage.value);
    ElMessage({message: errorMessage.value, type: 'error'});
  }
};

onMounted(() => {
  const adminId = 9; // 默认管理员ID为9，读取数据库里的相应信息
  getAdminInfo(adminId);
});

// 生成或更新授权码
const generateOrUpdateCode = async () => {
  if (!schoolAdminId.value) {
    ElMessage({message: '管理员信息缺失', type: 'error'});
    return;
  }

  try {
    const response = await axios.get(`/api/school-admin/${schoolAdminId.value}/generate-authorization-code`);
    if (response.status === 200) {
      authorizationCode.value = response.data.code;
      ElMessage({message: response.data.message, type: 'success'});
    } else {
      ElMessage({message: '授权码生成失败', type: 'error'});
    }
  } catch (error) {
    ElMessage({message: '生成授权码失败', type: 'error'});
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

.authorization-code-container {
  display: flex;
  align-items: center;
  margin-top: 20px;
}

.el-button {
  appearance: auto;
  -webkit-appearance: auto;
  -moz-appearance: auto;
}
</style>

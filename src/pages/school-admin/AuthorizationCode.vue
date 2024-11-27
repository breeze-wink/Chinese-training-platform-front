<template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header />

    <div class="main-container">
      <!-- 引入侧边栏通用组件 -->
      <Sidebar />

      <!-- 内容区 -->
      <div class="content">
        <h2>首页</h2> <!-- 修改为首页 -->

        <!-- 管理员和学校信息展示 -->
        <div class="admin-info-container">
          <p>管理员名称: {{ adminName }}</p>
          <p>学校名称: {{ schoolName }}</p>
          <p>管理员邮箱: {{ email ? email : '邮箱未绑定' }}</p>
        </div>

        <!-- 授权码展示和操作 -->
        <div class="authorization-code-container">
          <p>授权码: {{ authorizationCode || '暂无绑定授权码' }}</p> <!-- 显示授权码 -->
          <el-button type="primary" @click="generateOrUpdateCode">
            {{ authorizationCode ? '更新授权码' : '生成授权码' }} <!-- 根据是否有授权码显示按钮文字 -->
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import { ElButton, ElMessage } from 'element-plus';
import axios from 'axios';
import { useStore } from 'vuex'; // 使用 Vuex 进行状态管理

// 定义变量
const adminName = ref('');
const schoolName = ref('');
const email = ref(null);
const authorizationCode = ref(''); // 存储授权码
const schoolAdminId = ref(null);
const errorMessage = ref('');

// 获取 Vuex 状态
const store = useStore();

// 计算属性获取用户 ID
const adminId = computed(() => store.state.user.id);

// 获取管理员信息
const getAdminInfo = async (id) => {
  try {
    const response = await axios.get(`/api/school-admin/${id}`);
    if (response.status === 200 && response.data.message === 'success') {
      schoolAdminId.value = id;
      adminName.value = response.data.data.username;
      schoolName.value = response.data.data.schoolName;
      email.value = response.data.data.email;
      authorizationCode.value = response.data.data.authorizationCode || ''; // 获取授权码
    } else {
      errorMessage.value = '获取管理员信息失败：' + response.data.message;
      console.error(errorMessage.value);
    }
  } catch (error) {
    errorMessage.value = '获取管理员信息失败';
    console.error(errorMessage.value);
    ElMessage({ message: errorMessage.value, type: 'error' });
  }
};

// 页面加载时获取管理员信息
onMounted(() => {
  getAdminInfo(adminId.value); // 使用动态的 adminId 获取信息
});

// 生成或更新授权码
const generateOrUpdateCode = async () => {
  if (!schoolAdminId.value) {
    ElMessage({ message: '管理员信息缺失', type: 'error' });
    return;
  }

  try {
    let response;
    if (authorizationCode.value) {
      // 如果已经有授权码，更新授权码
      response = await axios.get(`/api/school-admin/${schoolAdminId.value}/generate-authorization-code`);
    } else {
      // 如果没有授权码，生成授权码
      response = await axios.get(`/api/school-admin/${schoolAdminId.value}/generate-authorization-code`);
    }

    if (response.status === 200) {
      authorizationCode.value = response.data.code; // 更新授权码
      ElMessage({ message: response.data.message, type: 'success' });
    } else {
      ElMessage({ message: '授权码操作失败', type: 'error' });
    }
  } catch (error) {
    ElMessage({ message: '授权码操作失败', type: 'error' });
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
  flex-direction: column;
  align-items: flex-start;
  margin-top: 20px;
}

.el-button {
  appearance: auto;
  -webkit-appearance: auto;
  -moz-appearance: auto;
}
</style>

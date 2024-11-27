<template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header />

    <div class="main-container">
      <!-- 引入侧边栏通用组件 -->
      <Sidebar />

      <!-- 内容区 -->
      <div class="content">
        <div class="welcome-message">
          <h2>欢迎系统管理员进入</h2>
          <p>用户名：{{ username }}</p>
          <p>您的邮箱为：{{ email }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';  // 引入 axios
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';

// 定义组件中的数据
const username = ref('');
const email = ref('');

// 假设用户 ID 存储在某个地方，例如通过登录获取到的用户 ID
const userId = 1; // 可以替换成实际的用户 ID，例如从登录信息中获取

// 在组件挂载时，通过 axios 获取用户信息
onMounted(() => {
  axios.get(`/api/system-admin/${userId}`)
      .then(response => {
        if (response.data.message === 'success') {
          // 成功时，将用户名和邮箱存储到组件的响应式数据中
          username.value = response.data.data.username;
          email.value = response.data.data.email;
        } else {
          console.error('用户未找到');
        }
      })
      .catch(error => {
        console.error('请求失败', error);
      });
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
  display: flex;
  justify-content: center;
  align-items: center;
}

.welcome-message {
  text-align: center;
}

.welcome-message h2 {
  margin-bottom: 20px;
}

.welcome-message p {
  font-size: 18px;
  color: #333;
}
</style>

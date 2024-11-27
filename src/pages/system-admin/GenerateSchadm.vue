<template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header />

    <div class="main-container">
      <!-- 引入侧边栏通用组件 -->
      <Sidebar />

      <!-- 内容区 -->
      <div class="content">
        <h2>学校管理员账号生成</h2>
        <!-- 触发浮动框的按钮 -->
        <el-button type="primary" @click="openDialog">生成学校管理员账号</el-button>

        <!-- 浮动框 -->
        <div v-if="dialogVisible" class="floating-box">
          <h3>生成学校管理员账号</h3>
          <el-form :model="newAdmin" label-width="80px">
            <el-form-item label="用户名">
              <el-input v-model="newAdmin.name"></el-input>
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="newAdmin.password"></el-input>
            </el-form-item>
            <el-form-item label="学校ID">
              <el-input v-model="newAdmin.schoolId" type="number"></el-input>
            </el-form-item>
          </el-form>
          <div class="floating-box-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="generateAdmin">生成</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import { ElButton, ElInput, ElForm, ElFormItem, ElMessage } from 'element-plus';
import axios from 'axios';

// 定义变量
const newAdmin = ref({ name: '', password: '', schoolId: null });
const dialogVisible = ref(false);

// 打开浮动框
const openDialog = () => {
  dialogVisible.value = true;
};

// 生成管理员账号
const generateAdmin = async () => {
  if (!newAdmin.value.name || !newAdmin.value.password || !newAdmin.value.schoolId) {
    ElMessage({ message: '用户名、密码和学校ID不能为空', type: 'warning' });
    return;
  }

  try {
    // 将学校管理员账号数据发送到后端
    const response = await axios.post('/api/system-admin/create-school-admin', {
      name: newAdmin.value.name,
      password: newAdmin.value.password,
      schoolId: Number(newAdmin.value.schoolId) // Ensure schoolId is sent as a number (Long)
    });

    if (response.data && response.data.message === '生成成功') {
      ElMessage({ message: '账号生成成功', type: 'success' });
      dialogVisible.value = false; // 关闭浮动框
    } else {
      ElMessage({message: response.data.message || '账号生成失败', type: 'error'});
    }
  } catch (error) {
    ElMessage({message: '账号生成失败', type: 'error'});
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

/* 浮动框样式 */
.floating-box {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  width: 400px;
}

.floating-box-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.floating-box .el-form-item {
  margin-bottom: 15px;
}
</style>

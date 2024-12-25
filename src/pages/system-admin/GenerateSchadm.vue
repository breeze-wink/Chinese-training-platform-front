<template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header />

    <div class="main-container">
      <!-- 引入侧边栏通用组件 -->
      <Sidebar />

      <!-- 内容区 -->
      <div class="content">
        <div class="title-and-button-container">
        <h2>学校管理员账号管理</h2>
        <!-- 触发浮动框的按钮 -->


        </div>

        <!-- 学校管理员账号列表 -->
        <el-table :data="searchedAdmins" stripe height="620" style="max-width: 100%;" >
          <el-table-column prop="schoolName" label="学校" width="200" ></el-table-column>
          <el-table-column prop="userName" label="用户名" width="280" ></el-table-column>
          <el-table-column prop="name" label="负责人" width="100" ></el-table-column>
          <el-table-column prop="email" label="邮箱" width="320" ></el-table-column>
          <el-table-column align="right" >
            <template #header>
              <div class="header-container">
                <el-button text type="primary" icon="CirclePlus" @click="openDialog" class="custom-button"></el-button>
                <el-input v-model="search" size="large" placeholder="请输入学校名称" style="margin-left: 10px;"/>
              </div>
            </template>
            <template #default="{ row }">
              <el-button @click="deleteAdmin(row.schoolAdminId)" type="danger" size="large">删除</el-button>
            </template>
          </el-table-column>
        </el-table>


        <el-dialog title="生成学校管理员账号" v-model="dialogVisible" width="30%" align-center>
          <el-form :model="newAdmin" label-width="100px" class="floating-box-form">
            <el-form-item label="用户名">
              <el-input v-model="newAdmin.name" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item label="密码" >
              <el-input v-model="newAdmin.password" type="password" placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item label="学校名称">
              <el-input v-model="newAdmin.schoolName" placeholder="请输入学校名称"></el-input>
            </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="dialogVisible = false" class="cancel-btn">取消</el-button>
              <el-button type="primary" @click="generateAdmin" class="submit-btn">生成</el-button>
            </span>
        </el-dialog>


      </div>
    </div>
  </div>
</template>


<script setup>
import {ref, onMounted, computed} from 'vue';
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import {
    ElButton,
    ElInput,
    ElForm,
    ElFormItem,
    ElMessage,
    ElTable,
    ElTableColumn,
    ElNotification,
    ElMessageBox
} from 'element-plus';
import axios from 'axios';

// 定义变量
const newAdmin = ref({ name: '', password: '', schoolName: ''});
const dialogVisible = ref(false);
const admins = ref([]);  // 用于存储管理员列表
const search = ref("");

// 页面加载时获取管理员列表
onMounted(async () => {
  await fetchAdmins();
});

const searchedAdmins = computed(() =>
    admins.value.filter(
        (data) =>
            !search.value ||
            data.schoolName.toLowerCase().includes(search.value.toLowerCase())
    )
)

// 获取学校管理员列表
const fetchAdmins = async () => {
  try {
    const response = await axios.get('/api/system-admin/get-school-admin-accounts');
    if (response.data && response.data) {
      admins.value = response.data.data; // 将返回的数据赋值给admins
      searchedAdmins.value = admins.value;
    } else {
      ElMessage({ message: '获取管理员列表失败', type: 'error' });
    }
  } catch (error) {
    ElMessage({ message: '获取管理员列表失败', type: 'error' });
  }
};

// 删除管理员账号
const deleteAdmin = async (id) => {
    // 显示确认框
    ElMessageBox.confirm(
            '您确定要删除该学校管理员吗？',
            '警告',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
    ).then(async () => {
        try {
            // 发送删除请求
            const response = await axios.delete(`/api/system-admin/delete-school-admin-account/${id}`);
            if (response.data && response.data.message === '删除成功') {
                ElNotification.success({ message: '账号删除成功' });
                // 刷新管理员列表
                await fetchAdmins();
            } else {
                ElNotification.error({ title: '删除失败', message: response.data.message  });
            }
        } catch (error) {
            // 捕获请求失败的错误
            ElNotification.error({ title: '删除失败', message: error.response.data.message });
        }
    }).catch(() => {
        // 用户点击取消时显示提示

    });
};

// 打开浮动框
const openDialog = () => {
  dialogVisible.value = true;
};

// 生成管理员账号
const generateAdmin = async () => {
  if (!newAdmin.value.name || !newAdmin.value.password || !newAdmin.value.schoolName) {
    ElMessage({ message: '用户名、密码和学校ID不能为空', type: 'warning' });
    return;
  }

    if (!String(newAdmin.value.name).trim()) {
        ElMessage.error('用户名不能为空');
        return;
    }
    if (/\s/.test(newAdmin.value.name)) { // 新增空格检查
        ElMessage.error('用户名不能包含空格');
        return;
    }
    if (String(newAdmin.value.name).includes('@')) {
        ElMessage.error('用户名不能包含 "@" 符号');
        return;
    }

  try {
    // 将学校管理员账号数据发送到后端
    const response = await axios.post('/api/system-admin/create-school-admin', {
      name: newAdmin.value.name,
      password: newAdmin.value.password,
      schoolName: newAdmin.value.schoolName // Ensure schoolId is sent as a number (Long)
    });

    if (response.data && response.data.message === '生成成功') {
      ElMessage({ message: '账号生成成功', type: 'success' });
      dialogVisible.value = false; // 关闭浮动框
      // 刷新管理员列表
      await fetchAdmins();
    } else {
      ElMessage({ message: response.data.message || '账号生成失败', type: 'error' });
    }
  } catch (error) {
    ElMessage.error({ message: error.response.data.message ? error.response.data.message : "创建失败" });
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
  background-color: #f0f0f0;
  margin-bottom: 30px;
}

.content {
  max-width: 1140px;
  width: 100%;
  padding: 20px;
  background-color: #fff;
  overflow-y: auto;
  margin-right: 50px;
    margin-left: 300px;
}

.page-container /deep/ .el-table .el-table__header-wrapper th{
  color: #000 !important; /* 黑色字体 */
  font-weight: bold; /* 加粗 */
}

/* 弹窗样式 */
.floating-box {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  width: 450px;
  max-width: 100%;
  box-sizing: border-box;
}

.floating-box-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}

.floating-box-form {
  margin-bottom: 20px;
}

/* 设置表单项之间的间距 */
.floating-box .el-form-item {
  margin-bottom: 15px;
}

.floating-box .el-form-item label {
  font-size: 16px;
  color: #666;
}

/* 设置输入框的样式 */
.floating-box .el-input {
  font-size: 14px;
  padding: 5px;
  border-radius: 6px;
  width: 100%;  /* 让输入框宽度占满父容器 */
}

/* 设置按钮样式 */
.floating-box-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
.dialog-footer {
  display: flex;
  justify-content: center;
  margin-top: 20px; /* 底部按钮与表单的间距 */
}
.cancel-btn {
  margin-right: 10px;
  background-color: #f2f4f7;
  color: #333;
  border-radius: 6px;
}

.cancel-btn:hover {
  background-color: #e1e4e8;
}

.submit-btn {
  background-color: #409EFF;
  color: #fff;
  border-radius: 6px;
}

.submit-btn:hover {
  background-color: #66b1ff;
}



.el-table {
  font-size: 18px;  /* 增大字体 */
}

.title-and-button-container {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 在容器中将标题和按钮分别放在两边 */
  margin-bottom: 20px; /* 设置标题和表格之间的间距 */
}

.header-container {
  display: flex;
  align-items: center; /* 垂直居中 */
  gap: 10px; /* 元素之间的间距 */
}

.custom-button {
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 25px;
}
/* 由于使用了scoped，确保样式只作用于当前组件 */
.header-container .el-input {
  margin-left: 10px; /* 输入框与按钮之间的间距 */
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

<template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header/>

    <div class="main-container">
      <!-- 引入侧边栏通用组件 -->
      <Sidebar/>

      <!-- 内容区 -->
      <div class="content">
        <h2>个人信息</h2>

        <!-- 个人信息卡片 -->
        <el-card class="info-card">
          <div class="info-item">
            <label>昵称：</label>
            <span v-if="!editNickname">{{ SystemAdminInfo.username }}</span>
            <el-input
                v-else
                v-model="SystemAdminInfo.username"
                size="small"
                class="edit-input"
                @blur="toggleEdit('nickname'); updateUsername()"/>
            <el-icon @click="toggleEdit('nickname')">
              <Edit/>
            </el-icon>
          </div>
        </el-card>

        <!-- 账号信息卡片 -->
        <h2>账号信息</h2>
        <el-card class="info-card" style="margin-top: 20px;">
          <div class="info-item">
            <label>账号ID：</label>
            <span>{{ systemAdminId }}</span>
          </div>
          <div class="info-item">
            <label>密码：</label>
            <span>******</span>
            <el-icon @click="showChangePasswordModal" class="edit-icon">
              <Edit />
            </el-icon>
          </div>
            <div class="info-item">
                <label>绑定邮箱：</label>
                <span>{{ SystemAdminInfo.email }}</span>
                <el-icon @click="showChangeEmailModal" class="edit-icon">
                    <Edit />
                </el-icon>
            </div>
        </el-card>
      </div>

        <el-dialog v-model="isChangeEmailModalVisible" title="更换绑定邮箱" @close="hideChangeEmailModal" custom-class="square-modal">
            <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef">
                <el-form-item label="新邮箱" prop="newEmail">
                    <el-input v-model="emailForm.newEmail" placeholder="请输入新邮箱地址"></el-input>
                </el-form-item>
                <el-form-item label="验证码" prop="verificationCode">
                    <el-row :gutter="10">
                        <el-col :span="16">
                            <el-input v-model="emailForm.verificationCode" placeholder="请输入验证码"></el-input>
                        </el-col>
                        <el-col :span="8">
                            <el-button @click="sendVerificationCode" class="verify-button">发送验证码</el-button>
                        </el-col>
                    </el-row>
                </el-form-item>
                <div class="form-buttons">
                    <el-button type="primary" @click="handleChangeEmail" class="action-button">确认修改</el-button>
                </div>
            </el-form>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        </el-dialog>

      <!-- 修改密码的模态框 -->
      <el-dialog v-model="isChangePasswordModalVisible" width="400px" align-center title="修改密码" @close="resetPasswordForm" custom-class="square-modal">
        <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
          <el-form-item label="旧密码" prop="oldPassword">
            <el-input type="password" v-model="passwordForm.oldPassword" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input type="password" v-model="passwordForm.newPassword" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmNewPassword">
            <el-input type="password" v-model="passwordForm.confirmNewPassword" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div class="form-buttons">
          <el-button @click="hideChangePasswordModal" class="action-button">取 消</el-button>
          <el-button type="primary" @click="handlePasswordChange" class="action-button">确 定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import { ref, reactive, onMounted, computed } from 'vue';
import { ElIcon, ElCard, ElInput, ElMessage, ElDialog, ElForm, ElFormItem } from 'element-plus';
import { Edit } from '@element-plus/icons-vue';
import { useStore } from "vuex";
import axios from "axios";

// 从全局状态中获取 ID 信息
const store = useStore();
const systemAdminId = computed(() => store.state.user.id);

// 控制编辑状态
const editNickname = ref(false);

// 错误消息
const errorMessage = ref('');

// 定义响应式表单数据
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',
});
const passwordFormRef = ref(null);
// 自定义确认密码验证
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.value.newPassword) {
    callback(new Error('新密码和确认密码不一致'));
  } else {
    callback();
  }
};

// 定义表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' },
  ],
  confirmNewPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
};

// 密码修改方法
const handlePasswordChange = async () => {

  try {
    // 表单验证
    const validateResult = await passwordFormRef.value.validate();
    if (!validateResult) {
      ElMessage.error('表单验证失败');
      return;
    }

    // 发送密码更新请求
    const response = await axios.post(`/api/system-admin/${systemAdminId.value}/change-password`, {
      password: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
    });

    if (response.status === 200) {
      ElMessage.success('密码修改成功');
      hideChangePasswordModal();
    } else {
      ElMessage.error(response.data.message || '密码修改失败');
    }
  } catch (error) {
    ElMessage.error(error.message || '密码修改失败');
  }
};


// 获取信息
const getSystemAdminInfo = async () => {
  try {
    const response = await axios.get(`/api/system-admin/${systemAdminId.value}`);
    if (response.status === 200 && response.data.message === 'success') {
      SystemAdminInfo.value = response.data.data;
    } else {
      errorMessage.value = '获取系统管理员信息失败:' + response.data.message;
      console.error(errorMessage.value);
    }
  } catch (error) {
    errorMessage.value = '获取系统管理员信息时发生错误：' + error.message;
    console.error(errorMessage.value);
  }
};

onMounted(() => {
  getSystemAdminInfo();
});

// 切换编辑状态
function toggleEdit(field) {
  if (field === 'nickname') {
    editNickname.value = !editNickname.value;
  }
}

const updateUsername = async () => {
  try {
    const url = `/api/system-admin/${systemAdminId.value}/update-username`;

    // 发送 POST 请求
    const response = await axios.post(url, {
      username: SystemAdminInfo.value.username
    });

    // 处理响应
    if (response.status === 200) {
      ElMessage.success('用户名修改成功');
      console.log(response.data.message);
    } else {
      console.error(response.data.message);
      ElMessage.error(response.data.message);
    }
  } catch (error) {
    // 处理错误
    console.error('请求失败' + error.message);
  }
};

const isChangePasswordModalVisible = ref(false);

// 显示修改密码弹窗
const showChangePasswordModal = () => {
  isChangePasswordModalVisible.value = true;
};

// 隐藏修改密码弹窗
const hideChangePasswordModal = () => {
  isChangePasswordModalVisible.value = false;
  resetPasswordForm();
};

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  };
};

const SystemAdminInfo = ref({
  username: '',
  email: '',
});

const isChangeEmailModalVisible = ref(false);
const successMessage = ref('');

const emailFormRef = ref(null);
const emailForm = ref({
    newEmail: '',
    verificationCode: '',
});
const emailRules = ref({
    newEmail: [
        {required: true, message: '请输入新的邮箱地址', trigger: 'blur'},
        {type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change']}
    ],
    verificationCode: [
        {required: true, message: '请输入验证码', trigger: 'blur'},
        {len: 6, message: '验证码长度应为6位', trigger: 'blur'}
    ]
});

const showChangeEmailModal = () => {
    isChangeEmailModalVisible.value = true;
};

const hideChangeEmailModal = () => {
    isChangeEmailModalVisible.value = false;
    emailForm.value.newEmail = '';
    emailForm.value.verificationCode = '';
    errorMessage.value = '';
    successMessage.value = '';
};

// 发送验证码
const sendVerificationCode = async () => {
    try {
        const response = await axios.get(`/api/system-admin/send-email-code`, {
            params: {
                email: emailForm.value.newEmail
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            successMessage.value = '验证码已发送，请查收您的邮箱';
        } else {
            errorMessage.value = '验证码发送失败';
        }
    } catch (error) {
        errorMessage.value = '验证码发送失败，请稍后再试';
        console.error('验证码发送失败:', error.response ? error.response.data : error.message);
    }
};

// 处理邮箱更换
const handleChangeEmail = async () => {
    const formRef = emailFormRef.value; // 使用 emailFormRef 来访问 form 实例
    formRef.validate(async (valid) => { // 使用正确的 refs 调用 validate
        if (valid) {
            try {
                const response = await axios.get(`/api/system-admin/change-email`, {
                    params: {
                        newEmail: emailForm.value.newEmail
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    successMessage.value = '邮箱更换成功';
                    SystemAdminInfo.value.email = emailForm.value.newEmail;
                    hideChangeEmailModal();
                } else {
                    errorMessage.value = '邮箱更换失败';
                }
            } catch (error) {
                errorMessage.value = '邮箱更换失败，请稍后再试';
                console.error('邮箱更换失败:', error.response ? error.response.data : error.message);
            }
        } else {
            console.log('表单验证失败');
            return false;
        }
    });
};

</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f0f0; /* 背景改为浅灰色 */
}

.main-container {
  display: flex;
  flex: 1;
}
.form-buttons {
  text-align: center;
  margin-top: 20px;
}
.content {
  max-width: 1000px; /* 最大宽度为 1000px */
  width: 100%; /* 宽度在正常情况下可以随着窗口大小缩放 */
  padding: 20px;
  background-color: #fff;
  overflow-y: auto;
  margin-right: 50px; /* 如果需要右侧留空隙，可以保留这行，或者可以根据实际情况调整 */
    margin-left: 300px;
}



.info-card {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.info-item label
{
  font-weight: bold;
  width: 100px;
}

.info-item span {
  font-size: 16px;
  color: #333;
}
/* 新增样式 */
.action-button {
  background-color: #409eff;
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}
.el-icon {
  font-size: 20px;
  cursor: pointer;
  color: #409EFF; /* 图标颜色设置为蓝色，确保更醒目 */
}

.edit-input {
  width: 200px; /* 限制输入框的宽度，避免太长 */
}

.dialog-footer {
  display: flex;
  justify-content: center; /* 水平居中 /
gap: 10px; / 按钮之间留一些间距 /
padding: 10px 0; / 上下留空隙，使布局看起来更好 */
}

.form-item-spacing {
  margin-bottom: 30px; /* 表单项之间的上下间距 */
}

.form-container {
  align-items: center; /* 水平方向居中 /
margin-top: 20px; / 给表单添加上方的间距，使标题与表单之间有间距 */
}

.input-limited {
  width: 300px; /* 限定输入框的宽度 /
max-width: 100%; / 防止超出父容器 */
}
.form-buttons {
    text-align: center;
    margin-top: 20px;
}
.action-button {
    background-color: #409eff;
    border: none;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
}

.action-button:hover {
    background-color: #66b1ff;
    transform: scale(1.05);
}

.action-button:active {
    transform: scale(0.95);
}
.error-message,
.success-message,
.result-message {
    font-size: 14px;
    margin-top: 10px;
    padding: 8px 12px;
    border-radius: 4px;
    display: inline-block;
}

.error-message {
    color: #f56c6c;
    background-color: #fef0f0;
}

.success-message {
    color: #67c23a;
    background-color: #f0f9eb;
}
.result-message {
    color: #909399;
    background-color: #f4f4f5;
}
</style>
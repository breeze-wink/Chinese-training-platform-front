<template>
  <div class="page-container">
    <!-- 引入头部通用组件 -->
    <Header />

    <div class="main-container">
      <!-- 引入侧边栏通用组件 -->
      <Sidebar />

      <!-- 内容区 -->
      <div class="content">
        <h2>个人信息</h2>

        <!-- 个人信息卡片 -->
        <el-card class="info-card">
          <div class="info-item">
            <label>用户名：</label>
            <span v-if="!editNickname">{{ adminName }}</span>
            <el-input
                v-else
                v-model="adminName"
                size="small"
                class="edit-input"
                @blur="toggleEdit('adminName'); updateUsername()"/>
            <el-icon @click="toggleEdit('adminName')">
              <Edit/>
            </el-icon>
          </div>
          <div class="info-item">
            <label>学校名称：</label>
            <span>{{ schoolName }}</span>
          </div>
          <div class="info-item">
            <label>负责人：</label>
            <span :class="{'text-danger': !name}" v-if="!editName">{{ name ? name: '还未设定' }}</span>
            <el-input
                v-else
                v-model="name"
                size="small"
                class="edit-input"
                @blur="toggleEdit('name'); updateName()"/>
            <el-icon @click="toggleEdit('name')">
              <Edit/>
            </el-icon>
          </div>
        </el-card>

        <!-- 账号信息卡片 -->
        <h2>账号信息</h2>
        <el-card class="info-card" style="margin-top: 20px;">
          <div class="info-item">
            <label>账号ID：</label>
            <span>{{ schoolAdminId }}</span>
          </div>
         <div class="info-item">
          <label>密码：</label>
          <span>******</span>
          <el-icon @click="showChangePasswordDialog = true">
            <Edit/>
          </el-icon>
        </div>

          <div class="info-item">
            <label>绑定邮箱：</label>
            <span :class="{'text-danger': !email}">{{ email ? email : '还未绑定' }}</span>
            <el-button text bg v-if="!email" type="primary" @click="showBindEmailDialog = true">绑定邮箱</el-button>
              <el-icon @click="showChangeEmailModal" class="edit-icon">
                  <Edit />
              </el-icon>
          </div>
        </el-card>

         <!-- 授权码信息卡片 -->
         <h2>授权码信息</h2>
        <el-card class="info-card" style="margin-top: 20px;">
          <div class="info-item">
            <label>教师授权码：</label>
            <span :class="{'text-danger': !authorizationCode}">{{ authorizationCode || '暂无' }}</span>
            <el-button size="large" @click="generateOrUpdateCode" style="margin-left: auto;">
            {{ authorizationCode ? '更新授权码' : '生成授权码' }} <!-- 根据是否有授权码显示按钮文字 -->
          </el-button>
          </div>
          <div class="info-item">
            <label>创建时间：</label>
            <span>{{ createDate || ''}}</span>
          </div>

        </el-card>
      </div>
    </div>
      <!-- 绑定邮箱对话框 -->
      <el-dialog title="绑定邮箱" v-model="showBindEmailDialog" width="25%" align-center>
          <el-form :model="bindEmailForm" label-width="100px">
              <el-form-item label="邮箱地址">
                  <el-input v-model="bindEmailForm.email" placeholder="请输入邮箱地址" style="width: 95%;"></el-input>
              </el-form-item>
              <el-form-item label="验证码">
                  <el-input v-model="bindEmailForm.verificationCode" placeholder="请输入验证码" style="width: 60%;"></el-input>
                  <el-button type="primary" @click="sendVerificationCode" :disabled="isSendingCode" style="margin-left: 10px;">
                      {{ isSendingCode ? `${countdown}s` : '获取验证码' }}
                  </el-button>
              </el-form-item>
          </el-form>
        <div class="form-buttons">
          <el-button @click="showBindEmailDialog = false">取 消</el-button>
          <el-button type="primary" @click="confirmBindEmail">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 更换邮箱模态窗口 -->
      <el-dialog v-model="isChangeEmailModalVisible" title="更换绑定邮箱" @close="hideChangeEmailModal" custom-class="square-modal" width="25%" align-center>
          <el-form :model="bindEmailForm" :rules="emailRules" ref="emailFormRef" label-width="100px">
              <el-form-item label="新邮箱" prop="newEmail">
                  <el-input v-model="bindEmailForm.newEmail" placeholder="请输入新邮箱地址" style="width: 95%;"></el-input>
              </el-form-item>
              <el-form-item label="验证码" prop="verificationCode">
                  <el-row :gutter="10">
                      <el-col :span="16">
                          <el-input v-model="bindEmailForm.verificationCode" placeholder="请输入验证码" style="width: 95%;"></el-input>
                      </el-col>
                      <el-col :span="8">
                          <el-button @click="sendVerificationCodeForChangeEmail" class="verify-button" style="margin-left: -18px;">发送验证码</el-button>
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

      <!-- 修改密码对话框 -->
      <el-dialog title="修改密码" v-model="showChangePasswordDialog" width="25%" align-center>
          <el-form :model="changePasswordForm" label-width="100px">
              <el-form-item label="旧密码">
                  <el-input v-model="changePasswordForm.password" type="password" placeholder="请输入旧密码" style="width: 95%;"></el-input>
              </el-form-item>
              <el-form-item label="新密码">
                  <el-input v-model="changePasswordForm.newPassword" type="password" placeholder="请输入新密码" style="width: 95%;"></el-input>
              </el-form-item>
          </el-form>
          <div class="form-buttons">
              <el-button @click="closeChangePasswordDialog" class="action-button">取 消</el-button>
              <el-button type="primary" @click="submitChangePassword" class="action-button">确 定</el-button>
          </div>
      </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import {ElButton, ElMessage, ElDialog, ElForm, ElFormItem, ElInput, ElIcon} from 'element-plus';
import axios from 'axios';
import { useStore } from 'vuex';
import {Edit} from "@element-plus/icons-vue";
import {useRouter} from "vue-router"; // 使用 Vuex 进行状态管理

// 定义变量
const adminName = ref('');
const schoolName = ref('');
const name = ref('')
let email = ref(null);
const authorizationCode = ref(''); // 存储授权码
const createDate = ref('')
const schoolAdminId = ref(null);
const errorMessage = ref('');
const showBindEmailDialog = ref(false); // 控制绑定邮箱对话框的显示
const bindEmailForm = ref({
  email: '',
  verificationCode: ''
});

const correctCode = ref('');

const isSendingCode = ref(false);
const countdown = ref(0);
const editNickname = ref('');
const editName = ref('');
const editPassword = ref('');


const isChangeEmailModalVisible = ref(false);
const successMessage = ref('');

const emailFormRef = ref(null);

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
      name.value = response.data.data.name;
      email.value = response.data.data.email;
      authorizationCode.value = response.data.data.authorizationCode || ''; // 获取授权码
      createDate.value = response.data.data.createDate || '';
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

// 定义变量
const showChangePasswordDialog = ref(false);
const changePasswordForm = ref({
  password: '',
  newPassword: ''
});

const closeChangePasswordDialog = () => {
  showChangePasswordDialog.value = false;
  changePasswordForm.value = {
    password: '',
    newPassword: ''
  };
};

// 生成或更新授权码
const generateOrUpdateCode = async () => {
  if (!schoolAdminId.value) {
    ElMessage({ message: '管理员信息缺失', type: 'error' });
    return;
  }

  try {
    let response;
    response = await axios.get(`/api/school-admin/${schoolAdminId.value}/generate-authorization-code`);

    if (response.status === 200) {
      authorizationCode.value = response.data.code; // 更新授权码
      createDate.value = response.data.createDate;
      ElMessage({ message: response.data.message, type: 'success' });
    } else {
      ElMessage({ message: '授权码操作失败', type: 'error' });
    }
  } catch (error) {
    ElMessage({ message: '授权码操作失败', type: 'error' });
  }
};
// 修改密码
const submitChangePassword = async () => {
  if (!changePasswordForm.value.password || !changePasswordForm.value.newPassword) {
    ElMessage({ message: '请填写完整信息', type: 'error' });
    return;
  }

  try {
    const response = await axios.post(`/api/school-admin/${schoolAdminId.value}/change-password`, {
      password: changePasswordForm.value.password,
      newPassword: changePasswordForm.value.newPassword
    });

    if (response.status === 200) {
      ElMessage({ message: '密码修改成功', type: 'success' });
      showChangePasswordDialog.value = false; // 关闭对话框
      changePasswordForm.value.password = '';
      changePasswordForm.value.newPassword = '';
    } else {
      console.error(response.data.message);
      ElMessage({ message: '密码修改失败,' + response.data.message, type: 'error' });
    }

  } catch (error) {
    ElMessage({ message: '密码修改失败, '+ error.response.data.message, type: 'error' });
    changePasswordForm.value.password = '';
    changePasswordForm.value.newPassword = '';
  }
};

const sendVerificationCode = async () => {
  if (isSendingCode.value) return;

  try {
    isSendingCode.value = true;
    countdown.value = 60; // 设置倒计时时间
    const interval = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--;
      } else {
        isSendingCode.value = false;
        clearInterval(interval);
      }
    }, 1000);

    const response = await axios.post(`/api/school-admin/${schoolAdminId.value}/send-verification-code`, {
      email: bindEmailForm.value.email
    });

    if (response.status === 200) {
      const verificationCode = response.data.verificationCode;
      correctCode.value = verificationCode; // 存储验证码
      ElMessage({ message: '验证码已发送，请查收邮件', type: 'success' });
    } else {
      ElMessage({ message: '发送验证码失败', type: 'error' });
    }
  } catch (error) {
    ElMessage({ message: '发送验证码失败', type: 'error' });
  }
};

const confirmBindEmail = async () => {
  if (!bindEmailForm.value.email || !bindEmailForm.value.verificationCode) {
    ElMessage({ message: '请填写完整信息', type: 'error' });
    return;
  }

  if (correctCode.value !== bindEmailForm.value.verificationCode) {
    ElMessage({ message: '验证码错误', type: 'error' });
    return;
  }

  try {
    const response = await axios.post(`/api/school-admin/${schoolAdminId.value}/bind-email`, {
      email: bindEmailForm.value.email,
    });

    if (response.status === 200) {
      email.value = bindEmailForm.value.email; // 更新邮箱

      ElMessage({ message: '绑定邮箱成功', type: 'success' });
      showBindEmailDialog.value = false; // 关闭对话框
    } else {
      ElMessage({ message: '绑定邮箱失败', type: 'error' });
    }
  } catch (error) {
    ElMessage({ message: '绑定邮箱失败', type: 'error' });
  }
};

// 更新用户名
const updateUsername = async () => {
  try {
    const url = `/api/school-admin/${schoolAdminId.value}/update-username`;

    // 发送 POST 请求
    const response = await axios.post(url, {
      username: adminName.value
    });

    // 处理响应
    if (response.status === 200) {
      ElMessage({ message: '用户名更新成功', type: 'success' });
    } else {
      ElMessage({ message: '用户名更新失败', type: 'error' });
    }
  } catch (error) {
    // 处理错误
    ElMessage({ message: '请求失败' + error.message, type: 'error' });
  }
};

// 更新负责人
const updateName = async () => {
  try {
    const url = `/api/school-admin/${schoolAdminId.value}/update-name`;

    // 发送 POST 请求
    const response = await axios.put(url, {
      name: name.value
    });

    // 处理响应
    if (response.status === 200) {
      ElMessage({ message: '负责人更新成功', type: 'success' });
    } else {
      ElMessage({ message: '负责人更新失败', type: 'error' });
    }
  } catch (error) {
    // 处理错误
    ElMessage({ message: '请求失败' + error.message, type: 'error' });
  }
};

// 切换编辑状态
const toggleEdit = (field) => {
  if (field === 'adminName') {
    editNickname.value = !editNickname.value;
  } else if (field === 'name') {
    editName.value = !editName.value;
  }
};



const showChangeEmailModal = () => {
    isChangeEmailModalVisible.value = true;
};

const hideChangeEmailModal = () => {
    isChangeEmailModalVisible.value = false;
    bindEmailForm.value.newEmail = '';
    bindEmailForm.value.verificationCode = '';
    errorMessage.value = '';
    successMessage.value = '';
};
const sendVerificationCodeForChangeEmail = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bindEmailForm.value.newEmail)) {
        ElMessage({ message: '请输入有效的邮箱地址', type: 'error' });
        return;
    }
console.log(bindEmailForm.value.newEmail)
    try {
        const response = await axios.get(`/api/school-admin/send-email-code`, {
            params: {
                email: bindEmailForm.value.newEmail
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            successMessage.value = '验证码已发送，请查收您的邮箱';
            ElMessage({ message: '验证码已发送，请查收邮件', type: 'success' });
        } else {
            errorMessage.value = '验证码发送失败';
        }
    } catch (error) {
        errorMessage.value = '验证码发送失败，请稍后再试';
        console.error('验证码发送失败:', error.response ? error.response.data : error.message);
    }
};
const handleChangeEmail = async () => {
    const formRef = emailFormRef.value; // 使用 emailFormRef 来访问 form 实例
    formRef.validate(async (valid) => { // 使用正确的 refs 调用 validate
        if (valid) {
            try {
                const response = await axios.get(`/api/school-admin/change-email`, {
                    params: {
                        newEmail: bindEmailForm.value.newEmail
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    successMessage.value = '邮箱更换成功';
                    email.value = bindEmailForm.value.newEmail;
                    hideChangeEmailModal();
                    ElMessage({ message: '邮箱已成功更换', type: 'success' });
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
  background-color: #f0f0f0;
}

.main-container {
  display: flex;
  flex: 1;
  background-color: #f0f0f0;
  margin-bottom: 50px;
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
.content {
  max-width: 1000px;
  width: 100%;
  padding: 20px;
  background-color: #fff;
  overflow-y: auto;
  margin-right: 50px;
    margin-left: 300px;
}
.edit-input {
  width: 200px; /* 限制输入框的宽度，避免太长 */
}

.info-item label {
    font-weight: bold;
    width: 100px;
}
.text-danger {
  color: red;
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

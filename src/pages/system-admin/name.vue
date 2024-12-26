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
            <label>用户名：</label>
            <span v-if="!editNickname">{{ SystemAdminInfo.username }}</span>
            <el-input
                v-else
                v-model="SystemAdminInfo.username"
                size="small"
                class="edit-input"
                @blur="updateUsername('nickname')"/>
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
          <div class="form-buttons">
            <el-button type="primary" @click="beginRegister" class="action-button">注册新的系统管理员</el-button>
          </div>
        </el-card>


      </div>

      <el-dialog v-model="isChangeEmailModalVisible" title="更换绑定邮箱" @close="hideChangeEmailModal" custom-class="square-modal" width="400px" align-center>
        <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef" label-width="100px">
          <el-form-item label="新邮箱" prop="newEmail">
            <el-input v-model="emailForm.newEmail" placeholder="请输入新邮箱地址" style="width: 95%;"></el-input>
          </el-form-item>
          <el-form-item label="验证码" prop="verificationCode">
            <el-row :gutter="10">
              <el-col :span="10">
                <el-input v-model="emailForm.verificationCode" placeholder="请输入验证码" style="width: 100%;"></el-input>
              </el-col>
              <el-col :span="8">
                <el-button @click="sendVerificationCode"  class="verify-button" style="margin-left: 10px;">{{ codeButtonText }}</el-button>
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

      <!-- 注册浮窗 -->
      <el-dialog
          v-model="registerDialogVisible"
          title="注册"
          width="400px"
          align-center
          :close-on-click-modal="false"
          @close="closeRegisterDialog">

          <el-form :model="registerForm" :rules="rules" ref="registerFormRef"
                   label-width="80px">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="registerForm.email" placeholder="邮箱"
                        size="large"></el-input>
            </el-form-item>
            <div style="display: flex">
              <el-form-item label="验证码" style="width: auto;" prop="code">
                <el-input v-model="registerForm.code" placeholder="验证码" size="large"
                          ></el-input>
              </el-form-item>
              <el-button :disabled="countdown.value > 0" style="margin-left: 10px; height: 40px; " @click="sendCodeForRegister()">
                {{ codeButtonText }}
              </el-button>
            </div>
            <el-form-item  label="用户名" prop="username">
              <el-input v-model="registerForm.username" placeholder="用户名"
                        size="large"></el-input>
            </el-form-item>
            <el-form-item  label="密码" prop="password">
              <el-input type="password" v-model="registerForm.password" placeholder="密码"
                        size="large"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="checkPass">
              <el-input type="password" v-model="registerForm.checkPass"
                        placeholder="再次输入密码" size="large"></el-input>
            </el-form-item>
            <div class="sign-up-btn">
              <el-button size="large" type="primary"
                         @click="submitRegister()">确认注册
              </el-button>
            </div>
          </el-form>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import {ref, reactive, onMounted, computed, watch} from 'vue';
import {ElIcon, ElCard, ElInput, ElMessage, ElDialog, ElForm, ElFormItem, ElNotification} from 'element-plus';
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
const registerDialogVisible = ref(false);

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ],
  checkPass: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
};


const registerForm = ref({
  email: '',
  password: '',
  checkPass: '',
  username: '',
  code: '',
});

const registerFormRef = ref(null);


function validatePassword(rule, value, callback){
  if (value !== registerForm.value.password) {
    callback(new Error('新密码和确认密码不一致'));
  } else {
    callback();
  }
}

const sendCodeForRegister = async () => {
  if (isCountingDown.value) {
    return;
  }
  try {
    startCountdown();
    const response = await axios.get(`/api/system-admin/send-email-code`, {
      params: {
        email: registerForm.value.email
      }
    });

    if (response.status !== 200){
      ElMessage.error('验证码发送失败' + response.data.message);
      resetCountdown();
    }
  } catch (error) {
    ElNotification.error({title: '验证码发送失败' , message: '邮箱已注册'});
    resetCountdown();
  }
};

const submitRegister = async () => {
  try {
    const formRef = registerFormRef.value; // 确保有引用
    await registerFormRef.value.validate();

    // 发送注册请求
    const response = await axios.post('/api/system-admin/create', {
      email: registerForm.value.email,
      username: registerForm.value.username,
      password: registerForm.value.password,
      code: registerForm.value.code,
    });

    if (response.status === 200) {
      ElMessage.success('注册成功');
      registerDialogVisible.value = false;
      // 重置表单
      resetRegisterForm();
    } else {
      ElMessage.error(response.data.message || '注册失败');
    }
  } catch (error) {
    ElNotification.error(error.response?.data?.message || '注册失败，请稍后再试');
    console.error('注册失败:', error);
  }
};

const closeRegisterDialog = () => {
  registerDialogVisible.value = false;
  resetRegisterForm();
};

// 重置注册表单的方法
const resetRegisterForm = () => {
  registerForm.value = {
    email: '',
    password: '',
    checkPass: '',
    username: '',
    code: '',
  };
  errorMessage.value = '';
  successMessage.value = '';
};

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
        ElNotification.success({ title: '密码更改成功', message: '密码更改成功' });
      hideChangePasswordModal();
    } else {
        ElNotification.error({ title: '密码更改失败', message: response.data.message });
    }
  } catch (error) {
      ElNotification.error({ title: '密码更改失败', message: error.response.data.message });
  }
};

const countdown = ref(60)
const codeButtonText = ref('获取验证码')
let timer; // 用于存储定时器ID
let isCountingDown = ref(false); // 标记是否正在倒计时
function startCountdown() {
    console.log('Starting countdown...');
    clearInterval(timer); // 清除任何现有的定时器
    isCountingDown.value = true;
    if (codeButtonText.value === '重新获取验证码') {
        countdown.value = 60
    }
    timer = setInterval(() => {
        if (countdown.value > 0) {
            countdown.value--;
        } else {
            clearInterval(timer);
            isCountingDown.value = false;
            console.log('Countdown finished.');
        }
    }, 1000);
}
function resetCountdown() {
    clearInterval(timer);
    countdown.value = 60;
    codeButtonText.value = '获取验证码';
    isCountingDown.value = false;
}

// 使用 watch 监听 countdown 的变化并更新按钮文本
watch(countdown, (newVal) => {
    if (newVal > 0 && newVal < 60) {
        codeButtonText.value = `${newVal}s 后重新获取`;
    } else {
        resetCountdown();
    }
});
// 获取信息
const getSystemAdminInfo = async () => {
  try {
    const response = await axios.get(`/api/system-admin/${systemAdminId.value}`);
    if (response.status === 200) {
      SystemAdminInfo.value = response.data.data;
      originNickname.value= SystemAdminInfo.value.username;
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

const originNickname = ref('');

// 切换编辑状态
function toggleEdit(field) {
  if (field === 'nickname') {
    editNickname.value = !editNickname.value;
    originNickname.value = SystemAdminInfo.value.username;
  }
}

const updateUsername = async (field) => {


    if (!String(SystemAdminInfo.value.username).trim()) {
        ElMessage.error('用户名不能为空');
        // 恢复原始昵称
        SystemAdminInfo.value.username = originNickname.value;
        return; // 阻止后续操作
    }
    if (/\s/.test(SystemAdminInfo.value.username)) { // 新增空格检查
        ElMessage.error('用户名不能包含空格');
        // 恢复原始昵称
        SystemAdminInfo.value.username = originNickname.value;
        return; // 阻止后续操作
    }
    if (String(SystemAdminInfo.value.username).includes('@')) {
        ElMessage.error('用户名不能包含 "@" 符号');
        // 恢复原始昵称
        SystemAdminInfo.value.username = originNickname.value;
        return; // 阻止后续操作
    }
    if(SystemAdminInfo.value.username === originNickname.value)
    {
        toggleEdit(field); // 验证通过后切换编辑状态
        return;
    }
  try {
    const url = `/api/system-admin/${systemAdminId.value}/update-username`;

    // 发送 POST 请求
    const response = await axios.post(url, {
      username: SystemAdminInfo.value.username
    });

    // 处理响应
    if (response.status === 200) {
      ElMessage.success('用户名修改成功');
        toggleEdit(field); // 验证通过后切换编辑状态
        originNickname.value = SystemAdminInfo.value.username; // 更新原始昵称
    } else {
      ElMessage.error(response.data.message);
    }
  } catch (error) {
    // 处理错误
     SystemAdminInfo.value.username = originNickname.value;
    console.error('请求失败' + error.message);
      toggleEdit(field); // 验证通过后切换编辑状态
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
const beginRegister = () => {
    registerDialogVisible.value = true;
}

const hideChangeEmailModal = () => {
    isChangeEmailModalVisible.value = false;
    emailForm.value.newEmail = '';
    emailForm.value.verificationCode = '';
    errorMessage.value = '';
    successMessage.value = '';
};

// 发送验证码
const sendVerificationCode = async () => {
    // 如果当前正在倒计时，则不允许再次发送验证码
    if (countdown.value !== 60) return;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(emailForm.value.newEmail)) {
      errorMessage.value = '请输入正确的邮箱格式';
      return;
    }
    startCountdown();
    try {
        const response = await axios.get(`/api/system-admin/send-email-code`, {
            params: {
                email: emailForm.value.newEmail
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status !== 200) {
            ElNotification.error({title: '发送失败', message: response.data.message});
            resetCountdown(); // 发送失败时重置倒计时
        }
    } catch (error) {
        ElNotification.error({title: '发送失败', message: '邮箱已注册'});
        resetCountdown(); // 发送失败时重置倒计时
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
                        newEmail: emailForm.value.newEmail,
                        code : emailForm.value.verificationCode
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
  background-color: #f0f0f0; /* 背景改为浅灰色 */
  margin-bottom: 30px;
}

.sign-up-btn {
  text-align: center; /* 使按钮居中 */
  margin-top: 1em; /* 添加一些顶部间距 */
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
    padding: 30px;
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease-in-out;
}

.info-card:hover {
    transform: scale(1.01);
}

.info-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
}

.info-item label {
    font-weight: bold;
    width: 100px;
    color: #555;
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
.verify-button {
    background-color: #fff;
    border: 1px solid #dcdfe6;
    color: #606266;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: border-color 0.3s, color 0.3s, transform 0.2s;
}

.verify-button:hover {
    border-color: #c6e2ff;
    color: #409eff;
    transform: scale(1.05);
}

.verify-button:active {
    transform: scale(0.95);
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
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
                @blur="updateUsername('adminName')"/>
            <el-icon @click="toggleEdit('adminName')" class="edit-icon">
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
                @blur="updateName('name')"/>
            <el-icon @click="toggleEdit('name')" class="edit-icon">
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
          <el-icon @click="showChangePasswordDialog = true" class="edit-icon">
            <Edit/>
          </el-icon>
        </div>

          <div class="info-item">
            <label>绑定邮箱：</label>
            <span :class="{'text-danger': !email}">{{ email ? email : '还未绑定' }}</span>
            <el-button text bg v-if="!email" type="primary" @click="showBindEmailDialog = true">绑定邮箱</el-button>
              <el-icon v-if="email" @click="showChangeEmailModal" class="edit-icon">
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
      <el-dialog title="绑定邮箱" v-model="showBindEmailDialog" width="450px" align-center>
          <el-form :model="bindEmailForm" label-width="100px">
              <el-form-item label="邮箱地址">
                  <el-input v-model="bindEmailForm.email" placeholder="请输入邮箱地址" style="width: 95%;"></el-input>
              </el-form-item>
              <el-form-item label="验证码">
                  <el-input v-model="bindEmailForm.verificationCode" placeholder="请输入验证码" style="width: 60%;"></el-input>
                  <el-button type="primary" @click="sendVerificationCode" :disabled="isCountingDown" style="margin-left: 10px;">
                      {{ isCountingDown ? `${countdown}s` : '获取验证码' }}
                  </el-button>
              </el-form-item>
          </el-form>
        <div class="form-buttons">
          <el-button @click="showBindEmailDialog = false">取 消</el-button>
          <el-button type="primary" @click="confirmBindEmail">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 更换邮箱模态窗口 -->
      <el-dialog v-model="isChangeEmailModalVisible" title="更换绑定邮箱" @close="hideChangeEmailModal" custom-class="square-modal" width="450px" align-center>
          <el-form :model="bindEmailForm" :rules="emailRules" ref="emailFormRef" label-width="100px">
              <el-form-item label="新邮箱" prop="newEmail">
                  <el-input v-model="bindEmailForm.email" placeholder="请输入新邮箱地址" style="width: 300px;"></el-input>
              </el-form-item>
              <el-form-item label="验证码" prop="verificationCode">
                  <el-row :gutter="10">
                      <el-col :span="10">
                          <el-input v-model="bindEmailForm.verificationCode" placeholder="请输入验证码" style="width: 180px;"></el-input>
                      </el-col>
                      <el-col :span="8">
                          <el-button @click="sendVerificationCodeForChangeEmail" class="verify-button" style="margin-left: 60px;">{{ codeButtonText }}</el-button>
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
import {computed, onMounted, ref, watch} from 'vue';
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import {ElButton, ElDialog, ElForm, ElFormItem, ElIcon, ElInput, ElMessage, ElNotification} from 'element-plus';
import axios from 'axios';
import {useStore} from 'vuex';
import {Edit} from "@element-plus/icons-vue";

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
const editNickname = ref('');
const editName = ref('');
const editPassword = ref('');


const isChangeEmailModalVisible = ref(false);
const successMessage = ref('');

const emailFormRef = ref(null);

const emailRules = ref({
    email: [
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
        originNickname.value = adminName.value;
        originName.value = name.value;
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
        ElNotification.success({ title: '密码更改成功', message: '密码更改成功' });
      showChangePasswordDialog.value = false; // 关闭对话框
      changePasswordForm.value.password = '';
      changePasswordForm.value.newPassword = '';
    } else {
      console.error(response.data.message);
        ElNotification.error({ title: '密码更改失败', message: '密码更改失败，请重试' });
    }

  } catch (error) {
      ElNotification.error({ title: '密码更改失败', message: '密码更改失败，请重试' });
    changePasswordForm.value.password = '';
    changePasswordForm.value.newPassword = '';
  }
};

const countdown = ref(60)
const codeButtonText = ref('获取验证码')
let timer; // 用于存储定时器ID
let isCountingDown = ref(false); // 标记是否正在倒计时
function startCountdown() {

    clearInterval(timer); // 清除任何现有的定时器
    isCountingDown.value = true;
    countdown.value = 60
    timer = setInterval(() => {

        if (countdown.value > 0) {
            countdown.value--;
        } else {
            clearInterval(timer);
            isCountingDown.value = false;
            codeButtonText.value = '获取验证码';
        }
    }, 1000);
}
function resetCountdown() {
    clearInterval(timer);
    countdown.value = 60;
    isCountingDown.value = false;
}

// 使用 watch 监听 countdown 的变化并更新按钮文本
watch(countdown, (newVal) => {
    if (newVal > 0 && newVal < 60) {
        codeButtonText.value = `${newVal}s 后重新获取`;
    } else {
        codeButtonText.value = '获取验证码';
    }
});
const sendVerificationCode = async () => {
  if (isCountingDown.value) return;

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(bindEmailForm.value.email)) {
    errorMessage.value = '请输入正确的邮箱格式';
    return;
  }

  startCountdown();
  try {
    const response = await axios.get(`/api/school-admin/send-email-code`, {
      params: {
        email: bindEmailForm.value.email
      },
    });

    if (response.status !== 200) {
      ElNotification.error({ title: '发送验证码失败', message: response.data.message });
        resetCountdown(); // 发送失败时重置倒计时
    }
  } catch (error) {
    ElNotification.error({ title: '发送验证码失败', message: error.response.data.message });
    resetCountdown(); // 发送失败时重置倒计时
  }
};

const confirmBindEmail = async () => {
  if (!bindEmailForm.value.email || !bindEmailForm.value.verificationCode) {
    ElMessage({ message: '请填写完整信息', type: 'error' });
    return;
  }

  try {
    const response = await axios.get(`/api/school-admin/${schoolAdminId.value}/bind-email`, {
      params: {
        newEmail: bindEmailForm.value.email,
        code: bindEmailForm.value.verificationCode
      }
    });

    if (response.status === 200) {
      email.value = bindEmailForm.value.email; // 更新邮箱
      ElNotification.success({ message: '绑定邮箱成功' });
      showBindEmailDialog.value = false; // 关闭对话框
    } else {
      ElNotification.error({ title: '绑定邮箱失败', message: response.data.message });
    }
  } catch (error) {
    ElNotification.error({ title: '绑定邮箱失败', message: error.response.data.message });
  }
};

// 更新用户名
const updateUsername = async (field) => {
    if (!String(adminName.value).trim()) {
        ElMessage.error('用户名不能为空');
        // 恢复原始昵称
        adminName.value = originNickname.value;
        return; // 阻止后续操作
    }
    if (/\s/.test(adminName.value)) { // 新增空格检查
        ElMessage.error('用户名不能包含空格');
        // 恢复原始昵称
        adminName.value = originNickname.value;
        return; // 阻止后续操作
    }
    if (String(adminName.value).includes('@')) {
        ElMessage.error('用户名不能包含 "@" 符号');
        // 恢复原始昵称
        adminName.value = originNickname.value;
        return; // 阻止后续操作
    }
    if(adminName.value === originNickname.value)
    {
        toggleEdit(field); // 验证通过后切换编辑状态
        return;
    }


  try {
    const url = `/api/school-admin/${schoolAdminId.value}/update-username`;

    // 发送 POST 请求
    const response = await axios.put(url, {
      username: adminName.value
    });

    // 处理响应
    if (response.status === 200) {
      ElMessage({ message: '用户名更新成功', type: 'success' });
        originNickname.value = adminName.value;
        toggleEdit(field);
    } else {
      ElMessage({ message: '用户名更新失败', type: 'error' });
    }
  } catch (error) {
    // 处理错误
    ElMessage({ message: '请求失败' + error.message, type: 'error' });
      toggleEdit(field);
  }
};

// 更新负责人
const updateName = async (field) => {
  const namePattern = /^[\u4e00-\u9fa5A-Za-z·]{2,20}$/;

  // 验证姓名格式
  if (!namePattern.test(name.value)) {
    ElMessage.error('姓名格式错误，请输入2到20个字符或“·”符号');
    // 恢复原始姓名
    name.value = originName.value;
    return; // 阻止后续操作
  }



  try {
    const url = `/api/school-admin/${schoolAdminId.value}/update-name`;

    // 发送 POST 请求
    const response = await axios.put(url, {
      name: name.value
    });

    // 处理响应
    if (response.status === 200) {
      ElMessage({ message: '负责人更新成功', type: 'success' });
      originName.value = name.value; // 更新原始姓名
      toggleEdit(field); // 验证通过后切换编辑状态

    } else {
      ElMessage({ message: '负责人更新失败', type: 'error' });

    }
  } catch (error) {
    // 处理错误
    ElMessage({ message: '请求失败' + error.message, type: 'error' });
    name.value = originName.value;
    toggleEdit(field); // 验证通过后切换编辑状态
  }
};
const originNickname = ref('');
const originName = ref('');
// 切换编辑状态
const toggleEdit = (field) => {
  if (field === 'adminName') {
    editNickname.value = !editNickname.value;
      originNickname.value = adminName.value;

  } else if (field === 'name') {
    editName.value = !editName.value;
    if (editName.value) {
      originName.value = name.value; // 开始编辑时保存原始姓名
    }
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
    if (isCountingDown.value) return;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(bindEmailForm.value.email)) {
        errorMessage.value = '请输入正确的邮箱格式';
        return;
    }

    try {
        startCountdown();
        const response = await axios.get(`/api/school-admin/send-email-code`, {
            params: {
                email: bindEmailForm.value.email
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });

         if(response.status !== 200) {
            ElNotification.error({title: '验证码发送失败', message: response.data.message});
            resetCountdown();
        }
    } catch (error) {
        ElNotification.error({title: '验证码发送失败', message: error.response.data.message});
        resetCountdown();
    }
};
const handleChangeEmail = async () => {
    const formRef = emailFormRef.value; // 使用 emailFormRef 来访问 form 实例
    formRef.validate(async (valid) => { // 使用正确的 refs 调用 validate
        if (valid) {
            try {
                const response = await axios.get(`/api/school-admin/change-email`, {
                    params: {
                        newEmail: bindEmailForm.value.email,
                        code: bindEmailForm.value.verificationCode
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    successMessage.value = '邮箱更换成功';
                    email.value = bindEmailForm.value.email;
                    hideChangeEmailModal();
                    ElMessage({ message: '邮箱已成功更换', type: 'success' });
                } else {
                    errorMessage.value = '邮箱更换失败';
                }
            } catch (error) {
                errorMessage.value = '邮箱更换失败，请稍后再试';
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
.edit-icon {
  color: #66b1ff;
}
.main-container {
  display: flex;
  flex: 1;
  background-color: #f0f0f0;
  margin-bottom: 50px;
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

.edit-input {
  width: 200px; /* 限制输入框的宽度，避免太长 */
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

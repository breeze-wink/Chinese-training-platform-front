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
                        <span v-if="!editNickname">{{ teacherInfo.username }}</span>
                        <el-input
                                v-else
                                v-model="teacherInfo.username"
                                size="small"
                                class="edit-input"
                                @blur="updateUsername('nickname')"/>
                        <el-icon @click="toggleEdit('nickname')">
                            <Edit/>
                        </el-icon>
                    </div>
                    <div class="info-item">
                        <label>所属学校：</label>
                        <span>{{ teacherInfo.schoolName }}</span>
                    </div>
                    <div class="info-item">
                        <label>电话号码：</label>
                        <span v-if="!editPhone">{{ teacherInfo.phoneNumber }}</span>
                        <el-input
                                v-else
                                v-model="teacherInfo.phoneNumber"
                                size="small"
                                class="edit-input"
                                @blur="toggleEdit('phone'); updatePhoneNumber()"/>
                        <el-icon @click="toggleEdit('phone')">
                            <Edit/>
                        </el-icon>
                    </div>
                    <div class="info-item">
                        <label>姓名：</label>
                        <span v-if="!editName">{{ teacherInfo.name }}</span>
                        <el-input
                                v-else
                                v-model="teacherInfo.name"
                                size="small"
                                class="edit-input"
                                @blur="updateName('name')"/>
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
                        <span>{{ teacherId }}</span>
                    </div>
                    <div class="info-item">
                        <label>密码：</label>
                        <span>******</span>
                        <el-icon @click="editPassword">
                            <Edit/>
                        </el-icon>
                    </div>
                    <div class="info-item">
                        <label>绑定邮箱：</label>
                        <span>{{ teacherInfo.email }}</span>
                        <el-icon @click="showChangeEmailModal" class="edit-icon">
                            <Edit />
                        </el-icon>
                    </div>
                </el-card>
            </div>

            <!-- 更换邮箱模态窗口 -->
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
            <el-dialog v-model="isChangePasswordModalVisible" title="修改密码" @close="resetPasswordForm" custom-class="square-modal" width="25%" align-center>
                <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
                    <el-form-item label="旧密码" prop="oldPassword">
                        <el-input type="password" v-model="passwordForm.oldPassword" autocomplete="off" style="width: 95%;"></el-input>
                    </el-form-item>
                    <el-form-item label="新密码" prop="newPassword">
                        <el-input type="password" v-model="passwordForm.newPassword" autocomplete="off" style="width: 95%;"></el-input>
                    </el-form-item>
                    <el-form-item label="确认新密码" prop="confirmNewPassword">
                        <el-input type="password" v-model="passwordForm.confirmNewPassword" autocomplete="off" style="width: 95%;"></el-input>
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
//公共组件引入
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import {computed, ref, onMounted, watch} from 'vue';
//图标引入
import {ElIcon, ElCard, ElInput, ElMessageBox, ElMessage, ElNotification} from 'element-plus';
import {Edit} from '@element-plus/icons-vue';
import {useStore} from "vuex";
import axios from "axios";
import { useRouter } from 'vue-router';

//从全局中ID信息
const store = useStore();
const teacherId = computed(() => store.state.user.id);
const originNickname = ref('');

const teacherInfo = ref({
    name: '',
    username: '',
    email: '',
    phoneNumber: '',
    schoolName: ''
});



// 控制编辑状态
const editNickname = ref(false);
const editPhone = ref(false);
const editName = ref(false);

const isChangeEmailModalVisible = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const originName = ref(''); // 定义原始姓名
const router = useRouter();

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

// 获取教师信息
const getTeacherInfo = async () => {
    try {
        const response = await axios.get(`/api/teacher/${teacherId.value}`);
        if (response.status === 200 && response.data.message === 'success') {
            // 更新教师信息

            teacherInfo.value = response.data.data;
            originNickname.value = teacherInfo.value.username;
            originName.value = teacherInfo.value.name;
        } else {
            errorMessage.value = '获取教师信息失败：' + response.data.message;
            console.error(errorMessage.value);
        }
    } catch (error) {
        errorMessage.value = '获取教师信息时发生错误：' + error.message;
        console.error(errorMessage.value);
    }
};

// 在组件挂载时获取教师信息
onMounted(() => {
    getTeacherInfo();
});


// 切换编辑状态
function toggleEdit(field) {
    if (field === 'nickname') {
        editNickname.value = !editNickname.value;
        originNickname.value = teacherInfo.value.username;
    } else if (field === 'phone') {
        editPhone.value = !editPhone.value;

    } else if (field === 'name') {
        editName.value = !editName.value;
      if (editName.value) {
        originName.value = teacherInfo.value.name; // 开始编辑时保存原始姓名
      }
    }
}


const updateUsername = async (field) => {


    if (!String(teacherInfo.value.username).trim()) {
        ElMessage.error('用户名不能为空');
        // 恢复原始昵称
        teacherInfo.value.username = originNickname.value;
        return; // 阻止后续操作
    }
    if (/\s/.test(teacherInfo.value.username)) { // 新增空格检查
        ElMessage.error('用户名不能包含空格');
        // 恢复原始昵称
        teacherInfo.value.username = originNickname.value;
        return; // 阻止后续操作
    }
    if (String(teacherInfo.value.username).includes('@')) {
        ElMessage.error('用户名不能包含 "@" 符号');
        // 恢复原始昵称
        teacherInfo.value.username = originNickname.value;
        return; // 阻止后续操作
    }
    if(teacherInfo.value.username === originNickname.value)
    {
        toggleEdit(field); // 验证通过后切换编辑状态
        return;
    }

    try {
        const url = `/api/teacher/${teacherId.value}/update-username`;

        // 发送 POST 请求
        const response = await axios.post(url, {
            username: teacherInfo.value.username
        });

        // 处理响应
        if (response.status === 200) {

            ElMessage.success('用户名修改成功');
            toggleEdit(field); // 验证通过后切换编辑状态
            originNickname.value = teacherInfo.value.username; // 更新原始昵称
        } else {
            console.error(response.data.message);
            ElMessage.error(response.data.message);

        }
    } catch (error) {
        // 处理错误
        teacherInfo.value.username = originNickname.value;
        console.error('请求失败' + error.message);
        toggleEdit(field); // 验证通过后切换编辑状态
    }
};
const updatePhoneNumber = async () => {
    try {
        //发送 POST 请求
        const url = `/api/teacher/${teacherId.value}/update-phoneNumber`;

        const response = await axios.post(url, {
            phoneNumber: teacherInfo.value.phoneNumber

        });

        if (response.status === 200 ) {
          ElMessage.success('手机号修改成功');
        } else {
          ElMessage.error('手机号修改失败');
        }
    } catch (error) {
        console.error('请求失败' + error.message);
    }

}

const updateName = async (field) =>{

  const namePattern = /^[\u4e00-\u9fa5A-Za-z·]{2,20}$/;

  // 验证姓名格式
  if (!namePattern.test(teacherInfo.value.name)) {
    ElMessage.error('姓名格式错误，请输入2到20个中文字符或“·”符号');
    // 恢复原始姓名
    teacherInfo.value.name = originName.value;
    return; // 阻止后续操作
  }
    try {
        //发送 POST 请求
        const url = `/api/teacher/${teacherId.value}/update-name`;

        const response = await axios.put(url, {
            name: teacherInfo.value.name
        });

        if (response.status === 200 && response.data.message === '姓名修改成功') {

           ElMessage.success('姓名修改成功');
          originName.value = teacherInfo.value.name; // 更新原始姓名
          toggleEdit(field); // 验证通过后切换编辑状态

        } else {
            ElMessage.error('姓名修改失败');

        }
    } catch (error) {
        console.error('请求失败' + error.message);
      teacherInfo.value.name = originName.value;
      toggleEdit(field); // 验证通过后切换编辑状态
    }
}


const isChangePasswordModalVisible = ref(false);
const passwordErrorMessage = ref('');
const passwordSuccessMessage = ref('');
const passwordFormRef = ref(null);
const passwordForm = ref({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
});
const validateConfirmPassword = (rule, value, callback) => {
    if (value !== passwordForm.value.newPassword) {
        callback(new Error('两次输入的新密码不一致'));
    } else {
        callback();
    }
};
const passwordRules = ref({
    oldPassword: [
        { required: true, message: '请输入旧密码', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '新密码至少6位', trigger: 'blur' }
    ],
    confirmNewPassword: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        { validator: validateConfirmPassword, trigger: 'blur' }
    ]
});
const resetPasswordForm = () => {
    console.log('resetPasswordForm called');
    // 清空表单
    Object.assign(passwordForm.value, {
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    // 清理错误和成功消息
    passwordErrorMessage.value = '';
    passwordSuccessMessage.value = '';
    // 重置表单验证状态
    passwordFormRef.value?.resetFields();
};
// 编辑密码的逻辑（可以弹出对话框等）
const editPassword = () => {
    console.log('showChangePasswordModal called');
    isChangePasswordModalVisible.value = true;
};

const hideChangePasswordModal = () => {
    console.log('hideChangePasswordModal called');
    isChangePasswordModalVisible.value = false;
};
const handlePasswordChange = async () => {
    const form = passwordFormRef.value;
    if (!form) return;

    await form.validate(async (valid) => {
        if (valid) {
            try {
                const response = await axios.post(
                    `/api/teacher/${teacherId.value}/change-password`,
                    {
                        password: passwordForm.value.oldPassword,
                        newPassword: passwordForm.value.newPassword,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.status === 200) {
                    passwordSuccessMessage.value = '密码更改成功';
                    hideChangePasswordModal();
                    ElNotification.success({ title: '密码更改成功', message: '密码更改成功' });
                } else {
                    passwordErrorMessage.value = '密码更改失败，请稍后再试';
                    ElNotification.error({ title: '密码更改失败', message: '密码更改失败，请重试' });
                }
            } catch (error) {
                let errorMessage = '密码更改失败，请稍后再试';
                ElNotification.error({ title: '密码更改失败', message: '密码更改失败，请重试' });
                passwordErrorMessage.value = errorMessage;
            }
        } else {
            console.log('表单验证失败');
            return false;
        }
    });
};



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

const countdown = ref(60)
const codeButtonText = ref('获取验证码')
let timer; // 用于存储定时器ID
let isCountingDown = ref(false); // 标记是否正在倒计时
function startCountdown() {

  clearInterval(timer); // 清除任何现有的定时器
  isCountingDown.value = true;
  countdown.value = 60;
  timer = setInterval(() => {

    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timer);
      isCountingDown.value = false;
    }
  }, 1000);
}
function resetCountdown() {
    clearInterval(timer);
    countdown.value = 60;
    isCountingDown.value = false;
    codeButtonText.value = '获取验证码';
}

watch(countdown, (newVal) => {
  if (newVal > 0 && newVal < 60) {
    codeButtonText.value = `${newVal}s 后重新获取`;
  } else {
    resetCountdown();
  }
});

// 发送验证码
const sendVerificationCode = async () => {
  // 如果当前正在倒计时，则不允许再次发送验证码
  if (isCountingDown.value) return;

  // 手动验证邮箱格式
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(emailForm.value.newEmail)) {
    errorMessage.value = '请输入正确的邮箱格式';
    return;
  }
  startCountdown();
  try {
    const response = await axios.get(`/api/teacher/send-email-code`, {
      params: {
        email: emailForm.value.newEmail
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.status !== 200){
      ElNotification.error({title: '验证码发送失败', message: response.data.message});
      resetCountdown(); // 发送失败时重置倒计时
    }
  } catch (error){
    ElNotification.error({title: '验证码发送失败', message: error.response.data.message});
    resetCountdown(); // 发送失败时重置倒计时
  }

};

// 处理邮箱更换
const handleChangeEmail = async () => {
  const response = await axios.get(`/api/teacher/change-email`, {
    params: {
      newEmail: emailForm.value.newEmail,
      code: emailForm.value.verificationCode
    },
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 200) {
    ElNotification.success('邮箱更换成功');
    teacherInfo.value.email = emailForm.value.newEmail;
    hideChangeEmailModal();
  } else {
    ElMessage.error('邮箱更换失败' + response.data.message);
  }

}

// 请求注销账号

const navigateToHome = () => {
    router.push({ name: 'Home' }); // 使用 router.push 来跳转到首页
};
</script>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f0f0f0; /* 背景改为浅灰色 */
}

.form-buttons {
  text-align: center;
  margin-top: 20px;
}

.main-container {
    display: flex;
    flex: 1;
    background-color: #f0f0f0; /* 背景改为浅灰色 */

}

.content {
    max-width: 1000px; /* 最大宽度为 1000px */
    width: 100%; /* 宽度在正常情况下可以随着窗口大小缩放 */
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin-right: 50px; /* 如果需要右侧留空隙，可以保留这行，或者可以根据实际情况调整 */
    margin-bottom: 30px;

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
    justify-content: center; /* 水平居中 */
    gap: 10px; /* 按钮之间留一些间距 */
    padding: 10px 0; /* 上下留空隙，使布局看起来更好 */
}

.form-item-spacing {
    margin-bottom: 30px; /* 表单项之间的上下间距 */
}

.form-container {
    align-items: center; /* 水平方向居中 */
    margin-top: 20px; /* 给表单添加上方的间距，使标题与表单之间有间距 */
}

.input-limited {
    width: 300px; /* 限定输入框的宽度 */
    max-width: 100%; /* 防止超出父容器 */
}

.delete-button {
    background-color: #f56c6c;
    border: none;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
}

.delete-button:hover {
    background-color: #ff7875;
    transform: scale(1.05);
}

.delete-button:active {
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
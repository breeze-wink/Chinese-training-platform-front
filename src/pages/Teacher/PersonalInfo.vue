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
                        <span v-if="!editNickname">{{ teacherInfo.username }}</span>
                        <el-input
                                v-else
                                v-model="teacherInfo.username"
                                size="small"
                                class="edit-input"
                                @blur="toggleEdit('nickname'); updateUsername()"/>
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
                        <label>实名：</label>
                        <span v-if="!editName">{{ teacherInfo.name }}</span>
                        <el-input
                                v-else
                                v-model="teacherInfo.name"
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
                    <div class="info-item">
                        <label>账号注销：</label>
                        <el-button type="danger" @click="requestAccountDeactivation" class="delete-button">申请注销账号</el-button>
                        <!-- 显示错误和成功消息 -->
                        <p v-if="accountDeactivationErrorMessage" class="error-message">{{ accountDeactivationErrorMessage }}</p>
                        <p v-if="accountDeactivationSuccessMessage" class="success-message">{{ accountDeactivationSuccessMessage }}</p>
                        <p v-if="deletionResultMessage" class="result-message">{{ deletionResultMessage }}</p>
                    </div>
                </el-card>
            </div>

            <!-- 更换邮箱模态窗口 -->
            <el-dialog v-model="isChangeEmailModalVisible" title="更换绑定邮箱" @close="hideChangeEmailModal" custom-class="square-modal" width="25%" align-center>
                <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef" label-width="100px">
                <el-form-item label="新邮箱" prop="newEmail">
                        <el-input v-model="emailForm.newEmail" placeholder="请输入新邮箱地址" style="width: 95%;"></el-input>
                    </el-form-item>
                    <el-form-item label="验证码" prop="verificationCode">
                        <el-row :gutter="10">
                            <el-col :span="16">
                                <el-input v-model="emailForm.verificationCode" placeholder="请输入验证码" style="width: 95%;"></el-input>
                            </el-col>
                            <el-col :span="8">
                                <el-button @click="sendVerificationCode" class="verify-button" style="margin-left: -18px;">发送验证码</el-button>
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

            <!-- 实名认证对话框 -->
            <el-dialog title="实名认证" v-model="realNameDialogVisible" width="500px">
                <el-form :model="realNameForm" label-width="100px" class="form-container">
                    <el-form-item label="真实姓名" class="form-item-spacing">
                        <el-input v-model="realNameForm.name" placeholder="请输入真实姓名"
                                  class="input-limited"></el-input>
                    </el-form-item>
                    <el-form-item label="身份证号" class="form-item-spacing">
                        <el-input v-model="realNameForm.idCard" placeholder="请输入身份证号"
                                  class="input-limited"></el-input>
                    </el-form-item>
                </el-form>

                <div slot="footer" class="dialog-footer">
                    <el-button @click="realNameDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitRealNameVerification">确认</el-button>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script setup>
//公共组件引入
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import {computed, ref, onMounted} from 'vue';
//图标引入
import {ElIcon, ElCard, ElInput, ElMessageBox, ElMessage} from 'element-plus';
import {Edit} from '@element-plus/icons-vue';
import {useStore} from "vuex";
import axios from "axios";
import { useRouter } from 'vue-router';

//从全局中ID信息
const store = useStore();
const teacherId = computed(() => store.state.user.id);

const teacherInfo = ref({
    name: '',
    username: '',
    email: '',
    phoneNumber: '',
    schoolName: ''
});

// 实名认证表单
const realNameForm = ref({
    name: '',
    idCard: ''
});

// 控制编辑状态
const editNickname = ref(false);
const editPhone = ref(false);
const editName = ref(false);
const realNameDialogVisible = ref(false);

const isChangeEmailModalVisible = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const accountDeactivationErrorMessage = ref('');
const accountDeactivationSuccessMessage = ref('');
const deletionResultMessage = ref('');
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
            console.log(response.data.data)
            teacherInfo.value = response.data.data;
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
    } else if (field === 'phone') {
        editPhone.value = !editPhone.value;
    } else if (field === 'name') {
        editName.value = !editName.value;
    }
}

// 打开实名认证对话框
const openRealNameDialog = () => {
    realNameDialogVisible.value = true;
};

const updateUsername = async () => {
    try {
        const url = `/api/teacher/${teacherId.value}/update-username`;

        // 发送 POST 请求
        const response = await axios.post(url, {
            username: teacherInfo.value.username
        });

        // 处理响应
        if (response.status === 200 && response.data.message === '用户名修改成功') {
            console.log(response.data.message);
        } else {
            console.error(response.data.message);
        }
    } catch (error) {
        // 处理错误
        console.error('请求失败' + error.message);
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
            console.log(response.data.message);
        } else {
            console.error(response.data.message);
        }
    } catch (error) {
        console.error('请求失败' + error.message);
    }

}

const updateName = async () => {
    try {
        //发送 POST 请求
        const url = `/api/teacher/${teacherId.value}/update-name`;

        const response = await axios.put(url, {
            name: teacherInfo.value.name
        });

        if (response.status === 200 && response.data.message === '姓名修改成功') {

            console.log(response.data.message);
        } else {
            console.error(response.data.message);
        }
    } catch (error) {
        console.error('请求失败' + error.message);
    }
}

// 提交实名认证
const submitRealNameVerification = async () => {
    try {
        // 调用外部实名认证接口
        const url = 'https://cloudauth.aliyuncs.com/id2MetaVerify';

        const response = await axios.post(url, {
            ParamType: 'normal',
            IdentifyNum: realNameForm.value.idCard,
            UserName: realNameForm.value.name

        });

        if (response.data.Code === '200') {
            console.log('实名认证成功');
            teacherInfo.value.name = realNameForm.value.name; // 更新教师信息中的实名
            realNameDialogVisible.value = false; // 关闭对话框
        } else {
            console.error('实名认证失败:', response.data.Message);
        }
    } catch (error) {
        console.error('实名认证请求失败:', error.message);
    }
};

// 编辑密码的逻辑（可以弹出对话框等）
function editPassword() {
    console.log('编辑密码');
}





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
        const response = await axios.get(`/api/teacher/send-email-code`, {
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
                const response = await axios.get(`/api/teacher/change-email`, {
                    params: {
                        newEmail: emailForm.value.newEmail
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    successMessage.value = '邮箱更换成功';
                    teacherInfo.value.email = emailForm.value.newEmail;
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


// 请求注销账号
const requestAccountDeactivation = () => {
    ElMessageBox.confirm(
        '您确定要注销您的账号吗？这将永久删除您的账号信息。',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        try {
            const response = await axios.delete(`/api/teacher/delete-account`, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200) {
                accountDeactivationSuccessMessage.value = '账号注销成功';
                accountDeactivationErrorMessage.value = ''; // 清除错误消息
                navigateToHome();
            } else {
                accountDeactivationErrorMessage.value = '账号注销失败';
            }
        } catch (error) {
            accountDeactivationErrorMessage.value = '账号注销失败，请检查网络连接或稍后再试';
            console.error('账号注销失败:', error.response ? error.response.data : error.message);
        }
    }).catch(() => {
        ElMessage.info('已取消注销账号');
    });
};

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

.info-item label {
    font-weight: bold;
    width: 100px;
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
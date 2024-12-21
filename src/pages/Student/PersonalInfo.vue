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
                        <label>昵称：</label>
                        <span v-if="!editNickname">{{ studentInfo.username }}</span>
                        <el-input
                            v-else
                            v-model="studentInfo.username"
                            size="small"
                            class="edit-input"
                            @blur="toggleEdit('nickname'); saveEditedUserInfo()"
                        />
                        <el-icon v-if="!editNickname" @click="toggleEdit('nickname')" class="edit-icon">
                            <Edit />
                        </el-icon>
                    </div>
                    <div class="info-item">
                        <label>姓名：</label>
                        <span v-if="!editName">{{ studentInfo.name }}</span>
                        <el-input
                            v-else
                            v-model="studentInfo.name"
                            size="small"
                            class="edit-input"
                            @blur="toggleEdit('name'); saveEditedUserInfo()"
                        />
                        <el-icon v-if="!editName" @click="toggleEdit('name')" class="edit-icon">
                            <Edit />
                        </el-icon>
                    </div>
                    <div class="info-item">
                        <label>班级：</label>
                        <span>{{ studentInfo.class }}</span>
                    </div>
                    <div class="info-item">
                        <label>学校：</label>
                        <span>{{ studentInfo.schoolName }}</span>
                    </div>
                    <div class="info-item">
                        <label>年级：</label>
                        <span v-if="!editGrade">{{ studentInfo.grade }}</span>
                        <el-select
                            v-else
                            v-model="studentInfo.grade"
                            size="small"
                            class="edit-input"
                            placeholder="请选择年级"
                            @change="saveEditedUserInfo"
                        >
                            <el-option
                                v-for="grade in gradeOptions"
                                :key="grade.value"
                                :label="grade.label"
                                :value="grade.value"
                            />
                        </el-select>
                        <el-icon v-if="!editGrade" @click="toggleEdit('grade')" class="edit-icon">
                            <Edit />
                        </el-icon>
                    </div>
                </el-card>

                <!-- 账号信息卡片 -->
                <h2>账号信息</h2>
                <el-card class="info-card" style="margin-top: 20px;">
                    <div class="info-item">
                        <label>账号ID：</label>
                        <span>{{ studentInfo.accountId }}</span>
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
                        <span>{{ studentInfo.email }}</span>
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
                    <div class="info-item">
                        <label>加入班级：</label>
                        <el-button
                            @click="showJoinClassModal"
                            :disabled="isJoinedClass"
                            class="action-button"
                            :title="isJoinedClass ? '您已加入班级' : ''"
                        >{{ isJoinedClass ? '已加入班级' : '加入班级' }}</el-button>
                    </div>
                </el-card>
            </div>
        </div>

        <!-- 更换邮箱模态窗口 -->
        <el-dialog v-model="isChangeEmailModalVisible" title="更换绑定邮箱" @close="hideChangeEmailModal" custom-class="square-modal" width="25%" align-center>
            <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef" label-width="100px">
                <el-form-item label="新邮箱" prop="newEmail">
                    <el-input v-model="emailForm.newEmail" placeholder="请输入新邮箱地址" style="width: 95%;"></el-input>
                </el-form-item>
                <el-form-item label="验证码" prop="verificationCode">
                    <el-row :gutter="10">
                        <el-col :span="10">
                            <el-input v-model="emailForm.verificationCode" placeholder="请输入验证码" style="width: 95%;"></el-input>
                        </el-col>
                        <el-col :span="8">
                            <el-button @click="sendVerificationCode" class="verify-button" style="margin-left: -10px;">{{ codeButtonText }}</el-button>
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
            <el-form ref="passwordForm" :model="passwordForm" :rules="passwordRules" label-width="100px">
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

        <!-- 加入班级模态窗口 -->
        <el-dialog v-model="isJoinClassModalVisible" title="加入班级" @close="hideJoinClassModal" custom-class="square-modal" width="25%" align-center>
            <el-form :model="joinClassForm" :rules="joinClassRules" ref="joinClassFormRef" label-width="100px">
                <el-form-item prop="inviteCode">
                    <el-input v-model="inviteCode" placeholder="请输入班级邀请码" autocomplete="off" style="width: 95%;"></el-input>
                </el-form-item>
                <div class="form-buttons">
                    <el-button type="primary" @click="joinClass" class="action-button">确认加入</el-button>
                </div>
            </el-form>
            <p v-if="joinClassResultMessage" class="result-message">{{ joinClassResultMessage }}</p>
        </el-dialog>
    </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import axios from 'axios';
import {ElMessageBox, ElMessage, ElForm, ElDialog, ElInput, ElFormItem, ElButton, ElNotification} from 'element-plus';
import { Edit } from '@element-plus/icons-vue';
import { mapGetters } from 'vuex';
import {ref, watch} from "vue";

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
        console.log(`Countdown value: ${countdown.value}`);
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
    isCountingDown.value = false;
}

// 使用 watch 监听 countdown 的变化并更新按钮文本
watch(countdown, (newVal) => {
    if (newVal > 0 && newVal <= 60) {
        codeButtonText.value = `${newVal}s 后重新获取`;
    } else {
        codeButtonText.value = '重新获取验证码';
    }
});

export default {
    components: {
        ElButton, ElFormItem, ElInput, ElDialog, ElForm,
        Edit,
        Header,
        Sidebar
    },
    data() {
        return {
            studentInfo: {
                name: '',  // 实名
                username: '', // 昵称
                schoolName: '',
                grade: '',
                accountId: '',
                email: '',
                class: ''
            },

            gradeOptions: [
                { value: '7', label: '7' },
                { value: '8', label: '8' },
                { value: '9', label: '9' }
            ],

            emailForm: {
                newEmail: '',
                verificationCode: '',
            },

            passwordForm: {
                oldPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            },

            editNickname: false,
            editName: false,
            editGrade: false,

            isChangeEmailModalVisible: false,
            errorMessage: '',
            successMessage: '',

            isChangePasswordModalVisible: false,
            passwordErrorMessage: '',
            passwordSuccessMessage: '',

            isAccountDeletionInProgress: false,
            deletionResultMessage: '',
            accountDeactivationErrorMessage: '',
            accountDeactivationSuccessMessage: '',

            isJoinClassModalVisible: false,
            inviteCode: '',
            joinClassResultMessage: '',
            isJoinedClass: false,

            passwordRules: {
                oldPassword: [
                    {required: true, message: '请输入旧密码', trigger: 'blur'}
                ],
                newPassword: [
                    {required: true, message: '请输入新密码', trigger: 'blur'},
                    {min: 6, message: '新密码至少6位', trigger: 'blur'}
                ],
                confirmNewPassword: [
                    {required: true, message: '请再次输入新密码', trigger: 'blur'},
                    {validator: this.validateConfirmPassword, trigger: 'blur'}
                ]
            },

            emailRules: {
                newEmail: [
                    {required: true, message: '请输入新的邮箱地址', trigger: 'blur'},
                    {type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change']}
                ],
                verificationCode: [
                    {required: true, message: '请输入验证码', trigger: 'blur'},
                    {len: 6, message: '验证码长度应为6位', trigger: 'blur'}
                ]
            }
        };
    },
    computed: {
        ...mapGetters(['getUserId']),
        accountId() {
            return this.getUserId;
        },
    },
    methods: {
        async fetchStudentInfo() {
            const accountId = this.accountId;

            if (!accountId) {
                this.showError('账号ID必须是一个有效的数字。');
                return;
            }

            console.log('Fetching student info for account ID:', accountId); // 打印 accountId 以确认其值

            try {
                const response = await axios.get(`/api/student/${accountId}`);
                if (response.status === 200) {
                    const studentData = response.data.data;
                    this.studentInfo = {
                        ...studentData,
                        class: studentData.className || '', // 确保 className 存在
                        accountId: accountId, // 不需要转换为字符串，因为 accountId 已经是字符串
                        name: studentData.name
                    };

                    // 检查学生是否已经加入了班级
                    this.isJoinedClass = Boolean(studentData.className);
                } else {
                    console.error('获取学生信息失败: 未知状态码', response.status);
                    this.showError(`获取学生信息失败: 未知状态码 ${response.status}`);
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.error('获取学生信息失败: 用户信息未找到');
                    this.showError('用户信息未找到，请检查账号ID是否正确。');
                } else {
                    console.error('获取学生信息失败:', error);
                    this.showError('获取学生信息时发生错误，请稍后再试。');
                }
            }
        },

        showError(message) {
            // 显示错误提示的方法
            this.errorMessage = message;
            ElNotification.error({ title: '学生信息获取失败', message: message });
        },

        toggleEdit(field) {
            if (field === 'nickname') {
                this.editNickname = !this.editNickname;
            } else if (field === 'name') { // 添加对姓名的编辑支持
                this.editName = !this.editName;
            } else if (field === 'grade') {
                this.editGrade = !this.editGrade;
            }
        },

        async saveEditedUserInfo() {
            const requestBody = {};

            // 检查哪个字段被编辑并添加到请求体
            requestBody.username = this.studentInfo.username;
            requestBody.name = this.studentInfo.name;
            requestBody.grade = this.studentInfo.grade;

            // 如果没有任何字段被编辑，则不发送请求
            if (Object.keys(requestBody).length === 0) {
                ElNotification.warning({ title: '学生信息未修改', message: "信息未更改，没有需要更新的信息" });
                return;
            }

            try {
                // 发送请求
                const response = await axios.post(`/api/student/${this.studentInfo.accountId}/edit-information`, requestBody, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    // 更新成功
                    const responseData = response.data;
                    if (responseData.message === "个人信息修改成功") {
                        // 更新成功，更新本地数据
                        this.studentInfo.username = responseData.data.username;
                        this.studentInfo.name = responseData.data.name;
                        this.studentInfo.grade = responseData.data.grade;
                        ElNotification.success({ title: '个人信息更新成功', message: "个人信息更新成功，请注意查看" });
                        if (this.editGrade) {
                            this.toggleEdit('grade');
                        }
                    } else {
                        ElNotification.error({ title: '个人信息更新失败', message: responseData.message });
                    }
                } else {
                    ElNotification.error({ title: '个人信息更新失败', message: "请重新修改个人信息" });
                }
            } catch (error) {
                ElNotification.error({ title: '个人信息更新失败', message: "请重新修改个人信息" });
            }
        },

        showChangeEmailModal() {
            this.isChangeEmailModalVisible = true;
        },
        hideChangeEmailModal() {
            this.isChangeEmailModalVisible = false;
            this.emailForm.newEmail = '';
            this.emailForm.verificationCode = '';
            this.errorMessage = '';
            this.successMessage = '';
        },
        async sendVerificationCode() {
            // 如果当前正在倒计时，则不允许再次发送验证码
            if (countdown.value !== 60) return;
            startCountdown();
            try {
                const response = await axios.post(`/api/student/${this.studentInfo.accountId}/change-email/send-code`, {
                    email: this.emailForm.newEmail
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    this.successMessage = '验证码已发送，请查收您的邮箱';
                }
            } catch (error) {
                this.errorMessage = '验证码发送失败，请稍后再试';
                console.error('验证码发送失败:', error.response ? error.response.data : error.message);
                resetCountdown(); // 发送失败时重置倒计时
            }
        },
        async handleChangeEmail() {
            this.$refs.emailFormRef.validate(async (valid) => {
                if (valid) {
                    try {
                        const response = await axios.post(`/api/student/${this.studentInfo.accountId}/change-email`, {
                            email: this.emailForm.newEmail,
                            verificationCode: this.emailForm.verificationCode
                        }, {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        if (response.status === 200) {
                            this.successMessage = '邮箱更换成功';
                            this.studentInfo.email = this.emailForm.newEmail;
                            this.hideChangeEmailModal();
                        } else {
                            this.errorMessage = '邮箱更换失败，状态码: ' + response.status;
                            if (response.data && response.data.message) {
                                this.errorMessage += ' - ' + response.data.message;
                            }
                        }
                    } catch (error) {
                        this.errorMessage = '邮箱更换失败，请稍后再试';
                        if (error.response && error.response.data && error.response.data.message) {
                            this.errorMessage += ' - ' + error.response.data.message;
                        }
                        console.error('邮箱更换失败:', error.response ? error.response.data : error.message);
                    }
                } else {
                    console.log('表单验证失败');
                    return false;
                }
            });
        },

        showChangePasswordModal() {
            console.log('showChangePasswordModal called');
            this.isChangePasswordModalVisible = true;
        },
        hideChangePasswordModal() {
            console.log('hideChangePasswordModal called');
            this.isChangePasswordModalVisible = false;
        },
        resetPasswordForm() {
            console.log('resetPasswordForm called');
            this.passwordForm = {
                oldPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            };
            // 清理错误和成功消息
            this.passwordErrorMessage = '';
            this.passwordSuccessMessage = '';
        },
        validateConfirmPassword(rule, value, callback) {
            if (value !== this.passwordForm.newPassword) {
                callback(new Error('两次输入的新密码不一致'));
            } else {
                callback();
            }
        },
        async handlePasswordChange() {
            this.$refs.passwordForm.validate(async (valid) => {
                if (valid) {
                    try {
                        const response = await axios.post(
                            `/api/student/${this.studentInfo.accountId}/change-password`,
                            {
                                oldPassword: this.passwordForm.oldPassword,
                                newPassword: this.passwordForm.newPassword,
                            },
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            }
                        );

                        if (response.status === 200) {
                            this.passwordSuccessMessage = '密码更改成功';
                            this.hideChangePasswordModal();
                        } else {
                            this.passwordErrorMessage = '密码更改失败，请稍后再试';
                        }
                    } catch (error) {
                        this.passwordErrorMessage = '密码更改失败，请检查网络连接或稍后再试';
                        console.error('密码更改失败:', error.response ? error.response.data : error.message);
                    }
                } else {
                    console.log('表单验证失败');
                    return false;
                }
            });
        },

        async requestAccountDeactivation() {
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
                    const response = await axios.delete(
                        `/api/student/${this.studentInfo.accountId}/account-deactivation`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    if (response.status === 200) {
                        this.accountDeactivationSuccessMessage = '账号注销成功';
                        this.accountDeactivationErrorMessage = ''; // 清除错误消息
                        this.navigateToHome();
                    } else if (response.status === 409) { // 冲突状态码
                        this.accountDeactivationErrorMessage = '账号注销失败：存在关联数据，请先解除关联后再试';
                    } else {
                        this.accountDeactivationErrorMessage = '账号注销失败，请稍后再试';
                        if (response.data && response.data.message) {
                            this.accountDeactivationErrorMessage += ' - ' + response.data.message;
                        }
                    }
                } catch (error) {
                    this.accountDeactivationErrorMessage = '账号注销失败，请稍后再试';
                    if (error.response && error.response.data && error.response.data.message) {
                        this.accountDeactivationErrorMessage += ' - ' + error.response.data.message;
                    } else if (error.response) {
                        // 如果服务器返回了500错误或其他错误状态码
                        this.accountDeactivationErrorMessage += ' - 服务器内部错误';
                    }
                    console.error('账号注销失败:', error.response ? error.response.data : error.message);
                }
            }).catch(() => {
                // 用户点击了取消
                ElMessage.info('已取消注销账号');
            });
        },
        navigateToHome() {
            // 使用 Vue Router 进行页面重定向
            this.$router.push({name: 'Home'});
        },

        showJoinClassModal() {
            this.isJoinClassModalVisible = true;
        },

        hideJoinClassModal() {
            this.isJoinClassModalVisible = false;
            this.inviteCode = '';
            this.joinClassResultMessage = '';
        },

        async joinClass() {
            try {
                const response = await axios.post(`/api/student/${this.studentInfo.accountId}/join-class`, {
                    inviteCode: this.inviteCode
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.status === 200) {
                    this.joinClassResultMessage = response.data.message;
                    this.studentInfo.class = response.data.className; // 如果响应中有新的班级名称，更新学生信息
                    this.studentInfo.schoolName = response.data.schoolName;
                    this.fetchStudentInfo(); // 重新获取学生信息
                    ElNotification.success({ title: '加入班级成功', message: "您已成功加入班级" });
                    this.hideJoinClassModal();
                } else {
                    this.joinClassResultMessage = '加入班级失败';
                    ElNotification.error({ title: '加入班级失败', message: "请重新输入班级邀请码" });
                }
            } catch (error) {
                console.error('加入班级失败:', error.response ? error.response.data : error.message);
                ElNotification.error({ title: '加入班级失败', message: "请输入正确的班级邀请码" });
            }
        }
    },

    created() {
        this.fetchStudentInfo(); // 在组件创建时获取学生信息
    },
}

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

.content {
    max-width: 1000px;
    width: 100%;
    padding: 30px;
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
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

.edit-icon {
    font-size: 22px;
    cursor: pointer;
    color: #409eff;
    transition: color 0.3s;
}

.edit-icon:hover {
    color: #66b1ff;
}

.edit-input {
    width: 200px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 0 10px;
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

.action-button:hover {
    background-color: #66b1ff;
    transform: scale(1.05);
}

.action-button:active {
    transform: scale(0.95);
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

/* 正方形模态窗口 */
.square-modal {
    width: 400px;
    height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.square-modal .el-dialog__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.square-modal .el-form {
    width: 100%;
    max-width: 300px;
}
</style>
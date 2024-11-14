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
                        <span v-if="!Editusername">{{ userInfo.username }}</span>
                        <el-input v-else v-model="editedUserInfo.username" size="small" class="edit-input" @blur="saveEditedUserInfo" />
                        <el-icon v-if="!Editusername" @click="toggleEdit('username')"><Edit /></el-icon>
                    </div>
                    <div class="info-item">
                        <label>实名：</label>
                        <span>{{ userInfo.name }}</span>
                    </div>
                    <div class="info-item">
                        <label>班级：</label>
                        <span>{{ accountInfo.class }}</span>
                    </div>
                    <div class="info-item">
                        <label>学校：</label>
                        <span>{{ userInfo.schoolName }}</span>
                    </div>
                    <div class="info-item">
                        <label>年级：</label>
                        <span v-if="!Editgrade">{{ userInfo.grade }}</span>
                        <el-input v-else v-model="editedUserInfo.grade" size="small" class="edit-input" @blur="saveEditedUserInfo" />
                        <el-icon v-if="!Editgrade" @click="toggleEdit('grade')"><Edit /></el-icon>
                    </div>
                </el-card>

                <!-- 账号信息卡片 -->
                <h2>账号信息</h2>
                <el-card class="info-card" style="margin-top: 20px;">
                    <div class="info-item">
                        <label>账号ID：</label>
                        <span>{{ accountInfo.accountId }}</span>
                    </div>
                    <div class="info-item">
                        <label>密码：</label>
                        <span>******</span>
                        <el-icon @click="showChangePasswordModal">
                            <Edit />
                        </el-icon>
                    </div>
                    <div class="info-item">
                        <label>绑定邮箱：</label>
                        <span>{{ accountInfo.email }}</span>
                        <el-icon @click="showChangeEmailModal">
                            <Edit />
                        </el-icon>
                    </div>
                    <div class="info-item">
                        <label>实名认证：</label>
                        <span>{{ accountInfo.realNameStatus }}</span>
                        <el-button @click="requestRealNameVerification">去认证</el-button>
                    </div>
                    <div class="info-item">
                        <label>账号注销：</label>
                        <el-button @click="requestAccountDeactivation" :loading="isAccountDeletionInProgress">申请注销</el-button>
                        <p v-if="deletionResultMessage" class="result-message">{{ deletionResultMessage }}</p>
                    </div>
                    <div class="info-item">
                        <label>加入班级：</label>
                        <el-button @click="showJoinClassModal">加入班级</el-button>
                    </div>
                </el-card>
            </div>
        </div>

        <!-- 更换邮箱模态窗口 -->
        <el-dialog v-model="isChangeEmailModalVisible" title="更换绑定邮箱" @close="hideChangeEmailModal">
            <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef">
                <el-form-item prop="newEmail">
                    <el-input v-model="newEmail" placeholder="请输入新邮箱地址"></el-input>
                </el-form-item>
                <el-form-item prop="verificationCode">
                    <el-input v-model="verificationCode" placeholder="请输入验证码"></el-input>
                    <el-button @click="sendVerificationCode">发送验证码</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleChangeEmail">确认修改</el-button>
                </el-form-item>
            </el-form>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        </el-dialog>

        <!-- 修改密码窗口 -->
        <el-dialog v-model="isChangePasswordModalVisible" title="更改密码" @close="hideChangePasswordModal">
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef">
                <el-form-item prop="oldPassword">
                    <el-input v-model="oldPassword" type="password" placeholder="请输入旧密码"></el-input>
                </el-form-item>
                <el-form-item prop="newPassword">
                    <el-input v-model="newPassword" type="password" placeholder="请输入新密码"></el-input>
                </el-form-item>
                <el-form-item prop="confirmNewPassword">
                    <el-input v-model="confirmNewPassword" type="password" placeholder="请再次输入新密码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handlePasswordChange">确认修改</el-button>
                </el-form-item>
            </el-form>
            <p v-if="passwordErrorMessage" class="error-message">{{ passwordErrorMessage }}</p>
            <p v-if="passwordSuccessMessage" class="success-message">{{ passwordSuccessMessage }}</p>
        </el-dialog>

        <!-- 加入班级模态窗口 -->
        <el-dialog v-model="isJoinClassModalVisible" title="加入班级" @close="hideJoinClassModal">
            <el-form :model="joinClassForm" :rules="joinClassRules" ref="joinClassFormRef">
                <el-form-item prop="inviteCode">
                    <el-input v-model="inviteCode" placeholder="请输入班级邀请码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="joinClass">确认加入</el-button>
                </el-form-item>
            </el-form>
            <p v-if="joinClassResultMessage" class="result-message">{{ joinClassResultMessage }}</p>
        </el-dialog>
    </div>
</template>

<script>
import Header from '@/components/Header.vue'; // 确保路径正确
import Sidebar from '@/components/Sidebar.vue';
import axios from 'axios';
import {Edit} from "@element-plus/icons-vue";
import {ref} from "vue";

export default {
    components: {
        Edit,
        Header,
        Sidebar
    },
    data() {
        return {
            userInfo: {
                name: '调查',
                username: '调查',
                schoolName: '调查',
                grade: '调查'
            },
            accountInfo: {
                accountId: '调查',
                email: '调查',
                password: '调查',
                realNameStatus: '未认证',
                class: '调查'
            },
            isEditing: false, // 用于控制是否处于编辑模式
            editedUserInfo: {}, // 用于存储编辑中的用户信息
            Editusername: false, // 控制用户名编辑状态
            Editgrade: false, // 控制年级编辑状态

            isChangeEmailModalVisible: false,
            newEmail: '',
            verificationCode: '',
            errorMessage: '',
            successMessage: '',

            isChangePasswordModalVisible: false,
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: '',
            passwordErrorMessage: '',
            passwordSuccessMessage: '',

            isAccountDeletionInProgress: false,
            deletionResultMessage: '',

            isJoinClassModalVisible: false, // 控制加入班级模态窗口的可见性
            inviteCode: '', // 用于存储用户输入的班级邀请码
            joinClassResultMessage: '' // 显示加入班级的结果信息
        };
    },
    methods: {
        async fetchStudentInfo() {
            try {
                const response = await axios.get(`/api/student/${this.accountInfo.accountId}`);
                if (response.status === 200) {
                    this.userInfo = response.data.data;
                    this.accountInfo.class = this.userInfo.schoolName; // 更新班级信息
                }
            } catch (error) {
                console.error("获取学生信息失败:", error);
            }
        },

        toggleEdit(field) {
            if (field === 'username') {
                this.Editusername = !this.Editusername;
            } else if (field === 'grade') {
                this.Editgrade = !this.Editgrade;
            }
        },

        async saveEditedUserInfo() {
            try {
                const userId = this.userInfo.username;
                const updatedData = {
                    username: this.editedUserInfo.username || this.userInfo.username,
                    name: this.editedUserInfo.name || this.userInfo.name,
                    grade: parseInt(this.editedUserInfo.grade || this.userInfo.grade)
                };

                const response = await axios.post(`/api/student/${userId}/edit-information`, updatedData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    this.userInfo = response.data.data;
                    this.isEditing = false;
                    this.editedUserInfo = {};
                    this.Editusername = false; // 保存后重置编辑状态
                    this.Editgrade = false; // 保存后重置编辑状态
                    alert("个人信息更新成功");
                } else {
                    alert("个人信息更新失败");
                }
            } catch (error) {
                console.error("个人信息更新出错:", error);
                alert("个人信息更新过程中出现错误，请稍后再试");
            }
        },


        showChangeEmailModal() {
            this.isChangeEmailModalVisible = true;
        },

        hideChangeEmailModal() {
            this.isChangeEmailModalVisible = false;
            this.newEmail = '';
            this.verificationCode = '';
            this.errorMessage = '';
            this.successMessage = '';
        },

        async sendVerificationCode() {
            try {
                console.log('Sending verification code for:', this.newEmail, 'with account ID:', this.accountInfo.accountId);
                const response = await axios.post(`/api/student/${this.accountInfo.accountId}/change-email/send-verification`, {
                    email: this.newEmail
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
            }
        },
        async handleChangeEmail() {
            try {
                const response = await axios.post(`/api/student/${this.accountInfo.accountId}/change-email`, {
                    email: this.newEmail
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    this.successMessage = '邮箱更换成功';
                    this.accountInfo.email = this.newEmail; // 更新显示的邮箱
                    this.hideChangeEmailModal();
                }
            } catch (error) {
                this.errorMessage = '邮箱更换失败，请稍后再试';
                console.error('邮箱更换失败:', error.response ? error.response.data : error.message);
            }
        },

        showChangePasswordModal() {
            this.isChangePasswordModalVisible = true; // 控制密码修改模态窗口的显示
        },

        hideChangePasswordModal() {
            this.isChangePasswordModalVisible = false; // 控制密码修改模态窗口的隐藏
            this.oldPassword = '';
            this.newPassword = '';
            this.confirmNewPassword = '';
            this.passwordErrorMessage = '';
            this.passwordSuccessMessage = '';
        },

        async handlePasswordChange() {
            if (this.newPassword !== this.confirmNewPassword) {
                this.passwordErrorMessage = '新密码与确认的新密码不一致';
                return;
            }

            try {
                const response = await axios.post(`/api/student/${this.accountInfo.accountId}/change-password`, {
                    oldPassword: this.oldPassword,
                    newPassword: this.newPassword
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    this.passwordSuccessMessage = '密码更改成功';
                    this.hideChangePasswordModal(); // 关闭模态框并重置表单
                } else {
                    this.passwordErrorMessage = '密码更改失败，请稍后再试';
                }
            } catch (error) {
                this.passwordErrorMessage = '密码更改失败，请检查网络连接或稍后再试';
                console.error('密码更改失败:', error.response ? error.response.data : error.message);
            }
        },

        requestAccountDeactivation() {
            if (confirm('确定要注销账号吗？此操作不可逆！')) {
                this.isAccountDeletionInProgress = true;

                axios.delete(`/api/student/${this.accountInfo.accountId}/account-deactivation`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => {
                        if (response.status === 200) {
                            this.deletionResultMessage = '账号注销成功';
                            // 注销成功后跳转到登录页面
                            this.$router.push({ name: 'Home' });
                        } else {
                            this.deletionResultMessage = '账号注销失败';
                        }
                    })
                    .catch(error => {
                        this.deletionResultMessage = '账号注销失败，请稍后再试';
                        console.error('账号注销失败:', error.response ? error.response.data : error.message);
                    })
                    .finally(() => {
                        this.isAccountDeletionInProgress = false;
                    });
            }
        },

        // 显示加入班级模态窗口
        showJoinClassModal() {
            this.isJoinClassModalVisible = true;
        },

        // 隐藏加入班级模态窗口
        hideJoinClassModal() {
            this.isJoinClassModalVisible = false;
            this.inviteCode = '';
            this.joinClassResultMessage = '';
        },

        // 处理加入班级的逻辑
        async joinClass() {
            const studentId = this.accountInfo.accountId; // 获取学生的 ID
            const payload = { inviteCode: this.inviteCode }; // 构建请求体

            try {
                const response = await axios.post(`/api/student/${studentId}/join-class`, payload, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    this.joinClassResultMessage = response.data.message;
                    this.accountInfo.class = response.data.data.className; // 更新班级信息
                    this.fetchStudentInfo(); // 获取最新的学生信息，包括学校
                    this.hideJoinClassModal(); // 成功后隐藏模态窗口
                } else {
                    this.joinClassResultMessage = '加入班级失败';
                }
            } catch (error) {
                this.joinClassResultMessage = '加入班级失败，请检查您的网络连接或稍后再试';
                console.error('加入班级失败:', error.response ? error.response.data : error.message);
            }
        },

        created() {
            // 组件创建时获取学生信息
            this.fetchStudentInfo();
        }
    }
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

.content {
    max-width: 1000px; /* 最大宽度为 1000px */
    width: 100%; /* 宽度在正常情况下可以随着窗口大小缩放 */
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin-right: 50px; /* 如果需要右侧留空隙，可以保留这行，或者可以根据实际情况调整 */
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


.error-message, .success-message, .result-message {
    margin-top: 10px;
    padding: 10px;
    border-radius: 4px;
}

.error-message {
    background: #fdd;
    color: #c00;
}

.success-message, .result-message {
    background: #dfd;
    color: #0c0;
}

</style>
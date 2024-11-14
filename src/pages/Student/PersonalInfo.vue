<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header />

        <div class="main-container">
            <!-- 引入侧边栏通用组件 -->
            <Sidebar />

            <main class="content">
                <section class="profile-info">
                    <!-- 图片 -->
<!--                    <img :src="require('@/assets/path-to-your-image.jpg')" alt="User Profile Picture" />-->
                    <div class="info-section">
                        <h2>个人信息管理</h2>
                        <button @click="editUserInfo">编辑</button>
                        <table>
                            <tr>
                                <td>姓名:</td>
                                <td v-if="!isEditing">{{ userInfo.name }}</td>
                                <td v-else><input type="text" v-model="editedUserInfo.name" /></td>
                            </tr>
                            <tr>
                                <td>班级:</td>
                                <td>{{ accountInfo.class }}</td>
                            </tr>
                            <tr>
                                <td>学校:</td>
                                <td>{{ userInfo.school }}</td>
                            </tr>
                            <tr>
                                <td>年级:</td>
                                <td v-if="!isEditing">{{ userInfo.grade }}</td>
                                <td v-else><input type="number" v-model="editedUserInfo.grade" /></td>
                            </tr>
                        </table>
                        <button v-if="isEditing" @click="saveEditedUserInfo">保存</button>
                        <button v-if="isEditing" @click="cancelEdit">取消</button>
                    </div>
                </section>

                <section class="account-info">
                    <h2>账号信息管理</h2>
                    <table>
                        <tr>
                            <td>账号ID:</td>
                            <td>{{ accountInfo.accountId }}</td>
                            <td>绑定邮箱:</td>
                            <td>{{ accountInfo.email }}</td>
                            <td><button @click="showChangeEmailModal">更换</button></td>
                        </tr>
                        <tr>
                            <td>密码:</td>
                            <td>{{ accountInfo.password }}</td>
                            <td><button @click="showChangePasswordModal">修改</button></td>
                            <td>实名认证:</td>
                            <td>{{ accountInfo.realNameStatus }}</td>
                            <td><button>去认证</button></td>
                        </tr>
                        <tr>
                            <td>账号注销:</td>
                            <td>
                                <button @click="requestAccountDeactivation">申请注销</button>
                                <p v-if="isAccountDeletionInProgress">正在注销...</p>
                                <p v-if="deletionResultMessage" class="result-message">{{ deletionResultMessage }}</p>
                            </td>
                            <td>班级:</td>
                            <td>{{ accountInfo.class }}</td>
                            <td><button @click="showJoinClassModal">加入班级</button></td>
                        </tr>
                    </table>
                </section>
            </main>
        </div>

        <!-- 更换邮箱模态窗口 -->
        <div v-if="isChangeEmailModalVisible" class="modal-overlay" @click="hideChangeEmailModal">
            <div class="modal" @click.stop>
                <h2>更换绑定邮箱</h2>
                <form @submit.prevent="handleChangeEmail">
                    <div>
                        <label for="newEmail">新邮箱地址:</label>
                        <input type="email" id="newEmail" v-model="newEmail" required />
                    </div>
                    <div>
                        <label for="verificationCode">验证码:</label>
                        <input type="text" id="verificationCode" v-model="verificationCode" required />
                        <button @click.prevent="sendVerificationCode">发送验证码</button>
                    </div>
                    <div>
                        <button type="submit">确认修改</button>
                    </div>
                </form>
                <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
                <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
            </div>
        </div>

        <!-- 修改密码窗口 -->
        <div v-if="isChangePasswordModalVisible" class="modal-overlay" @click="hideChangePasswordModal">
            <div class="modal" @click.stop>
                <h2>更改密码</h2>
                <form @submit.prevent="handlePasswordChange">
                    <div>
                        <label for="oldPassword">旧密码:</label>
                        <input type="password" id="oldPassword" v-model="oldPassword" required />
                    </div>
                    <div>
                        <label for="newPassword">新密码:</label>
                        <input type="password" id="newPassword" v-model="newPassword" required />
                    </div>
                    <div>
                        <label for="confirmNewPassword">确认新密码:</label>
                        <input type="password" id="confirmNewPassword" v-model="confirmNewPassword" required />
                    </div>
                    <div>
                        <button type="submit">确认修改</button>
                    </div>
                </form>
                <p v-if="passwordErrorMessage" class="error-message">{{ passwordErrorMessage }}</p>
                <p v-if="passwordSuccessMessage" class="success-message">{{ passwordSuccessMessage }}</p>
            </div>
        </div>

        <!-- 加入班级模态窗口 -->
        <div v-if="isJoinClassModalVisible" class="modal-overlay" @click="hideJoinClassModal">
            <div class="modal" @click.stop>
                <h2>加入班级</h2>
                <form @submit.prevent="joinClass">
                    <div>
                        <label for="inviteCode">班级邀请码:</label>
                        <input type="text" id="inviteCode" v-model="inviteCode" required />
                    </div>
                    <div>
                        <button type="submit">确认加入</button>
                    </div>
                </form>
                <p v-if="joinClassResultMessage" class="result-message">{{ joinClassResultMessage }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header.vue'; // 确保路径正确
import Sidebar from '@/components/Sidebar.vue';
import axios from 'axios';

export default {
    components: {
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

        editUserInfo() {
            // 进入编辑模式，复制 userInfo 到 editedUserInfo
            this.isEditing = true;
            this.editedUserInfo = JSON.parse(JSON.stringify(this.userInfo));
        },

        cancelEdit() {
            // 取消编辑，清除编辑中的用户信息，并退出编辑模式
            this.isEditing = false;
            this.editedUserInfo = {}; // 清除编辑中的用户信息
        },

        async saveEditedUserInfo() {
            try {
                // 获取用户的唯一标识符，这里是使用 username
                const userId = this.userInfo.username;
                // 准备要发送的数据
                const updatedData = {
                    username: this.editedUserInfo.username,
                    name: this.editedUserInfo.name,
                    grade: parseInt(this.editedUserInfo.grade)
                };

                // 发送更新请求
                const response = await axios.post(`/api/student/${userId}/edit-information`, updatedData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    // 更新成功，更新本地 userInfo 并退出编辑模式
                    this.userInfo = response.data.data;
                    this.isEditing = false;
                    this.editedUserInfo = {};
                    alert("个人信息更新成功");
                } else {
                    // 更新失败
                    alert("个人信息更新失败");
                }
            } catch (error) {
                // 错误处理
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
    flex: 1;
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin-right: 50px; /* 右侧留空隙 */
}

.info-section {
    display: flex;
    flex-direction: column;
    gap: ½em;
}

.info-section h2 {
    margin-bottom: 10px;
}

.info-section table {
    width: 100%;
    border-collapse: collapse;
}

.info-section table tr td {
    padding: 5px;
    border: 1px solid #ccc;
}

.info-section table tr td button {
    padding: 5px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
}

.info-section table tr td button:hover {
    background-color: #0056b3;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal {
    background: #fff;
    padding: 8px;
    border-radius: 7px;
    box-shadow: 0 9px 9px rgba(0, 0, 0, 0.6);
    max-width: 300px;
    text-align: center;
}

.modal form {
    display: flex;
    flex-direction: column;
}

.modal form div {
    margin-bottom: 10px;
}

.modal form label {
    margin-bottom: 5px;
}

.modal form input {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
}

.modal form button {
    padding: 5px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
}

.modal form button:hover {
    background-color: #0056b3;
}

.error-message {
    color: red;
    margin-top: 10px;
}

.success-message {
    color: green;
    margin-top: 10px;
}
</style>
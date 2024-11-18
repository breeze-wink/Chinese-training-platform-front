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
                        <label>实名：</label>
                        <span>{{ studentInfo.name || '未实名' }}</span>
                        <el-button v-if="studentInfo.realNameStatus === '未认证'" @click="showRealNameVerificationModal" class="action-button">去实名</el-button>
                        <span v-else class="success-message">已认证</span>
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
                        <el-input
                            v-else
                            v-model="studentInfo.grade"
                            size="small"
                            class="edit-input"
                            @blur="toggleEdit('grade'); saveEditedUserInfo()"
                        />
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
                        <el-button @click="showJoinClassModal" class="action-button">加入班级</el-button>
                    </div>
                </el-card>
            </div>
        </div>

        <!-- 更换邮箱模态窗口 -->
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
        <el-dialog v-model="isChangePasswordModalVisible" title="修改密码" @close="resetPasswordForm" custom-class="square-modal">
            <el-form ref="passwordForm" :model="passwordForm" :rules="passwordRules" label-width="100px">
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

        <!-- 加入班级模态窗口 -->
        <el-dialog v-model="isJoinClassModalVisible" title="加入班级" @close="hideJoinClassModal" custom-class="square-modal">
            <el-form :model="joinClassForm" :rules="joinClassRules" ref="joinClassFormRef">
                <el-form-item prop="inviteCode">
                    <el-input v-model="inviteCode" placeholder="请输入班级邀请码"></el-input>
                </el-form-item>
                <div class="form-buttons">
                    <el-button type="primary" @click="joinClass" class="action-button">确认加入</el-button>
                </div>
            </el-form>
            <p v-if="joinClassResultMessage" class="result-message">{{ joinClassResultMessage }}</p>
        </el-dialog>

        <!-- 实名认证模态窗口 -->
        <el-dialog v-model="isRealNameVerificationModalVisible" title="实名认证" @close="hideRealNameVerificationModal" custom-class="square-modal">
            <el-form :model="realNameForm" :rules="realNameRules" ref="realNameFormRef">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="realNameForm.name" placeholder="请输入您的姓名"></el-input>
                </el-form-item>
                <el-form-item label="身份证号码" prop="idCard">
                    <el-input v-model="realNameForm.idCard" placeholder="请输入您的身份证号码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitRealNameVerification" class="action-button">确认提交</el-button>
                </el-form-item>
            </el-form>
            <p v-if="realNameErrorMessage" class="error-message">{{ realNameErrorMessage }}</p>
            <p v-if="realNameSuccessMessage" class="success-message">{{ realNameSuccessMessage }}</p>
        </el-dialog>
    </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { ElMessage } from 'element-plus';
import { Edit } from '@element-plus/icons-vue';
import { defineComponent, reactive, ref, onMounted } from 'vue';

function percentEncode(str) {
    return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A');
}

function generateSignature(params, accessKeySecret) {
    const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
        .join('&');
    const stringToSign = `POST&%2F&${percentEncode(sortedParams)}`;
    const hmac = CryptoJS.HmacSHA1(stringToSign, `${accessKeySecret}&`);
    return hmac.toString(CryptoJS.enc.Base64);
}

export default {
    components: {
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
                accountId: '84',
                email: '',
                realNameStatus: '未认证', // 未认证和已认证两种结果
                class: ''
            },

            realNameForm: {
                name: '',
                idCard: ''
            },

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

            isRealNameVerificationModalVisible: false,
            realNameErrorMessage: '',
            realNameSuccessMessage: '',

            passwordRules: {
                oldPassword: [
                    { required: true, message: '请输入旧密码', trigger: 'blur' }
                ],
                newPassword: [
                    { required: true, message: '请输入新密码', trigger: 'blur' },
                    { min: 6, message: '新密码至少6位', trigger: 'blur' }
                ],
                confirmNewPassword: [
                    { required: true, message: '请再次输入新密码', trigger: 'blur' },
                    { validator: this.validateConfirmPassword, trigger: 'blur' }
                ]
            },

            realNameRules: {
                name: [
                    { required: true, message: '请输入姓名', trigger: 'blur' }
                ],
                idCard: [
                    { required: true, message: '请输入身份证号码', trigger: 'blur' },
                    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入有效的身份证号码', trigger: 'blur' }
                ]
            },

            emailRules: {
                newEmail: [
                    { required: true, message: '请输入新的邮箱地址', trigger: 'blur' },
                    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
                ],
                verificationCode: [
                    { required: true, message: '请输入验证码', trigger: 'blur' },
                    { len: 6, message: '验证码长度应为6位', trigger: 'blur' }
                ]
            }
        };
    },

    methods: {
        async fetchStudentInfo() {
            const accountId = parseInt(this.studentInfo.accountId, 10); // 将 accountId 转换为数字
            if (isNaN(accountId)) {
                this.showError('账号ID必须是一个有效的数字。');
                return;
            }

            console.log('Fetching student info for account ID:', accountId); // 打印 accountId 以确认其值

            try {
                const response = await axios.get(`/api/student/${accountId}`);
                if (response.status === 200) {
                    const studentData = response.data.data;
                    // 动态设置 realNameStatus
                    if (studentData.name) {
                        studentData.realNameStatus = '已认证';
                    } else {
                        studentData.realNameStatus = '未认证';
                    }
                    studentData.class = studentData.className;
                    delete studentData.className; // 删除 className 字段，避免重复
                    this.studentInfo = {
                        ...studentData,
                        accountId: accountId.toString()
                    };
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
            ElMessage.error(message);
        },

        toggleEdit(field) {
            if (field === 'nickname') {
                this.editNickname = !this.editNickname;
            } else if (field === 'grade') {
                this.editGrade = !this.editGrade;
            }
        },

        async saveEditedUserInfo() {
            try {
                // 构建请求体
                const requestBody = {
                    username: this.studentInfo.username,
                    name: this.studentInfo.name,
                    grade: this.studentInfo.grade
                };

                // 发送请求
                const response = await axios.post(`/api/student/${this.studentInfo.accountId}/editInformation`, requestBody, {
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
                        ElMessage.success("个人信息更新成功");
                        this.toggleEdit('nickname');
                        this.toggleEdit('grade');
                    } else {
                        // 后端返回的其他消息
                        ElMessage.warning(responseData.message);
                    }
                } else {
                    // 请求失败
                    ElMessage.error("个人信息更新失败");
                }
            } catch (error) {
                console.error("个人信息更新出错:", error);
                ElMessage.error("个人信息更新过程中出现错误，请稍后再试");
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
            try {
                const response = await axios.post(`/api/student/${this.studentInfo.accountId}/change-email/send-verification`, {
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
            }
        },
        async handleChangeEmail() {
            this.$refs.emailFormRef.validate(async (valid) => {
                if (valid) {
                    try {
                        const response = await axios.post(`/api/student/${this.studentInfo.accountId}/changeEmail`, {
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
                } else {
                    this.accountDeactivationErrorMessage = '账号注销失败，请稍后再试';
                    if (response.data && response.data.message) {
                        this.accountDeactivationErrorMessage += ' - ' + response.data.message;
                    }
                }
            } catch (error) {
                this.accountDeactivationErrorMessage = '账号注销失败，请检查网络连接或稍后再试';
                if (error.response && error.response.data && error.response.data.message) {
                    this.accountDeactivationErrorMessage += ' - ' + error.response.data.message;
                }
                console.error('账号注销失败:', error.response ? error.response.data : error.message);
            }
        },
        navigateToHome() {
            // 使用 Vue Router 进行页面重定向
            this.$router.push({ name: 'Home' });
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
                    this.studentInfo.class = response.data.data.className;
                    this.fetchStudentInfo(); // 重新获取学生信息
                    this.hideJoinClassModal();
                } else {
                    this.joinClassResultMessage = '加入班级失败';
                }
            } catch (error) {
                this.joinClassResultMessage = '加入班级失败，请检查您的网络连接或稍后再试';
                console.error('加入班级失败:', error.response ? error.response.data : error.message);
            }
        },

        showRealNameVerificationModal() {
            this.isRealNameVerificationModalVisible = true;
        },

        hideRealNameVerificationModal() {
            this.isRealNameVerificationModalVisible = false;
            this.realNameForm = {
                name: '',
                idCard: ''
            };
            this.realNameErrorMessage = '';
            this.realNameSuccessMessage = '';
        },

        async submitRealNameVerification() {
            try {
                const params = {
                    Action: 'Id2MetaVerify',
                    Format: 'json',
                    Version: '2019-03-07',
                    AccessKeyId: 'Access Key ID',
                    SignatureMethod: 'HMAC-SHA1',
                    Timestamp: new Date().toISOString().replace('Z', '+0000'),
                    SignatureVersion: '1.0',
                    SignatureNonce: Math.random().toString(36).substring(7),
                    ParamType: 'normal', // 添加 ParamType 参数
                    IdentifyNum: this.realNameForm.idCard, // 证件号码
                    UserName: this.realNameForm.name, // 姓名
                    CertType: 'IDENTITY_CARD', // 证件类型
                    ProductCode: 'authfaceverify',
                    RegionId: 'cn-hangzhou',
                };

                // 构建签名
                const signature = generateSignature(params, 'Access Key Secret');

                params.Signature = signature;

                console.log('Request Params:', params); // 调试信息
                console.log('Signature:', signature); // 调试信息

                const response = await axios.post(
                    'https://cloudauth.cn-hangzhou.aliyuncs.com/',
                    null, // 不需要请求体
                    {
                        params: params,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                );

                if (response.status === 200) {
                    const responseData = response.data;
                    console.log('Response Data:', responseData); // 调试信息

                    if (responseData.Id2MetaVerifyResponse && responseData.Id2MetaVerifyResponse.VerifyResult === 'PASS') {
                        this.realNameSuccessMessage = '实名认证成功';
                        this.realNameErrorMessage = ''; // 清除错误消息
                        this.fetchStudentInfo(); // 重新获取学生信息
                    } else {
                        this.realNameErrorMessage = '实名认证失败，请稍后再试';
                        if (responseData.Id2MetaVerifyResponse && responseData.Id2MetaVerifyResponse.VerifyMsg) {
                            this.realNameErrorMessage += ' - ' + responseData.Id2MetaVerifyResponse.VerifyMsg;
                        }
                    }
                } else {
                    this.realNameErrorMessage = '实名认证失败，请稍后再试';
                    if (response.data && response.data.Message) {
                        this.realNameErrorMessage += ' - ' + response.data.Message;
                    }
                }
            } catch (error) {
                this.realNameErrorMessage = '实名认证失败，请检查网络连接或稍后再试';
                if (error.response && error.response.data && error.response.data.Message) {
                    this.realNameErrorMessage += ' - ' + error.response.data.Message;
                }
                console.error('实名认证失败:', error.response ? error.response.data : error.message);
            }
        },
    },
    created() {
        this.fetchStudentInfo(); // 在组件创建时获取学生信息
    }
};

</script>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: linear-gradient(180deg, #f7f7f7 0%, #eaeaea 100%);
}

.main-container {
    display: flex;
    flex: 1;
    padding: 20px;
}

.content {
    max-width: 1000px;
    width: 100%;
    padding: 30px;
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    margin-right: 50px;
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
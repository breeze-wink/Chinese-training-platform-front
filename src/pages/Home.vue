<template>
    <div class="common-layout">
        <el-container class="common-layout">
            <el-header class="fixed-header">
                <div class="header-title">初中语文综合素养提升平台</div>
                <div class="header-buttons">
                    <el-button color="#626aef" :dark="isDark" @click="loginDialogVisible = true">登录</el-button>
                    <el-button color="#626aef" :dark="isDark" @click="registerDialogVisible = true">注册</el-button>
                </div>
            </el-header>

            <el-main>
                <el-scrollbar>
                    <el-carousel height="400px"><!--  走马灯部分-->
                        <el-carousel-item v-for="item in 3" :key="item">
                            <img class="carousel-image" src="../static/1.png" v-if="item === 1">
                            <img class="carousel-image" src="../static/2.png" v-if="item === 2">
                            <img class="carousel-image" src="../static/3.png" v-if="item === 3">
                        </el-carousel-item>
                    </el-carousel>

                    <!-- 诗词列表页面 -->
                    <div class="poetry-list-section">
                        <section class="poetry-list">
                            <div class="poetry-section">
                                <h1>必背古诗词</h1>
                                <h2>七年级上册</h2>
                                <div class="poem-grid">
                                    <div v-for="poem in poems_seven_upper" :key="poem.title" class="poem-item">
                                        <router-link :to="{ name: 'TouristPoem', params: { id: poem.title } }">
                                            <h3>{{ poem.title }}</h3>
                                        </router-link>
                                        <p>{{ poem.author }} | {{ poem.dynasty }}</p>
                                        <p>{{ poem.annotation }}</p>
                                    </div>
                                </div>
                                <h2>七年级下册</h2>
                                <div class="poem-grid">
                                    <div v-for="poem in poems_seven_lower" :key="poem.title" class="poem-item">
                                        <router-link :to="{ name: 'TouristPoem', params: { id: poem.title } }">
                                            <h3>{{ poem.title }}</h3>
                                        </router-link>
                                        <p>{{ poem.author }} | {{ poem.dynasty }}</p>
                                        <p>{{ poem.annotation }}</p>
                                    </div>
                                </div>
                                <h2>八年级上册</h2>
                                <div class="poem-grid">
                                    <div v-for="poem in poems_eight_upper" :key="poem.title" class="poem-item">
                                        <router-link :to="{ name: 'TouristPoem', params: { id: poem.title } }">
                                            <h3>{{ poem.title }}</h3>
                                        </router-link>
                                        <p>{{ poem.author }} | {{ poem.dynasty }}</p>
                                        <p>{{ poem.annotation }}</p>
                                    </div>
                                </div>
                                <h2>八年级下册</h2>
                                <div class="poem-grid">
                                    <div v-for="poem in poems_eight_lower" :key="poem.title" class="poem-item">
                                        <router-link :to="{ name: 'TouristPoem', params: { id: poem.title } }">
                                            <h3>{{ poem.title }}</h3>
                                        </router-link>
                                        <p>{{ poem.author }} | {{ poem.dynasty }}</p>
                                        <p>{{ poem.annotation }}</p>
                                    </div>
                                </div>
                                <h2>九年级上册</h2>
                                <div class="poem-grid">
                                    <div v-for="poem in poems_nine_upper" :key="poem.title" class="poem-item">
                                        <router-link :to="{ name: 'TouristPoem', params: { id: poem.title } }">
                                            <h3>{{ poem.title }}</h3>
                                        </router-link>
                                        <p>{{ poem.author }} | {{ poem.dynasty }}</p>
                                        <p>{{ poem.annotation }}</p>
                                    </div>
                                </div>
                                <h2>九年级下册</h2>
                                <div class="poem-grid">
                                    <div v-for="poem in poems_nine_lower" :key="poem.title" class="poem-item">
                                        <router-link :to="{ name: 'TouristPoem', params: { id: poem.title } }">
                                            <h3>{{ poem.title }}</h3>
                                        </router-link>
                                        <p>{{ poem.author }} | {{ poem.dynasty }}</p>
                                        <p>{{ poem.annotation }}</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </el-scrollbar>
            </el-main>

            <el-dialog v-model="loginDialogVisible"
                       title="登录"
                       width="500px"
                       align-center
                       :close-on-click-modal="false">

                <el-form label-position="top" class="login-form">
                    <el-radio-group v-model="Identity" style="margin-bottom: 30px">
                        <el-radio-button value="student">学生</el-radio-button>
                        <el-radio-button value="teacher">教师</el-radio-button>
                        <el-radio-button value="sch-adm">学校管理员</el-radio-button>
                        <el-radio-button value="sys-adm">系统管理员</el-radio-button>
                    </el-radio-group>

                    <el-form-item class="form-item">
                        <el-input
                            v-model="account"
                            style="width: 280px"
                            placeholder="输入邮箱/用户名"
                            :prefix-icon="User">
                        </el-input>
                    </el-form-item>
                    <el-form-item class="form-item">
                        <el-input
                            v-model="password"
                            style="width: 280px"
                            type="password"
                            placeholder="输入密码"
                            show-password
                        >
                        </el-input>
                    </el-form-item>
                    <el-form-item class="form-item">
                        <el-checkbox>记住密码</el-checkbox>
                        <a href="#" style="float: right;" @click="forgotPasswordDialogVisible = true">忘记密码</a>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button type="primary" class="custom-button" @click="login">登 录</el-button>
                </div>
            </el-dialog>

            <!--            找回密码-->
            <el-dialog v-model="forgotPasswordDialogVisible"
                       title="找回密码"
                       width="510px"
                       align-center
            >

                <el-steps style="max-width: 500px; margin-bottom: 60px" :active="active"
                          finish-status="success" simple>
                    <el-step title="验证邮箱"/>
                    <el-step title="重置密码"/>
                    <el-step title="重置成功"/>
                </el-steps>


                <el-form label-position="right" label-width="120px" class="form-item">
                    <!-- Step1 -->
                    <div v-if="active === 1">
                        <el-form-item label="邮箱" class="form-item">
                            <el-input v-model="email" placeholder="请输入您的邮箱" style="width: 250px"></el-input>
                        </el-form-item>

                        <el-form-item label="验证码" class="form-item">
                            <el-input v-model="verifyCode" placeholder="请输入验证码" style="width: 150px"></el-input>
                            <el-button>发送验证码</el-button>
                        </el-form-item>
                    </div>
                    <!-- Step2 -->
                    <div v-if="active === 2">
                        <el-form-item label="新密码" class="form-item">
                            <el-input v-model="email" placeholder="请输入新密码" style="width: 250px"></el-input>
                        </el-form-item>

                        <el-form-item label="确认新密码" class="form-item">
                            <el-input v-model="verifyCode" placeholder="请重复输入密码" style="width: 250px"></el-input>
                        </el-form-item>
                    </div>
                    <!-- Step3 -->
                    <div v-if="active === 3" class="center-text">
                        <p>成功重置密码</p>
                    </div>
                    <!-- 其他表单项 -->
                </el-form>

                <div slot="footer" class="dialog-footer1">
                    <el-button v-if="active > 1 && active < 3" @click="front">frontStep</el-button>
                    <el-button v-if="active < 3" @click="next">nextStep</el-button>
                    <el-button v-if="active === 3" @click="goToOwnPage" type="primary" class="custom-button">进入平台
                    </el-button>
                </div>
            </el-dialog>

            <!-- 注册浮窗 -->
            <el-dialog
                    v-model="registerDialogVisible"
                    title="注册"
                    width="500px"
                    align-center
                    :close-on-click-modal="false">

              <el-tabs v-model="activeTab">
                <el-tab-pane label="学生" name="student">
                  <el-form :model="registerForm.student" :rules="rules" ref="registerFormStudent"
                           label-width="170px">
                    <el-form-item prop="email" label="邮箱">
                      <el-input v-model="registerForm.student.email" placeholder="邮箱"
                                size="large"></el-input>
                    </el-form-item>
                    <div style="display: flex">
                      <el-form-item prop="code" label="验证码" style="width: auto;">
                        <el-input v-model="registerForm.student.code" placeholder="验证码" size="large"
                                  class="input-wid"></el-input>
                      </el-form-item>
                      <el-button :disabled="countdown.value > 0" @click="sendVerificationCode('student')">
                        {{ codeButtonText }}
                      </el-button>
                    </div>
                    <el-form-item prop="username" label="用户名">
                      <el-input v-model="registerForm.student.username" placeholder="用户名"
                                size="large"></el-input>
                    </el-form-item>
                    <el-form-item prop="password" label="密码">
                      <el-input type="password" v-model="registerForm.student.password" placeholder="密码"
                                size="large"></el-input>
                    </el-form-item>
                    <el-form-item prop="checkPass" label="确认密码">
                      <el-input type="password" v-model="registerForm.student.checkPass"
                                placeholder="再次输入密码" size="large"></el-input>
                    </el-form-item>
                    <div class="sign-up-btn">
                      <el-button size="large" type="primary"
                                 @click="submitForm('registerFormStudent', 'student')">注册
                      </el-button>
                    </div>
                  </el-form>
                </el-tab-pane>
                <el-tab-pane label="教师" name="teacher">
                  <el-form :model="registerForm.teacher" :rules="rules" ref="registerFormTeacher"
                           label-width="170px">
                    <el-form-item prop="AuthorizationCode" label="授权码">
                      <el-input v-model="registerForm.teacher.AuthorizationCode" placeholder="授权码"
                                size="large"></el-input>
                    </el-form-item>
                    <el-form-item prop="email" label="邮箱">
                      <el-input v-model="registerForm.teacher.email" placeholder="邮箱"
                                size="large"></el-input>
                    </el-form-item>
                    <div style="display: flex">
                      <el-form-item prop="code" label="验证码" style="width: auto;">
                        <el-input v-model="registerForm.teacher.code" placeholder="验证码" size="large"
                                  class="input-wid"></el-input>
                      </el-form-item>
                      <el-button :disabled="countdown.value > 0" @click="sendVerificationCode('teacher')">
                        {{ codeButtonText }}
                      </el-button>
                    </div>
                    <el-form-item prop="password" label="密码">
                      <el-input type="password" v-model="registerForm.teacher.password" placeholder="密码"
                                size="large"></el-input>
                    </el-form-item>
                    <el-form-item prop="checkPass" label="确认密码">
                      <el-input type="password" v-model="registerForm.teacher.checkPass"
                                placeholder="再次输入密码" size="large"></el-input>
                    </el-form-item>
                    <div class="sign-up-btn">
                      <el-button size="large" type="primary"
                                 @click="submitForm('registerFormTeacher', 'teacher')">注册
                      </el-button>
                    </div>
                  </el-form>
                </el-tab-pane>
              </el-tabs>
            </el-dialog>
        </el-container>
    </div>
</template>

<script setup>
import axios from 'axios'
import {User} from "@element-plus/icons-vue";
import {useStore} from 'vuex'; // 引入 useStore 来使用 Vuex
import { ref, watch, onMounted, reactive, getCurrentInstance, computed } from 'vue';

import {ElMessage} from "element-plus";
import {useRouter} from 'vue-router'; //引入路由
import { poems_seven_upper, poems_seven_lower, poems_eight_upper, poems_eight_lower, poems_nine_upper, poems_nine_lower } from '@/store/poems';


const store = useStore(); // 获取 Vuex Store 实例
const router = useRouter(); // 获取 Vue Router 实例

const {proxy} = getCurrentInstance(); // 获取组件实例
const isDark = ref(false)
const loginDialogVisible = ref(false)
const forgotPasswordDialogVisible = ref(false)
const registerDialogVisible = ref(false)

const Identity = ref('student')
const account = ref('')
const password = ref('')
const email = ref('')
const verifyCode = ref('')
const realVerifyCode = ref('')
const active = ref(1)
const activeTab = ref('student')

const urls = {
    'student': '/api/student/login',
    'teacher': '/api/teacher/login',
    'sch-adm': '/api/school-admin/login',
    'sys-adm': '/api/system-admin/login',
}

watch(Identity, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    account.value = '';
    password.value = '';
  }
});

// 观察 activeTab 的变化，当变化时重置表单数据
watch(activeTab, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    // 重置学生表单数据
    if (newValue === 'student') {
      registerForm.value.student.email = '';
      registerForm.value.student.code = '';
      registerForm.value.student.password = '';
      registerForm.value.student.checkPass = '';
      registerForm.value.student.username = '';
    }
    // 重置教师表单数据
    else if (newValue === 'teacher') {
      registerForm.value.teacher.AuthorizationCode = '';
      registerForm.value.teacher.email = '';
      registerForm.value.teacher.code = '';
      registerForm.value.teacher.password = '';
      registerForm.value.teacher.checkPass = '';
      registerForm.value.teacher.schoolId = '';
    }
  }
});

const registerForm = ref({
    student: {
        email: '',
        code: '',
        password: '',
        checkPass: '',
        username: ''
    },
    teacher: {
        AuthorizationCode: '',
        email: '',
        code: '',
        password: '',
        checkPass: '',
        schoolId: ''
    }
});

const rules = ref({
    AuthorizationCode: [
        {required: true, message: '请输入授权码', trigger: 'blur'}
    ],
    username: [
        {required: true, message: '请输入用户名', trigger: 'blur'}
    ],
    password: [
        {required: true, message: '请输入密码', trigger: 'blur'},
        {min: 6, message: '密码至少 6 位', trigger: 'blur'}
    ],
    checkPass: [
        {required: true, message: '请再次输入密码', trigger: 'blur'},
        {validator: validatePassword, trigger: 'blur'}
    ],
    email: [
        {required: true, message: '请输入邮箱地址', trigger: 'blur'},
        {type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}
    ],
    code: [
        {required: true, message: '请输入验证码', trigger: 'blur'}
    ]
})

const sendingCode = ref(false)
const countdown = ref(60)
const codeButtonText = ref('获取验证码')
const smsLoading = ref(false)
const verificationCode = ref(''); // 用于存储后端返回的验证码

const next = () => {
    if (active.value++ > 2) active.value = 0
}
const front = () => {
    if (active.value-- < 1) active.value = 0
}

const login = async () => {
    const url = urls[Identity.value];
    if(account.value===""||password.value===""){
        ElMessage({
            message: '信息未填写完整',
            type: 'warning',
        })
        return; // 提前返回，阻止后续逻辑执行
    }
    try {
        const response = await axios.post(url, {
            account: account.value,
            password: password.value
        });

        // 检查响应状态码和消息
        if (response.status === 200 ) {
            console.log("登录成功:", response.data.id);
            //使用vuex更新用户信息
            await store.dispatch('login', {
                id: response.data.id,
                role: Identity.value,
                token: response.data.token,
                permission: response.data.permission // 使用正确的字段名
        });

            const permission = response.data.permission;
            console.log('token:', response.data.token);
            console.log('permission:', permission);
            loginDialogVisible.value = false; // 登录成功后关闭对话框

            if (Identity.value === 'teacher') {
                if (permission === 0) {
                    await router.push({name: 'TeacherPersonalInfo'}); // 跳转到教师管理页面
                } else if (permission === 1) {
                    await router.push({name: 'AuditTeacherPersonalInfo'});
                }
            } else if (Identity.value === 'student') {
                await router.push({name: 'StudentPersonalInfo'}); // 跳转到学生学习页面
            } else if (Identity.value === 'sys-adm') {
              await router.push({name: 'name'});
            } else if (Identity.value === 'sch-adm') {
              await router.push({name: 'AuthorizationCode'});
            }
        } else if (response.status === 401 ){
            // 处理非200状态码的情况
            console.error("登录失败:", response.data.message);
            ElMessage.error(response.data.message);

        }
    } catch (error){
        // 处理错误
        console.error('登录请求失败:', error.message);
        ElMessage.error('用户名密码不正确');
        // 这里可以添加更多的错误处理逻辑，比如显示错误信息等
    }

}

function handleLoginKeydown(event) {
    if (event.key === "Enter") {
        this.login(); // 调用登录方法
    }
}

function handleRegisterKeydown(event) {
    if (event.key === "Enter") {
        // 根据当前选中的注册类型调用对应的提交方法
        if (this.activeTab === "student") {
            this.submitForm("registerFormStudent", "student");
        } else if (this.activeTab === "teacher") {
            this.submitForm("registerFormTeacher", "teacher");
        }
    }
}

const sendVerification = async () => {
    try {
        const response = await axios.post('/api/student/send-verification', {
            email: email.value
        });
        // 检查响应状态码和消息
        if (response.status === 200) {
            realVerifyCode.value = response.data.verificationCode;
            console.log(realVerifyCode.value);
            // 这里可以添加更多的登录成功后的操作，比如保存用户信息等
        } else {
            // 处理非200状态码的情况
            console.error("发送失败:", response.data.message);
        }
    } catch (error) {
        // 处理错误
        console.error('登录请求失败:', error.message);
        // 这里可以添加更多的错误处理逻辑，比如显示错误信息等
    }
}
const verifyIdentity = async () => {
    const url = urls[Identity.value];

    try {
        const response = await axios.post('/api/student/login', {
            account: account.value,
            password: password.value
        });
        // 检查响应状态码和消息
        if (response.status === 200 && response.data.message === "success") {
            console.log("登录成功:", response.data.id);
            loginDialogVisible.value = false; // 登录成功后关闭对话框
            // 这里可以添加更多的登录成功后的操作，比如保存用户信息等
        } else {
            // 处理非200状态码的情况
            console.error("登录失败:", response.data.message);
        }
    } catch (error) {
        // 处理错误
        console.error('登录请求失败:', error.message);
        // 这里可以添加更多的错误处理逻辑，比如显示错误信息等
    }
}

const goToOwnPage = () => {

}

function validatePassword(rule, value, callback) {
    if (value !== (activeTab.value === 'student' ? registerForm.value.student.password : registerForm.value.teacher.password)) {
        callback(new Error('两次输入密码不一致!'))
    } else {
        callback()
    }
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

async function sendVerificationCode(userType) {
    if (sendingCode.value) return;
    sendingCode.value = true;
    smsLoading.value = true;
    countdown.value = 60;

    const form = activeTab.value === 'student' ? registerForm.value.student : registerForm.value.teacher

    if (!validateEmail(form.email)) {
        alert('请输入正确的邮箱地址');
        sendingCode.value = false;
        smsLoading.value = false;
        return;
    }

    try {
        let url = '/api/student/send-verification';
        let payload = {email: form.email};

        if (userType === 'teacher') {
            url = '/api/teacher/send-verification';
            payload = {authorizationCode: form.AuthorizationCode, email: form.email};
        }

        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {

            verificationCode.value = response.data.verificationCode; // 存储验证码
            if (userType === 'teacher' && response.data.schoolId) {
                registerForm.value.teacher.schoolId = response.data.schoolId;
            }
            // console.log(verificationCode.value);
            // alert(`验证码已发送: ${verificationCode.value}`);
            startCountdown();
        } else {
            const errorMessage = response.data.message || '验证码发送失败，请稍后再试';
            console.error('验证码发送失败:', errorMessage);
            alert(errorMessage);
        }
    } catch (error) {
        console.error('网络错误:', error.response ? error.response.data : error.message);
        alert('网络错误，请稍后再试');
    } finally {
        sendingCode.value = false;
        smsLoading.value = false;
    }
}

function startCountdown() {
    const timer = setInterval(() => {
        if (countdown.value > 0) {
            countdown.value--;
            codeButtonText.value = `${countdown.value}s 后重新获取`;
        } else {
            clearInterval(timer);
            codeButtonText.value = '重新获取验证码';
        }
    }, 1000)
}

async function submitForm(formName, userType) {
    if (!proxy.$refs[formName]) {
        console.error(`表单引用 ${formName} 未找到`);
        return;
    }

    proxy.$refs[formName].validate(async (valid) => {
        if (valid) {
            const form = activeTab.value === 'student' ? registerForm.value.student : registerForm.value.teacher;

            if (form.code !== verificationCode.value) {
                alert('验证码不正确，请重新输入');
                return;
            }

            try {
                let url = '/api/student/register';
                let payload = {
                    email: form.email,
                    username: form.username,
                    password: form.password,
                    confirmPassword: form.checkPass
                };

                if (userType === 'teacher') {
                    url = '/api/teacher/register';
                    payload = {
                        email: form.email,
                        password: form.password,
                        confirmPassword: form.checkPass,
                        schoolId: form.schoolId
                    };
                }

                console.log('提交的数据:', payload); // 打印请求体数据

                const response = await axios.post(url, payload, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // 打印完整的响应对象
                console.log('后端响应:', response);

                // 检查响应状态码和消息
                if (response.status === 200) {
                    if (response.data.message === "注册成功") {
                        alert('注册成功！');
                        registerDialogVisible.value = false;
                    } else {
                        console.error('后端返回的消息不是 "注册成功"', response.data);
                        alert('注册失败，请检查信息');
                    }
                } else if (response.status === 400) {
                    const errorMessage = response.data.message || '注册失败，请检查信息';
                    console.error('注册失败:', errorMessage);
                    alert(errorMessage);
                } else {
                    console.error('未知错误:', response);
                    alert('未知错误，请稍后再试');
                }
            } catch (error) {
                console.error('注册请求失败:', error.response ? error.response.data : error.message);
                alert('网络错误，请稍后再试');
            }
        } else {
            console.log('error submit!!');
            return false;
        }
    });
}

</script>

<style scoped>
.common-layout .el-container {
    width: 100%;
}

.common-layout .el-header.fixed-header {
    position: fixed;
    top: 0;
    width: 100%; /* 确保header宽度与容器相同 */
    background-color: var(--el-color-primary-light-7);
    color: var(--el-text-color-primary);
    z-index: 1000;
    display: flex;
    justify-content: space-between;;
    align-items: center;
    padding: 0 80px; /* 根据需要调整padding */
}

.header-content {
    display: flex;
    justify-content: flex-end; /* 按钮靠右 */
    align-items: center;
}

.header-title {
    font-size: 16px; /* 根据需要调整字体大小 */
    font-weight: bold; /* 使文字加粗 */
}

.header-buttons {
    display: flex;
    gap: 10px; /* 根据需要调整按钮之间的间距 */
}

.common-layout .el-main {
    padding-top: 60px; /* 为header的高度留出空间 */
    width: 100%;
    background-color: #ffffff;
    height: 2600px;
}

.common-layout .el-scrollbar {
    width: 100%; /* 确保scrollbar宽度与main相同 */
}

.common-layout .el-container {
    width: 100%;
}

.carousel-image {
    width: 100%; /* 使图片宽度填满carousel-item */
    height: 100%; /* 使图片高度填满carousel-item */
    object-fit: fill; /* 确保图片按比例填充 */
}

.login-form {
    display: flex;
    flex-direction: column;
    justify-content: center; /* 垂直居中 */
    align-items: center; /* 水平居中 */
    height: 100%; /* 使表单占满整个对话框的高度 */
}


.dialog-footer .el-button {
    margin-left: 10px;
}

.form-item {
    margin-bottom: 30px;
}

.dialog-footer {
    display: flex;
    justify-content: center;
}

.dialog-footer1 {
    margin-top: 50px;
    display: flex;
    justify-content: center;
}

.dialog-footer .el-button {
    margin-left: 10px;
}

/* 使忘记密码链接对齐到右侧 */
.el-form-item__content a {
    margin-left: 80px; /* 为忘记密码链接添加左边距 */
}

.custom-button {
    height: 40px; /* 设置按钮的高度 */
    line-height: 40px; /* 设置按钮文本的垂直居中 */
    width: 300px; /* 设置按钮的宽度 */
    border-radius: 16px; /* 设置圆角 */
    font-size: 16px; /* 调整字体大小 */
    padding: 10px 20px; /* 调整按钮内边距 */
    font-weight: bold; /* 使字体加粗 */
}

.view-members-button {
    background-color: #c8f0c8; /* 绿色背景 */
    color: #2f8f2f; /* 绿色字体 */
}

.view-stats-button {
    background-color: #c8e1ff; /* 浅蓝色背景 */
    color: #2f5f8f; /* 深蓝色字体 */
}


.disband-button {
    background-color: #f8c8c8; /* 红色背景 */
    color: #8f2f2f; /* 红色字体 */
}

.centered-form .el-form-item {
    display: flex;
    align-items: center; /* 垂直居中 */
    justify-content: center; /* 水平居中 */
    width: 90%; /* 使表单项宽度填满父容器 */
    margin-top: 20px; /* 增加表单项之间的间距 */
    margin-bottom: 0px; /* 增加表单项之间的间距 */
}

.center-text {
    margin-top: 100px;
    margin-bottom: 100px;
    text-align: center;
    font-size: 24px; /* 你可以根据需要调整字体大小 */
}

.sign-up-btn {
    text-align: center; /* 使按钮居中 */
    margin-top: 1em; /* 添加一些顶部间距 */
}

/* 美化按钮 */
.sign-up-btn .el-button {
    padding: 12px 32px; /* 增加内边距，使按钮更大 */
    font-size: 18px; /* 增加字体大小 */
    border-radius: 8px; /* 圆角 */
    transition: all 0.3s ease; /* 平滑过渡效果 */
}

.sign-up-btn .el-button:hover {
    background-color: #4d5aff; /* 鼠标悬停时改变背景颜色 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
}

.page-container {
    display: flex;
    flex-wrap: wrap;
    grid-template-columns: auto minmax(auto, 800px);
    gap: 2rem;
}

.main-container {
    display: flex;
    flex-grow: 1;
    flex-basis: calc(100% - 200px); /* 减去 sidebar 宽度 */
}

/* 主要内容区域 */
.content {
    background-color: #f4f4f9;
    border-radius: 5px;
    padding: 2rem;
}

/* 古诗词网格布局 */
.poem-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 调整列数以适应诗歌数量 */
    gap: 1rem;
}

/* 单个诗歌项 */
.poem-item {
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 1rem;
}

/* 标题样式 */
h1,
h2,
h3 {
    font-family: "Roboto Slab", serif; /* 使用更美观的字体 */
    margin-bottom: 0.5rem;
}

h1 {
    color: #333;
    font-size: 2rem;
}

h2 {
    color: #666;
    font-size: 1.5rem;
}

h3 {
    color: #777;
    font-size: 1.2rem;
}

/* 段落文本样式 */
p {
    font-family: kaiti, sans-serif;
    line-height: 1.6;
    color: #444;
}
</style>
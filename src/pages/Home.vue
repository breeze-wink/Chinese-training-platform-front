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
                        <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
                        <a href="#" style="float: right;" @click="forgotPasswordDialogVisible = true">忘记密码</a>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button type="primary" class="custom-button" @click="login">登 录</el-button>
                </div>
            </el-dialog>

            <!--            找回密码-->
            <el-dialog v-model="forgotPasswordDialogVisible" title="找回密码" width="510px" align-center>
                <el-steps :active="active" finish-status="success" simple style="max-width: 500px; margin-bottom: 60px">
                    <el-step title="验证邮箱"/>
                    <el-step title="重置密码"/>
                    <el-step title="重置成功"/>
                </el-steps>

                <el-form ref="formRef" :model="formData" :rules="rules" label-position="right" label-width="120px" class="form-item">
                    <!-- Step1 -->
                    <div v-if="active === 1">
                        <el-form-item prop="email" label="邮箱" class="form-item">
                            <el-input v-model="formData.email" placeholder="请输入您的邮箱" style="width: 250px"></el-input>
                        </el-form-item>

                        <el-form-item prop="verifyCode" label="验证码" class="form-item">
                            <el-input v-model="formData.verifyCode" placeholder="请输入验证码" style="width: 150px"></el-input>
                            <el-button @click="sendVerificationCodeFor" :disabled="countdownFor.value > 0">{{ codeButtonTextFor }}</el-button>
                        </el-form-item>
<!--                        <el-button type="primary" @click="nextStep">下一步</el-button>-->
                    </div>

                    <!-- Step2 -->
                    <div v-if="active === 2">
                        <el-form-item prop="newPassword" label="新密码" class="form-item">
                            <el-input v-model="formData.newPassword" placeholder="请输入新密码" style="width: 250px" type="password"></el-input>
                        </el-form-item>

                        <el-form-item prop="confirmPassword" label="确认新密码" class="form-item">
                            <el-input v-model="formData.confirmPassword" placeholder="请重复输入密码" style="width: 250px" type="password"></el-input>
                        </el-form-item>

                    </div>

                    <!-- Step3 -->
                    <div v-if="active === 3" class="center-text">
                        <p>成功重置密码</p>
                    </div>
                </el-form>

                <div slot="footer" class="dialog-footer1">
                    <el-button v-if="active > 1 && active < 3" @click="front">上一步</el-button>
                    <el-button v-if="active > 0 && active < 3" @click="handleClick">下一步</el-button>
                    <el-button v-if="active === 3" @click="goToOwnPage" type="primary" class="custom-button">确定
                    </el-button>
                </div>
            </el-dialog>

          <!-- 注册浮窗 -->
          <el-dialog
              v-model="registerDialogVisible"
              title="注册"
              width="500px"
              align-center
              @close="handleRegisterClose"
              :close-on-click-modal="false">

            <el-tabs v-model="activeTab">
              <el-tab-pane label="学生" name="student">
                <el-form :model="registerForm.student" :rules="rules" ref="registerFormStudent"
                         label-width="100px" style="margin-right: 30px">
                  <el-form-item prop="email" label="邮箱">
                    <el-input v-model="registerForm.student.email" placeholder="邮箱"
                              size="large"></el-input>
                  </el-form-item>
                  <div style="display: flex">
                    <el-form-item prop="code" label="验证码" style="width: auto;">
                      <el-input v-model="registerForm.student.code" placeholder="验证码" size="large"
                                class="input-wid"></el-input>
                    </el-form-item>
                    <el-button :disabled="countdown.value > 0" style="height:40px;margin-left: 10px " @click="sendVerificationCode('student')">
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
                         label-width="100px" style="margin-right: 30px">
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
                    <el-button :disabled="countdown.value > 0" style="height: 40px;margin-left: 10px" @click="sendVerificationCode('teacher')">
                      {{ codeButtonText  }}
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

import {ElMessage, ElNotification} from "element-plus";
import {useRouter} from 'vue-router'; //引入路由
import { poems_seven_upper, poems_seven_lower, poems_eight_upper, poems_eight_lower, poems_nine_upper, poems_nine_lower } from '@/store/poems';
import {onBeforeUnmount} from "vue-demi";


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
const formRef = ref(null);
const formData = reactive({
    email: '',
    verifyCode: '',
    newPassword: '',
    confirmPassword: ''
});
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

const validateUsername = (rule, value, callback) => {
    const usernameRegex = /^[a-zA-Z0-9_]+$/; // 正则表达式：匹配字母、数字和下划线
    // 允许中文、字母（大小写）、数字和下划线
    // const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/;
    if (!value) {
        callback(new Error('请输入用户名'));
    } else if (!usernameRegex.test(value)) {
        callback(new Error('用户名只能包含字母、数字和下划线'));
    } else {
        callback(); // 验证通过
    }
};

const rules = ref({
    AuthorizationCode: [
        {required: true, message: '请输入授权码', trigger: 'blur'}
    ],
    username: [
        {required: true, message: '请输入用户名', trigger: 'blur'},
        {validator: validateUsername, trigger: 'blur'} // 添加自定义验证规则
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
    ],
    verifyCode: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { len: 6, message: '验证码应为6位数字', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码至少6位', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value !== formData.newPassword) {
                    callback(new Error('两次输入的密码不匹配'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ]
})

const sendingCode = ref(false)
const verificationCode = ref(''); // 用于存储后端返回的验证码

const next = () => {
    if (active.value++ > 2) active.value = 0
}
const front = () => {
    if (active.value-- < 1) active.value = 0
}

const rememberMe = ref(true);
const login = async () => {
    const url = urls[Identity.value];
    if (account.value === "" || password.value === "") {
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
        if (response.status === 200) {
            ElNotification.success({title: '成功', message: '登录成功'});
            //使用vuex更新用户信息
            await store.dispatch('login', {
                id: response.data.id,
                role: response.data.permission === 1 ? 'audit-teacher' : Identity.value,
                token: response.data.token,
                permission: response.data.permission // 使用正确的字段名
            });

            const permission = response.data.permission;
            loginDialogVisible.value = false; // 登录成功后关闭对话框

            if (rememberMe.value) {
              // 存储凭证
              localStorage.setItem('account', account.value);
              localStorage.setItem('password', password.value);
              localStorage.setItem('role', Identity.value);
            }

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
            ElNotification.error({ title: '失败', message: response.data.message });
        }
    } catch (error){
        // 处理错误
        ElNotification.error({ title: '失败', message: '用户名密码不正确' });
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

const emit = defineEmits(['login', 'register']);
const handleEnter = (event) => {
    if (event.key === "Enter") {
        if (loginDialogVisible.value && !forgotPasswordDialogVisible.value && !registerDialogVisible.value) {
            login();
        }

        // 注册窗口的 Enter 键逻辑
        if (registerDialogVisible.value && !loginDialogVisible.value && !forgotPasswordDialogVisible.value) {
            if (activeTab.value === "student") {
                submitForm("registerFormStudent", "student");
            } else if (activeTab.value === "teacher") {
                submitForm("registerFormTeacher", "teacher");
            }
        }
    }
};

// 监听全局键盘事件
const handleKeydown = (event) => {
    if (event.key === "Enter") {
        handleEnter(event);
    }
};

watch([loginDialogVisible, registerDialogVisible], ([loginVisible, registerVisible]) => {
    if (loginVisible || registerVisible) {
        window.addEventListener("keydown", handleEnter); // 添加监听
    } else {
        window.removeEventListener("keydown", handleEnter); // 移除监听
    }
});

onMounted(() => {
  const storedAccount = localStorage.getItem('account');
  const storedPassword = localStorage.getItem('password');
  const role = localStorage.getItem('role');

  if (storedAccount && storedPassword) {
    account.value = storedAccount;
    password.value = storedPassword;
    Identity.value = role;
    rememberMe.value = true;
  }
});
const sendVerification = async () => {
    try {
        const response = await axios.post('/api/student/send-verification', {
            email: email.value
        });
        // 检查响应状态码和消息
        if (response.status === 200) {
            realVerifyCode.value = response.data.verificationCode;
            // 这里可以添加更多的登录成功后的操作，比如保存用户信息等
        } else {
            // 处理非200状态码的情况
            ElNotification.error({ title: '发送失败', message: response.data.message });
        }
    } catch (error) {
        // 处理错误
        ElNotification.error({ title: '登录请求失败', message: error.message });
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
            loginDialogVisible.value = false; // 登录成功后关闭对话框
        } else {
            // 处理非200状态码的情况
            ElNotification.error({ title: '登录失败', message: response.data.message });
        }
    } catch (error) {
        // 处理错误
        ElNotification.error({ title: '登录请求失败', message: error.message });
    }
}

const goToOwnPage = () => {
    location.reload(); // 刷新当前页面
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
const countdown = ref(60)
const codeButtonText = ref('获取验证码')
let timer; // 用于存储定时器ID
let isCountingDown = ref(false); // 标记是否正在倒计时
function startCountdown() {
  clearInterval(timer); // 清除任何现有的定时器
  isCountingDown.value = true;
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timer);
      resetCountdown();
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
    codeButtonText.value = registerDialogVisible.value ? '重新获取验证码' : '获取验证码';
    resetCountdown();
  }
});

async function sendVerificationCode(userType) {
  if (isCountingDown.value) return;

  const form = activeTab.value === 'student' ? registerForm.value.student : registerForm.value.teacher

  if (!validateEmail(form.email)) {
    ElNotification.error({ title: '邮箱错误', message: '请输入正确的邮箱地址' });
    return;
  }

  startCountdown();

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

      if (userType === 'teacher' && response.data.schoolId) {
        registerForm.value.teacher.schoolId = response.data.schoolId;
      }

    } else {
      const errorMessage = response.data.message || '验证码发送失败，请稍后再试';
      ElNotification.error({ title: '邮箱错误', message: errorMessage });
      resetCountdown();
    }
  } catch (error) {
    ElNotification.error({ title: '验证码发送失败:', message: error.response ? error.response.data.message : error.message });
    resetCountdown();

  }
}

//forget password
const countdownFor = ref(60)
const codeButtonTextFor = ref('获取验证码')
let timerFor; // 用于存储定时器ID
let isCountingDownFor = ref(false); // 标记是否正在倒计时
function startCountdownFor() {
  clearInterval(timerFor); // 清除任何现有的定时器
  isCountingDownFor.value = true;
  timerFor = setInterval(() => {
    if (countdownFor.value > 0) {
      countdownFor.value--;
    } else {
      clearInterval(timerFor);
      resetCountdownFor();
    }
  }, 1000);
}
function resetCountdownFor() {
  clearInterval(timerFor);
  countdownFor.value = 60;
  isCountingDownFor.value = false;
}


// 使用 watch 监听 countdown 的变化并更新按钮文本
watch(countdownFor, (newVal) => {
  if (newVal > 0 && newVal < 60) {
    codeButtonTextFor.value = `${newVal}s 后重新获取`;
  } else {
    codeButtonTextFor.value = forgotPasswordDialogVisible.value ? '重新获取验证码' : '获取验证码';
    resetCountdownFor();
  }
});

const handleRegisterClose = () => {
  registerDialogVisible.value = false;
}

// 找回密码发送验证码
const sendVerificationCodeFor = async () => {
    if (isCountingDownFor.value) return;
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      ElNotification.error({ title: '邮箱错误', message: '请输入正确的邮箱地址' });
      return;
    }
    startCountdownFor();

    try {
        sendingCode.value = true;
        const response = await axios.post(`api/find-password/send-code`, {
            type: Identity.value, // 根据身份选择类型
            email: formData.email
        });
        if (response.status === 200) {
            // 验证码发送成功后的逻辑
            ElNotification.success({ title: '验证码已发送', message: '验证码已发送，请注意查收' });
        }
    } catch (error) {
        console.error('Error occurred while sending verification code:', error);
        ElNotification.error({ title: '验证码发送失败', message: '验证码发送失败，请稍后再试' });
        resetCountdownFor(); // 发送失败时重置倒计时
    }
};
const nextStep = () => {
    if (active.value === 1) {
        formRef.value.validateField(['email', 'verifyCode'], (valid) => {
            if (valid) {
                next(); // 如果验证通过，则执行下一步
            } else {
                console.log('验证失败');
            }
        });
    } else {
        next(); // 对于其他步骤直接调用 next 方法
    }
};

let passwordResetSuccess = false;
// 重置密码
const resetPassword = () => {
    formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const response = await axios.post(`api/find-password/reset-password`, {
                    type: Identity.value,
                    email: formData.email,
                    code: formData.verifyCode,
                    password: formData.newPassword
                });
                if (response.status === 200) {
                    passwordResetSuccess = true;
                    active.value = 3; // 切换到最后一步
                    forgotPasswordDialogVisible.value = false; // 关闭对话框
                    ElNotification.success({ title: '密码重置成功' });

                }
            } catch (error) {
                console.error('Error occurred while resetting password:', error);
                ElNotification.error({ title: '密码重置失败', message: error.response.message });
                return false
            }
        } else {
            console.log('验证失败');
            return false;
        }
    });
};
const handleClick = () => {
    if (active.value < 3 && active.value !== 2) {
        nextStep();
    }
    if (active.value === 2) {
        resetPassword();
        if (passwordResetSuccess === true) {
            nextStep();
        }
    }

};

async function submitForm(formName, userType) {
    if (!proxy.$refs[formName]) {
        return;
    }
    proxy.$refs[formName].validate(async (valid) => {
        if (valid) {
            const form = activeTab.value === 'student' ? registerForm.value.student : registerForm.value.teacher;


            try {
                let url = '/api/student/register';
                let payload = {
                    email: form.email,
                    username: form.username,
                    password: form.password,
                    confirmPassword: form.checkPass,
                    verificationCode: form.code
                };

                if (userType === 'teacher') {
                    url = '/api/teacher/register';
                    payload = {
                        email: form.email,
                        password: form.password,
                        confirmPassword: form.checkPass,
                        schoolId: form.schoolId,
                        verificationCode: form.code
                    };
                }


                const response = await axios.post(url, payload, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // 打印完整的响应对象

                // 检查响应状态码和消息
                if (response.status === 200) {
                    if (response.data.message === "注册成功") {
                        ElNotification.success({ title: '注册成功', message: '注册成功' });
                        registerDialogVisible.value = false;
                    } else {
                        ElNotification.error({ title: '注册失败', message: '注册失败，请检查信息' });
                    }
                } else if (response.status === 400) {
                    const errorMessage = response.data.message || '注册失败，请检查信息';
                    ElNotification.error({ title: '注册失败', message: errorMessage });
                } else {
                    ElNotification.error({ title: '未知错误', message: '未知错误，请稍后再试' });
                }
            } catch (error) {
                ElNotification.error({ title: '注册请求失败', message: error.response ? error.response.data.message : error.message });
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
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
          <el-carousel height="400px"><!-- 走马灯部分-->
            <el-carousel-item v-for="item in 4" :key="item">
              <img class="carousel-image" src="../static/1.jpg" v-if="item === 1" >
              <img class="carousel-image" src="../static/2.jpg" v-if="item === 2">
              <img class="carousel-image" src="../static/1.jpg" v-if="item === 3">
              <img class="carousel-image" src="../static/2.jpg" v-if="item === 4">
            </el-carousel-item>
          </el-carousel>
          <!-- 内容 -->
        </el-scrollbar>
      </el-main>

      <!-- 登录浮窗 -->
      <el-dialog v-model="loginDialogVisible" title="登录" width="500" align-center>
        <el-form>
          <el-radio-group v-model="selectedCity" style="margin-bottom: 30px">
            <el-radio-button value="1">top</el-radio-button>
            <el-radio-button value="right">right</el-radio-button>
            <el-radio-button value="bottom">bottom</el-radio-button>
            <el-radio-button value="left">left</el-radio-button>
          </el-radio-group>

          <el-form-item>
            <el-input placeholder="登录邮箱"></el-input>
          </el-form-item>
          <el-form-item>
            <el-input type="password" placeholder="登录密码"></el-input>
          </el-form-item>
          <el-form-item>
            <el-checkbox>记住密码</el-checkbox>
            <a href="#">忘记密码</a>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="loginDialogVisible = false">取 消</el-button>
          <el-button type="primary" >登 录</el-button>
        </div>
      </el-dialog>

      <!-- 注册浮窗 -->
      <el-dialog v-model="registerDialogVisible" title="注册" width="500px" align-center>
        <el-tabs v-model="activeTab">
          <!-- 学生注册表单内容 -->
          <!--     <el-tab-pane label="学生" name="student">
                <el-form>
                  <el-form-item>
                    <el-input placeholder="邮箱"></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-input placeholder="验证码"></el-input>
                    <el-button type="primary" @click="sendVerificationCode">发送</el-button>
                  </el-form-item>
                  <el-form-item>
                    <el-input type="password" placeholder="密码"></el-input>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
          -->

              <el-tab-pane label="学生" name="student">
                <el-form>
                  <!-- 邮箱 -->
                  <el-form-item prop="email" class="auto" label="邮箱">
                    <el-input
                        v-model="registerForm.email"
                        placeholder="邮箱"
                        size="large"
                    ></el-input>
                  </el-form-item>

                  <!-- 邮箱验证码 -->
                  <div style="display: flex">
                    <el-form-item prop="code" class="auto" style="width: auto;" label="验证码">
                      <el-input
                          size="large"
                          class="input-wid"
                          v-model="registerForm.code"
                          placeholder="验证码"
                      ></el-input>
                    </el-form-item>
                    <div class="w-18px"></div>
                    <el-button size="large" :disabled="isCounting" :loading="smsLoading" @click="handleSms">
                      {{ label }}
                    </el-button>
                  </div>

                  <!-- 密码 -->
                  <el-form-item prop="password" class="auto" label="密码">
                    <el-input
                        type="password"
                        placeholder="密码"
                        v-model="registerForm.password"
                        size="large"
                    ></el-input>
                  </el-form-item>

                  <!-- 确认密码 -->
                  <el-form-item label="确认密码" class="auto" prop="checkPass">
                    <el-input
                        type="password"
                        v-model="registerForm.checkPass"
                        autocomplete="off"
                        placeholder="再次输入密码"
                        size="large"
                    ></el-input>
                  </el-form-item>

                  <!-- 注册按钮 -->
                 <div class="sign-up-btn">
                   <el-button size="large" type="primary" @click="handleSignUp">注册</el-button>
                 </div>

                </el-form>
              </el-tab-pane>


          <el-tab-pane label="教师" name="teacher">
            <!-- 教师注册表单内容 -->
            <el-form>
              <!-- 授权码 -->
              <el-form-item prop="AuthorizationCode" class="auto" label="授权码">
                <el-input
                    v-model="registerForm.AuthorizationCode"
                    placeholder="授权码"
                    size="large"
                ></el-input>
              </el-form-item>

              <!-- 邮箱 -->
              <el-form-item prop="email" class="auto" label="邮箱">
                <el-input
                    v-model="registerForm.email"
                    placeholder="邮箱"
                    size="large"
                ></el-input>
              </el-form-item>

              <!-- 验证码 -->
              <div style="display: flex">
                <el-form-item prop="code" class="auto" style="width: auto;" label="验证码">
                  <el-input
                      size="large"
                      class="input-wid"
                      v-model="registerForm.code"
                      placeholder="验证码"
                  ></el-input>
                </el-form-item>
                <div class="w-18px"></div>
                <el-button size="large" :disabled="isCounting" :loading="smsLoading" @click="handleSms">
                  {{ label }}
                </el-button>
              </div>

              <!-- 密码 -->
              <el-form-item prop="password" class="auto" label="密码">
                <el-input
                    type="password"
                    placeholder="密码"
                    v-model="registerForm.password"
                    size="large"
                ></el-input>
              </el-form-item>

              <!-- 确认密码 -->
              <el-form-item label="确认密码" class="auto" prop="checkPass">
                <el-input
                    type="password"
                    v-model="registerForm.checkPass"
                    autocomplete="off"
                    placeholder="再次输入密码"
                    size="large"
                ></el-input>
              </el-form-item>

              <div class="sign-up-btn">
                <el-button size="large" type="primary" @click="handleSignUp">注册</el-button>
              </div>

            </el-form>
          </el-tab-pane>
          <!-- 注册按钮 -->

        </el-tabs>
<!--        <div slot="footer" class="dialog-footer">
          <el-button @click="registerDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="register">注 册</el-button>
        </div>-->
      </el-dialog>
    </el-container>


  </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue';
/*import useSmsCode from "@/util/CodeGenerator/utilForCode/useSmsCode";
import request from "@/util/postreq";
import {mixin} from "../../mixins/index";*/

let {label, isCounting, loading: smsLoading, getSmsCode} = useSmsCode();

const loginDialogVisible = ref(false);
const registerDialogVisible = ref(false); // 注册弹窗的响应式变量
const activeTab = ref('student'); // 默认选中的选项卡
const selectedCity = ref('1') // 默认选中的城市

/*const isCounting = ref(false); // 是否正在倒计时
const smsLoading = ref(false); // 是否正在加载短信验证码
const label = ref('发送验证码'); // 短信按钮文本*/

// 注册表单状态
// 注册学生表单
const registerForm = ref({
  AuthorizationCode: '',
  email: '',
  code: '',
  password: '',
  checkPass: ""
});


// 必填项校验规则
const rules = {
  email: [
    {message: "请输入邮箱地址", trigger: "blur"},
    {
      type: "email",
      message: "请输入正确的邮箱地址",
      trigger: ["blur", "change"],
    },
  ],
  password: [{required: true, trigger: "blur"}],
  checkPass: [
    { required: true, validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("请再次输入密码"));
        } else if (value !== registerForm.value.password) {
          callback(new Error("两次输入密码不一致!"));
        } else {
          callback();
        }
      }, trigger: "blur" }
  ],
};

// 发送短信验证码的方法
const handleSms = () => {
  getSmsCode(registerForm.value.email);
};

// 注册的方法
const handleSignUp = () => {
  registerFormRef.value.validate((valid) => {
    if (valid) {
      request.post('/customer/register', registerForm.value)
          .then((res) => {
            if (res.code === 200) {
              alert(res.message);
              registerDialogVisible.value = false;
              // 跳转到登录页面
            } else {
              alert(res.message);
            }
          })
          .catch((err) => {
            console.error(err);
          });
    }
  });
};

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
  justify-content: space-between;
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


.title {
  margin-bottom: 50px;
  text-align: center;
  font-size: 30px;
  font-weight: 600;
  color: rgb(3, 19, 11);
}

.auto {
  display: flex;
  justify-content: center;
  align-items: center;
}

.w-18px {
  width: 18px;
}

.sign-up-btn {
  display: block;
  width: 100%;
  margin-top: 20px;
  text-align: center;
}
</style>
<template>
    <div class="common-layout">
        <el-container class="common-layout">
            <el-header class="fixed-header">
                <div class="header-title">初中语文综合素养提升平台</div>
                <div class="header-buttons">


                    <el-button color="#626aef" :dark="isDark" @click="loginDialogVisible = true">登录</el-button>
                    <el-button color="#626aef" :dark="isDark" plain>注册</el-button>
                </div>
            </el-header>

            <el-main>
                <el-scrollbar>
                    <el-carousel height="400px"><!--  走马灯部分-->
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
<!--            <el-dialog v-model="loginDialogVisible" title="登录" width="500" center>-->
<!--                <el-form>-->
<!--                    <el-radio-group  v-model="selectedCity" style="margin-bottom: 30px">-->
<!--                    <el-radio-button value="1">top</el-radio-button>-->
<!--                    <el-radio-button value="right">right</el-radio-button>-->
<!--                    <el-radio-button value="bottom">bottom</el-radio-button>-->
<!--                    <el-radio-button value="left">left</el-radio-button>-->
<!--                </el-radio-group>-->

<!--                    <el-form-item label="账号">-->
<!--                        <el-input placeholder="输入邮箱/用户名"></el-input>-->
<!--                    </el-form-item>-->
<!--                    <el-form-item label="密码">-->
<!--                        <el-input type="password" placeholder="输入密码"></el-input>-->
<!--                    </el-form-item>-->
<!--                    <el-form-item>-->
<!--                        <el-checkbox>记住密码</el-checkbox>-->
<!--                        <a href="#">忘记密码</a>-->
<!--                    </el-form-item>-->
<!--                </el-form>-->
<!--                <div slot="footer" class="dialog-footer">-->
<!--                    <el-button @click="loginDialogVisible = false">取 消</el-button>-->
<!--                    <el-button type="primary" >登 录</el-button>-->
<!--                </div>-->

<!--            </el-dialog>-->
            <el-dialog v-model="loginDialogVisible"
                       title="登录"
                       width="500px"
                       align-center>

                <el-form label-position="top" class="login-form">
                    <el-radio-group v-model="selectedCity" style="margin-bottom: 30px">
                        <el-radio-button value="1">学生</el-radio-button>
                        <el-radio-button value="right">教师</el-radio-button>
                        <el-radio-button value="bottom">学校管理员</el-radio-button>
                        <el-radio-button value="left">系统管理员</el-radio-button>
                    </el-radio-group>

                    <el-form-item  class="form-item">
                        <el-input
                            v-model="input1"
                            style="width: 280px"
                            placeholder="输入邮箱/用户名"
                            :prefix-icon="User">
                        </el-input>
                    </el-form-item>
                    <el-form-item  class="form-item">
                        <el-input
                            v-model="input2"
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
                    <el-button type="primary" class="custom-button">登 录</el-button>
                </div>
            </el-dialog>

<!--            找回密码-->
            <el-dialog v-model="forgotPasswordDialogVisible"
                       title="找回密码"
                       width="500px"
                       align-center
                       >

                <el-steps style="max-width: 600px; margin-bottom: 60px" :active="active"
                          finish-status="success" simple>
                    <el-step title="Step 1" />
                    <el-step title="Step 2" />
                    <el-step title="Step 3" />
                </el-steps>


                <el-form label-position="right" label-width="120px" class="form-item">
                    <!-- Step1 -->
                    <div v-if="active === 1">
                        <el-form-item label="邮箱" class="form-item">
                            <el-input v-model="mail" placeholder="请输入您的邮箱" style="width: 250px"></el-input>
                        </el-form-item>

                        <el-form-item label="验证码" class="form-item">
                            <el-input v-model="verifyCode" placeholder="请输入验证码" style="width: 150px"></el-input>
                            <el-button >发送验证码</el-button>
                        </el-form-item>
                    </div>
                    <!-- Step2 -->
                    <div v-if="active === 2">
                        <el-form-item label="新密码" class="form-item">
                            <el-input v-model="mail" placeholder="请输入新密码" style="width: 250px"></el-input>
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
                    <el-button v-if="active == 3" @click="goToOwnPage" type="primary" class="custom-button">进入平台</el-button>


                </div>
            </el-dialog>



        </el-container>
    </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue'
import {User,Lock} from "@element-plus/icons-vue";

const loginDialogVisible = ref(false)
const forgotPasswordDialogVisible = ref(false)
const userType = ref<'student' | 'teacher' | 'admin' | 'sysadmin'>('student');
const selectedCity = ref('1') // 默认选中的城市
const input1 = ref('')
const input2 = ref('')
const mail = ref('')
const verifyCode = ref('')
const active = ref(1)

const next = () => {
    if (active.value++ > 2) active.value = 0
}
const front = () => {
    if (active.value-- < 1) active.value = 0
}
const goToOwnPage = () => {

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
    padding: 0; /* 去除默认的内边距 */
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


</style>
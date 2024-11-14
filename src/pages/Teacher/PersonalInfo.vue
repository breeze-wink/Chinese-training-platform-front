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
                        <span v-if="!editNickname">{{ nickname }}</span>
                        <el-input v-else v-model="nickname" size="small" class="edit-input" @blur="toggleEdit('nickname')" />
                        <el-icon @click="toggleEdit('nickname')">
                            <Edit />
                        </el-icon>
                    </div>
                    <div class="info-item">
                        <label>所属学校：</label>
                        <span>{{ school }}</span>
                    </div>
                    <div class="info-item">
                        <label>电话号码：</label>
                        <span v-if="!editPhone">{{ phone }}</span>
                        <el-input v-else v-model="phone" size="small" class="edit-input" @blur="toggleEdit('phone')" />
                        <el-icon @click="toggleEdit('phone')">
                            <Edit />
                        </el-icon>
                    </div>
                    <div class="info-item">
                        <label>实名：</label>
                        <span>{{ realName }}</span>
                    </div>
                </el-card>

                <!-- 账号信息卡片 -->
                <h2>账号信息</h2>
                <el-card class="info-card" style="margin-top: 20px;">
                    <div class="info-item">
                        <label>账号ID：</label>
                        <span>{{ accountId }}</span>
                    </div>
                    <div class="info-item">
                        <label>密码：</label>
                        <span>******</span>
                        <el-icon @click="editPassword">
                            <Edit />
                        </el-icon>
                    </div>
                    <div class="info-item">
                        <label>绑定邮箱：</label>
                        <span>{{ email }}</span>
                    </div>
                </el-card>
            </div>
        </div>
    </div></template>

<script setup>

import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import { ref } from 'vue';
import { ElIcon, ElCard, ElInput } from 'element-plus';
import { Edit } from '@element-plus/icons-vue';

// 个人信息
const nickname = ref('张老师');
const school = ref('某某学校');
const phone = ref('123456789');
const realName = ref('张三');

// 账号信息
const accountId = ref('teacher123');
const email = ref('zhangsan@example.com');

// 控制编辑状态
const editNickname = ref(false);
const editPhone = ref(false);
// 编辑按钮的逻辑
// 切换编辑状态
function toggleEdit(field) {
    if (field === 'nickname') {
        editNickname.value = !editNickname.value;
    } else if (field === 'phone') {
        editPhone.value = !editPhone.value;
    }
}
// 编辑密码的逻辑（可以弹出对话框等）
function editPassword() {
    console.log('编辑密码');
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


</style>
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
                <div class="info-container">
                    <div class="info-item">
                        <label>姓名：</label>
                        <span>张三</span>
                    </div>
                    <div class="info-item">
                        <label>邮箱：</label>
                        <span>zhangsan@example.com</span>
                    </div>
                    <div class="info-item">
                        <label>电话：</label>
                        <span>123456789</span>
                    </div>
                    <div class="info-item">
                        <label>其他：</label>
                        <span>其他信息内容</span>
                    </div>
                </div>

                <el-button type="primary" @click="editInfo">编辑</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';

import { ElButton } from 'element-plus';

// 编辑按钮的逻辑
function editInfo() {
    console.log('编辑个人信息');
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
    flex: 1;
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin-right: 50px; /* 右侧留空隙 */
}

.info-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.info-item {
    display: flex;
    justify-content: flex-start;
    gap: 10px;
}

.info-item label {
    font-weight: bold;
}

.info-item span {
    font-size: 16px;
    color: #333;
}

.el-button {
    margin-top: 20px;
}
</style>
<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header />

        <div class="main-container">
            <!-- 引入侧边栏通用组件 -->
            <Sidebar />

            <!-- 内容区 -->
            <div class="content">
                <h2>上传题目</h2>
                <div class="card-container">
                    <!-- 单题上传卡片 -->
                    <el-card shadow="hover" class="upload-card">
                        <h3 class="card-title">单题上传</h3>
                        <p class="card-description">适用于单独的题目</p>
                        <div class="card-footer">
                            <el-button type="primary" @click="startSingleUpload">开始上传</el-button>
                        </div>
                    </el-card>

                    <!-- 组合式题目上传卡片 -->
                    <el-card shadow="hover" class="upload-card">
                        <h3 class="card-title">组合式题目上传</h3>
                        <p class="card-description">适用于组合式的题目，结构为一个题干+多个问题，例如阅读题等</p>
                        <div class="card-footer">
                            <el-button type="primary" @click="startCombinedUpload">开始上传</el-button>
                        </div>
                    </el-card>

                    <!-- 作文上传卡片 -->
                    <el-card shadow="hover" class="upload-card">
                        <h3 class="card-title">作文上传</h3>
                        <p class="card-description">适用于优秀作文</p>
                        <div class="card-footer">
                            <el-button type="primary" @click="startEssayUpload">开始上传</el-button>
                        </div>
                    </el-card>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

const router = useRouter();

// 单题上传按钮点击事件
const startSingleUpload = () => {

    router.push('/teacher/upload-single-question');
};

// 作文上传按钮点击事件
const startEssayUpload = () => {

    router.push('/teacher/upload-essay');
};

// 组合式题目上传按钮点击事件
const startCombinedUpload = () => {

    router.push( '/teacher/upload-combined-question');

};
</script>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f0f0f0; /* 浅灰色背景 */
}

.main-container {
    display: flex;
    flex: 1;
    background-color: #f0f0f0; /* 背景改为浅灰色 */
}

.content {
    max-width: 1000px; /* 最大宽度为 1000px */
    width: 100%; /* 宽度在正常情况下可以随着窗口大小缩放 */
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin-right: 50px; /* 如果需要右侧留空隙，可以保留这行，或者可以根据实际情况调整 */
    margin-bottom: 30px;

    margin-left: 300px;
}

.card-container {
    display: flex;

    gap: 20px; /* 卡片之间的间距 */
    flex-wrap: wrap; /* 允许换行 */
    justify-content: space-between;
}

.upload-card {
    flex: 1 1 calc(45% - 10px); /* 每个卡片约占50%的宽度，减去间隙 */
    max-width: calc(45% - 10px); /* 确保卡片不会超过50%的宽度 */
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
    background-color: #dfe7f6;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.card-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
}

.card-description {
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
}

.card-footer {
    display: flex;
    justify-content: flex-end;
}
</style>

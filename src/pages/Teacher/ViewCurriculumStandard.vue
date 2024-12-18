<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header />

        <div class="main-container">
            <!-- 引入侧边栏通用组件 -->
            <Sidebar />

            <!-- 内容区 -->
            <div class="content">
                <h2>课程标准</h2>


                <div v-if="pdfUrl" class="pdf-container">
                    <!-- 使用 iframe 显示 PDF 文件 -->
                    <iframe :src="pdfUrl" type="application/pdf" width="100%" height="600px"></iframe>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import {computed, onMounted, ref} from 'vue';
import { ElButton } from 'element-plus';
import axios from 'axios';
import {useStore} from "vuex";

// 存储 PDF 文件的 URL
const pdfUrl = ref('');
const store = useStore();
const teacherId = computed(() => store.state.user.id);
// 获取课程标准的 PDF
async function fetchCurriculumStandard() {
    try {

        const response = await axios.get(`/api/teacher/${teacherId.value}/view-curriculum-standard`, {
            responseType: 'blob' // 确保返回的是二进制数据，以 Blob 形式
        });

        // 创建一个 URL 对象来显示 PDF
        const file = new Blob([response.data], { type: 'application/pdf' });
        pdfUrl.value = URL.createObjectURL(file);
    } catch (error) {
        console.error('无法获取课程标准:', error);
    }
}

onMounted(() => {
    fetchCurriculumStandard();
});
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
    margin-right: 50px; /* 右侧留空隙 */
    margin-left: 300px;
}

.pdf-container {
    margin-top: 20px;
}

iframe {
    border: none;
}
</style>

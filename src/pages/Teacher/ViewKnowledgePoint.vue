<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header />

        <div class="main-container">
            <!-- 引入侧边栏通用组件 -->
            <Sidebar />

            <!-- 内容区 -->
            <div class="content">
                <h2>知识点</h2>

                <!-- 知识点列表 -->
                <div class="knowledge-container" v-if="knowledgePoints && Object.keys(knowledgePoints).length">
                    <div v-for="(points, category) in knowledgePoints" :key="category" class="knowledge-category">
                        <!-- 设置背景颜色 -->
                        <h3 class="category-title">{{ category }}</h3>
                        <ul>
                            <li v-for="point in points" :key="point.name" class="knowledge-item">
                                <!-- 为 point.name 添加标志 -->
                                <div class="knowledge-name">·{{ point.name }}·</div>
                                <!-- 设置描述文字间距 -->
                                <div class="knowledge-description">{{ point.description }}</div>
                            </li>
                        </ul>
                    </div>
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

const knowledgePoints = ref(null);

const store = useStore();
const teacherId = computed(() => store.state.user.id);

// 获取知识点

const fetchKnowledgePoint = async () => {
    try {
        const response = await axios.get(`/api/teacher/${teacherId.value}/view-knowledge-point`);

        // 检查响应状态并处理数据
        if (response.status === 200 && response.data) {
            knowledgePoints.value = response.data.knowledgePoints;
        } else {
            console.error('无法获取知识点：', response);
        }
    } catch (error) {
        console.error('获取知识点时发生错误：', error);
    }
};

onMounted(() => {
    fetchKnowledgePoint();
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
    margin-bottom: 30px;

    margin-left: 300px;
}

/* 整体知识点列表容器，向右移动 */
.knowledge-container {
    margin-top: 60px;
    margin-left: 60px; /* 向右移动 30px，可根据需求调整 */
    margin-right: 60px;
}


.knowledge-category {
    margin-bottom: 20px;
}


/* 设置分类标题背景颜色 */
.category-title {
    font-size: 18px;
    margin-bottom: 10px;
    background-color: #e6e6fa; /* 淡紫色背景 */
    padding: 10px;
    border-radius: 5px; /* 圆角 */
}

/* 知识点项目样式 */
.knowledge-category ul {
    padding-left: 20px;
}


.knowledge-category ul {
    padding-left: 20px;
}

.knowledge-item {
    margin-bottom: 10px;
    display: flex;
    flex-direction: column; /* 将名称和描述分开为上下结构 */
}

.knowledge-name {
    font-weight: bold;
    margin-bottom: 5px;
    white-space: nowrap; /* 不换行 */
    overflow: hidden; /* 超出隐藏 */
    text-overflow: ellipsis; /* 超出显示省略号 */
    font-style: italic; /* 斜体，突出显示 */
    color: #333; /* 字体颜色 */
}

.knowledge-description {
    word-wrap: break-word; /* 自动换行 */
    white-space: pre-wrap; /* 保留空格和换行符 */
    max-width: 800px; /* 设置最大宽度，限制行长 */
    line-height: 1.5; /* 行间距 */
    letter-spacing: 0.5px; /* 增加文字间距 */
    color: #555; /* 更柔和的文字颜色 */
    font-size: 14px;
}
iframe {
    border: none;
}
</style>

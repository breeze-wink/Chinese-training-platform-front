<template>
    <div class="page-container">
        <Header />

        <div class="main-container">
            <Sidebar />

            <div class="poem-detail">
                <div v-if="poem.title" class="poem-content">
                    <h1 class="poem-title">{{ poem.title }}</h1>
                    <p class="poem-author">{{ poem.author }} | {{ poem.dynasty }}</p>
                    <p class="poem-annotation">{{ poem.annotation }}</p>
                    <div class="poem-text-container">
                        <pre class="poem-text">{{ poem.content }}</pre>
                    </div>
                </div>
                <div v-else class="loading">
                    <p>Loading...</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {
    poems_seven_upper,
    poems_seven_lower,
    poems_eight_upper,
    poems_eight_lower,
    poems_nine_upper,
    poems_nine_lower
} from '@/store/poems';
import Sidebar from "@/components/Sidebar.vue";

export default {
    name: 'PoemDetail',
    components: {Sidebar},
    props: {
        id: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            poem: {}
        };
    },
    watch: {
        // 监听 id 变化，当 id 改变时重新获取诗词数据
        id: {
            immediate: true, // 初始化时立即执行
            handler(newId) {
                this.fetchPoemDetails(newId);
            }
        }
    },
    methods: {
        fetchPoemDetails(id) {
            const allPoems = [
                ...poems_seven_upper,
                ...poems_seven_lower,
                ...poems_eight_upper,
                ...poems_eight_lower,
                ...poems_nine_upper,
                ...poems_nine_lower
            ];

            // 查找与 id 匹配的诗词
            this.poem = allPoems.find(poem => poem.title === id) || {};
        }
    }
};
</script>

<style scoped>
.page-container {
    background-color: #f9f9f9; /* 添加背景色 */
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.main-container {
    background-color: #fff; /* 添加背景色 */
    display: flex;
    flex: 1;
}

.poem-detail {
    display: flex;
    justify-content: center; /* 水平居中 */
    min-height: 100vh; /* 使内容垂直居中 */
}

.poem-content {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 添加投影效果 */
    padding: 30px; /* 内边距 */
    border-radius: 8px; /* 圆角 */
    text-align: center;
    max-width: 800px; /* 限制最大宽度 */
    width: 75%; /* 占据屏幕的75%宽度 */
    background-color: #fff; /* 内容区域背景色 */
}

.poem-title {
    font-family: 'Noto Serif SC', serif; /* 使用更优雅的字体 */
    font-size: 2.5rem; /* 标题字体大小 */
    margin-bottom: 1rem; /* 标题下方间距 */
    color: #333; /* 更深的文字颜色 */
}

.poem-author {
    font-family: 'Noto Sans SC', sans-serif; /* 使用简洁的字体 */
    font-size: 1.5rem; /* 作者字体大小 */
    color: #666; /* 作者字体颜色 */
    margin-bottom: 1rem; /* 作者下方间距 */
}

.poem-annotation {
    font-family: 'Noto Sans SC', sans-serif; /* 使用简洁的字体 */
    font-size: 1.2rem; /* 注释字体大小 */
    color: #888; /* 注释字体颜色 */
    margin-bottom: 2rem; /* 注释下方间距 */
}

.poem-text-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.poem-text {
    font-family: 'Noto Serif SC', serif; /* 使用更优雅的字体 */
    font-size: 1.2rem; /* 诗词内容字体大小 */
    line-height: 1.6; /* 行高 */
    white-space: pre-wrap; /* 保留换行符 */
    word-break: break-all; /* 防止长单词超出容器 */
    margin: 0 auto; /* 水平居中 */
    max-width: 80ch; /* 限制诗词内容的最大宽度 */
    color: #333; /* 更深的文字颜色 */
}

.loading {
    font-size: 1.5rem; /* 加载提示字体大小 */
    color: #aaa; /* 加载提示字体颜色 */
}
</style>
<template>
    <div class="page-container">
        <Header/>

        <div class="main-container">
            <Sidebar />

            <div class="poem-detail">
                <button class="back-button" @click="goBack">返回</button>
                <div v-if="poem.title" class="poem-content">
                    <h1 class="poem-title">{{ poem.title }}</h1>
                    <p class="poem-author">{{ poem.author }} | {{ poem.dynasty }}</p>
                    <p class="poem-annotation">{{ poem.annotation }}</p>
                    <div class="poem-text-container">
                        <pre class="poem-text">{{ poem.content }}</pre>
                    </div>
                    <div class="navigation-buttons">
                        <button class="nav-button" v-if="hasPrev" @click="goToPrev">上一篇</button>
                        <button class="nav-button" v-if="hasNext" @click="goToNext">下一篇</button>
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
import { useRouter } from 'vue-router';
import Header from "@/components/Header.vue";

export default {
    name: 'PoemDetail',
    components: {Header, Sidebar },
    props: {
        id: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            poem: {},
            allPoems: []
        };
    },
    computed: {
        hasPrev() {
            return this.allPoems.findIndex(p => p.title === this.id) > 0;
        },
        hasNext() {
            return this.allPoems.findIndex(p => p.title === this.id) < this.allPoems.length - 1;
        }
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
            this.allPoems = [
                ...poems_seven_upper,
                ...poems_seven_lower,
                ...poems_eight_upper,
                ...poems_eight_lower,
                ...poems_nine_upper,
                ...poems_nine_lower
            ];

            // 查找与 id 匹配的诗词
            this.poem = this.allPoems.find(poem => poem.title === id) || {};
        },
        goBack() {
            this.$router.push({ path: '/student/poetry-list' }); // 返回到指定路径
        },
        goToPrev() {
            const currentIndex = this.allPoems.findIndex(p => p.title === this.id);
            if (currentIndex > 0) {
                this.$router.push({ name: 'PoemDetail', params: { id: this.allPoems[currentIndex - 1].title } });
            }
        },
        goToNext() {
            const currentIndex = this.allPoems.findIndex(p => p.title === this.id);
            if (currentIndex < this.allPoems.length - 1) {
                this.$router.push({ name: 'PoemDetail', params: { id: this.allPoems[currentIndex + 1].title } });
            }
        }
    }
};
</script>

<style scoped>
.page-container {
    background-color: #f0f0f0; /* 添加背景色 */
    background-image: url('../../static/mountains.jpg'); /* 设置背景图像 */
    background-size: cover; /* 背景图像覆盖整个元素 */
    background-position: center; /* 背景图像居中 */
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.main-container {
    background-color: rgba(255, 255, 255, 0.8); /* 添加半透明背景色 */
    display: flex;
    flex: 1;
}

.poem-detail {
    display: flex;
    flex-direction: column; /* 垂直方向按列排列 */
    padding-top: 20px; /* 上方内边距，使内容从顶部开始 */
    flex: 1; /* 占据剩余空间 */
    padding-left: 20px; /* 左侧内边距，与 Sidebar 对齐 */
    margin-left: 300px;
}

.back-button {
    position: absolute;
    top: 20px;
    right: 20px; /* 将按钮移动到右上方 */
    padding: 10px 20px;
    background-color: #626aef;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
}

.back-button:hover {
    background-color: #4a50e2;
}

.poem-content {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 添加投影效果 */
    padding: 30px; /* 内边距 */
    border-radius: 8px; /* 圆角 */
    text-align: center;
    max-width: 800px; /* 限制最大宽度 */
    width: 75%; /* 占据屏幕的75%宽度 */
    background-color: #fff; /* 内容区域背景色 */
    margin: 0 auto; /* 水平居中 */
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
    text-align: center; /* 文字居中 */
}

.navigation-buttons {
    display: flex;
    justify-content: center; /* 水平居中 */
    margin-top: 20px; /* 与上方内容的距离 */
}

.nav-button {
    padding: 10px 20px;
    background-color: #626aef;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    margin: 0 10px; /* 按钮之间的间距 */
}

.nav-button:hover {
    background-color: #4a50e2;
}

.loading {
    font-size: 1.5rem; /* 加载提示字体大小 */
    color: #aaa; /* 加载提示字体颜色 */
}
</style>
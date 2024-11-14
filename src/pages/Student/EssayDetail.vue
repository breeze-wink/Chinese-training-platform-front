<template>
    <div class="page-container">
        <Header />

        <div class="main-container">
            <Sidebar />

            <div class="essay-detail">
                <div v-if="essay && essay.title" class="essay-content">
                    <h1 class="essay-title">{{ essay.title }}</h1>
                    <p class="essay-annotation">{{ essay.annotation }}</p>
                    <div class="essay-text-container">
<!--                        <pre class="essay-text">{{ essay.content }}</pre>-->
                        <div class="essay-text" v-html="formattedContent"></div>
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
import { mapState } from 'vuex';
import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";

export default {
    name: 'EssayDetail',
    components: { Sidebar, Header },
    data() {
        return {
            essay: {}
        };
    },
    computed: {
        ...mapState(['essays']),
        formattedContent() {
            // 添加首行缩进
            if (this.essay && this.essay.content) {
                // 将内容按段落分割，然后在每段首行前加两个空格
                return this.essay.content.split('\n').map(line => {
                    if (line.startsWith('——')) {
                        // 如果行以“——”开头，只在“——”后面加两个空格
                        return '                               ' +
                            '                                  ' + line;
                    } else {
                        // 对于其他行，正常处理
                        return line ? '  ' + line : '';
                    }
                }).join('<br>');
            }
            return '';
        }
    },
    created() {
        const id = this.$route.params.id;
        console.log('Route ID:', id); // 调试信息
        this.essay = this.essays.find(essay => essay.id === parseInt(id));
        console.log('Fetched Essay:', this.essay); // 调试信息
    },
    methods: {
        getEssayById(id) {
            return this.essays.find(essay => essay.id === parseInt(id));
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
    padding: 1rem; /* 增加内边距，使内容与边缘有一定距离 */
}

/* 为散文内容添加样式 */
.essay-text {
    white-space: pre-wrap; /* 保留空格和换行，同时允许内容换行 */
    word-wrap: break-word; /* 长单词或URL地址换行 */
    font-family: 'Noto Serif SC', serif; /* 保持与文章内容一致的字体 */
    line-height: 1.5; /* 调整行高以适应内容 */
    margin: 1rem 0; /* 上下外边距，根据需要调整 */
}

/* 首行缩进 */
.essay-text::first-line {
    text-indent: 2ch; /* 2个字符宽度的缩进 */
}

.essay-title {
    font-size: 1.5rem; /* 标题字体大小 */
    margin-bottom: 0.5rem; /* 标题底部外边距 */
}

.essay-annotation {
    font-size: 0.9rem; /* 注解字体大小 */
    color: #666; /* 注解字体颜色 */
    margin-bottom: 1rem; /* 注解底部外边距 */
}

.essay-text-container {
    padding: 1rem; /* 内容容器内边距 */
    border: 1px solid #ddd; /* 边框 */
    border-radius: 0.25rem; /* 圆角 */
    background-color: #f9f9f9; /* 背景颜色 */
}

.loading {
    font-size: 1.5rem; /* 加载提示字体大小 */
    color: #aaa; /* 加载提示字体颜色 */
    text-align: center; /* 文本居中 */
    padding-top: 1rem; /* 顶部内边距 */
}
</style>
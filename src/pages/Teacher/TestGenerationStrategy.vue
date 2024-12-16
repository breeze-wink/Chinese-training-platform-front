

<template>
    <div class="page-container">
        <!-- 引入头部通用组件 -->
        <Header />

        <div class="main-container">
            <!-- 引入侧边栏通用组件 -->
            <Sidebar />

            <!-- 内容区 -->
            <div class="content">
                <h2>生成试卷</h2>
                <div class ="card-container">
                    <div class="card-group">
                        <div class="card">
                            <div class="card-image">
                                <img src="../../static/one-click.png" alt="一键生成">
                            </div>
                            <div class="card-content">
                                <h3>【懒人必备】一键生成试卷大法</h3>
                                <div style="letter-spacing: 2px;">
                                <p>家人们，你们有没有想过，出题也能像点外卖一样简单？
                                    只需一键，系统就能模仿真题试卷，为你量身打造一张完整的试卷。
                                    省时省力，简直是懒人的福音！</p>
                                </div>
                                <button>一键生成</button>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-content">
                                <h3>【精准定制】知识点选题大师</h3>
                                <div style="letter-spacing: 2px;">
                                <p>想要出题，却又不想太费脑筋？来试试这个半自动的知识点选题模式吧！
                                    你只需挑选知识点和题目数量，系统就会为你搜寻符合条件的题目
                                    。高级感满满！</p>
                                </div>
                                <button>自定义出题</button>
                            </div>
                            <div class="card-image">
                                <img src="../../static/dingzhi.jpeg" alt="定制">
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-image">
                                <img src="../../static/typing.png" alt="手动">
                            </div>
                            <div class="card-content">
                                <h3>【匠心独运】手动选题艺术家</h3>
                                    <div style="letter-spacing: 2px;">
                                        <p>如果你追求的是那份独一无二的匠心，那么纯手动选题模式绝对适合你。
                                           老师可以亲手从题库中挑选出最合适的题目，
                                            这种模式，不仅考验你的专业眼光，更体现了你对教育的热爱和执着</p>
                                    </div>
                                <button
                                        @click="navigateTo('/teacher/paper-creation/manual')">
                                    手动出题
                                    </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>

import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";
import { ref } from "vue";


import { useRouter } from 'vue-router';

const router = useRouter();
const navigateTo = (path) => {
    if (path) {
        router.push(path);
    }
};


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
    background-color: #f0f0f0; /* 背景改为浅灰色 */
}

.content {

    max-width: 1000px; /* 最大宽度为 1000px */
    width: 100%; /* 宽度在正常情况下可以随着窗口大小缩放 */
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
    margin-right: 50px; /* 如果需要右侧留空隙，可以保留这行，或者可以根据实际情况调整 */
}

.card-container {
    display: flex;
    justify-content: center; /* 水平居中 */
    flex-wrap: wrap;
    gap: 20px;
}
.card-group {
    justify-content: center; /* 水平居中 */
    margin-top: 30px;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.card {
    background: linear-gradient(to right, #bbbee8, #dfe7f6, #bbbee8);
    height: 300px;
    display: flex;
    width: 800px;
    border-radius: 8px;
    overflow: hidden;
}

.card-image {
    width: 50%;
    background-color: #ccc; /* 占位图片颜色 */
}

.placeholder-image {
    width: 100%;
    height: 100%;
}
.card-image {
    width: 100%; /* 图片宽度与容器相同 */
    height: 100%; /* 图片高度与容器相同 */
    overflow: hidden; /* 隐藏溢出的部分 */
    position: relative; /* 设置相对定位 */
}

.card-image img {
    width: 100%; /* 图片宽度与容器相同 */
    height: 100%; /* 图片高度与容器相同 */
    object-fit: cover; /* 图片覆盖整个容器，保持宽高比 */
    object-position: center; /* 图片居中显示 */
    display: block; /* 去除图片底部的空白间隙 */
    position: absolute; /* 设置绝对定位 */
    top: 0;
    left: 0;
}
.card-content {
    width: 50%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.card-content h3 {
    margin: 0;
}

.card-content p {
    margin: 10px 0;
}

.card-content button {
    background-color: #637cde;
    color: #fff;
    border: none;
    padding: 10px;
    width: 100px;
    border-radius: 4px;
    cursor: pointer;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .card {
        width: 100%;
    }
}
</style>
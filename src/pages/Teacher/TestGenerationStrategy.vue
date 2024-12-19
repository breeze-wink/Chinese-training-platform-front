

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
                                <button  @click="autoGeneratePaper">一键生成</button>
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
                                <button @click="navigateTo('/teacher/preview-paper/knowledge-limited')">
                                    自定义出题
                                </button>
                            </div>
                            <div class="card-image">
                                <img src="../../static/knowledge.png" alt="定制">
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-image">
                                <img src="../../static/customized.png" alt="手动">
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
import {useStore} from "vuex";
import {ElNotification} from "element-plus";
import axios from "axios";

const router = useRouter();
const navigateTo = (path) => {
    if (path) {
        router.push(path);
    }
};
/*******************一键生成逻辑********************/

// 获取 Vuex Store 和 Router 实例
const store = useStore();

// 获取认证 Token
const token = store.getters.getToken;

// 辅助函数：替换图片路径
const replaceImageSrc = async (htmlContent) => {
    if (!htmlContent) return htmlContent;

    // 创建一个临时的 DOM 元素来解析 HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // 查找所有 img 标签
    const images = tempDiv.querySelectorAll('img');

    // 遍历所有 img 标签并替换 src
    const replacePromises = Array.from(images).map(async (img) => {
        const src = img.getAttribute('src');
        if (src && src.startsWith('/uploads/content/')) {
            const imageName = src.replace('/uploads/content/', '');
            const imageUrl = `/api/uploads/images/content/${imageName}`;

            try {
                // 使用 Axios 获取图片数据，设置响应类型为 blob
                const response = await axios.get(imageUrl, {
                    responseType: 'blob',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    // 创建 Blob URL
                    const blobUrl = URL.createObjectURL(response.data);
                    img.setAttribute('src', blobUrl);
                } else {
                    console.error(`获取图片失败: ${imageUrl}`);
                    // 可以设置一个占位图或保留原始 src
                    img.setAttribute('src', '/path/to/placeholder.png'); // 设置占位图路径
                }
            } catch (error) {
                console.error(`获取图片失败: ${imageUrl}`, error);
                // 设置占位图
                img.setAttribute('src', '/path/to/placeholder.png'); // 设置占位图路径
            }
        }
    });

    // 等待所有图片替换完成
    await Promise.all(replacePromises);

    return tempDiv.innerHTML;
};


// 一键生成试卷函数
const autoGeneratePaper = async () => {
    try {
        const response = await axios.get('/api/teacher/paper/auto');

        if (response.status === 200 && response.data) {
            const data = response.data;

            // 处理 bigQuestions
            const processedBigQuestions = await Promise.all(
                    (data.bigQuestions || []).map(async (bigQuestion) => ({
                        ...bigQuestion,
                        showExplanation: false, // 默认不显示解析
                        body: await replaceImageSrc(bigQuestion.body),
                        subQuestions: await Promise.all(
                                (bigQuestion.subQuestions || []).map(async (sub) => ({
                                    ...sub,
                                    showExplanation: false, // 默认不显示解析
                                    question: await replaceImageSrc(sub.content),
                                    options: sub.options || []
                                }))
                        )
                    }))
            );

            // 处理 questions
            const processedQuestions = await Promise.all(
                    (data.questions || []).map(async (question) => ({
                        ...question,
                        showExplanation: false, // 默认不显示解析
                        content: await replaceImageSrc(question.content),
                        options: question.options || []
                    }))
            );

            // 构建试题篮数据
            const basketQuestions = [
                ...processedQuestions.map(q => ({
                    id: q.id, // 确保唯一性，可以根据实际数据调整
                    type: q.type || 'small',
                    content: q.content,
                    answer: q.answer,
                    explanation: q.explanation,
                    options: q.options,
                    score: 0, // 初始化分数
                    difficulty: q.difficulty || 0,
                    knowledgePoint: q.knowledgePoint || ''
                })),
                ...processedBigQuestions.map(bq => ({
                    id: bq.id, // 确保唯一性，可以根据实际数据调整
                    type: 'big',
                    body: bq.body,
                    subQuestions: bq.subQuestions.map(sub => ({
                        id: `sub-${sub.content}`, // 确保唯一性
                        content: sub.question,
                        answer: sub.answer,
                        explanation: sub.explanation,
                        options: sub.options,
                        score: 0, // 初始化分数
                        difficulty: bq.difficulty || 0,
                        knowledgePoint: sub.knowledgePoint || ''
                    })),
                    score: 0, // 可以根据子题分数计算
                    difficulty: bq.difficulty || 0,
                    knowledgePoint: bq.knowledgePoint || ''
                }))
            ];

            // 将试题添加到试题篮
            basketQuestions.forEach(question => {
                store.dispatch('addQuestionToBasket', question);
            });

            ElNotification.success({
                title: '生成成功',
                message: '试卷已成功生成并添加到试题篮。',
                duration: 2000,
            });

            // 跳转到预览页面
            await router.push('/teacher/preview-paper/auto');
        } else {
            ElNotification.error({
                title: '生成失败',
                message: response.data.message || '试卷生成失败。',
                duration: 2000,
            });
        }
    } catch (error) {
        ElNotification.error({
            title: '请求失败',
            message: '无法连接服务器，请稍后再试。',
            duration: 2000,
        });
        console.error(error);
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
<template>
    <div >
        <router-view></router-view>

    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

const adjustViewportScale = () => {
    const screenWidth = window.innerWidth; // 获取屏幕的实际宽度
    const targetWidth = 1440; // 设计稿的宽度（根据你的设计稿宽度调整）
    const scale = screenWidth / targetWidth; // 计算缩放比例

    // 动态设置 viewport meta 标签
    let metaViewport = document.querySelector('meta[name="viewport"]');
    if (!metaViewport) {
        metaViewport = document.createElement('meta');
        metaViewport.name = 'viewport';
        document.head.appendChild(metaViewport);
    }
    metaViewport.setAttribute(
            'content',
            `width=${targetWidth}, initial-scale=${scale}, maximum-scale=${scale}, minimum-scale=${scale}, user-scalable=no`
    );
};

// 在组件挂载时调用调整缩放函数
onMounted(() => {
    adjustViewportScale();
    window.addEventListener('resize', adjustViewportScale); // 监听窗口大小变化
});

// 在组件卸载时移除事件监听
onUnmounted(() => {
    window.removeEventListener('resize', adjustViewportScale); // 移除事件监听
});
</script>


<style>
/* 可以在这里定义全局样式 */
</style>

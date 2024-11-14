<template>
    <div class="sidebar-container">
        <!-- 折叠/展开的控制按钮 -->
        <el-radio-group v-model="isCollapse" style="margin-bottom: 20px">
            <el-radio-button :value="false">Expand</el-radio-button>
            <el-radio-button :value="true">Collapse</el-radio-button>
        </el-radio-group>

        <!-- 侧边栏菜单 -->
        <el-menu
            default-active="2"
            class="el-menu-vertical-demo"
            :collapse="isCollapse"
            @open="handleOpen"
            @close="handleClose"
        >
            <!-- 导航项 1 -->
            <el-sub-menu index="1">
                <template #title>
                    <el-icon><Location /></el-icon>
                    <span>Navigator One</span>
                </template>
                <el-menu-item-group>
                    <template #title><span>Group One</span></template>
                    <el-menu-item index="1-1">Item One</el-menu-item>
                    <el-menu-item index="1-2">Item Two</el-menu-item>
                </el-menu-item-group>
                <el-menu-item-group title="Group Two">
                    <el-menu-item index="1-3">Item Three</el-menu-item>
                </el-menu-item-group>
                <el-sub-menu index="1-4">
                    <template #title><span>Item Four</span></template>
                    <el-menu-item index="1-4-1">Item One</el-menu-item>
                </el-sub-menu>
            </el-sub-menu>

            <!-- 导航项 2 -->
            <el-menu-item index="2">
                <el-icon><IconMenu /></el-icon>
                <span>Navigator Two</span>
            </el-menu-item>

            <!-- 导航项 3（禁用） -->
            <el-menu-item index="3" disabled>
                <el-icon><Document /></el-icon>
                <span>Navigator Three</span>
            </el-menu-item>

            <!-- 导航项 4 -->
            <el-menu-item index="4">
                <el-icon><Setting /></el-icon>
                <span>Navigator Four</span>
            </el-menu-item>
        </el-menu>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { Document, Menu as IconMenu, Location, Setting } from '@element-plus/icons-vue';

// 控制菜单折叠状态
const isCollapse = ref(true);

// 展开和关闭菜单项的事件处理函数
const handleOpen = (key, keyPath) => {
    console.log('Open:', key, keyPath);
};

const handleClose = (key, keyPath) => {
    console.log('Close:', key, keyPath);
};
</script>

<style scoped>
.sidebar-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 200px;
    margin-left: 100px; /* 左侧留空隙 */
    margin-right: 100px;
}


.el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
}

</style>
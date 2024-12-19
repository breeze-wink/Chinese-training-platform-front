<template>
    <div class="sidebar-container">
        <!-- 侧边栏菜单 -->
        <el-menu
            :default-active="activeMenuIndex"
            class="el-menu-vertical-demo"
            :collapse="isCollapse"
            @open="handleOpen"
            @close="handleClose"
            router
        >
            <template v-for="item in menuItems" :key="item.index">
                <el-sub-menu v-if="item.children && item.children.length" :index="item.index">
                    <template #title>
                        <el-icon><component :is="item.icon" /></el-icon>
                        <span class="main-menu-title">{{ item.label }}</span>
                    </template>
                    <el-menu-item
                        v-for="child in item.children"
                        :key="child.index"
                        :index="child.index"
                        class="submenu-item"
                        :route="{ path: child.path }"
                    >
                        {{ child.label }}
                    </el-menu-item>
                </el-sub-menu>
                <el-menu-item
                    v-else
                    :index="item.index"
                    class="main-menu-item"
                    :route="{ path: item.path }"
                >
                    <el-icon><component :is="item.icon" /></el-icon>
                    <span>{{ item.label }}</span>
                </el-menu-item>
            </template>
        </el-menu>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { Document, Setting, User, Management, Upload, EditPen, Avatar, Edit, Opportunity } from '@element-plus/icons-vue';

// 获取路由和当前路由信息
const router = useRouter();
const route = useRoute();

// Vuex store - 获取用户角色
const store = useStore();
const userRole = computed(() => store.state.user.role);

// 控制菜单折叠状态
const isCollapse = ref(false); // 设置默认状态为不折叠

// 当前激活的菜单项
const activeMenuIndex = ref(route.path); // 初始化为当前路由路径

// 监听路由变化，更新激活菜单项
watch(
    () => route.path,
    (newPath) => {
        activeMenuIndex.value = newPath;
    }
);

// 展开和关闭菜单项的事件处理函数
const handleOpen = (key, keyPath) => {
    console.log('Open:', key, keyPath);
};

const handleClose = (key, keyPath) => {
    console.log('Close:', key, keyPath);
};

// 根据用户角色动态生成菜单项
const menuItems = computed(() => {
    const userRole = store.getters['getUser'].role;
    const permission = store.getters['getPermission'];
    switch (userRole) {
        case 'teacher':
            if (permission === 0) {
            return [
                { index: '/teacher/personal-info', label: '个人信息', icon: User, path: '/teacher/personal-info' },
                {
                    index: '/teacher/view-info',
                    label: '查看资讯',
                    icon: Document,
                    children: [
                        { index: '/teacher/view-curriculum-standard', label: '课标', path: '/teacher/view-curriculum-standard' },
                        { index: '/teacher/view-knowledge-point', label: '知识点', path: '/teacher/view-knowledge-point' },
                    ],
                },
                { index: '/teacher/manage-class', label: '组织管理', icon: Management, path: '/teacher/manage-class' },
                {
                    index: '/teacher/question-manage',
                    label: '习题管理',
                    icon: Edit,
                    children: [
                        { index: '/teacher/upload-question', label: '上传习题', icon: Upload, path: '/teacher/upload-question' },
                        { index: '/teacher/view-question', label: '查看习题', path: '/teacher/view-question' }
                    ],
                },
                {
                    index: '/teacher/paper-manage',
                    label: '管理试卷',
                    icon: Edit,
                    children: [
                        { index: '/teacher/test-generation-strategy', label: '生成试卷', path: '/teacher/test-generation-strategy'},
                        { index: '/teacher/paper-manage', label: '查看试卷', path: '/teacher/paper-manage' },
                        { index: '/teacher/homework-manage', label: '查看作业', path: '/teacher/homework-manage'  }
                    ],
                },
            ];
            } else if (permission === 1) {
                return [
                    { index: '/audit-teacher/personal-info', label: '个人信息', icon: User, path: '/audit-teacher/personal-info' },
                    { index: '/audit-teacher/question-list', label: '审核题目', icon: Edit, path: '/audit-teacher/question-list' },
                ];
            }
            break;
        case 'student':
            return [
                { index: '/student/personal-info', label: '个人信息', icon: User, path: '/student/personal-info' },
                { index: '/student/poetry-list', label: '查看资讯', icon: Document, path: '/student/poetry-list' },
                {
                    index: '/student/study',
                    label: '课程学习',
                    icon: EditPen,
                    children: [
                        { index: '/student/question-options', label: '练习选择', path: '/student/question-options' },
                        { index: '/student/manage-test', label: '试卷管理', path: '/student/manage-test' },
                    ],
                },
                { index: '/student/personal-profiling', label: '个人分析', icon: Opportunity, path: '/student/personal-profiling' },
            ];
        case 'sys-adm':
            return [
                { index: '/system-admin/name', label: '账号信息', icon: User, path: '/system-admin/name' },
                {
                    index: '/system-admin/manage',
                    label: '相关管理',
                    icon: Document,
                    children: [
                        { index: '/system-admin/course-standard', label: '课标管理', path: '/system-admin/course-standard' },
                        { index: '/system-admin/knowledge-point', label: '知识点管理', path: '/system-admin/knowledge-point' },
                    ],
                },
                { index: '/system-admin/generate-sch-adm', label: '学校管理员信息', icon: Avatar, path: '/system-admin/generate-sch-adm' },
            ];
        case 'sch-adm':
            return [
                { index: '/school-admin/authorization-code', label: '首页', icon: User, path: '/school-admin/authorization-code' },
                {
                    index: '/school-admin/manage',
                    label: '相关管理',
                    icon: Management,
                    children: [
                        { index: '/school-admin/manage-teacher', label: '教师管理', path: '/school-admin/manage-teacher' },
                        { index: '/school-admin/manage-student', label: '学生管理', path: '/school-admin/manage-student' },
                        { index: '/school-admin/manage-class', label: '班级管理', path: '/school-admin/manage-class' },
                    ],
                },
            ];
        default:
            return [];
    }
});
</script>

<style scoped>
.sidebar-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 180px;
    margin-left: 100px; /* 左侧留空隙 */
    margin-right: 100px;
    position: fixed;

}

.el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 180px;
    min-height: 400px;
}

.main-menu-item {
    font-size: 16px; /* 主目录字号 */
    font-weight: bold;
}

/* 移除焦点边框 */
.el-menu-item:focus {
    outline: none;
}

.main-menu-title {
    font-size: 16px; /* 主目录的字号 */
    font-weight: bold; /* 主目录加粗 */
}

.submenu-item {
    padding-left: 60px; /* 子目录向右偏移 */
    font-size: 14px; /* 子目录的字体比主目录小 */
}
</style>

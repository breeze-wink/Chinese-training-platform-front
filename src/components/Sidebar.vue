<template>
    <div class="sidebar-container">
        <!-- 折叠/展开的控制按钮 -->
        <el-radio-group v-model="isCollapse" style="margin-bottom: 20px">
            <el-radio-button :value="false">Expand</el-radio-button>
            <el-radio-button :value="true">Collapse</el-radio-button>
        </el-radio-group>

        <!-- 侧边栏菜单 -->
        <el-menu
            default-active="1"
            class="el-menu-vertical-demo"
            :collapse="isCollapse"
            @open="handleOpen"
            @close="handleClose"
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
                        @click="navigateTo(child.path)"

                    >
                        {{ child.label }}
                    </el-menu-item>
                </el-sub-menu>
                <el-menu-item
                    v-else
                    :index="item.index"
                    class="main-menu-item"
                    @click="navigateTo(item.path)"
                >
                    <el-icon><component :is="item.icon" /></el-icon>
                    <span>{{ item.label }}</span>
                </el-menu-item>
            </template>
        </el-menu>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import {Document, Setting, User, Management, Upload, EditPen, Avatar, Edit, Opportunity} from '@element-plus/icons-vue';
import {ElAvatar} from "element-plus";
import KnowledgePoint from "@/pages/system-admin/KnowledgePoint.vue";
import GenerateSchadm from "@/pages/system-admin/GenerateSchadm.vue";
import ManageStudent from "@/pages/school-admin/ManageStudent.vue";
import ManageTeacher from "@/pages/school-admin/ManageTeacher.vue";

//获取路由
const router = useRouter();

// Vuex store - 获取用户角色
const store = useStore();
const userRole = computed(() => store.state.user.role);

// 控制菜单折叠状态
const isCollapse = ref(true);

// 展开和关闭菜单项的事件处理函数
const handleOpen = (key, keyPath) => {
    console.log('Open:', key, keyPath);
};

const handleClose = (key, keyPath) => {
    console.log('Close:', key, keyPath);
};
//跳转
const navigateTo = (path) => {
    if (path) {
        router.push(path);
    }
};

// 根据用户角色动态生成菜单项
const menuItems = computed(() => {
    switch (userRole.value) {
        case 'teacher':
            return [
                {
                    index: '1',
                    label: '个人信息',
                    icon: User,
                    path: '/teacher/personal-info'
                },
                {
                    index: '2',
                    label: '查看资讯',
                    icon: Document,
                    children: [
                        { index: '2-1', label: '课标', path: '/teacher/view-curriculum-standard'},
                        { index: '2-2', label: '知识点', path: '/teacher/view-knowledge-point' },
                    ],
                },
                {
                    index: '3',
                    label: '组织管理',
                    icon: Management,
                    path: '/teacher/manage-class'
                },
                {
                    index: '4',
                    label: '上传习题',
                    icon: Upload,
                    path: '/teacher/upload-question'
                },
                {
                    index: '5',
                    label: '生成试卷',
                    icon: Edit,
                    children: [
                        { index: '5-1', label: '生成试卷', path: '/teacher/test-generation-strategy'},
                        { index: '5-2', label: '查看试卷', path: '/teacher/paper-manage' },
                    ],

                },
                { index: '6', label: '设置', icon: Setting,  path:null  },
            ];
        case 'student':
            return [
                { index: '1', label: '个人信息', icon: User,  path:'/student/personal-info' },
                { index: '2', label: '查看资讯', icon: Document,  path:'/student/poetry-list' },
                {
                    index: '3',
                    label: '课程学习',
                    icon: EditPen,
                    children: [
                        { index: '2-1', label: '练习选择',  path:'/student/question-options' },
                        { index: '2-2', label: '试卷管理',  path:'/student/manage-test' },
                    ],
                },
                { index: '4', label: '个人分析', icon: Opportunity,  path:'/student/personal-profiling' },
                { index: '5', label: '设置', icon: Setting,  path:null  },
            ];
      case 'sys-adm':
        return [
          { index: '1', label: '账号信息', icon: User, path: '/system-admin/name' },
          {
            index: '2',
            label: '相关管理',
            icon: Document,
            children: [
              { index: '2-1', label: '课标管理', path: '/system-admin/course-standard' },
              { index: '2-2', label: '知识点管理', path: '/system-admin/knowledge-point' },
            ],
          },
          { index: '3', label: '学校管理员信息', icon: Avatar, path: '/system-admin/generate-sch-adm' },

        ];

      case 'sch-adm':
        return [
          { index: '1', label: '首页', icon: User, path: '/school-admin/AuthorizationCode' },
          {
            index: '2',
            label: '相关管理',
            icon: Management,
            children: [
              { index: '2-1', label: '教师管理', path: '/school-admin/manage-teacher' },
              { index: '2-2', label: '学生管理', path: '/school-admin/manage-student' },
              { index: '2-3', label: '班级管理', path: '/school-admin/manage-class' },
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
}


.el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 180px;
    min-height: 400px;
}

.main-menu-item {
    font-size: 16px; /* 主目录字号 */
    font-weight: bold;
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
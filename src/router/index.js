import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue'
//老师
import TeacherPersonalInfo from '../pages/Teacher/PersonalInfo.vue';// 老师个人信息
import ViewCurriculumStandard from "@/pages/Teacher/ViewCurriculumStandard.vue";

import KnowledgePoint from '../pages/system-admin/KnowledgePoint.vue';
import StudentPersonalInfo from '../pages/Student/PersonalInfo.vue';
import PoetryList from "@/pages/Student/PoetryList.vue";

const routes = [
    //首页
    { path: '/', component: Home },
    //老师的个人信息页面
    { path: '/teacher/personal-info', component: TeacherPersonalInfo },
    { path: '/teacher/view-curriculum-standard', component: ViewCurriculumStandard},
    //系统管理员
    { path: '/system-admin/KnowledgePoint', component: KnowledgePoint },
    // 学生的个人页面
    { path: '/student/personal-info', component: StudentPersonalInfo},
    { path: '/student/poetry-list', component: PoetryList},

];


const router = createRouter({
    history: createWebHistory(),
    routes
});


export default router;

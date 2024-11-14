import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue'
import TeacherPersonalInfo from '../pages/Teacher/PersonalInfo.vue';// 老师个人信息
import StudentPersonalInfo from '../pages/Student/PersonalInfo.vue';
import PoetryList from "@/pages/Student/PoetryList.vue";
// import KnowledgePoint from '../pages/system-admin/KnowledgePoint.vue';

const routes = [
    //首页
    { path: '/', component: Home },
    //老师的个人信息页面
    { path: '/teacher/personal-info', component: TeacherPersonalInfo },
    // { path: '/system-admin/KnowledgePoint', component: KnowledgePoint },
    { path: '/student/personal-info', component: StudentPersonalInfo},
    { path: '/student/poetry-list', component: PoetryList},
];


const router = createRouter({
    history: createWebHistory(),
    routes
});


export default router;



import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue'
//老师
import TeacherPersonalInfo from '../pages/Teacher/PersonalInfo.vue';// 老师个人信息
import ViewCurriculumStandard from "@/pages/Teacher/ViewCurriculumStandard.vue";

import KnowledgePoint from '../pages/system-admin/KnowledgePoint.vue';
import CourseStandard from '../pages/system-admin/CourseStandard.vue';
import ManageTeacher from '../pages/school-admin/ManageTeacher.vue';
import ManageStudent from '../pages/school-admin/ManageStudent.vue';
import AuthorizationCode from '../pages/school-admin/AuthorizationCode.vue';

// 学生
import StudentPersonalInfo from '../pages/Student/PersonalInfo.vue';
import PoetryList from "@/pages/Student/PoetryList.vue";
import PoemDetail from '@/pages/Student/PoemDetail.vue'; // 新增诗词详情页
import EssayDetail from '@/pages/Student/EssayDetail.vue'; // 新增作文详情页

const routes = [
    //首页
    { path: '/', component: Home },
    //老师的个人信息页面
    { path: '/teacher/personal-info', component: TeacherPersonalInfo },
    { path: '/teacher/view-curriculum-standard', component: ViewCurriculumStandard},
    //系统管理员
    { path: '/system-admin/KnowledgePoint', component: KnowledgePoint },
    { path: '/system-admin/CourseStandard', component: CourseStandard },
    //学校管理员
     { path: '/school-admin/ManageTeacher', component: ManageTeacher},
    { path: '/school-admin/ManageStudent', component: ManageStudent},
    { path: '/school-admin/AuthorizationCode', component: AuthorizationCode},
    // 学生的个人页面
    { path: '/student/personal-info', component: StudentPersonalInfo},
    { path: '/student/poetry-list', component: PoetryList},
    // 诗词详情路由
    { path: '/student/poem-detail/:id', name: 'PoemDetail', component: PoemDetail, props: true },
    // 作文详情路由
    { path: '/student/essay-detail/:id', name: 'EssayDetail', component: EssayDetail, props: true },
];


const router = createRouter({
    history: createWebHistory(),
    routes
});


export default router;

import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue'
//老师
import TeacherPersonalInfo from '@/pages/Teacher/PersonalInfo.vue';// 老师个人信息
import ViewCurriculumStandard from "@/pages/Teacher/ViewCurriculumStandard.vue";//查看课标
import ManageClass from "@/pages/Teacher/ManageClass.vue";
//知识点
import KnowledgePoint from '@/pages/system-admin/KnowledgePoint.vue';

// 学生
import StudentPersonalInfo from '../pages/Student/PersonalInfo.vue';
import PoetryList from "@/pages/Student/PoetryList.vue";
import PoemDetail from '@/pages/Student/PoemDetail.vue'; // 新增诗词详情页
import EssayDetail from '@/pages/Student/EssayDetail.vue'; // 新增作文详情页

const routes = [
    //首页
    { path: '/', component: Home },
    //老师页面
    { path: '/teacher/personal-info', component: TeacherPersonalInfo },//个人信息
    { path: '/teacher/view-curriculum-standard', component: ViewCurriculumStandard},//课标查看
    { path: '/teacher/manage-class', component: ManageClass},//管理班级

    //系统管理员
    { path: '/system-admin/KnowledgePoint', component: KnowledgePoint },

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

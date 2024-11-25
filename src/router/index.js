import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue'
import TouristPoem from "@/pages/TouristPoem.vue";
//老师
import TeacherPersonalInfo from '@/pages/Teacher/PersonalInfo.vue';// 老师个人信息
import ViewCurriculumStandard from "@/pages/Teacher/ViewCurriculumStandard.vue";//查看课标
import ManageClass from "@/pages/Teacher/ManageClass.vue";
//知识点
import KnowledgePoint from '@/pages/system-admin/KnowledgePoint.vue';
import CourseStandard from '@/pages/system-admin/CourseStandard.vue';

// 学生
import StudentPersonalInfo from '../pages/Student/PersonalInfo.vue';
import PoetryList from "@/pages/Student/PoetryList.vue";
import PoemDetail from '@/pages/Student/PoemDetail.vue'; // 新增诗词详情页
import EssayDetail from '@/pages/Student/EssayDetail.vue'; // 新增作文详情页
import QuestionOptions from '@/pages/Student/QuestionOptions.vue';
import AnswerPractice from "@/pages/Student/AnswerPractice.vue";
import AnswerDetail from "@/pages/Student/AnswerDetail.vue";
import ManageTest from "@/pages/Student/ManageTest.vue";


const routes = [
    //首页
    { path: '/', component: Home },
    // 游客诗词详情页
    { path: '/poem/:id', name: 'TouristPoem', component: TouristPoem, props: true },
    //老师页面
    //个人信息
    {
        path: '/teacher/personal-info',
        name: 'TeacherPersonalInfo',
        component: TeacherPersonalInfo
    },
    //课标查看
    {
        path: '/teacher/view-curriculum-standard',
        name: 'ViewCurriculumStandard',
        component: ViewCurriculumStandard
    },
    //管理班级
    {
        path: '/teacher/manage-class',
        name: 'ManageClass',
        component: ManageClass
    },

    //系统管理员
    { path: '/system-admin/KnowledgePoint', component: KnowledgePoint },
    { path: '/system-admin/CourseStandard', component: CourseStandard },

    // 学生的个人页面
    { path: '/student/personal-info', name: 'StudentPersonalInfo',component: StudentPersonalInfo},
    { path: '/student/poetry-list', component: PoetryList},
    // 诗词详情路由
    { path: '/student/poem-detail/:id', name: 'PoemDetail', component: PoemDetail, props: true },
    // 作文详情路由
    { path: '/student/essay-detail/:id', name: 'EssayDetail', component: EssayDetail, props: true },
    // 题目
    { path: '/student/question-options', name: 'QuestionOptions', component: QuestionOptions },
    {
        path: '/student/answer-practice',
        name: 'AnswerPractice',
        component: AnswerPractice,
        props: route => ({
            practiceId: route.query.practiceId,
            questions: route.query.questions,
            mode: route.query.mode,
            practiceName: route.query.practiceName,
        }),
    },
    {
        path: '/student/answer-detail/:practiceId',
        name: 'AnswerDetail',
        component: AnswerDetail,
        props: true
    },
    // 试卷管理
    { path: '/student/manage-test', name: 'ManageTest', component: ManageTest},
];


const router = createRouter({
    history: createWebHistory(),
    routes
});


export default router;

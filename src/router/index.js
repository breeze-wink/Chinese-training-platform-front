import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue'
import TouristPoem from "@/pages/TouristPoem.vue";
//老师
import TeacherPersonalInfo from '@/pages/Teacher/PersonalInfo.vue';// 老师个人信息
import ViewCurriculumStandard from "@/pages/Teacher/ViewCurriculumStandard.vue";//查看课标
import ViewKnowledgePoint from "@/pages/Teacher/ViewKnowledgePoint.vue";
import ManageClass from "@/pages/Teacher/ManageClass.vue";
import UploadQuestion from "@/pages/Teacher/UploadQuestion.vue";
import UploadSingleQuestion from "@/pages/Teacher/UploadSingleQuestion.vue";
import UploadCombinedQuestion from "@/pages/Teacher/UploadCombinedQuestion.vue"

//知识点
import KnowledgePoint from '@/pages/system-admin/KnowledgePoint.vue';
import CourseStandard from '@/pages/system-admin/CourseStandard.vue';
import Name from '@/pages/system-admin/name.vue';
import GenerateSchadm from '@/pages/system-admin/GenerateSchadm.vue';
import { ElMessage } from 'element-plus'; // 引入 ElMessage
//学管
import ManageStudent from '@/pages/school-admin/ManageStudent.vue';
import ManageTeacher from '@/pages/school-admin/ManageTeacher.vue';
import AuthorizationCode from '@/pages/school-admin/AuthorizationCode.vue';

// 学生
import StudentPersonalInfo from '../pages/Student/PersonalInfo.vue';
import PoetryList from "@/pages/Student/PoetryList.vue";
import PoemDetail from '@/pages/Student/PoemDetail.vue'; // 新增诗词详情页
import EssayDetail from '@/pages/Student/EssayDetail.vue'; // 新增作文详情页
import QuestionOptions from '@/pages/Student/QuestionOptions.vue';
import AnswerPractice from "@/pages/Student/AnswerPractice.vue";
import AnswerDetail from "@/pages/Student/AnswerDetail.vue";
import ManageTest from "@/pages/Student/ManageTest.vue";
import AnswerTemporary from "@/pages/Student/AnswerTemporary.vue";
import store from '@/store/user';
import TestGenerationStrategy from "@/pages/Teacher/TestGenerationStrategy.vue";


const routes = [
    //首页
    { path: '/', name: 'Home', component: Home },
    // 游客诗词详情页
    { path: '/poem/:id', name: 'TouristPoem', component: TouristPoem, props: true },
    //老师页面
    //个人信息
    {
        path: '/teacher/personal-info',
        name: 'TeacherPersonalInfo',
        component: TeacherPersonalInfo,
        meta: { requiresAuth: true }
    },
    //课标查看
    {
        path: '/teacher/view-curriculum-standard',
        name: 'ViewCurriculumStandard',
        component: ViewCurriculumStandard,
        meta: { requiresAuth: true }
    },
    //查看知识点
    {
        path: '/teacher/view-knowledge-point',
        name: 'ViewKnowledgePoint',
        component: ViewKnowledgePoint,
        meta: { requiresAuth: true }
    },
    //管理班级
    {
        path: '/teacher/manage-class',
        name: 'ManageClass',
        component: ManageClass,
        meta: { requiresAuth: true }
    },
    //上传习题
    {
        path: '/teacher/upload-question',
        name: 'UploadQuestion',
        component: UploadQuestion,
        meta: { requiresAuth: true }
    },
    //上传单题
    {
        path: '/teacher/upload-single-question',
        name: 'UploadSingleQuestion',
        component: UploadSingleQuestion,
        meta: { requiresAuth: true }
    },
    //上传组合题目
    {
        path: '/teacher/upload-combined-question',
        name: 'UploadCombinedQuestion',
        component: UploadCombinedQuestion,
        meta: { requiresAuth: true }
    },
    {
        path: '/teacher/test-generation-strategy',
        name: 'TestGenerationStrategy',
        component: TestGenerationStrategy,
        meta: { requiresAuth: true }
    },


    //系统管理员

    { path: '/system-admin/KnowledgePoint', component: KnowledgePoint, meta: { requiresAuth: true } },
    { path: '/system-admin/CourseStandard', component: CourseStandard, meta: { requiresAuth: true } },
    { path: '/system-admin/name', name:'name',component: Name, meta: { requiresAuth: true } },
    { path: '/system-admin/GenerateSchadm',component: GenerateSchadm, meta: { requiresAuth: true } },

    // 学管
    { path: '/school-admin/ManageStudent', component: ManageStudent, meta: { requiresAuth: true } },
    { path: '/school-admin/ManageTeacher', component: ManageTeacher, meta: { requiresAuth: true } },
    { path: '/school-admin/AuthorizationCode', name:'AuthorizationCode',component: AuthorizationCode, meta: { requiresAuth: true } },


    // 学生的个人页面
    { path: '/student/personal-info', name: 'StudentPersonalInfo',component: StudentPersonalInfo, meta: { requiresAuth: true }},
    { path: '/student/poetry-list', component: PoetryList, meta: { requiresAuth: true }},
    // 诗词详情路由
    { path: '/student/poem-detail/:id', name: 'PoemDetail', component: PoemDetail, props: true, meta: { requiresAuth: true } },
    // 作文详情路由
    { path: '/student/essay-detail/:id', name: 'EssayDetail', component: EssayDetail, props: true, meta: { requiresAuth: true } },
    // 题目
    { path: '/student/question-options', name: 'QuestionOptions', component: QuestionOptions, meta: { requiresAuth: true } },
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
        meta: { requiresAuth: true }
    },
    {
        path: '/student/answer-detail/:practiceId',
        name: 'AnswerDetail',
        component: AnswerDetail,
        props: true,
        meta: { requiresAuth: true }
    },
    {
        path: '/student/answer-temporary',
        name: 'AnswerTemporary',
        component: AnswerTemporary,
        props: route => ({
            practiceId: route.query.practiceId,
            questions: route.query.questions,
            mode: route.query.mode,
            practiceName: route.query.practiceName,
        }),
        meta: { requiresAuth: true }
    },
    // 试卷管理
    { path: '/student/manage-test', name: 'ManageTest', component: ManageTest, meta: { requiresAuth: true }},
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

const roleRoutesMap = {
    'teacher': '/teacher',
    'sys-adm': '/system-admin',
    'sch-adm': '/school-admin',
    'student': '/student',
};


const whiteList = ['/']; // 添加不需要重定向的路由

router.beforeEach((to, from, next) => {
    store.dispatch('initializeUser');
    const isAuthenticated = store.getters.isAuthenticated;
    const userRole = store.getters.getUser ? store.getters.getUser.role : null;
    const allowedRoutePrefix = roleRoutesMap[userRole];

    // 如果当前路由已经在白名单中，直接放行
    if (whiteList.includes(to.path)) {
        next();
        return;
    }
    // 检查是否已经访问了目标路由
    if (from.path === to.path) {
        next(); // 如果目标路由与当前路由相同，则不进行重定向
        return;
    }

    // 检查用户是否已认证
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!isAuthenticated) {
            // 用户未认证，重定向到登录页
            ElMessage.error('请先登录'); // 显示提示消息
            next('/');
        } else if (userRole && to.path.startsWith(allowedRoutePrefix)) {
            // 用户已认证，且访问的是允许的路由前缀
            next();
        } else {
            // 用户已认证，但访问的不是允许的路由前缀，重定向到角色对应的首页
            ElMessage.warning('您没有权限访问该页面');
            const homeRoute = '/';
            next(homeRoute);
        }
    } else {
        // 如果路由不需要认证，直接放行
        next();
    }
});

export default router;
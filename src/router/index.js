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

import TestGenerationStrategy from "@/pages/Teacher/TestGenerationStrategy.vue";
import ManualPaperCreation from "@/pages/Teacher/ManualPaperCreation.vue";
import PreviewPaper from "@/pages/Teacher/PreviewPaper.vue";
import ManagePaper from "@/pages/Teacher/ManagePaper.vue";
import PreviewGeneratedPaper from "@/pages/Teacher/PreviewGeneratedPaper.vue";
import ManageHomework from "@/pages/Teacher/ManageHomework.vue";
import ViewQuestion from "@/pages/Teacher/ViewQuestion.vue";
import PreviewAutoPaper from "@/pages/Teacher/PreviewAutoPaper.vue";
import CorrectingPaper from "@/pages/Teacher/CorrectingPaper.vue";
import PreviewKnowledgeLimitedPaper from "@/pages/Teacher/PreviewKnowledgeLimitedPaper.vue";
import ViewQuestionDetail from "@/pages/Teacher/ViewQuestionDetail.vue";
import UploadEssay from "@/pages/Teacher/UploadEssay.vue";

import AuditTeacherPersonalInfo from "@/pages/audit-teacher/PersonalInfo.vue"
import AuditStrategy from "@/pages/audit-teacher/AuditTest.vue"
import QuestionList from "@/pages/audit-teacher/QuestionList.vue";
import SeeQuestion from "@/pages/audit-teacher/SeeQuestion.vue"

//知识点
import KnowledgePoint from '@/pages/system-admin/KnowledgePoint.vue';
import CourseStandard from '@/pages/system-admin/CourseStandard.vue';
import Name from '@/pages/system-admin/name.vue';
import GenerateSchadm from '@/pages/system-admin/GenerateSchadm.vue';
import { ElMessage } from 'element-plus'; // 引入 ElMessage
//学管
import ManageClassForSchool from '@/pages/school-admin/ManageClass.vue';
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
import PersonalProfiling from "@/pages/Student/PersonalProfiling.vue";
import AnswerHomework from "@/pages/Student/AnswerHomework.vue";
import HomeworkDetail from "@/pages/Student/HomeworkDetail.vue";

import store from '@/store/user';
import ViewCorrectedPaper from "@/pages/Teacher/viewCorrectedPaper.vue";

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
    //上传作文
    {
        path: '/teacher/upload-essay',
        name: 'UploadEssay',
        component: UploadEssay,
        meta: { requiresAuth: true }
    },
    //上传组合题目
    {
        path: '/teacher/upload-combined-question',
        name: 'UploadCombinedQuestion',
        component: UploadCombinedQuestion,
        meta: { requiresAuth: true }
    },
    //查看题目
    {
        path: '/teacher/view-question',
        name: 'ViewQuestion',
        component: ViewQuestion,
        meta: { requiresAuth: true }
    },
    {
        path: '/teacher/question-detail',
        name: 'ViewQuestionDetail',
        component: ViewQuestionDetail,
        meta: { requiresAuth: true }
    },
    //选择组卷方式
    {
        path: '/teacher/test-generation-strategy',
        name: 'TestGenerationStrategy',
        component: TestGenerationStrategy,
        meta: { requiresAuth: true }
    },
    //手动组卷
    {
        path: '/teacher/paper-creation/manual',
        name: 'ManualPaperCreation',
        component: ManualPaperCreation,
        meta: { requiresAuth: true }
    },
    //预览试卷
    {
        path: '/teacher/paper-preview',
        name: 'PreviewPaper',
        component:PreviewPaper,
        meta: { requiresAuth: true }
    },
    //预览自动生成试卷
    {
        path: '/teacher/preview-paper/auto',
        name: 'PreviewAutoPaper',
        component:PreviewAutoPaper,
        meta: { requiresAuth: true }
    },
    //预览按知识点生成试卷
    {
        path: '/teacher/preview-paper/knowledge-limited',
        name: 'PreviewKnowledgeLimitedPaper',
        component:PreviewKnowledgeLimitedPaper,
        meta: { requiresAuth: true }
    },
    //预览已生成试卷
    {
        path: '/teacher/paper-generated-preview',
        name: 'PreviewGeneratedPaper',
        component:PreviewGeneratedPaper,
        props: (route) => ({
            name: route.query.name,
            difficulty: route.query.difficulty,
            totalScore: route.query.totalScore
        }),
        meta: { requiresAuth: true }
    },
    //查看已批改试卷
    {
        path: '/teacher/paper-corrected-view',
        name: 'ViewCorrectedPaper',
        component:ViewCorrectedPaper,
        meta: { requiresAuth: true }
    },
    //管理试卷
    {
        path: '/teacher/paper-manage',
        name: 'ManagePaper',
        component:ManagePaper,
        meta: { requiresAuth: true }
    },
    //管理作业
    {
        path: '/teacher/homework-manage',
        name: 'ManageHomework',
        component:ManageHomework,
        meta: { requiresAuth: true }
    },
    //批改作业
    {
        path: '/teacher/correcting-paper',
        name: 'CorrectingPaper',
        component:CorrectingPaper,
        meta: { requiresAuth: true }
    },
    // 审核老师
    // 个人信息
    {
        path: '/audit-teacher/personal-info',
        name: 'AuditTeacherPersonalInfo',
        component: AuditTeacherPersonalInfo,
        meta: { requiresAuth: true }
    },
    // 审核习题列表
    {
        path: '/audit-teacher/question-list',
        name: 'QuestionList',
        component: QuestionList,
        meta: { requiresAuth: true }
    },
    // 审核习题
    {
        path: '/audit-teacher/audit-strategy',
        name: 'AuditStrategy',
        component: AuditStrategy,
        meta: { requiresAuth: true }
    },
    {
        path: '/audit-teacher/see-question',
        name: 'SeeQuestion',
        component: SeeQuestion,
        meta: { requiresAuth: true }
    },



    //系统管理员

    { path: '/system-admin/knowledge-point', component: KnowledgePoint, meta: { requiresAuth: true } },
    { path: '/system-admin/course-standard', component: CourseStandard, meta: { requiresAuth: true } },
    { path: '/system-admin/name', name:'name',component: Name, meta: { requiresAuth: true } },
    { path: '/system-admin/generate-sch-adm',component: GenerateSchadm, meta: { requiresAuth: true } },

    // 学管
    { path: '/school-admin/manage-student', component: ManageStudent, meta: { requiresAuth: true } },
    { path: '/school-admin/manage-class', component: ManageClassForSchool, meta: { requiresAuth: true } },
    { path: '/school-admin/manage-teacher', component: ManageTeacher, meta: { requiresAuth: true } },
    { path: '/school-admin/authorization-code', name:'AuthorizationCode',component: AuthorizationCode, meta: { requiresAuth: true } },


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
    {
        path: '/student/answer-homework',
        name: 'AnswerHomework',
        component: AnswerHomework,
        props: route => ({
            assignmentId: route.query.assignmentId,
            questions: route.query.questions,
            assignmentName: route.query.assignmentName
        }),
        meta: { requiresAuth: true }
    },
    {
        path: '/student/homework-detail/:assignmentId',
        name: 'HomeworkDetail',
        component: HomeworkDetail,
        props: route => ({
            assignmentId: route.query.assignmentId,
            assignmentName: route.query.assignmentName
        }),
        meta: { requiresAuth: true }
    },
    // 试卷管理
    { path: '/student/manage-test', name: 'ManageTest', component: ManageTest},
    // 个人分析
    { path: '/student/personal-profiling', name: 'PersonalProfiling', component: PersonalProfiling},
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
    'audit-teacher': ['/audit-teacher','/teacher']
};


const whiteList = ['/']; // 添加不需要重定向的路由

router.beforeEach(async (to, from, next) => {
    try {
        // 初始化用户信息
        await store.dispatch('initializeUser');
        const isAuthenticated = store.getters.isAuthenticated;
        const user = store.getters.getUser;
        let userRole = user ? user.role : null;
        let allowedRoutePrefix = roleRoutesMap[userRole];
        const permission = user && user.permission !== undefined ? user.permission : 0;

        console.log(`[Navigation] Trying to navigate to: ${to.path}`);
        console.log(`[Navigation] User role: ${userRole}, Permission: ${permission}, Allowed route prefix: ${allowedRoutePrefix}`);

        // 如果当前路由已经在白名单中，直接放行
        if (whiteList.includes(to.path)) {
            console.log('[Navigation] Path is in whitelist, proceeding...');
            next();
            return;
        }

        // 检查是否已经访问了目标路由
        if (from.path === to.path) {
            console.log('[Navigation] Same path, not redirecting...');
            next(); // 如果目标路由与当前路由相同，则不进行重定向
            return;
        }

        // 检查用户是否已认证
        if (to.matched.some(record => record.meta.requiresAuth)) {
            if (!isAuthenticated) {
                // 用户未认证，重定向到登录页
                console.log('[Navigation] User is not authenticated, redirecting to login...');
                ElMessage.error('请先登录'); // 显示提示消息
                next('/');
            } else if (userRole) {
                if (Array.isArray(allowedRoutePrefix)) {
                    // 如果 allowedRoutePrefix 是数组，检查 to.path 是否以数组中的任何一个前缀开头
                    if (allowedRoutePrefix.some(prefix => to.path.startsWith(prefix))) {
                        console.log('[Navigation] User has the correct role and is accessing an allowed route.');
                        next();
                    } else {
                        console.log('[Navigation] User does not have permission for this page.');
                        ElMessage.warning('您没有权限访问该页面');
                        const homeRoute = '/';
                        next(homeRoute);
                    }
                } else {
                    // 如果 allowedRoutePrefix 不是数组，直接检查 to.path 是否以 allowedRoutePrefix 开头
                    if (to.path.startsWith(allowedRoutePrefix)) {
                        console.log('[Navigation] User has the correct role and is accessing an allowed route.');
                        next();
                    } else {
                        console.log('[Navigation] User does not have permission for this page.');
                        ElMessage.warning('您没有权限访问该页面');
                        const homeRoute = '/';
                        next(homeRoute);
                    }
                }
            } else {
                // 用户已认证，但访问的不是允许的路由前缀，重定向首页
                console.log('[Navigation] User does not have permission for this page.');
                ElMessage.warning('您没有权限访问该页面');
                const homeRoute = '/';
                next(homeRoute);
            }
        } else {
            // 如果路由不需要认证，直接放行
            console.log('[Navigation] Route does not require authentication, proceeding...');
            next();
        }
    } catch (error) {
        console.error('[Navigation] Error during navigation guard:', error);
        ElMessage.error('发生错误，请稍后再试');
        next('/');
    }
});
export default router;

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
import name from '@/pages/system-admin/name.vue';
import GenerateSchadm from '@/pages/system-admin/GenerateSchadm.vue';

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
        component: TeacherPersonalInfo
    },
    //课标查看
    {
        path: '/teacher/view-curriculum-standard',
        name: 'ViewCurriculumStandard',
        component: ViewCurriculumStandard
    },
    //查看知识点
    {
        path: '/teacher/view-knowledge-point',
        name: 'ViewKnowledgePoint',
        component: ViewKnowledgePoint
    },
    //管理班级
    {
        path: '/teacher/manage-class',
        name: 'ManageClass',
        component: ManageClass
    },
    //上传习题
    {
        path: '/teacher/upload-question',
        name: 'UploadQuestion',
        component: UploadQuestion
    },
    //上传单题
    {
        path: '/teacher/upload-single-question',
        name: 'UploadSingleQuestion',
        component: UploadSingleQuestion
    },
    //上传组合题目
    {
        path: '/teacher/upload-combined-question',
        name: 'UploadCombinedQuestion',
        component: UploadCombinedQuestion
    },
    {
        path: '/teacher/test-generation-strategy',
        name: 'TestGenerationStrategy',
        component: TestGenerationStrategy
    },


    //系统管理员
    { path: '/system-admin/knowledge-point', component: KnowledgePoint },
    { path: '/system-admin/course-standard', component: CourseStandard },
    { path: '/system-admin/name', name:'name',component: name},
    { path: '/system-admin/generate-sch-adm',component: GenerateSchadm},

    // 学管
    { path: '/school-admin/manage-student', component: ManageStudent },
    { path: '/school-admin/manage-teacher', component: ManageTeacher },
    { path: '/school-admin/authorization-code', name:'AuthorizationCode',component: AuthorizationCode },


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
    },
    // 试卷管理
    { path: '/student/manage-test', name: 'ManageTest', component: ManageTest},
];


const router = createRouter({
    history: createWebHistory(),
    routes
});


export default router;

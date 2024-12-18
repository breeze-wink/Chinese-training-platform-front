// store/user.js

import { createStore } from 'vuex';
import router from "@/router/index.js";

export default createStore({
    state: {
        user: {
            id: null, // 用户唯一标识符
            role: null, // 用户角色，比如 'teacher' 或 'student'
            token: null,
            permission: null
        },
        isAuthenticated: false, // 登录状态
        basket: [], // 添加试卷篮状态


        unmarkedSubmissions: [], // 存储未批阅的学生列表
        currentSubmissionIndex: 0, // 当前批阅的学生索引
        currentStudent: { // 当前批阅的学生信息
            studentId: null,
            studentName: '',
            totalScore: 0
        },


    },
    mutations: {
        setUser(state, user) {
            const roleKey = `user_${user.role}`;
            state.user.id = user.id;
            state.user.role = user.role;
            state.user.token = user.token;
            state.user.permission = user.permission;
            state.isAuthenticated = true;

            // 保存用户信息到 localStorage 使用角色作为键的一部分
            localStorage.setItem(roleKey, JSON.stringify(user));
            localStorage.setItem(`isAuthenticated_${user.role}`, 'true');
        },
        clearUser(state, userRole) {
            const roleKey = `user_${userRole}`;
            state.user.id = null;
            state.user.role = null;
            state.user.token = null;
            state.user.permission = null;
            state.isAuthenticated = false;

            // 清除 localStorage 中的用户信息
            localStorage.removeItem(roleKey);
            localStorage.removeItem(`isAuthenticated_${userRole}`);
        },
        initializeUser(state) {
            // 尝试从 localStorage 中恢复最近登录的角色
            let recentRole = sessionStorage.getItem('recentRole');
            if (! recentRole) {
                recentRole = localStorage.getItem('recentRole');
            }

            if (recentRole) {
                const roleKey = `user_${recentRole}`;
                const user = JSON.parse(localStorage.getItem(roleKey));
                const isAuthenticated = localStorage.getItem(`isAuthenticated_${recentRole}`) === 'true';
                if (user && isAuthenticated) {
                    state.user = user;
                    state.isAuthenticated = true;
                    return; // 如果找到并恢复了最近登录的角色，则不需要继续检查其他角色
                }
            }

            // 如果没有找到最近登录的角色，或者最近登录的角色信息无效，则继续检查其他角色
            const roles = ['teacher', 'audit-teacher','sys-adm', 'sch-adm', 'student'];
            for (const role of roles) {
                const roleKey = `user_${role}`;
                const user = JSON.parse(localStorage.getItem(roleKey));
                const isAuthenticated = localStorage.getItem(`isAuthenticated_${role}`) === 'true';
                if (user && isAuthenticated) {
                    state.user = user;
                    state.isAuthenticated = true;
                    break;
                }
            }

            const storedBasket = localStorage.getItem('basket');
            if (storedBasket) {
                state.basket = JSON.parse(storedBasket);
            }
        },
        // 添加试卷篮相关的 mutations
        addQuestionToBasket(state, question) {
            state.basket.push(question);
            localStorage.setItem('basket', JSON.stringify(state.basket));
        },
        addQuestionsToBasket(state, questions) {
            // 检查并添加新问题，避免重复
            questions.forEach(question => {
                // 生成唯一的 ID，可以根据需求调整
                const questionId = question.id || `paper-${question.sequence}-${Math.random()}`;
                const exists = state.basket.find(q => q.id === questionId);
                if (!exists) {
                    state.basket.push({ ...question, id: questionId });
                }
            });
            localStorage.setItem('basket', JSON.stringify(state.basket));
        },
        removeQuestionFromBasket(state, questionId) {
            state.basket = state.basket.filter(q => q.id !== questionId);
            localStorage.setItem('basket', JSON.stringify(state.basket));
        },
        clearBasket(state) {
            state.basket = [];
            localStorage.setItem('basket', JSON.stringify(state.basket));
        },

        // 新增开始
        setUnmarkedSubmissions(state, submissions) {
            state.unmarkedSubmissions = submissions;
            localStorage.setItem('unmarkedSubmissions', JSON.stringify(submissions));
        },
        setCurrentSubmissionIndex(state, index) {
            state.currentSubmissionIndex = index;
            localStorage.setItem('currentSubmissionIndex', index);
        },
        removeSubmission(state, studentId) {
            state.unmarkedSubmissions = state.unmarkedSubmissions.filter(s => s.studentId !== studentId);
            localStorage.setItem('unmarkedSubmissions', JSON.stringify(state.unmarkedSubmissions));
        },
        setCurrentStudent(state, student) {
            state.currentStudent = student;
            localStorage.setItem('currentStudent', JSON.stringify(student));
        },
        initializeUnmarkedSubmissions(state) {
            const storedSubmissions = localStorage.getItem('unmarkedSubmissions');
            const storedIndex = localStorage.getItem('currentSubmissionIndex');
            const storedStudent = localStorage.getItem('currentStudent');

            if (storedSubmissions) {
                state.unmarkedSubmissions = JSON.parse(storedSubmissions);
            }

            if (storedIndex) {
                state.currentSubmissionIndex = Number(storedIndex);
            }

            if (storedStudent) {
                state.currentStudent = JSON.parse(storedStudent);
            }
        },
        // 新增结束
        setBasket(state, questions) {
            state.basket = questions;
            localStorage.setItem('basket', JSON.stringify(state.basket));
        },

    },

    actions: {
        // 登录操作，通常需要从服务器获取用户信息后调用
        login({ commit }, user) {
            // 在这里可以添加从服务器获取用户信息的逻辑
            commit('setUser', user);
            sessionStorage.setItem('recentRole', user.role);

            localStorage.setItem('recentRole', user.role);
        },
        // 注销操作
        async logout({ commit,state }) {
            // 在这里可以添加登出的逻辑
            commit('clearUser', state.user.role); // 传递 userRole
            commit('clearBasket');
            commit('setUnmarkedSubmissions', []);
            await router.push('/');
            console.log('导航成功');
        },
        initializeUser({ commit }) {
            commit('initializeUser');
            commit('initializeUnmarkedSubmissions'); // 新增
        },
        //试卷篮
        addQuestionToBasket({ commit }, question) {
            commit('addQuestionToBasket', question);
        },
        addQuestionsToBasket({ commit }, questions) {
            commit('addQuestionsToBasket', questions);
        },
        removeQuestionFromBasket({ commit }, questionId) {
            commit('removeQuestionFromBasket', questionId);
        },
        clearBasket({ commit }) {
            commit('clearBasket');
        },

        // 新增开始
        setUnmarkedSubmissions({ commit }, submissions) {
            commit('setUnmarkedSubmissions', submissions);
        },
        setCurrentSubmissionIndex({ commit }, index) {
            commit('setCurrentSubmissionIndex', index);
        },
        removeSubmission({ commit }, studentId) {
            commit('removeSubmission', studentId);
        },
        setCurrentStudent({ commit }, student) {
            commit('setCurrentStudent', student);
        },
        // 新增结束
        setBasket({ commit }, questions) {
            commit('setBasket', questions);
        },
    },
    getters: {
        // 获取当前用户信息
        getUser(state) {
            // 根据角色获取用户信息
            const role = state.user.role;
            return JSON.parse(localStorage.getItem(`user_${role}`));
        },
        // 获取用户 ID
        getUserId(state) {
            return state.user.id;
        },
        // 获取用户token
        getToken(state) {
            const role = state.user.role;
            if (role) {
                const user = JSON.parse(localStorage.getItem(`user_${role}`));
                return user ? user.token : null;
            }
            return null;
        },
        // 获取用户permission
        getPermission(state) {
            return state.user.permission;
        },
        // 检查当前用户是否为教师
        isTeacher(state) {
            return state.user.role === 'teacher';
        },
        // 检查当前用户是否为学生
        isStudent(state) {
            return state.user.role === 'student';
        },
        // 获取登录状态
        isAuthenticated(state) {
            return state.isAuthenticated;
        },
        //试卷蓝相关
        getBasket(state) {
            return state.basket;
        },
        getBasketCount(state) {
            return state.basket.length;
        },
        // 新增开始
        getUnmarkedSubmissions(state) {
            return state.unmarkedSubmissions;
        },
        getCurrentSubmissionIndex(state) {
            return state.currentSubmissionIndex;
        },
        getCurrentStudent(state) {
            return state.currentStudent;
        },
    }
});
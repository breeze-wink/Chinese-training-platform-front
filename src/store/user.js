// store/user.js

import { createStore } from 'vuex';
import router from "@/router/index.js";

export default createStore({
    state: {
        user: {
            id: null, // 用户唯一标识符
            role: null // 用户角色，比如 'teacher' 或 'student'
        },
        isAuthenticated: false // 登录状态
    },
    mutations: {
        // 设置用户信息
        setUser(state, user) {
            state.user.id = user.id;
            state.user.role = user.role;
            state.isAuthenticated = true; // 用户登录后，设置为已认证

            // 保存用户信息到 localStorage
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('isAuthenticated', 'true');

        },
        // 清除用户信息（用于注销等操作）
        clearUser(state) {
            state.user.id = null;
            state.user.role = null;
            state.isAuthenticated = false;

            // 清除 localStorage 中的用户信息
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
        },
        initializeUser(state) {
            const user = JSON.parse(localStorage.getItem('user'));
            const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
            if (user && isAuthenticated) {
              state.user = user;
              state.isAuthenticated = true;
            }
        }
    },

    actions: {
        // 登录操作，通常需要从服务器获取用户信息后调用
        login({ commit }, user) {
            // 在这里可以添加从服务器获取用户信息的逻辑
            commit('setUser', user);
        },
        // 注销操作
        async logout({commit}) {
            // 在这里可以添加登出的逻辑
            commit('clearUser');
            await router.push('/');
            console.log('导航成功');

        },
        initializeUser({ commit }) {
            commit('initializeUser');
        }
    },
    getters: {
        // 获取当前用户信息
        getUser(state) {
            return state.user;
        },
        // 获取用户 ID
        getUserId(state) {
            return state.user.id;
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
        }
    }
});

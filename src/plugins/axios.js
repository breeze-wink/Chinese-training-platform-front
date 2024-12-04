// apiClient.js
import axios from 'axios';
import store  from '@/store/user'; // 确保正确导入 store 实例

const apiClient = axios.create({
    baseURL: 'http://localhost:8081',
    withCredentials: false,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.request.use(
    config => {
        console.log('Request Interceptor:', config);
        const token = store.getters.getToken; // 直接使用 store 实例访问 getters
        if (token && !config.url.endsWith('login')) { // 假设登录接口都以 'login' 结尾
            config.headers.Authorization = `${token}`; // 使用 'Bearer ' 前缀
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default apiClient;
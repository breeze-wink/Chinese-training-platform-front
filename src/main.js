import { createApp } from 'vue';
import App from './App.vue';
import router from './router';  // 引入 router

// 创建应用并使用 router
createApp(App).use(router).mount('#app');

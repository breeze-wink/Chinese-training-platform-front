import { createApp } from 'vue';
import App from './App.vue';
import router from './router';  // 引入 router

import store from './store';  // 引入 Vuex store

//引入elementPlus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App);

// 使用 Element Plus
app.use(ElementPlus);
// 使用 Vue Router
app.use(router);
// 使用 Vuex store
app.use(store);

// 注册 Element Plus Icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

// 挂载应用
app.mount('#app');



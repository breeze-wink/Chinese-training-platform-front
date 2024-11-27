import { createApp } from 'vue';
import App from './App.vue';
import router from './router';  // 引入 router
import store from './store/user.js';  // 引入 Vuex store
import 'element-plus/dist/index.css';
import 'quill/dist/quill.snow.css';
import '@vueup/vue-quill/dist/vue-quill.snow.css';



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
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
// 在 Vuex 初始化后恢复用户信息
async function initializeApp() {
    // 在应用启动时从 localStorage 恢复用户信息
    await store.dispatch('initializeUser'); // 等待 initializeUser 动作完成
}

initializeApp().then(() => {
    app.mount('#app'); // 在初始化完成后再挂载应用
});
// 注册 Element Plus Icons


// 挂载应用




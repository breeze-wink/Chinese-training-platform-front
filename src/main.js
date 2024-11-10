import { createApp } from 'vue';
import App from './App.vue';
import router from './router';  // 引入 router
//引入elementPlus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'



createApp(App).use(ElementPlus).use(router).mount('#app');
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    App.component(key, component)
}




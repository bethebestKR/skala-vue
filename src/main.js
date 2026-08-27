import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// [외부 UI 라이브러리] Element Plus 전역 등록
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Element Plus 아이콘을 전역 컴포넌트로 등록 (예: <el-icon><Search /></el-icon>)
for (const [name, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(name, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')

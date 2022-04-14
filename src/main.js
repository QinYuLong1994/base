import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import echarts from 'echarts'
import VueQuillEditor from 'vue-quill-editor'
import Viser from 'viser-vue'


import 'ant-design-vue/dist/antd.css'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'


import './permission'    //---导航守卫，决定路由跳转规则---

import './utils/axios'      //---给axios原生对象添加请求拦截---


Vue.config.productionTip = false;

Vue.prototype.$echarts = echarts;   //---echarts全局配置---

Vue.use(Antd);
Vue.use(Viser);

Vue.use(VueQuillEditor);

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')

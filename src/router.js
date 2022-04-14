import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

const constantRouterMap = [
    {
        name: 'login',
        path: '/login',
        component: () => import('@/views/Login')
    },
    {
        path: "/",
        redirect: "/home"
    }
];

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRouterMap
})

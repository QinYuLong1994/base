import router from './router'
import store from './store'
import axios from "axios"

const whiteList = ['/login'];

//---最后一定要执行next()，意味着到达目的地了---
router.beforeEach((to, from, next)=>{

    if (whiteList.indexOf(to.path) !== -1){
        next()
    }else {

        if (!localStorage.hasOwnProperty(store.state.TOKEN_NAME) || !localStorage.getItem(store.state.TOKEN_NAME)){
            next({
                path: '/login'
            })
        }else {

            if (!store.state.routed){
                if (store.state.nav === ''){

                    store.dispatch('getNav').then(function (res) {
                        // console.log(res);

                        store.dispatch('initUserinfo').then(() => {

                            let routers = res.map((item)=>{
                                if (item.leaf){
                                    return {
                                        path: '/layout',
                                        component: ()=>import('@/components/Layout'),
                                        children:[
                                            {
                                                path: item.path,
                                                component: () => import('@/views/'+item.component),
                                                name: item.name
                                            }
                                        ]
                                    }
                                }else {
                                    let childrenArr = item.children.map((child)=>{
                                        if (child.leaf){
                                            return {
                                                path: child.path,
                                                component: () => import('@/views/'+child.component),
                                                name: child.name
                                            }
                                        }
                                    });

                                    return {
                                        path: '/layout',
                                        component: ()=>import('@/components/Layout'),
                                        children: childrenArr
                                    }
                                }
                            });

                            routers.forEach(r =>{
                                router.addRoute(r);
                            })
                            // router.addRoutes(routers);

                            store.commit('setRouted', true);

                            next({
                                ...to,
                                replace: true
                            });

                        });


                    })
                }
            }else {
                //---正式页面的跳转，在这里进入---
                //---配置选中的menu---
                const nav = store.state.nav;
                nav.map((item)=>{
                    if(item.leaf){
                        if (item.path === to.path){
                            store.commit('setMenuKey', item.key);
                        }
                    }else {
                        item.children.map((child)=>{
                            if (child.leaf){
                                if (child.path === to.path){
                                    store.commit('setMenuKey', child.key);
                                    store.commit('setOpenKey', item.key);
                                }
                            }
                        })
                    }
                });

                let time = new Date().getTime();
                let name = store.state.TOKEN_NAME;
                let expireKey = store.state.EXPIRE_NAME;
                if (localStorage.hasOwnProperty(expireKey) && localStorage.getItem(expireKey) < time){

                    axios('/framework/boot/token/refresh?token='+ localStorage.getItem(name)).then(rep=>{

                        if (rep.status === 200){
                            let expire = new Date().getTime() + 1000 * 60 * 60 * 20;
                            localStorage.setItem(expireKey, expire);
                            localStorage.setItem(name, rep.data.data);

                            //---真正实现导航---
                            next();
                        }

                    });

                }else {

                    //---真正实现导航---
                    next();

                }
            }

        }

    }

});
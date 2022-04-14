import Vue from 'vue'
import Vuex from 'vuex'
import http from '@/utils/axios'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        nav: '',
        routed: false,
        menuKey: '',
        openKey: 'home',
        tenantHost: '',
        tenant: false,
        tenantMode: 'DISCRIMINATOR',
        tenantEnv: "TENANT",

        TOKEN_NAME: 'Ews-Token',
        EXPIRE_NAME: 'token-expire',
        TENANT_HEADER_HOST_NAME: 'Ews-Tenant-Host',
        userinfo: {}
    },
    mutations: {
        setNav(state, nav){
            state.nav = nav
        },
        setRouted(state, val){
            state.routed = val
        },
        setMenuKey(state, key){
            state.menuKey = key
        },
        setOpenKey(state, key){
            state.openKey = key
        },
        setUserinfo(state, info){
            state.userinfo = info
            state.tenant = info.tenant.enable
            state.tenantMode = info.tenant.mode
            state.tenantEnv = info.tenant.env
        }
    },
    actions: {
        getNav({commit}){
            return new Promise((resolve, reject)=>{
                http.get('/framework/boot/user/menu').then(function (res) {
                    if (res.success){
                        commit('setNav', res.data)
                        resolve(res.data)
                    }else {
                        reject(res.data)
                    }
                })
            })
        },
        initUserinfo({commit}){
            return new Promise((resolve, reject) => {
                http.get('/framework/boot/user/info').then(function (res) {
                    if (res.success){
                        commit('setUserinfo', res.data);
                        resolve(res.data);
                    } else {
                        reject(res.data);
                    }
                })
            })
        }
    }
})

import Vue from 'vue'
import store from '../store'
import router from '../router'
import axios from "axios"

const http = axios.create({
    transformRequest: [data => {
        return JSON.stringify(data);
    }]
});

http.interceptors.request.use( async function (config) {

    let time = new Date().getTime();
    let name = store.state.TOKEN_NAME;
    let expireKey = store.state.EXPIRE_NAME;
    if (localStorage.hasOwnProperty(expireKey) && localStorage.getItem(expireKey) > time){
        if (localStorage.hasOwnProperty(name) && localStorage.getItem(name)){
            config.headers['Authorization'] = 'Bearer '+ localStorage.getItem(name);
        }
    }else {
        if (localStorage.hasOwnProperty(expireKey) && localStorage.hasOwnProperty(name)){
            try{
                const res = await axios('/framework/boot/token/refresh?token='+ localStorage.getItem(name));
                if (res.status === 200){
                    let expire = new Date().getTime() + 1000 * 60 * 60 * 20;
                    localStorage.setItem(expireKey, expire);
                    localStorage.setItem(name, res.data.data);
                    config.headers['Authorization'] = 'Bearer '+ res.data.data
                }
            }catch (err) {
                console.log(err);
                localStorage.removeItem(name)
                localStorage.removeItem(expireKey)
                router.push('/login')
            }
        }
    }

    if (store.state.tenant && store.state.tenantHost){
        config.headers[store.state.TENANT_HEADER_HOST_NAME] = store.state.tenantHost
    }

    config.headers['Content-Type'] = 'application/json;charset=UTF-8';
    return config

}, function (error) {

    return Promise.reject(error)

});

http.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    if (response.status === 200){
        return response.data;
    }else {
        return response;
    }

}, function (error) {
    // 对响应错误做点什么
    //---token过期---
    if (error.response.status === 401){

        router.replace({name:'login'});

        localStorage.removeItem(store.state.TOKEN_NAME);

        return Promise.reject(error.response.data)

    }else {
        return Promise.reject(error);
    }

});


Vue.prototype.$http=http;

export default http

import Vue from 'vue'
import http from "@/utils/axios";
export default {
    //一级字典显示
    getDictLabel: function (value,datas) {
        let actions = [];
        if(datas){
            Object.keys(datas).some((key) => {
                if (datas[key].value == ('' + value)) {
                    actions.push(datas[key].name);
                }
            })
        }
        if(actions.length == 0){
            actions.push(value);
        }
        return actions.join('');
    },
    //导出为excel
    export: function (pathHttp, data, name) {
        return new Promise((resolve, reject) => {
            http.post(pathHttp,data, {responseType: 'blob'}).then(data => {
                const link = document.createElement('a');
                const blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                link.setAttribute('href', window.URL.createObjectURL(blob));
                link.setAttribute('download', name + new Date().getTime() + '.xlsx');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                resolve(data);
            })
        });
    },
    // 异常
    errorHandler: function (error) {
        // if (error.response) {
        //     // 请求已发出，但服务器响应的状态码不在 2xx 范围内
        //     Vue.prototype.$message.error(error.response.headers);
        //     console.log(error.response.status);
        // } else {
        //     // Something happened in setting up the request that triggered an Error
        //     Vue.prototype.$message.error(error.message);
        // }
        // console.log(error.config);

        if (error.response.status === 401) {
            Vue.prototype.$message.error('当前用户的角色，不允许访问该数据！');
        }
    },
}

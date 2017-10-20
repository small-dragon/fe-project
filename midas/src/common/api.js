import Vue from 'vue'
import Pop from 'pop-message'
import Store from 'store'

const Api = {
    showAllLoading: false,
    getJson(url, param, type = "get", dataType = "json", option) {
        const { showErrMsg, showLoading } = Object.assign({ showErrMsg: true, showLoading: false }, option) 
        dataType == "jsonp" && (type = "jsonp")
        if (showLoading) Store.state.showLoading = true // 是否显示loading动画
        return Vue.http[type](url, type == "post" ? param : {
            params: param,
        }, type == "post" && { emulateJSON: true }).then((data) => {
            if (showLoading && !this.showAllLoading) Store.state.showLoading = false
            return data.json()
        }, (e) => {
            if (showLoading && !this.showAllLoading) Store.state.showLoading = false
            if (e.body) {
                var h1 = e.body.match(/<h1>([\s\S]*)<\/h1>/i)
                console.error(h1 && h1[1])
            }
            showErrMsg && !/^0|200|304$/.test(e.status) && Pop.showMessage(`${url}:${e.status}`);
            showErrMsg && e.message && /200/.test(e.status) && Pop.showMessage(e.message);
            throw e;
        }).then((data) => {
            // -1参数缺少，-2接口报错，-3签名错误，-999其他，1成功 -4尚未登陆
            // if(/isLogin/.test(url)) return data
            if (+data.errno===401) {
                Pop.showMessage(`您还未登录`)
                throw data
            }
            if (data.errno !== 0) {
                data.errmsg && Pop.showMessage(`${data.errmsg}`);
                throw data;
            }
            return data;
        })
    },
    go2login(currentUrl = location.href) {
        Pop.showMessage(`你该去登录了`)
    },
    // 多个ajax统一处理函数，目的是为了ajax都返回时才去处理（比如loading问题)
    // 这里不用去处理异常，因为单个ajax会去处理,一个异常ajax不会影响其他ajax
    async promiseAll(arr = [], option){
        const { showLoading } = Object.assign({ showLoading: false }, option) 
        try {
            if (showLoading) {
                this.showAllLoading = true
                Store.state.showLoading = true
            }
            return await Promise.all(arr)
        } finally {
            if (showLoading) {
                Store.state.showLoading = false
                this.showAllLoading = false
            }
        }
    },
    getImgVerify () {
        return `${ this.serverPath }Jyxapi/Public/imgVerify?${ Date.now() }`
    }
};

const ApiMap = {
    index: {
        query_default_solution: "index/query_default_solution:post",
        relationships: "index/relationships:post",
        default_solution: "index/default_solution:post"
    },
    auth: {
        save_solution: "auth/save_solution:post",
        query_solution: "auth/query_solution:post",
    },
    useraccount: {
        logout: "useraccount/logout:post",
        is_login: "useraccount/is_login",
        login: "useraccount/login:post"
    }
}

for (let i in ApiMap) {
    Api[i] = Api[i] || {};
    for (let j in ApiMap[i]) {
        Api[i][j] = function (param, option) {
            var ApiMapDetail = ApiMap[i][j];
            var url = ApiMapDetail.split(":")[0];
            var method = ApiMapDetail.split(":")[1];
            var dataType = ApiMapDetail.split(":")[2];
            return Api.getJson(url, param, method, dataType, option)
        }
    }
}

export default Api;
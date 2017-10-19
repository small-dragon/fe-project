import Vue from 'vue';
import VueResource from 'vue-resource';
import Resource from 'resource';
import store from 'store'
import router from './router';
import App from './pages/app.vue';
import Pop from 'pop-message';
import Api from 'api';
import sleep from 'sleep';
import 'polyfill';
Vue.use(VueResource);

//全局组件、自定义指令注册
let comps = Resource.requireAll((require.context("./comps/", true, /\.vue$/)))
comps.forEach((comp) => {
    Vue.component(comp.name, comp)
})

let directives = Resource.requireAll((require.context("./directives/", true, /\.js$/)))
directives.forEach((f) => {
    Vue.directive(f.default.name, f.default.callback())
})


Vue.config.errorHandler = function (err, vm, info) {
	console.log(err)
	console.log(vm)
    console.log(info)
}

//把库/模块引入Vue原型
Object.defineProperty(Vue.prototype, '$pop', { value: Pop})
Object.defineProperty(Vue.prototype, '$api', { value: Api})
Object.defineProperty(Vue.prototype, '$sleep', { value: sleep})

new Vue({
    router,
    el: 'app',
    store,
    render: h => h(App)
})

// window.onbeforeunload = (e) => {
//     if(store.state.isSaved && !/dev/.test(ENV) && /main/.test(location.hash)) {
//         const msg = '您的作品尚未保存，直接退出将会导致现有作品丢失'
//         event.returnValue = msg
//         return msg
//     }
// }
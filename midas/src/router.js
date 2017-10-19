import Vue from 'vue'
import VueRouter from 'vue-router';
import Store from 'store'
Vue.use(VueRouter);

export default  new VueRouter({
    mode: 'hash',
    routes: [
        { path: '', redirect: 'home' }, 
        { path: '/home', component: r => require([`./pages/home/home.vue`], r) },
        { path: '/main', component: r => require([`./pages/main/main.vue`], r) },
        // { path: '/pricelist', component: r => require([`./pages/pricelist/pricelist.vue`], r) },
        // { path: '/itemlist', component: r => require([`./pages/itemlist/itemlist.vue`], r) },
        { path: '*', component: r => require(['./pages/404.vue'], r) }
    ]
})
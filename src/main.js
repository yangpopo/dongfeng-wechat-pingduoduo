import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Vant from 'vant';
import 'vant/lib/index.css';
Vue.use(Vant);

import * as filters from './filters/index';

Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key]);
})

import requests from './request/axios.js';   // 记得改为你的路径
Vue.prototype.$axios = requests.requests;  // 此处命名为rq,你可以改

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

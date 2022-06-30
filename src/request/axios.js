import axios from 'axios';
import { Toast } from 'vant';
import store from '../store/index'; // vuex

// 获取url token 和 type来源
function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = location.hash.split('?')[1].match(reg);
  if (r != null) {
      return unescape(r[2]);
  } else {
      return null;
  }
}

let token = getUrlParam('token');
let type = getUrlParam('type'); // app: 来自app  null: 来自小程序

// 存储vuex
store.commit('updateToken', token);
store.commit('updateType', type);

let baseURL = "";
if(type == "app") {
  baseURL = process.env.VUE_APP_API;
} else {
  baseURL = process.env.VUE_APP_WECHAT_API;
}
console.log(baseURL, '-------', type);

// 创建 axios 实例
const requests = axios.create({
  baseURL,
  headers: {
    token,
  },
  timeout: 10000 // 请求超时时间
})

// 错误处理函数
const err = (error) => {
  if (error.response) {
    const data = error.response.data
    Toast(data.message || data.msg || data.mes);
  }
  return Promise.reject(error)
}

// request interceptor(请求拦截器)
requests.interceptors.request.use(config => {
    return config
  }, err)

// response interceptor（接收拦截器）
requests.interceptors.response.use((response) => {
  const res = response.data;
  if (res.code == "10003") {
    // 登录失效|未登录
    if (type == null) {
      // 小程序跳去登录
      // wx.miniProgram.navigateTo({ url: '/pages/login/index' });
      wx.miniProgram.redirectTo({
        url: '/pages/login/index?next=' + encodeURIComponent('/pages/webpage/index?url=' + encodeURIComponent(location.href))
      })
    } else {
      // app跳去登录
    }
  } else if (res.code !== 0 && res.code !== 200) { 
    Toast(res.message || res.msg || res.mes);
    return Promise.reject('error')
  } else {
    return res
  }
}, err)

export default {
  requests
}
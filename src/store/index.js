import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: '', // 口令
    type: '', // 来源 app  null: 小程序
    // orderList: [], // 订单列表
  },
  mutations: {
    // 更新token
    updateToken(state, val) {
      state.token = val;
    },
    // 更新type
    updateType(state, val) {
      state.type = val;
    },
    // // 缓存订单列表
    // cacheOrderList(state, val) {
    //   state.orderList = val;
    // }
  },
  actions: {
  },
  modules: {
  }
})

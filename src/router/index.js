import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/bargaining'
  },
  {
    path: '/bargaining',
    component: () => import(/* webpackChunkName: "bargaining" */ '../views/bargaining/Index.vue'),
    meta:{title:"砍价"},
    children: [
      {
        path: '',
        name: 'bargaining',
        meta:{title:"砍价"},
        component: () => import(/* webpackChunkName: "bargainingHome" */ '../views/bargaining/Home.vue'),
      },
      {
        path: 'bargaining-betails',
        name: 'bargainingDetails',
        meta:{title:"砍价详情"},
        component: () => import(/* webpackChunkName: "bargainingDetails" */ '../views/bargaining/Details.vue'),
      },
      {
        path: 'pay-result',
        name: 'BargainingPayResult',
        meta:{title:"支付"},
        component: () => import(/* webpackChunkName: "BargainingPayResult" */ '../views/bargaining/PayResult.vue'),
      }
    ]
  },
  {
    path: '/collage',
    meta:{title:"拼团"},
    component: () => import(/* webpackChunkName: "collageIndex" */ '../views/collage/Index.vue'),
    children: [
      {
        path: '',
        name: 'Collage',
        meta:{title:"拼团"},
        component: () => import(/* webpackChunkName: "CollageHome" */ '../views/collage/Home.vue'),
      },
      {
        path: 'my-collage',
        name: 'MyCollage',
        meta:{title:"我的拼团"},
        component: () => import(/* webpackChunkName: "MyCollage" */ '../views/collage/MyCollage.vue'),
      },
      {
        path: 'my-collage-details',
        name: 'MyCollageDetails',
        meta:{title:"我的拼团"},
        component: () => import(/* webpackChunkName: "MyCollageDetails" */ '../views/collage/MyCollageDetails.vue'),
      },
      {
        path: 'pay-result',
        name: 'CollagePayResult',
        meta:{title:"支付"},
        component: () => import(/* webpackChunkName: "CollagePayResult" */ '../views/collage/PayResult.vue'),
      },
    ]
  },
  {
    path: '/order',
    meta:{title:"我的订单"},
    component: () => import(/* webpackChunkName: "collageIndex" */ '../views/order/Index.vue'),
    children: [
      {
        path: '',
        name: 'order',
        meta:{title:"我的订单"},
        component: () => import(/* webpackChunkName: "orderHome" */ '../views/order/Home.vue'),
      },
      {
        path: 'order-details',
        name: 'orderDetails',
        meta:{title:"订单详情"},
        component: () => import(/* webpackChunkName: "orderDetails" */ '../views/order/Details.vue'),
      },{
        path: 'order-love-details',
        name: 'orderLoveDetails',
        meta:{title:"订单详情"},
        component: () => import(/* webpackChunkName: "LoveDetails" */ '../views/order/LoveDetails.vue'),
      },
      {
        path: 'pay-result',
        name: 'CollagePayResult',
        meta:{title:"支付"},
        component: () => import(/* webpackChunkName: "CollagePayResult" */ '../views/order/PayResult.vue'),
      },
    ]
  }
]

const router = new VueRouter({
  routes
})

//全局后置钩子，不需要主动调用next()函数
router.afterEach((to,from) => {
  if (to.meta.title != undefined) {
    document.title = to.meta.title;
  } else {
    document.title = "";
  }
})

export default router

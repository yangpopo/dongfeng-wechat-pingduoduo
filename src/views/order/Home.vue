<template>
  <div class="order">
    <Navigation @return-emit="returnEmit">
      <template v-slot:title>
        我的订单
      </template>
    </Navigation>
    <ul class="menu-box">
      <li :class="{'select': menuIndex == 1}" @click="switchMenu(1)">砍价订单</li>
      <li :class="{'select': menuIndex == 2}" @click="switchMenu(2)">拼团订单</li>
    </ul>
    <div class="order-box">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list v-model="loading" :finished="finished" :finished-text="orderList.length == 0 ? '' : '没有更多了'" @load="onPullUpLoad" >
          <component v-bind:is="menuIndex == 1 ? 'OrderBargaining' : 'OrderCollage'" class="order-unit" v-for="order in orderList" :key="order.id" :order-info="order" ></component>
          <van-empty v-if="orderList.length == 0" description="暂无订单" />
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script>
import MaskBox from "@/components/MaskBox";
import Navigation from '@/components/Navigation.vue';
import OrderCollage from "@/components/OrderCollage";
import OrderBargaining from "@/components/OrderBargaining";
import { PullRefresh, List, Toast, Dialog } from 'vant';
import { mapState, mapMutations } from 'vuex'
import { ORDER_ORDER_PAGE } from '@/request/api';


export default {
  name: 'order',
  components: {
    MaskBox,
    OrderCollage,
    OrderBargaining,
    Navigation
  },
  data() {
    return {
      menuIndex: 1, // 菜单索引 1,砍价订单，2,拼团订单
      loading: false, // 是否处于上拉加载状态
      finished: false, // 是否已加载完成
      refreshing: false, // 是否处于下来刷新中状态
      page: {
        startPage: 1, // 当前页面
        pageSize: 10, // 一页多少数据
      },
      orderList: [], // 订单列表
    }
  },

  // 生命周期
  mounted() {
    this.menuIndex = Number.parseInt(this.$route.query.menuIndex);
  },

  // 计算属性
  computed: {
   ...mapState(['token', 'type']),
  },

  // 事件
  methods:{
    // ...mapMutations(['cacheOrderList']),
    // 返回按钮
    returnEmit() {
      this.$router.go(-1);
    },
    // 切换菜单
    switchMenu(index) {
      this.menuIndex = index;
      this.orderList = []; // 清空数据
      this.page.startPage = 1;
      this.finished = false; // 设置未加载完
      this.loading = false;
      this.refreshing = true; // 设置未下拉刷新状态
      // 修改路由参数
      this.$router.push({ path: "/order", query:{ menuIndex: this.menuIndex, token: this.token, type: this.type} });
      this.getOrderList();
    },
    // 下拉刷新
    onRefresh() {
      console.log("下拉刷新");
      this.page = {
        startPage: 1, 
        pageSize: 10, 
      };
      this.loading = false;
      this.orderList = [];
      this.getOrderList();
    },
    // 上拉加载
    onPullUpLoad() {
      console.log("上拉加载");
      this.getOrderList();
    },
    getOrderList() {
      this.$axios.post(ORDER_ORDER_PAGE, {...this.page, types: this.menuIndex}).then(res => {
        this.refreshing = false;
        this.loading = false;
        if (res.code == 0) {
          if (res.data.pageCount <= this.page.startPage) {
            this.finished = true;
          }
          res.data.data.forEach(item => {
            if (item.detailImg != null) {
              item.detailImg = item.detailImg.split(",");
            } else {
              item.detailImg = [];
            }
            this.orderList.push(item);
          })
          // this.cacheOrderList(this.orderList);
          this.page.startPage++;
        } else {
          Toast(res.msg);
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.order {
  width: 100vw;
  background-color: #fff;
  box-sizing: border-box;
  position: relative;
  padding-top: 14vw;
  .menu-box {
    width: 100%;
    display: flex;
    justify-content: space-around;
    box-sizing: border-box;
    padding: 4vw 5vw;
    li {
      font-size: 4vw;
      color: #859096;
      margin: 0 5vw;
      &.select {
        color: #F76D3F;
      }
    }
  }
  .order-box {
    width: 100%;
    box-sizing: border-box;
    padding: 3vw;
    .order-unit {
      margin-bottom: 3vw;
    }
  }
}
</style>
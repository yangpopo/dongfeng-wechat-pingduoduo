<template>
  <div class="order">
    <Navigation @return-emit="returnEmit">
    </Navigation>
    <ul class="menu-box">
      <li :class="{'select': menuIndex == 3}" @click="switchMenu(3)">爱车订单</li>
      <li :class="{'select': menuIndex == 1}" @click="switchMenu(1)">砍价订单</li>
      <li :class="{'select': menuIndex == 2}" @click="switchMenu(2)">拼团订单</li>
    </ul>
    <div class="order-box">
      <!-- 更多分类 -->
      <ul class="more-class" v-if="menuIndex == 3">
        <li :class="{'select': moreClassIndex === ''}" @click="switchMoreClass('')">全部</li>
        <li :class="{'select': moreClassIndex === 0}" @click="switchMoreClass(0)">待支付</li>
        <li :class="{'select': moreClassIndex === 1}" @click="switchMoreClass(1)">已完成</li>
        <li :class="{'select': moreClassIndex === 2}" @click="switchMoreClass(2)">退款/售后</li>
      </ul>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list v-model="loading" :finished="finished" :finished-text="orderList.length == 0 ? '' : '没有更多了'" @load="onPullUpLoad" >
          <!-- 爱车订单 -->
          <template v-if="menuIndex == 3">
            <OrderItem v-for="order in orderList" :key="order.id" :order-info="order"
            :data-info="order"
            @deleteOrder="deleteOrder"
            @refundOrder="openRefundOrder"
            @pay="goPay"
            />
          </template>
          
          <!-- 砍价 -->
          <template v-if="menuIndex == 1">
            <OrderBargaining  class="order-unit" v-for="order in orderList" :key="order.id" :order-info="order"  />
          </template>
          
          <!-- 拼团 -->
          <template v-if="menuIndex == 2">
            <OrderCollage class="order-unit" v-for="order in orderList" :key="order.id" :order-info="order"  />
          </template>
          
          <van-empty v-if="orderList.length == 0" description="暂无订单" />
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 申请退款 -->
    <mask-box ref="refundPopup">
      <div class="refund-popup">
        <div class="title">退款原因</div>
        <textarea v-model="remark" placeholder="请输入退款原因，以便为您提供更好的服务。" maxlength="100" class="textarea-box"></textarea>
        <div class="tap">（5-100字）</div>
        <div class="common but" @click="submitRefund" >确认退款</div>
        <img @click="clostRefundPopup" class="close-but" src="../../assets/img/close-01.png" alt="">
      </div>
    </mask-box>

    <!-- 支付 -->
    <pay-type ref="payType" :payInfo="payInfo" :jump-link="payJumpLink" />

  </div>
</template>

<script>
import appApi from '@/assets/js/appApi.js';
import MaskBox from "@/components/MaskBox";
import PayType from "@/components/PayType";
import Navigation from '@/components/Navigation.vue';
import OrderCollage from "@/components/OrderCollage";
import OrderBargaining from "@/components/OrderBargaining";
import OrderItem from '@/components/OrderItem';
import { PullRefresh, List, Toast, Dialog } from 'vant';
import { mapState } from 'vuex';
import { ORDER_ORDER_PAGE, ORDER_DEL_ORDER, ORDER_REFUND, ORDER_PAY_PARAM } from '@/request/api';


export default {
  name: 'order',
  components: {
    MaskBox,
    OrderCollage,
    OrderBargaining,
    OrderItem,
    Navigation,
    PayType
  },
  data() {
    return {
      menuIndex: 3, // 菜单索引 3,爱车订单, 1,砍价订单，2,拼团订单
      moreClassIndex: '', // 更多分类
      loading: false, // 是否处于上拉加载状态
      finished: false, // 是否已加载完成
      refreshing: false, // 是否处于下来刷新中状态
      switchState: false, // 菜单切换状态
      page: {
        startPage: 1, // 当前页面
        pageSize: 10, // 一页多少数据
      },
      orderList: [], // 订单列表
      operationOrder: {}, // 操作订单
      remark: '', // 退款原因
      payInfo: {}, // 支付信息
      payJumpLink: '', // 跳转链接
    }
  },

  // 生命周期
  mounted() {
    this.menuIndex = Number.parseInt(this.$route.query.menuIndex) || 3;
  },

  // 计算属性
  computed: {
   ...mapState(['token', 'type']),
  },

  // 事件
  methods:{
    // 返回按钮
    returnEmit() {
      if (this.type == 'app') {
        // app关闭窗口  
        appApi.closePage();
      } else {
        wx.miniProgram.switchTab({ url: '/pages/my/index' }); // 跳个人中心
        // wx.miniProgram.navigateBack(); // 微信关闭窗口
        console.log("微信关闭窗口");
      }
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
      this.switchState = true;
      if (this.menuIndex != 3) {
        this.moreClassIndex = '';
      }
      this.getOrderList();
    },
    // 切换更多分类
    switchMoreClass(index) {
      this.moreClassIndex = index;
      this.orderList = []; // 清空数据
      this.page.startPage = 1;
      this.finished = false; // 设置未加载完
      this.loading = false;
      this.refreshing = true; // 设置未下拉刷新状态
      this.getOrderList();
    },
    // 下拉刷新
    async onRefresh() {
      console.log("下拉刷新");
      this.page = {
        startPage: 1, 
        pageSize: 10, 
      };
      this.loading = false;
      this.orderList = [];
      await this.getOrderList();
      if (this.orderList.length == 10) {
        this.finished = false;
      }
    },
    // 上拉加载
    onPullUpLoad() {
      if (this.switchState != true) {
        console.log("上拉加载");
        this.getOrderList();
      } else {
        this.switchState = false;
      }
    },
    async getOrderList() {
      await this.$axios.post(ORDER_ORDER_PAGE, {...this.page, types: this.menuIndex, status: this.moreClassIndex}).then(res => {
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
          this.page.startPage++;
        } else {
          Toast(res.msg);
        }
      })
    },
    // 删除订单
    deleteOrder(data) {
      Dialog.confirm({
        title: '提示',
        message: '确认要删除订单吗？'
      }).then(() => {
        this.$axios.post(ORDER_DEL_ORDER, {
          orderId: data.id
        }).then(res => {
          if (res.code == 0) {
            Toast.success('删除成功!');
            setTimeout(() => {
              this.orderList = []; // 清空数据
              this.page.startPage = 1;
              this.finished = false; // 设置未加载完
              this.loading = false;
              this.refreshing = true; // 设置未下拉刷新状态
              this.$nextTick(() => {
                this.getOrderList();
              })
            }, 1000);
          } else {
            Toast(res.msg);
          }
        })
      }).catch(() => {
      });
    },

    // 打开订单退款
    openRefundOrder(data) {
      this.operationOrder = data;
      this.$refs.refundPopup.showState = true;
    },

    // 关闭订单退款
    clostRefundPopup() {
      this.$refs.refundPopup.showState = false;
    },

    // 发起退款
    submitRefund() {
      if (this.remark.length < 5) {
        Toast('退款理由不能少于5个字!');
        return
      }
      this.$axios.post(ORDER_REFUND, {
        orderId: this.operationOrder.id,
        remark: this.remark,
      }).then(res => {
        if (res.code == 0) {
          this.$refs.refundPopup.showState = false;
          Toast.success('退款成功!');
          setTimeout(() => {
            this.orderList = []; // 清空数据
            this.page.startPage = 1;
            this.finished = false; // 设置未加载完
            this.loading = false;
            this.refreshing = true; // 设置未下拉刷新状态
            this.$nextTick(() => {
              this.getOrderList();
            })
          }, 1000);
        } else {
          Toast(res.msg);
        }
      })
    },

    // 去支付
    goPay(data) {
      let orderId = data.id;
      this.payJumpLink = `/order/pay-result?orderId=${orderId}`;
      this.$nextTick(() =>{
        this.$axios.post(ORDER_PAY_PARAM, {id: orderId}).then(res => {
          if (res.code == 0) {
            this.payInfo = {...res.data, orderId: orderId}; 
            this.$refs.payType.showState = true;
          }
        })
      })
    },
  }
}
</script>

<style scoped lang="scss">
.order {
  width: 100vw;
  background-color: #fff;
  box-sizing: border-box;
  position: relative;
  // padding-top: 14vw;
  .menu-box {
    width: 100%;
    display: flex;
    justify-content: space-around;
    box-sizing: border-box;
    padding: 4vw 5vw 4vw 10vw;
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
    .more-class {
      width: 100%;
      box-sizing: border-box;
      padding: 0 5vw 3vw 5vw;
      display: flex;
      flex-wrap: nowrap;
      font-size: 3.2vw;
      color: #859096;
      justify-content: space-between;
      li {
        box-sizing: border-box;
        width: 20%;
        text-align: center;
        &.select {
            color: #F76D3F;
        }
      }
    }
    .order-unit {
      margin-bottom: 3vw;
    }
  }
  .refund-popup {
    position: absolute;
    top: 42%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    width: 70vw;
    height: 88vw;
    box-sizing: border-box;
    padding: 3vw;
    border-radius: 5vw;
    .title {
      width: 100%;
      font-size: 3.5vw;
      text-align: center;
      margin-bottom: 3vw;
    }
    .textarea-box {
      width: 100%;
      height: 50vw;
      border: none;
      box-sizing: border-box;
      padding: 3vw;
      font-size: 3.5vw;
      background-color: #FAFAFA;
      resize: none;
      margin-bottom: 2vw;
    }
    .tap {
      font-size: 3vw;
      text-align: right;
      color: #859096;
      margin-bottom: 4vw;
    }
    .close-but {
      position: absolute;
      bottom: -15vw;
      left: 50%;
      transform: translateX(-50%);
      width: 10vw;
      height: 10vw;
    }
  }
  .but {
    width: 100%;
    box-sizing: border-box;
    padding: 3vw 0;
    border-radius: 3vw;
    font-size: 3.5vw;
    text-align: center;
    &.common {
      background-color: #F76D3F;
      color: #fff;
      margin-bottom: 3vw;
    }
    &.grey {
      background-color: #FAFAFA;
      color: #444954;
    }
  }
}
</style>
<template>
  <div class="home" v-if="bargainingInfo.id">
    <Navigation @return-emit="returnEmit">
      <template v-slot:title>
        砍价
      </template>
    </Navigation>
    <swiper class="swiper-box" ref="mySwiper" :options="swiperOptions" v-if="bargainingInfo.images.length > 0">
      <swiper-slide class="slide-box" v-for="imgItem in bargainingInfo.images" :key="imgItem"><img class="img-slide" :src="imgItem" alt="" /></swiper-slide>
      <div class="swiper-pagination" slot="pagination"></div>
    </swiper>
    <div class="price-info">
      <dl class="price">
        <dt>定金<b>{{ bargainingInfo.deposit | priceUnit }}</b>元</dt>
        <dd><span class="price-01">砍价后：{{ bargainingInfo.targetPrice | priceUnit }}元</span><span class="price-02">原价：{{ bargainingInfo.price | priceUnit }}元</span></dd>
      </dl>
      <span class="right-box"><van-count-down :time="activityDownTime" />后结束</span>
    </div>
    <div class="basic-info">
      <div class="name">
        <span class="tap">砍价</span>{{ bargainingInfo.name }}
      </div>
      <dl class="additional-info">
        <dt>{{ bargainingInfo.describe }}</dt>
        <dd>库存：{{ bargainingInfo.stock }}</dd>
      </dl>
    </div>
    <div class="main-box">
      <div class="title">活动详情</div>
      <div class="rich-text" v-html="bargainingInfo.details">
      </div>
    </div>
    <div class="bottom-box">
      <div class="left-box">
        <div class="icon-but customer-service" @click="customerService">
          <img src="../../assets/img/customer-service.png" alt="">
          客服
        </div>
        <div class="icon-but my-bargain" @click="myOrder">
          <img src="../../assets/img/my-bargain.png" alt="">
          我的砍价
        </div>
      </div>
      <!-- 活动结束 -->
      <template v-if="(bargainingInfo.endTime - currentTime) <= 0">
        <div class="text-but ed">活动结束</div>
      </template>
      <template v-else>
        <div class="text-but ing" v-if="bargainingInfo.flag == 0" @click="startBargaining">发起砍价</div>
        <div class="text-but ing" v-else-if="bargainingInfo.flag == 1" @click="continueBargaining">继续砍价</div>
      </template>
    </div>

    <!-- 订单信息 -->
    <order-info-bargaining ref="orderInfo" :activity-info="activityInfo" @address-submit="jumpDetails" />

    <!-- 自坎一刀 -->
    <mask-box ref="successPopup">
      <div class="success-box">
        <img class="title-icon" src="../../assets/img/bargaining/title-icon.png" alt="">
        <div class="main-box">
          <img class="success-light" src="../../assets/img/bargaining/success-light.png" alt="">
          <img class="auto-icon" src="../../assets/img/bargaining/auto-icon.png" alt="">
        </div>
        <div class="describe">
          恭喜您，已砍掉<b>{{ ownBargainingPrice | priceUnit }}</b>元
        </div>
      </div>
    </mask-box>

  </div>
</template>

<script>
import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper';
import 'swiper/css/swiper.min.css';
import { mapState } from 'vuex';
import MaskBox from "@/components/MaskBox";
import Navigation from '@/components/Navigation.vue';
import { Toast, Dialog } from 'vant';
import OrderInfoBargaining from "@/components/OrderInfoBargaining";
import { BARGAIN_ACTIVITY_INFO } from "@/request/api";

export default {
  name: 'bargaining',
  components: {
    Swiper,
    SwiperSlide,
    directive,
    MaskBox,
    OrderInfoBargaining,
    Navigation
  },
  data() {
    return {
      // 轮播配置
      swiperOptions: {
        autoplay: true,     // 把这里的3000改为true就可以了、
        pagination:  {
          el: ".swiper-pagination",
        },
        loop: true,
      },
      activityDownTime: 0, // 活动倒计时
      id: "", // 砍价id
      bargainingInfo: {}, // 砍价信息
      currentTime: new Date().getTime(), // 当前时间
      ownBargainingPrice: 0, // 自坎一刀价格
      activityInfo: {}, // 活动信息
    }
  },

  // 计算属性
  computed: {
    ...mapState(['token', 'type']),
    swiper() {
      return this.$refs.mySwiper.$swiper
    }
  },

  // 生命周期
  mounted() {
    this.id = this.$route.query.id;
    this.getBargainingInfo();
  },
  // 过滤器
  filters: {
    
  },
  // 事件
  methods:{
    returnEmit() {
      this.$router.go(-1);
    },
    // 获取
    getBargainingInfo() {
      Toast.loading({
        message: '加载中...',
        forbidClick: true,
        duration: 0,
      });
      this.$axios.post(BARGAIN_ACTIVITY_INFO, {
        id: this.id
      }).then((res) => {
        Toast.clear();
        if (res.code == 0) {
          // 数据处理
          if (res.data.images != null) {
            res.data.images = res.data.images.split(",");
          } else {
            res.data.images = [];
          }
          this.activityDownTime = res.data.endTime - this.currentTime;
          this.bargainingInfo = res.data
        } else {
          Toast(res.mes);
        }
      })
    },

    // 发起砍价
    startBargaining() {
      this.activityInfo = {
        type: false,
        titleData: '填写信息',
        id: this.bargainingInfo.id,
        price: this.bargainingInfo.deposit,
        butData: '提交'
      }
      console.log(this.activityInfo);
      this.$refs.orderInfo.showState(true);
    },

    // 继续砍价
    continueBargaining(){
      this.$router.push({ path: "/bargaining/bargaining-betails", query: {customerBargainId: this.bargainingInfo.customerBargainId, orderNo: this.bargainingInfo.appOrderEntity.orderNo, token: this.token, type: this.type} });
    },

    // 跳转详情
    jumpDetails(res) {
      console.log(res, "-----");
      if (res.state == true) {
        // 砍价成功
        this.$refs.orderInfo.showState(false);
        this.ownBargainingPrice = res.data.price;
        this.$refs.successPopup.showState = true;
        setTimeout(() => {
          this.$router.push({ path: "/bargaining/bargaining-betails", query: {customerBargainId: res.data.customerBargainId, orderNo: res.data.orderNo,token: this.token, type: this.type} });
        }, 1500)
      }
    },

    // 我的订单
    myOrder() {
      this.$router.push({ path: "/order", query:{ menuIndex: 1, token: this.token, type: this.type} });
    },

    // 跳转客服
    customerService(){
      window.location.href="https://cschat-ccs.aliyun.com/index.htm?tntInstId=_1194WK0&scene=SCE00003734"
    }
  }
}
</script>

<style scoped lang="scss">
.home {
  width: 100vw;
  background-color: #fff;
  box-sizing: border-box;
  padding-top: 14vw;
  position: relative;
  .swiper-box{
    height: 65vw;
    .slide-box {
      position: relative;
      .img-slide {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width:auto;
        min-width: 100%;
        height: 100%;
      }
    }
  }
  .price-info {
    width: 100%;
    box-sizing: border-box;
    background-color: #E83228;
    padding: 3vw 4vw;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .price {
      color: #fff;
      dt {
        font-size: 3vw;
        b {
          font-size: 8vw;
          font-weight: normal;
          color: #ffffff;
          margin-left: 2vw;
        }
      }
      dd {
        font-size: 3vw;
        .price-01 {
          color: #FDE785;
          margin-right: 3vw;
        }
        .price-02 {
          color: #fff;
          text-decoration: line-through;
        }
      }
    }
    .right-box {
      font-size: 3.5vw;
      color: #E83228;
      background-color: #FDE785;
      box-sizing: border-box;
      padding: 1vw 3vw;
      border-radius: 15vw;
      margin-top: -3vw;
      display: flex;
      align-items: center;
      /deep/.van-count-down {
        color: #E83228;
        margin-right: 1vw;
      }
    }
  }
  .basic-info {
    width: 100%;
    background-color: #FAFAFA;
    box-sizing: border-box;
    padding: 3vw;
    .name {
      width: 100%;
      font-size: 4vw;
      line-height: 6vw;
      color: #444954;
      margin-bottom: 1vw;
      word-break: break-all;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2; /* 这里是超出几行省略 */
      overflow: hidden;
      span.tap {
        font-size: 3vw;
        color: #fff;
        background-color: #F2A55F;
        box-sizing: border-box;
        padding: 0.3vw 2vw;
        border-radius: 4vw;
        margin-right: 1vw;
      }
    }
    .additional-info {
      width: 100%;
      font-size: 3vw;
      dt {
        color: #444954;
        margin-bottom: 1vw;
      }
      dd {
        color: #859096;
      }
    }
  }
  .main-box {
    box-sizing: border-box;
    padding: 8vw 5vw 25vw 5vw;
    > .title {
      font-size: 4vw;
      color: #444954;
      margin-bottom: 5vw;
    }
    > .rich-text {
      width: 100%;
      background-color: #FAFAFA;
      box-sizing: border-box;
      padding: 3vw;
    }
  }
  .bottom-box {
    position: fixed;
    width: 100%;
    height: 22vw;
    background-color: #fff;
    left: 0;
    bottom: 0;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 4vw 2vw 0 2vw;
    .left-box {
      display: flex;
      align-items: center;
    }
    .icon-but {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-size: 3vw;
      color: #6F7B88;
      width: 18vw;
      img {
        width: 6vw;
        height: 6vw;
      }
    }
    .text-but {
      font-size: 4vw;
      box-sizing: border-box;
      padding: 3vw;
      width: 50vw;
      text-align: center;
      border-radius: 3vw;
      &.ing {
        color: #fff;
        background-color: #F76D3F;
      }
      &.ed {
        color: #859096;
        background-color: #F6F7F9;
      }
    }
  }
  .address-popup {
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #FFFFFF;
    width: 70vw;
    box-sizing: border-box;
    padding: 5vw 5vw;
    border-radius: 3vw;
    >.title {
      width: 100%;
      font-size: 4vw;
      color: #454952;
      text-align: center;
      margin-bottom: 3vw;
    }
    >.list-box {
      width: 100%;
      background-color: #FAFAFA;
      box-sizing: border-box;
      padding: 0 2vw;
      margin-bottom: 5vw;
      .unit-box {
        width: 100%;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 3vw 0;
        b{
          font-weight: normal;
          font-size: 3.5vw;
          color: #454952;
        }
        .input-box {
          border: none;
          background-color: transparent;
          font-size: 3.5vw;
          width: 30vw;
          text-align: right;
          color: #859096;
        }
        .select-box {
          font-size: 3.5vw;
          color: #859096;
          display: flex;
          align-items: center;
          svg.icon {
            width: 3vw;
            height: 3vw;
            vertical-align: middle;
            fill: currentColor;
            overflow: hidden;
            margin-left: 2vw;
          }
        }
        .price {
          font-size: 4.5vw;
          color: #F76D3F;
        }
      }
    }
    .address-submit {
      margin: 0 auto;
      box-sizing: border-box;
      padding: 3vw;
      text-align: center;
      color: #fff;
      background-color: #F76D3F;
      font-size: 4vw;
      border-radius: 3vw;
    }
    .address-close {
      position: absolute;
      bottom: -15vw;
      left: 50%;
      transform: translateX(-50%);
      width: 10vw;
      height: 10vw;
    }
  }
  .success-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content:center;
    .title-icon {
      width: 50vw;
      height: 12vw;
    }
    .main-box{
      width: 60vw;
      height: 60vw;
      position: relative;
    }
    .success-light {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 0;
      width: 80vw;
      height: 80vw;
      animation: success-light 4s;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
    @keyframes success-light {
      0% {
        transform: translate(-50%, -50%) rotate(0deg);
      }
      100% {
        transform: translate(-50%, -50%) rotate(360deg);
      }
    }
    .auto-icon {
      width: 58vw;
      height: 28vw;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
    }
    .help-icon {
      width: 35vw;
      height: 35vw;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
    }
    .describe {
      color: #FFFFFF;
      font-size: 3.5vw;
      text-align: center;
      b {
        font-size: 4.5vw;
        color: #FDE785;
        font-weight: normal;
      }
    }
  }
}
</style>
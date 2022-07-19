<template>
  <div class="order-details" v-if="order.id">
    <Navigation @return-emit="returnEmit">
    </Navigation>
    <div class="order">
      <div class="cover-box">
        <img v-if="order.type == 1" :src="order.detailImg[0].type == 'images' ? order.detailImg[0].imagesUrl : order.detailImg[0].videoUrl + '?vframe/jpg/offset/4'" alt />
        <img v-if="order.type == 2" :src="order.detailImg[0]" alt />
      </div>
      <dl class="info">
        <dt class="title">{{ order.orderName }}</dt>
        <dd class="dd-01">订金：{{ order.price | priceUnit }}元</dd>
        <dd class="dd-02">
          <span class="tap-01" v-if="order.type == 1">砍后价：{{ order.totalPrice / 100 / 10000 }}万元</span>
          <!-- <span class="tap-02">申请退款</span>
          <span class="tap-03">订单未支付</span>-->
        </dd>
      </dl>
    </div>
    <ul class="user-info">
      <li>
        <div class="title">姓名</div>
        <div class="val">{{ order.userName }}</div>
      </li>
      <li>
        <div class="title">电话</div>
        <div class="val">{{ order.phone }}</div>
      </li>
      <li>
        <div class="title">省市</div>
        <div class="val">{{ order.provinceName }}{{ order.cityName }}</div>
      </li>
      <li>
        <div class="title">经销商</div>
        <div class="val">{{ order.dealerName }}</div>
      </li>
    </ul>
    <ul class="order-info">
      <li>订单编号：{{ order.orderNo }}</li>
      <li>下单时间：{{ (order.ct / 1000) | formatDate('yyyy-MM-dd hh:mm:ss') }}</li>
      <li v-if="order.status == 4" class="write-code">核销码：{{ order.orderNo }}</li>
    </ul>
    <template v-if="order.type == 1">
      <!-- 砍价 -->
      <!-- -1已失效,0待支付，1已支付，2发起退款，3已退款，4已核销,5退款失败 -->
      <!-- 已失效 -->
      <div class="grey but" v-if="order.status == -1">已失效</div>
      <!-- 待支付 -->
      <div class="common but" v-if="order.status == 0" @click="goPay">去支付</div>
      <!-- 已支付 -->
      <div class="grey but" v-if="order.status == 1" @click="openRefundPopup">申请退款</div>
      <!-- 发起退款 -->
      <div class="grey but" v-if="order.status == 2">已发起退款</div>
      <!-- 已退款 -->
      <div class="grey but" v-if="order.status == 3">已退款</div>
      <!-- 已核销 -->
      <div class="grey but" v-if="order.status == 4">已核销</div>
      <!-- 退款失败 -->
      <div class="grey but" v-if="order.status == 5">退款失败</div>
    </template>
    <template v-if="order.type == 2">
      <!-- 拼团 -->
      <template v-if="order.teamStatus == 0">
        <!-- 拼团中 -->
        <div class="common but" v-if="order.teamStatus == 0" @click="goShare" >去分享</div>
        <div class="common but" v-if="order.status == 0" @click="goPay" >去支付</div>
        <div class="grey but" v-else-if="order.status == 1" @click="openRefundPopup">申请退款</div>
      </template>
      <template v-else-if="order.teamStatus == 1">
        <!-- 拼团成功 -->
        <div class="grey but" v-if="order.status == 1" @click="openRefundPopup">申请退款</div>
      </template>
      <template v-else-if="order.teamStatus == 2">
        <!-- 拼团失败 -->
        <div class="grey but" v-if="order.status == 1">拼团失败,已自动退款</div>
      </template>
    </template>
    
    

    <!-- 支付 -->
    <pay-type ref="payType" :payInfo="payInfo" :jump-link="payJumpLink" />

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

  </div>
</template>

<script>
import MaskBox from "@/components/MaskBox";
import Navigation from '@/components/Navigation.vue';
import PayType from "@/components/PayType";
import { mapState } from 'vuex';
import { Toast, Dialog } from 'vant';
import { ORDER_PAY_PARAM, ORDER_REFUND, ORDER_QUERY_ONE } from '@/request/api';

export default {
  name: "Details",
  components: {
    MaskBox,
    PayType,
    Navigation
  },
  data() {
    return {
      remark: "", // 退款原因
      orderId: '', // 订单id
      order: {}, // 订单数据
      payInfo: {}, // 支付信息
      payJumpLink: '', // 支付跳转链接
    };
  },

  // 计算属性
  computed: {
   ...mapState(['token', 'type']),
  },

  // 生命周期
  mounted() {
    this.orderId = this.$route.query.orderId;
    this.getOrderDetails();
  },

  // 事件
  methods: {
    // 获取订单详情
    getOrderDetails() {
      this.$axios.post(ORDER_QUERY_ONE, {orderId: this.orderId}).then(res => {
        if (res.code == 0) {
          if(res.data.detailImg != null) {
            if (res.data.type == 1) {
              // 砍价
              res.data.detailImg = JSON.parse(res.data.detailImg);
            } else if (res.data.type == 2) {
              // 拼团
              res.data.detailImg = res.data.detailImg.split(",");
            }
          } else {
            res.data.detailImg = [];
          }
          
          this.order = res.data;
        } else {
          Toast(res.msg);
        }
      })
    },
    // 返回
    returnEmit() {
      this.$router.push({ path: "/order",  query:{ token: this.token, type: this.type, menuIndex: this.order.type } });
      // if () {
      //   // 从支付结果页面来
      //   this.$router.push({ path: "/order/"});
      // } else {
      //   // 从订单页面来
      //   this.$router.go(-1);
      // }
    },
    // 去分享
    goShare() {
      this.$router.push({ path: "/collage/my-collage", query:{ teamId: this.order.target, token: this.token, type: this.type, ifJoin: 1} });
    },
    // 去支付
    goPay() {
      this.payJumpLink = `/order/pay-result?orderId=${this.orderId}`;
      this.$nextTick(() =>{
        this.$axios.post(ORDER_PAY_PARAM, {id: this.order.id}).then(res => {
          if (res.code == 0) {
            this.payInfo = {...res.data, orderId: this.orderId}; 
            this.$refs.payType.showState = true;
          }
        })
      })
    },

    // 打开退款弹窗
    openRefundPopup() {
      this.$refs.refundPopup.showState = true;
    },

    // 关闭退款弹窗
    clostRefundPopup() {
      this.$refs.refundPopup.showState = false;
    },

    // 提交退款
    submitRefund() {
      if (this.remark.length < 5) {
        Toast('退款理由不能少于5个字!');
        return
      }
      this.$axios.post(ORDER_REFUND, {orderId: this.orderId, remark: this.remark}).then(res => {
        if (res.code == 0) {
          Toast.success('退款成功');
          this.returnEmit();
        } else {
          Toast(res.msg);
        }
        this.$refs.refundPopup.showState = false;
      })
      
    }
  }
};
</script>

<style scoped lang="scss">
.order-details {
  width: 100vw;
  background-color: #fff;
  box-sizing: border-box;
  padding: 3vw;
  position: relative;
  // padding-top: 14vw;
  .order {
    width: 100%;
    background-color: #fafafa;
    display: flex;
    box-sizing: border-box;
    padding: 3vw;
    margin-bottom: 3vw;
    .cover-box {
      width: 25vw;
      height: 25vw;
      overflow: hidden;
      position: relative;
      border-radius: 3vw;
      flex-shrink: 0;
      margin-right: 2vw;
      img {
        position: absolute;
        width: auto;
        min-width: 100%;
        height: 100%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
    .info {
      width: calc(100% - 25vw - 2vw);
      dt.title {
        width: 100%;
        font-size: 3.5vw;
        color: #444954;
        word-break: break-all;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2; /* 这里是超出几行省略 */
        overflow: hidden;
        height: 10vw;
        margin-bottom: 2vw;
      }
      dd.dd-01 {
        font-size: 3vw;
        color: #686d70;
        margin-bottom: 2vw;
      }
      dd.dd-02 {
        display: flex;
        justify-content: space-between;
        span.tap-01 {
          font-size: 3.5vw;
          color: #fa3226;
        }
        span.tap-02 {
          font-size: 3vw;
          color: #444954;
          background-color: #fff;
          box-sizing: border-box;
          padding: 0.5vw 3vw;
          border-radius: 4vw;
        }
        span.tap-03 {
          font-size: 3vw;
          color: #ffffff;
          background-color: #f76d3f;
          box-sizing: border-box;
          padding: 0.5vw 3vw;
          border-radius: 4vw;
        }
      }
    }
  }
  .user-info {
    width: 100%;
    box-sizing: border-box;
    background-color: #fafafa;
    padding: 1vw 5vw;
    border-radius: 3vw;
    margin-bottom: 3vw;
    li {
      box-sizing: border-box;
      padding: 2vw 0;
      display: flex;
      justify-content: space-between;
      font-size: 3.5vw;
      color: #454952;
      .val {
        text-align: right;
        width: 50vw;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
  .order-info {
    width: 100%;
    margin-bottom: 8vw;
    li {
      font-size: 3vw;
      color: #686D70;
      padding: 2vw 0;
      &.write-code {
        color: rgb(42, 141, 255);
      }
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
}
</style>
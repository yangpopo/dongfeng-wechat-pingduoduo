<template>
  <div class="pay-result">
    <!-- 支付成功 -->
    <div class="pay-box" v-if="result">
      <img class="payment-icon" src="../../assets/img/payment-success.png" alt="">
      <dl class="explain">
        <dt>支付成功</dt>
        <dd>您可凭身份证明和订单记录<br />到经销商门店支付尾款</dd>
      </dl>
      <div class="pay-but" @click="viewOrder">查看订单</div>
    </div>
    <!-- 支付失败 -->
    <div class="pay-box" v-else>
      <img class="payment-icon" src="../../assets/img/payment-fail.png" alt="">
      <dl class="explain">
        <dt>支付失败</dt>
        <dd>请返回上一页重新支付</dd>
      </dl>
      <div class="pay-but" @click="returnPage">返回</div>
    </div>
  </div>
</template>

<script>
import MaskBox from "@/components/MaskBox";
import { mapState } from 'vuex';

export default {
  name: 'PayResult',
  components: {
    MaskBox
  },
  data() {
    return {
      result: false, // 结果状态
      id: '', // 订单id
      orderNo: '', // 订单编号
      customerBargainId: '', // 砍价id
    }
  },

  // 计算属性
  computed: {
    ...mapState(['token', 'type']),
  },

  // 生命周期
  mounted() {
    this.result = this.$route.query.result == 'true' ? true : false;
    this.id = this.$route.query.id || ''; // 订单id
    this.orderNo = this.$route.query.orderNo || ''; // 订单id
    this.customerBargainId = this.$route.query.customerBargainId || null; // 砍价id
  },

  // 事件
  methods:{
    // 返回页面
    returnPage() {
      this.$router.push({ path: "/order/", query: {token: this.token, type: this.type, menuIndex: 1} });
    },

    // 查看订单
    viewOrder() {
      this.$router.push({ path: "/order/order-details", query:{ orderId: this.id, token: this.token, type: this.type} });
    },
  }
}
</script>

<style scoped lang="scss">
.pay-result {
  width: 100vw;
  min-height: 100vh;
  position: relative;
  .pay-box {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60vw;
    .payment-icon {
      width: 32vw;
      height: 32vw;
      margin: 0 auto 5vw auto;
    }
    .explain {
      width: 100%;
      text-align: center;
      margin: 0 auto 6vw auto;
      dt {
        font-size: 4vw;
        color: #444954;
        margin-bottom: 2vw;
      }
      dd {
        font-size: 3vw;
        color: #859096;
      }
    }
    .pay-but {
      background-color: #F76D3F;
      box-sizing: border-box;
      padding: 3vw 0;
      text-align: center;
      color: #fff;
      font-size: 4vw;
      border-radius: 3vw;
      width: 80%;
      margin: 0 auto;
    }
  }
}
</style>
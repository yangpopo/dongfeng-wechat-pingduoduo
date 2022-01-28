<template>
  <div class="pay-result">
    <!-- 支付成功 -->
    <div class="pay-box" v-if="result">
      <img class="payment-icon" src="../../assets/img/payment-success.png" alt="">
      <dl class="explain">
        <dt>支付成功</dt>
        <dd>您可凭身份证明和订单记录<br />到经销商门店支付尾款</dd>
      </dl>
      <div class="pay-but" @click="returnPage">返回</div>
    </div>
    <!-- 支付失败 -->
    <div class="pay-box" v-else>
      <img class="payment-icon" src="../../assets/img/payment-fail.png" alt="">
      <dl class="explain">
        <dt>支付失败</dt>
        <dd>请前往“活动订单-拼团活动”中重新支付</dd>
      </dl>
      <div class="pay-but" @click="jumpMyOrder">查看拼团活动订单</div>
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
      id: '',
      tempId: '',
    }
  },

  // 计算属性
  computed: {
   ...mapState(['token', 'type']),
  },

  // 生命周期
  mounted() {
    this.result = this.$route.query.result;
    this.id = this.$route.query.id || null;
    this.teamId = this.$route.query.teamId || null;
  },

  // 事件
  methods:{
    // 返回页面
    returnPage() {
      this.$router.push({ path: "/my-collage", query:{ id: this.id, tempId: this.tempId } });
      // this.$router.go(-1);
    },

    // 跳转我的订单
    jumpMyOrder() {
      this.$router.push({ path: "/order", query:{ menuIndex: 0, token: this.token, type: this.type} });
    }
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
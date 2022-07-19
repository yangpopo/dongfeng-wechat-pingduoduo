<template>
  <div class="order-bargaining" @click="goOrderDetails">
    <div class="cover-box">
      <img :src="OrderInfo.detailImg[0].type == 'images' ? OrderInfo.detailImg[0].imagesUrl : OrderInfo.detailImg[0].videoUrl + '?vframe/jpg/offset/4'" alt="">
    </div>
    <dl class="info">
      <dt class="title">{{ OrderInfo.orderName }}</dt>
      <dd class="dd-01">订金：{{ OrderInfo.price | priceUnit }}元</dd>
      <dd class="dd-02">
        <span class="tap-01">砍后价：{{ OrderInfo.totalPrice / 100 / 10000 }}万元</span>
        <span class="tap-02" v-if="OrderInfo.status == -1">已失效</span>
        <span class="tap-03" v-else-if="OrderInfo.status == 0">订单未支付</span>
        <span class="tap-02" v-else-if="OrderInfo.status == 1">已支付</span>
        <span class="tap-02" v-else-if="OrderInfo.status == 2">发起退款</span>
        <span class="tap-02" v-else-if="OrderInfo.status == 3">已退款</span>
        <span class="tap-02" v-else-if="OrderInfo.status == 4">已核销</span>
        <span class="tap-02" v-else-if="OrderInfo.status == 5">退款失败</span>
      </dd>
    </dl>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'OrderBargaining',
  props: {
    // 订单砍价信息
    OrderInfo: {
      type: Object,
      default:() => {
        return {}
      }
    }
  },
  data() {
    return {
      showState: false,
    }
  },
  // 计算属性
  computed: {
   ...mapState(['token', 'type']),
  },
  // 方法
  methods: {
    // 去订单详情
    goOrderDetails() {
      this.$router.push({ path: "/order/order-details", query:{ orderId: this.OrderInfo.id, token: this.token, type: this.type} });
    },
  }
}
</script>
<style scoped lang="scss">
.order-bargaining {
  width: 100%;
  background-color: #FAFAFA;
  display: flex;
  box-sizing: border-box;
  padding: 3vw;
  border-radius: 3vw;
  .cover-box {
    width: 25vw;
    height: 25vw;
    overflow: hidden;
    position: relative;
    border-radius: 3vw;
    flex-shrink: 0;
    margin-right: 2vw;
    img{
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
      color: #686D70;
      margin-bottom: 2vw;  
    }
    dd.dd-02{
      display: flex;
      justify-content: space-between;
      span.tap-01 {
        font-size: 3.5vw;
        color: #FA3226;
      }
      span.tap-02 {
        font-size: 3vw;
        color: #444954;
        background-color: #fff;
        box-sizing: border-box;
        padding: .5vw 3vw;
        border-radius: 4vw;
      }
      span.tap-03 {
        font-size: 3vw;
        color: #FFFFFF;
        background-color: #F76D3F;
        box-sizing: border-box;
        padding: .5vw 3vw;
        border-radius: 4vw;
      }
    }
  }
}
</style>

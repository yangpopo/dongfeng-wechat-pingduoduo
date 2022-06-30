<template>
  <div class="order-menu-three">
    <!-- 爱车订单 -- 开始 -->
    <div class="order-item" @click="enterOrderDetail(dataInfo)">
      <div class="o-top">
        <div class="t-left">订单号：{{ dataInfo.orderNo }}</div>
        <div class="t-right">
          <!-- -1已失效,0待支付，1已支付，2发起退款，3已退款，4已核销,5退款失败 -->
          <span class="gray" v-if="dataInfo.status === -1">已失效</span>
          <span class="red" v-else-if="dataInfo.status === 0">待支付</span>
          <span class="green" v-else-if="dataInfo.status === 1">已支付</span>
          <span class="red" v-else-if="dataInfo.status === 2">退款中</span>
          <span class="red" v-else-if="dataInfo.status === 3">已退款</span>
          <span class="black" v-else-if="dataInfo.status === 4">已核销</span>
          <span class="red" v-else-if="dataInfo.status === 5">退款失败</span>
        </div>
      </div>
      <div class="o-center">
        <div class="c-left">
          <img :src="dataInfo.listImg | formatUrl" />
        </div>
        <div class="c-right">
          <div class="r-top">{{ dataInfo.orderName }}</div>
          <div class="r-bottom">
            <span class="name">订金</span>
            <span class="value">￥{{ dataInfo.price / 100 }}</span>
          </div>
        </div>
      </div>
      <div class="o-bottom">
        <div class="b-left">
          <span style="color: #429aff" v-if="(dataInfo.status == 1) || (dataInfo.status == 2) || (dataInfo.status == 4) || (dataInfo.status == 5)">核销码：{{ dataInfo.verifyCode }}</span>
        </div>
        <div class="b-right">
          <div class="r-btn" v-if="dataInfo.status === 1" @click.stop="openRefundEvent">申请退款</div>
          <div class="r-btn" v-if="dataInfo.status === 0" @click.stop="payEvent">支付订金</div>
          <div class="r-btn" v-if="(dataInfo.status === 0) || (dataInfo.status === 3) || (dataInfo.status === -1)" @click.stop="deleteOrderEvent">删除订单</div>
        </div>
      </div>
    </div>
    <!-- 爱车订单 -- 结束 -->
  </div>
</template>

<script>
export default {
  name: 'OrderItemThree',

  components: {
  },

  props: {
    dataInfo: {
      type: Object
    },
  },

  computed: {

  },
  data() {
    return {}
  },
  
   // 过滤器
  filters:{
    formatUrl (value) {
      if (!value) return ''
      // TODO 是否启用代理
      if (value.indexOf('http') === 0) {
        // 绝对地址处理
        return value
      } else if (value.indexOf('data:') >= 0) {
        // base64 处理
        return value
      } else {
        // 相对地址处理
        return config.cdnUrl + value
      }
    }
  },

  methods: {
    /** 申请退款 */
    applyRefundEvent(data) {
      this.$COMMON.replyRefundMoney(data.orderId)
    },
    /** 申请退货退款 */
    applyRefundObjectEvent(data) {
      this.$COMMON.replyRefundObject(data.orderId)
    },
    /** 进入风迷订单详情 */
    enterFMOrderDetail(data) {
      if (['1', '2', '3', '4', '5', '6'].indexOf(data.orderStatus) > -1) {
        this.$COMMON.refundDetail(data.orderId)
      } else {
        this.$COMMON.goOrderDetail(data.orderId)
      }
    },
    /** 进入订单详情页面 */
    enterOrderDetail(obj) {
      this.$router.push({
        path: '/order/order-love-details',
        query: {
          orderId: obj.id,
          token: this.$route.query.token
        }
      })
    },
    /** 支付订金 */
    payEvent() {
      this.$emit('pay', {
        ...this.dataInfo
      })
    },
    /** 发起退款 */
    openRefundEvent() {
      this.$emit('refundOrder', {
        ...this.dataInfo
      })
    },
    /** 删除订单 */
    deleteOrderEvent() {
      this.$emit('deleteOrder', {
        ...this.dataInfo
      })
    },
  }
}
</script>

<style scoped lang="scss">
/** 主题色*/
$primary-color: #e60613;
$bg-color: #f2f2f2;

/** 系统颜色 */
$c-black: #000000;
$c-102: #000102;
$c-333: #333333;
$c-3a3: #3A3A3A;
$c-666: #666666;
$c-999: #999999;
$c-dde: #DDE1E8;
$c-dad: #DADBDC;
$c-fef: #FEFFFF;
$c-fef4f5: #FEF4F5;
$c-e60: #E60613;
$c-e7e: #E7E7E7;
$c-696: #696969;
$c-f0f: #F0F4F7;
$c-e7e: #E7E7E7;
$c-e8e: #E8E8E8;
$c-faf: #FAFAFA;
$c-fdf: #FDF2F3;
$c-6d5: #6D5D54;
$c-957: #957C6F;
$c-ba9: #ba997f;
$c-3d2: #3D241B;
$c-fce: #FCE1E3;
$c-fce6e7: #FCE6E7;
$c-f0f: #F0F4F7;
$c-f2f: #F2F2F2;
$c-c8c: #C8C8C8;
$c-979: #979797;
$c-7d7: #7d7d7d;
$c-fef2d6: #FEF2D6;
$c-e29: #E29933;
$c-fba: #FBA816;
$c-f4c: #F4C39D;
$c-fee: #FEEBD0;
$c-feeabb: #FEEABB;
$c-f6f: #F6FBFF;
$c-f93: #F93E61;
$c-717: #717171;
$c-171: #171717;
$c-363: #363C52;
$c-fbe: #FBEDE1;
$c-e6c: #E6C7AA;
$c-f8e: #F8EEE5;
$c-f8f: #F8F8F8;
$c-6c3: #6C3B06;
$c-55c: #55C595;
$c-c8c: #C8C8C8;
$c-e60: #E60613;
$c-f63: #F63843;
$c-44b: #44B11F;
$c-white: #FFFFFF;
$c-8f4: #8F4613;
$c-429: #429aff;
.order-menu-three {
  width: 100%;
  .order-item {
    padding: 0;
    background-color: $c-white;
    .o-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 3.2vw;
      line-height: 5vw;
      padding: 1.5vw 0;
      .t-left {
        color: $c-333;
      }
      .t-right {
        .red {
          color: $c-e60;
        }
        .gray {
          color: $c-999;
        }
        .green {
          color: $c-55c;
        }
        .black {
          color: $c-333;
        }
      }
    }
    .o-center {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: $c-f6f;
      padding: 2vw;
      .c-left {
        width: 20vw;
        height: 20vw;
        background-color: $c-white;
        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
      .c-right {
        width: 50vw;
        height: 15vw;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding-left: 3vw;
        padding-top: 2vw;
        .r-top {
          text-align: left;
          font-size: 3.2vw;
          color: $c-333;
          font-weight: bold;
        }
        .r-bottom {
          text-align: right;
          .name {
            font-size: 3vw;
            color: $c-333;
          }
          .value {
            font-size: 3.5vw;
            color: $c-333;
            margin-left: 2vw;
          }
        }
      }
    }
    .o-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2.5vw 0;
      .b-left {
        font-size: 3vw;
        color: $c-333;
      }
      .b-right {
        display: inline-flex;
        justify-content: flex-end;
        align-items: center;
        .r-btn {
          width: 20vw;
          height: 6vw;
          border-radius: 10vw;
          border: 1px solid $c-dad;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 3vw;
          color: $c-333;
          &:nth-child(n + 2) {
            margin-left: 2vw;
          }
        }
      }
    }
  }
  .order-item-list {
    width: 100%;
    background-color: $c-white;
    padding: rem(28px) rem(20px);
    .l-body {
      width: 100%;
      background-color: $c-white;
      box-shadow: 0 rem(4px) rem(40px) 0 rgba(0, 0, 0, 0.1);
      border-radius: rem(4px);
      .l-title {
        width: 100%;
        height: rem(56px);
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding: 0 rem(20px);
        background-color: $c-fce6e7;
        font-size: rem(28px);
        font-weight: bold;
        color: $c-333;
      }
      .order-item {
        padding: 0 rem(10px);
        .o-top {
          padding: rem(28px) rem(10px);
        }
        .o-bottom {
          padding: rem(20px) rem(10px);
        }
      }
    }
  }
}
</style>

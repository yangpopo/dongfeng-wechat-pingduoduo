<template>
  <div class="order-details" v-if="order.id">
    <Navigation @return-emit="returnEmit">
    </Navigation>
    <div class="page-content">
      <div class="c-top">
        <!-- -1已失效,0待支付，1已支付，2发起退款，3已退款，4已核销,5退款失败 -->
        <span v-if="order.status == -1">已失效</span>
        <span v-else-if="order.status === 0">待支付</span>
        <span v-else-if="order.status === 1">已支付</span>
        <span v-else-if="order.status === 2">退款中</span>
        <span v-else-if="order.status === 3">已退款</span>
        <span v-else-if="order.status === 4">已核销</span>
        <span v-else-if="order.status === 5">退款失败</span>
      </div>
      <div class="c-author">
        <div class="left">
          <img src="../../assets/img/order-head.png" />
        </div>
        <div class="right">
          <div class="r-name">
            <span class="name">{{ order.userName }}</span>
            <span class="mobile">{{ order.phone }}</span>
          </div>
          <div class="r-address">{{ order.dealerName }}</div>
          <!-- <div class="r-car-type">{{ dataInfo.carSeriesName }}{{ dataInfo.carModelName }}</div> -->
          <div class="r-car-type">{{ order.carSeriesName }}</div>
        </div>
      </div>
      <div class="c-line">
        <img src="../../assets/img/order-line.png" />
      </div>
      <div class="c-goods">
        <div class="g-top">
          <div class="t-left">订单号：{{ order.orderNo }}</div>
          <div class="t-right">
            <!-- -1已失效,0待支付，1已支付，2发起退款，3已退款，4已核销,5退款失败 -->
            <span v-if="order.status == -1">已失效</span>
            <span v-else-if="order.status === 0">待支付</span>
            <span v-else-if="order.status === 1">已支付</span>
            <span v-else-if="order.status === 2">退款中</span>
            <span v-else-if="order.status === 3">已退款</span>
            <span v-else-if="order.status === 4">已核销</span>
            <span v-else-if="order.status === 5">退款失败</span>
          </div>
        </div>
        <div class="g-center">
          <div class="c-left">
            <img :src="order.listImg | formatUrl" />
          </div>
          <div class="c-right">
            <div class="r-name">{{ order.orderName}}</div>
            <div class="r-price-info">
              <div class="price">官方指导价：￥{{ order.carPrice }}起</div>
            </div>
          </div>
        </div>
        <div class="g-bottom">
          <div class="b-left">
            <template v-if="(order.status == 1) || (order.status == 2) || (order.status == 4) || (order.status == 5)">
              核销码：{{ order.verifyCode }}
            </template>
          </div>
          <div class="b-right">
            <span class="r-name">订单金额：</span>
            <span class="r-money">￥{{ order.price / 100 }}</span>
          </div>
        </div>
      </div>
      <template v-if="order.carOption">
        <div class="c-pay" v-if="order.carOption.length != 0">
          <div class="p-title">选配信息</div>
          <div class="p-item">
            <span class="p-name">
              <template v-for="(item, index) in order.carOption" >
                <span :key="item.detailId" v-if="index == 0">{{item.detailName}}</span>
                <span :key="item.detailId" v-else>&nbsp;/&nbsp;{{item.detailName}}</span>
              </template>
            </span>
          </div>
        </div>
      </template>
      <div class="c-pay" style="display: none">
        <div class="p-title">支付信息</div>
        <div class="p-item">
          <span class="p-name">支付流水号</span>
          <span class="p-val">187656468748654563</span>
        </div>
        <div class="p-item">
          <span class="p-name">支付时间</span>
          <span class="p-val">2020-12-12 11:12:09</span>
        </div>
        <div class="p-item">
          <span class="p-name">支付类型</span>
          <span class="p-val">微信支付</span>
        </div>
      </div>
      <div class="c-pay">
        <div class="p-title">下单信息</div>
        <!-- <div class="p-item">
          <span class="p-name">下单编号</span>
          <span class="p-val">{{ dataInfo.orderSn }}</span>
        </div> -->
        <div class="p-item">
          <span class="p-name">下单时间</span>
          <span class="p-val">{{ order.ct | formatDate('yyyy/MM/dd hh:mm:ss') }}</span>
        </div>
      </div>
      <div class="c-fun">
        <div v-if="order.status == 0" class="but green" @click="goPay">支付订金</div><div v-if="order.status == 1" class="but red" @click="openRefundPopup">申请退款</div><div class="but gray" v-if="(order.status === 0) || (order.status === 3) || (order.status === -1)" @click="deleteOrderEvent">删除订单</div>
      </div>
    </div>

    <!-- 支付 -->
    <pay-type ref="payType" :payInfo="payInfo" :jump-link="payJumpLink" />

    <!-- 申请退款 -->
    <mask-box ref="refundPopup">
      <div class="refund-popup">
        <div class="title">退款原因</div>
        <textarea v-model="remark" placeholder="请输入退款原因，以便为您提供更好的服务。" maxlength="100" class="textarea-box"></textarea>
        <div class="tap">（5-100字）</div>
        <div class="common popup-but" @click="submitRefund" >确认退款</div>
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
import { ORDER_PAY_PARAM, ORDER_REFUND, ORDER_QUERY_ONE, ORDER_DEL_ORDER } from '@/request/api';

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
  filters:{
    formatDate (date, fmts) {
      //时间戳转换
      var fmt = 'yyyy-MM-dd hh:mm:ss'
      if (fmts) {
        fmt = fmts
      }
      var date = new Date(date)
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
      }
      let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
      }
      for (let k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
          let str = o[k] + ''
          fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : ('00' + str).substr(str.length))
        }
      }
      return fmt
    },
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

  // 事件
  methods: {
    // 获取订单详情
    getOrderDetails() {
      this.$axios.post(ORDER_QUERY_ONE, {orderId: this.orderId}).then(res => {
        if (res.code == 0) {
          if(res.data.detailImg != null) {
            res.data.detailImg = res.data.detailImg.split(",");
          } else {
            res.data.detailImg = [];
          }
          if (res.data.carOption != null && res.data.carOption != "") {
            res.data.carOption = JSON.parse(res.data.carOption);
          } else {
            res.data.carOption = [];
          }
          this.order = res.data;
        } else {
          Toast(res.msg);
        }
      })
    },
    // 返回
    returnEmit() {
      this.$router.go(-1);
      // this.$router.push({ path: "/order",  query:{ token: this.token, type: this.type, menuIndex: this.order.type } });
      // if () {
      //   // 从支付结果页面来
      //   this.$router.push({ path: "/order/"});
      // } else {
      //   // 从订单页面来
      //   this.$router.go(-1);
      // }
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
          // this.returnEmit();
          this.$router.push({ path: "/order",  query:{ token: this.token, type: this.type, menuIndex: this.order.type } });
        } else {
          Toast(res.msg);
        }
        this.$refs.refundPopup.showState = false;
      })
    },
    // 删除订单
    deleteOrderEvent() {
      Dialog.confirm({
        title: '提示',
        message: '确认要删除订单吗？'
      }).then(() => {
        this.$axios.post(ORDER_DEL_ORDER, {
          orderId: this.orderId
        }).then(res => {
          if (res.code == 0) {
            Toast.success('删除成功!');
            setTimeout(() => {
              // this.returnEmit();
              this.$router.push({ path: "/order",  query:{ token: this.token, type: this.type, menuIndex: this.order.type } });
            }, 1000);
          } else {
            Toast(res.msg);
          }
        })
      }).catch(() => {
      });
    }
  }
};
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
.order-details {
  width: 100vw;
  background-color: #fff;
  box-sizing: border-box;
  padding: 14vw 0 3vw 0;
  // padding-top: 0;
  position: relative;
  .page-content {
    width: 100%;
    height: 100%;
    .c-top {
      width: 100%;
      height: 21vw;
      box-sizing: border-box;
      background-color: $c-f93;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 0 5vw;
      font-size: 4.2vw;
      color: $c-white;
      font-weight: bold;
      line-height: 4vw;
    }
    .c-author {
      width: 100%;
      box-sizing: border-box;
      padding: 5vw 4vw;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      .left {
        width: 6vw;
        padding-top: 2vw;
        img {
          width: 6vw;
          height: 6vw;
        }
      }
      .right {
        width: auto;
        box-sizing: border-box;
        flex-grow: 1;
        padding-left: 4vw;
        .r-name {
          width: 100%;
          text-align: left;
          .name {
            font-size: 4.2vw;
            color: $c-333;
          }
          .mobile {
            margin-left: 2vw;
            font-size: 3.5vw;
            color: $c-666;
          }
        }
        .r-province-city {
          margin-top: 3vw;
          font-size: 3.5vw;
          line-height: 4vw;
          color: $c-333;
          .city {
            margin-left: 5vw;
          }
        }
        .r-address {
          margin-top: 3vw;
          font-size: 3.5vw;
          line-height: 4vw;
          color: $c-333;
        }
        .r-car-type {
          margin-top: 2vw;
          font-size: 3.5vw;
          line-height: 4vw;
          color: $c-333;
        }
      }
    }
    .c-line {
      width: 100%;
      height: 1vw;
      img {
        width: 100%;
        height: 100%;
        display: block;
      }
    }
    .c-goods {
      width: 100%;
      padding: 0 3vw;
      box-sizing: border-box;
      .g-top {
        width: 100%;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 3vw 0;
        font-size: 3.2vw;
        line-height: 3vw;
        .t-left {
          color: $c-333;
        }
        .t-right {
          color: $c-999;
        }
      }
      .g-center {
        width: 100%;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        background-color: $c-f6f;
        padding: 3vw;
        .c-left {
          width: 23vw;
          height: 23vw;
          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        }
        .c-right {
          width: auto;
          height: 20vw;
          box-sizing: border-box;
          flex-grow: 1;
          padding-top: 2vw;
          padding-left: 2vw;
          box-sizing: border-box;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-direction: column;
          .r-name {
            width: 100%;
            font-size: 4vw;
            color: $c-333;
            font-weight: bold;
            line-height: 4vw;
          }
          .r-price-info {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 3.5vw;
            color: $c-333;
            line-height: 3.5vw;
          }
        }
      }
      .g-bottom {
        width: 100%;
        padding: 4vw 0;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .b-left {
          font-size: 3.5vw;
          color: $c-333;
          // font-weight: bold;
          color: $c-429;
        }
        .b-right {
          .r-name {
            font-size: 3.5vw;
            color: $c-333;
          }
          .r-money {
            font-size: 4vw;
            color: $c-e60;
          }
        }
      }
    }
    .c-pay {
      border-top: 3vw solid $c-f0f;
      padding: 3vw 2vw;
      box-sizing: border-box;
      .p-title {
        font-size: 3.5vw;
        color: $c-333;
        padding-bottom: 2vw;
      }
      .p-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 2vw;
        font-size: 3.5vw;
        color: $c-666;
      }
    }
    .c-fun {
      border-top: 3vw solid $c-f0f;
      padding: 4vw 3vw;
      display: flex;
      justify-content: flex-end;
      .but {
        box-sizing: border-box;
        padding: 1vw 3vw;
        font-size: 3vw;
        border-radius: 3vw;
        margin-left: 2vw;
        background-color: #f1f7f8;
        &.red {
          color: $c-e60;
        }
        &.gray {
          color: $c-999;
        }
        &.green {
          color: $c-55c;
        }
        &.black {
          color: $c-333;
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
  .popup-but {
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
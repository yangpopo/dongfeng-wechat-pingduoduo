<template>
  <div class="details" v-if="activityInfo.id">
    <Navigation @return-emit="returnEmit">
      <template v-slot:title>
        砍价详情
      </template>
    </Navigation>
    <div class="light-box">
      <img class="light-bg" src="../../assets/img/bargaining/light-bg.png" alt="">
    </div>
    
    <div class="describe-box">
      <div class="cover-box">
        <img :src="activityInfo.images[0]" alt="">
      </div>
      <ul class="info-box">
        <li class="title">{{ activityInfo.name }}</li>
        <li class="li-01">
          <span class="price-01">砍价后：{{ activityInfo.targetPrice | priceUnit }}元</span><span class="price-02">原价：{{ activityInfo.price | priceUnit }}元</span>
        </li>
        <li class="li-02">
          库存：{{ activityInfo.stock }}
        </li>
      </ul>
    </div>
    <div class="count-down">
      <template v-if="(price.surplus != 0) && (bargainEndTime >= currentTime)">
        还剩<van-count-down class="time-box" :time="bargainingDownTime" />结束，快来砍价吧
      </template>
    </div>
    <!-- 详情 -->
    <div class="light-plate">
      <template v-if="price.surplus != 0">
        已砍<b>{{ price.success | priceUnit }}</b>元，还剩<b>{{ price.surplus | priceUnit }}</b>元
      </template>
      <b v-else>恭喜！砍价已成功！</b>
    </div>
    <van-progress class="progress-box" :show-pivot="false" track-color="#FFF4C4" color="#FA2626" :percentage="price.success / (price.surplus + price.success) * 100" stroke-width="8" />
    <!-- 砍价成功 -->
    <div v-if="(price.surplus == 0) && (activityEndTime >= currentTime)" class="my-link-but share-big-but" @click="payDeposit">立即下定</div>
    <template v-else-if="stockFlag == 0">
      <!-- 商品没抢完 -->
      <template v-if="bargainEndTime >= currentTime">
        <!-- 砍价未过期 -->
        <template v-if="selfFlag == 1">
          <!-- selfFlag 1:是自己 -->
          <div class="share-link-but share-big-but" @click="shareWeChatAppBut">分享给好友砍价</div>
          <div class="share-img-but" @click="shareImgBut">一键生成海报分享</div>
        </template>
        <template v-else-if="selfFlag == 0">
          <!-- selfFlag 0:不是自己 -->
          <div @click="initiateMyBargaining" class="my-link-but share-big-but">发起我的砍价</div>
          <template v-if="bargainFlag == 0">
            <!-- 没有砍过 -->
            <div @click="helpBargaining" class="friend-link-but share-big-but">帮好友砍一刀</div>
          </template>
          <template v-else-if="bargainFlag == 1">
            <!-- 砍过 -->
            <div class="bargaining-complete">您已成功帮好友砍价</div>
          </template>
        </template>
      </template>
      <template v-else>
        <!-- 砍价过期 -->
        <div class="none-but share-big-but">活动已过期</div>
      </template>
    </template>
    <div v-if="stockFlag == 1" class="none-but share-big-but">商品抢光了</div>

    <!-- 好友助力 -->
    <div class="friend-box">
      <div class="title">好友助力</div>
      <div class="friend-list">
        <template v-if="bargainList.length != 0">
          <div class="unit" v-for="item in bargainList" :key="item.id">
            <div class="head">
              <div class="head-portrait">
                <img :src="item.headImg" alt="">
              </div>
              <dl>
                <dt>{{ item.cname }}</dt>
                <dd>{{ (item.bargainTime / 1000) | formatDate('yyyy/MM/dd hh:mm:ss') }}</dd>
              </dl>
            </div>
            <div class="footer">砍掉：{{ item.price | priceUnit }}元</div>
          </div>
        </template>
        <van-empty v-else description="暂无好友助力" />
      </div>
    </div>

    <!-- 图片分享弹窗 -->
    <mask-box ref="shareImgPopup">
      <div class="share-img-box">
        <div class="share-img" ref="shareImg">
          <div class="cover-box">
            <img :src="activityInfo.images[0]" alt="">
            <!-- <img src="../../assets/img/close-01.png" alt=""> -->
          </div>
          <dl class="info-box">
            <dt>{{ activityInfo.name }}</dt>
            <dd>
              <span class="price-01">砍价后：{{ activityInfo.targetPrice | priceUnit }}元</span><span class="price-02" :class="{'price-ios': os == 'ios', 'price-android': os == 'Android'}">原价：{{ activityInfo.price | priceUnit }}元</span>
            </dd>
          </dl>
          <div class="add-box">
            <div class="qrcode-box"><img class="qrcode" :src="qrcode" alt=""></div>
            <div class="describe">长按识别二维码查看更多</div>
          </div>
        </div>
        <img class="img-data" :src="imgData" alt="">
        <div class="mask-loading" v-if="pictureLoading">
          <van-loading class="loading" type="spinner" size="24px" />
          正在生成图片
        </div>
        <div class="download-but">长按图片保存到相册</div>
        <img class="close-but" @click="closeShareImgBut" src="../../assets/img/close-01.png" alt="">
      </div>
    </mask-box>

    <!-- 朋友帮砍 -->
    <mask-box ref="successPopup">
      <div class="success-box">
        <img class="title-icon" src="../../assets/img/bargaining/title-icon.png" alt="">
        <div class="main-box">
          <img class="success-light" src="../../assets/img/bargaining/success-light.png" alt="">
          <img class="help-icon" src="../../assets/img/bargaining/help-icon.png" alt=""> 
        </div>
        <div class="describe">
          恭喜您，已帮好友砍掉<b>{{ friendHelpPrice | priceUnit }}</b>元
        </div>
      </div>
    </mask-box>
    
    <!-- 订单确认 -->
    <order-info-bargaining ref="orderInfo" title-data="订单确认" but-data="提交并支付" @address-submit="goPay" :activityInfo="orderInfo" />

    <!-- 支付 -->
    <pay-type ref="payType" :payInfo="payInfo" :jump-link="payJumpLink" />

    <!-- 分享弹窗 -->
    <mask-box ref="shareLinkPopup" @mask-event="shareLinkPopupEvent">
      <img class="share-lick-icon" src="../../assets/img/bargaining/share-icon.png" alt="">
    </mask-box>

  </div>
</template>

<script>
import MaskBox from "@/components/MaskBox";
import Navigation from '@/components/Navigation.vue';
import html2canvas from "html2canvas";
import { mapState } from 'vuex';
import QRCode from "qrcode";
import OrderInfoBargaining from "@/components/OrderInfoBargaining";
import PayType from "@/components/PayType";
import { Toast, Dialog } from 'vant';
import { BARGAIN_CUSTOMER_BARGAIN_INFO, BARGAIN_FRIEND_HELP } from "@/request/api";

export default {
  name: 'Details',
  components: {
    MaskBox,
    OrderInfoBargaining,
    PayType,
    Navigation
  },
  data() {
    return {
      customerBargainId: '', // 拼团id
      orderNo: '', // 订单id
      pageType: 'details', // details: 详情页面  share: 好友分享页  friendbargaining: 好友砍价页
      activityInfo: {}, // 活动信息
      bargainList: [], // 砍价朋友
      orderInfo: {}, // 订单信息
      price: {}, // 砍价价格信息
      customerBargainInfo: {}, // 砍价信息
      selfFlag: 1, // 1表示自己，0，表示不是自己
      currentTime: new Date().getTime(), // 当前时间
      bargainEndTime: 0, // 砍价结束时间
      activityEndTime: 0, // 活动结束时间
      bargainingDownTime: 0, // 砍价倒计时
      stockFlag: 1, // 1商品抢完，0没抢完
      bargainFlag: 1, // 1：已经砍价:0 没有砍价
      friendHelpPrice: 0, // 朋友帮砍价格
      qrcode: '',
      imgData: '',
      pictureLoading: true, // 图片加载状态
      os: '', // 系统版本
      orderInfo: {}, // 订单信息
      payJumpLink: '', // 支付跳转链接
      payInfo: {}, // 支付信息
    }
  },

  // 计算属性
  computed: {
  },

  // 生命周期
  mounted() {
    this.customerBargainId = this.$route.query.customerBargainId;
    this.orderNo = this.$route.query.orderNo;
    this.pageType = this.$route.query.pageType || 'details';
    this.getDetails();

    // 判断系统版本
    let userAgent = navigator.userAgent;
    let Agents = ["Android", "iPhone",
        "SymbianOS", "Windows Phone",
        "iPad", "iPod"];
    let flag = true;
    for (let i in Agents) {
      if (userAgent.indexOf(Agents[i]) > -1) {
        flag = false;
        if (Agents[i] == 'iPhone' || Agents[i] == 'iPad'  || Agents[i] == 'iPod' ) {
          this.os = "ios"
        } else {
          this.os = Agents[i];
        }
        break;
      }
    }
  },

  // 事件
  methods:{
    ...mapState(['token', 'type']),
    returnEmit() {
      this.$router.go(-1);
    },
    // 获取砍价详情
    getDetails() {
      Toast.loading({
        message: '加载中...',
        forbidClick: true,
        duration: 0,
      });
      this.$axios.post(BARGAIN_CUSTOMER_BARGAIN_INFO, {customerBargainId: this.customerBargainId, orderNo: this.orderNo}).then(res => {
        Toast.clear();
        if (res.code == 0) {
          // 数据处理
          if (res.data.activityInfo.images != null) {
            res.data.activityInfo.images = res.data.activityInfo.images.split(",");
          } else {
            res.data.activityInfo.images = [];
          }
          this.bargainingDownTime = res.data.customerBargainInfo.endTime - this.currentTime;
          this.bargainEndTime = res.data.customerBargainInfo.endTime; // 砍价结束时间
          this.stockFlag = res.data.stockFlag; // 1商品抢完，0没抢完
          this.bargainFlag = res.data.bargainFlag; // 1：已经砍价:0 没有砍价
          this.activityEndTime = res.data.activityInfo.endTime;
          this.activityInfo = res.data.activityInfo;
          this.bargainList = res.data.bargainList;
          this.orderInfo = res.data.orderInfo;
          this.price = res.data.price;
          this.selfFlag = res.data.selfFlag;
          this.customerBargainInfo = res.data.customerBargainInfo; // 砍价信息
        } else {
          Toast(res.mes);
        }
      })
    },
    // 小程序分享
    shareWeChatAppBut() {
      let path = `/pages/webpage/index?url=${encodeURIComponent(process.env.VUE_APP_SERVER_URL + "/bargaining/bargaining-betails?customerBargainId=" + this.customerBargainId )}`;
      console.log(path);
      wx.miniProgram.postMessage({
        data: {
          type: 'share_data',     //固定
          data: {
            title: this.activityInfo.name,      //分享标题，可选，不传使用小程序名
            imageUrl: this.activityInfo.images[0],   //分享图片，可选，不传使用默认图
            path, //小程序页面地址，可选
          },
        },
      });
      this.$refs.shareLinkPopup.showState = true;
    },

    // 关闭分享链接弹窗
    shareLinkPopupEvent() {
      this.$refs.shareLinkPopup.showState = false;
    },

    // 分享图片按钮
    shareImgBut() {
      this.$refs.shareImgPopup.showState = true;
      this.$nextTick(() => {
        QRCode.toDataURL("http://www.runoob.com", {
          width: 128,
          height: 128,
          colorDark : "#000000",
          colorLight : "#ffffff",
          errorCorrectionLevel: 'L'
        }, (error, url) => {
          if (error) {
            console.error("生成二维码失败:", error)
          }  else {
            this.qrcode = url;
            html2canvas(this.$refs.shareImg, {
                allowTaint: true,
                // "border-width": 2
              }).then((canvas) =>{
              this.imgData = canvas.toDataURL();
              this.pictureLoading = false;
            })
          }
        })
      })
    },

    // 关闭分享弹窗
    closeShareImgBut() {
      this.$refs.shareImgPopup.showState = false;
      this.pictureLoading = true;
    },

    // 下定金按钮
    payDeposit() {
      this.orderInfo = {
        type: true,
        titleData: '订单确认',
        id: this.orderInfo.id, // 订单id
        price: this.activityInfo.deposit, // 定金
        butData: '提交并支付'
      }
      console.log(this.activityInfo.deposit)
      this.$refs.orderInfo.showState(true);
    },

    // 跳转去支付
    goPay(data) {
      if (data.state == true) {
        this.payInfo = data.data;
        this.payJumpLink = `/bargaining/pay-result?customerBargainId=${data.data.customerBargainId}&id=${data.data.orderId}`;
        this.$refs.payType.showState = true;
      }
    },

    // 发起的砍价
    initiateMyBargaining(){
      this.$router.push({ path: "/bargaining", query: {id: this.activityInfo.id, token: this.token, type: this.type} });
    },

    // 帮助好友砍价
    helpBargaining() {
      Toast.loading({
        message: '加载中...',
        forbidClick: true,
        duration: 0,
      });
      this.$axios.post(BARGAIN_FRIEND_HELP, {
        customerBargainId: this.customerBargainInfo.id
      }).then(res => {
        if (res.code == 0) {
          Toast.clear();
          this.friendHelpPrice = res.data.price;
          this.$refs.successPopup.showState = true;
          this.getDetails(); // 更新砍价详情
          setTimeout(() => {
            this.$refs.successPopup.showState = false;
          }, 3000);
        } else {
          Toast(res.mes);
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.details {
  width: 100vw;
  min-height: 100vh;
  background-color: #f42f38;
  background-image: url("../../assets/img/bargaining/bg.jpg");
  background-repeat: no-repeat;
  background-size: 100% auto;
  box-sizing: border-box;
  padding: 4vw;
  position: relative;
  padding-top: 17vw;
  .light-box {
    position: absolute;
    width: 100vw;
    height: 100vw;
    left: 50%;
    top: 7vw;
    transform: translateX(-50%);
    overflow: hidden;
  }
  .light-bg {
    position: absolute;
    width: 100vw;
    height: 100vw;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
    animation: rotate-light 4s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @keyframes rotate-light {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
  .describe-box {
    position: relative;
    z-index: 1;
    width: 100%;
    background-color: #fff;
    box-sizing: border-box;
    padding: 3vw;
    border-radius: 3vw;
    display: flex;
    align-items: flex-start;
    margin-bottom: 5vw;
    .cover-box {
      width: 25vw;
      height: 25vw;
      overflow: hidden;
      border-radius: 3vw;
      position: relative;
      margin-right: 2vw;
      flex-shrink: 0;
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
    .info-box {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      height: 24vw;
      .title {
        font-size: 4vw;
        color: #444954;
        margin-bottom: 1vw;
        width: 100%;
        text-overflow: -o-ellipsis-lastline;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      .li-01 {
        .price-01 {
          color: #FA3226;
          margin-right: 3vw;
          font-size: 3.5vw;
        }
        .price-02 {
          font-size: 3vw;
          color: #859096;
          text-decoration: line-through;
        }
      }
      .li-02 {
        font-size: 3vw;
        color: #859096;
      }
    }
  }
  .count-down {
    width: 100%;
    height: 5vw;
    font-size: 3vw;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 5vw;
    position: relative;
    z-index: 1;
    /deep/.time-box{
      font-size: 3vw;
      color: #fff;
      margin: 0 1vw;
    }
  }
  .light-plate {
    width: 95vw;
    height: 17vw;
    margin: 0 auto;
    margin-left: -1.5vw;
    margin-bottom: 5vw;
    background-image: url("../../assets/img/bargaining/light-plate.png");
    background-size: 100% 100%;
    position: relative;
    z-index: 1;
    display: flex;
    color: #fff;
    justify-content: center;
    align-items: center;
    font-size: 3.2vw;
    b {
      font-size: 6vw;
      font-weight: normal;
      margin: 0 1vw;
    }
  }
  .progress-box {
    width: 70vw;
    margin: 0 auto 5vw auto;
    position: relative;
    z-index: 0;
  }
  .share-big-but {
    background-image: url("../../assets/img/bargaining/but-bg.png");
    background-size: 100% 100%;
    width: 90vw;
    height: 18vw;
    font-size: 3.5vw;
    // font-weight: bold;
    margin: 0 auto;
    text-align: center;
    line-height: 16vw;
    color: #7D422F;
    position: relative;
    z-index: 0;
    &.none-but {
      background-image: none;
      background-color: rgba(255, 255, 255, .15);
      color: #FFFFFF;
      font-size: 3.5vw;
      height: 12vw;
      line-height: 12vw;
      margin-bottom: 3vw;
      border-radius: 3vw;
    }
  }
  .share-img-but {
    font-size: 3vw;
    color: #FFFFFF;
    text-decoration: underline;
    text-align: center;
    width: 30vw;
    margin: 0 auto 10vw auto;
    position: relative;
    z-index: 1;
  }
  .bargaining-complete {
    font-size: 3vw;
    color: #FFFFFF;
    text-align: center;
    width: 30vw;
    margin: 0 auto 10vw auto;
    position: relative;
    z-index: 1;
  }
  .friend-box {
    width: 100%;
    >.title {
      font-size: 4vw;
      color: #FDE785;
      margin-bottom: 3vw;
    }
    .friend-list {
      box-sizing: border-box;
      background-color: #FFFBEB;
      border-radius: 3vw;
      box-sizing: border-box;
      padding: 3vw;
      .unit {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 3vw;
        &:last-child {
          margin-bottom: 0;
        }
        .head {
          display: flex;
          align-items: center;
          .head-portrait {
            width: 10vw;
            height: 10vw;
            overflow: hidden;
            position: relative;
            border-radius: 50%;
            margin-right: 2vw;
            img {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              min-width: 100%;
              height: 100%;
            }
          }
          > dl{
            width: 36vw;
            dt {
              font-size: 3.2vw;
              color: #7D422F;
              width: 100%;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
              word-break: break-all;
              margin-bottom: 1vw;
            }
            dd {
              font-size: 3vw;
              color: #B27460;
            }

          }
        }
        .footer {
          font-size: 3.5vw;
          color: #FA3226;
        }
      }
    }
  }
  .share-img-box {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 78vw;
    height: 95vw;
    background-color: #FAFAFA;
    border-radius: 3vw;
    .img-data{
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      border-radius: 3vw;
    }
    .share-img {
      position: relative;
    }
    .cover-box {
      position: relative;
      width: 78vw;
      height: 50vw;
      overflow: hidden;
      border-radius: 3vw 3vw 0 0;
      img {
        min-width: 101%;
        height: 101%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
    .info-box {
      box-sizing: border-box;
      width: 100%;
      padding: 0 3vw 5vw 3vw;
      background-color: #fff;
      dt {
        font-size: 3.5vw;
        color: #444954;
        margin-bottom: 1vw;
        width:100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 6.5vw;
      }
      dd {
        .price-01 {
          color: #FA3226;
          margin-right: 3vw;
          font-size: 3.5vw;
          line-height: 5vw;
          display: inline-block;
        }
        .price-02 {
          font-size: 3vw;
          color: #859096;
          line-height: 5vw;
          position: relative;
          display: inline-block;
          &.price-ios:before{
            content:"";
            position: absolute;
            background-color: #859096;
            height: 1px;
            width: 100%;
            top: 80%;
            left: 0%;
          }
          &.price-android:before{
            content:"";
            position: absolute;
            background-color: #859096;
            height: 1px;
            width: 100%;
            top: 70%;
            left: 0%;
          }
    
        }
      }
    }
    .add-box {
      width: 100%;
      height: 20vw;
      box-sizing: border-box;
      position: relative;
      background-color: #FAFAFA;
      border-radius: 0 0 3vw 3vw;
      .qrcode-box {
        position: absolute;
        left: 30%;
        top: 10%;
        width: 15vw;
        height: 15vw;
        overflow: hidden;
        img.qrcode {
          position: absolute;
          width: 115%;
          height: 115%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
      .describe {
        width: 20vw;
        font-size: 3vw;
        color: #7D422F;
        position: absolute;
        left: 52%;
        top: 15%;
      }
    } 
    .mask-loading{
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 3vw;
      background-color: rgba(0, 0, 0, .9);
      top: 0;
      left: 0;
      display: flex;
      font-size: 3.5vw;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      color: #fff;
      .loading {
        margin-bottom: 2vw;
      }
    }
    .download-but {
      position: absolute;
      left: 50%;
      bottom: -14vw;
      transform: translateX(-50%);
      width: 62vw;
      height: 10vw;
      font-size: 3vw;
      color: #FFFFFF;
      border-radius: 3vw;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .close-but {
      position: absolute;
      left: 50%;
      bottom: -28vw;
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
  .pay-type-box {
    width: 100%;
    box-sizing: border-box;
    padding: 0 5vw 30vw 5vw;
    .pay-type {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      font-size: 3.5vw;
      color: #454952;
      svg.icon {
        width: 5vw;
        height: 5vw;
        vertical-align: middle;
        fill: currentColor;
        overflow: hidden;
        margin-right: 2vw;
        color: #9AC86C;
      }
    }
    
  }
  .share-lick-icon {
    position: absolute;
    width: 55vw;
    height: 13vw;
    right: 15vw;
    top: 3vw;
  }
}
</style>
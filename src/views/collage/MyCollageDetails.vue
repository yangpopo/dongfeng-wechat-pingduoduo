<template>
  <div class="home" v-if="model.id">
    <Navigation @return-emit="returnEmit">
    </Navigation>
    <swiper class="swiper-box" ref="mySwiper" :options="swiperOptions" v-if="model.detailImg.length > 0">
      <swiper-slide class="slide-box" v-for="imgItem in model.detailImg" :key="imgItem"><img class="img-slide" :src="imgItem" alt="" /></swiper-slide>
      <div class="swiper-pagination" slot="pagination"></div>
    </swiper>
    <div class="price-info">
      <dl class="price">
        <dt>订金<b>{{ model.price | priceUnit }}</b>元</dt>
      </dl>
      <!-- <span class="right-box">{{ model.groupNum }}人成团&nbsp;&nbsp;已拼:{{ model.successNum }}人</span> -->
      <span class="right-box">库存:{{ model.totalNum }}</span>
    </div>
    <div class="basic-info">
      <div class="name">
        <span class="tap">拼团</span>{{ model.title }}
      </div>
      <dl class="additional-info">
        <dt>{{ model.subtitle }}</dt>
      </dl>
    </div>
    <div class="explain-box">
      <div class="partake-box" v-if="groupList.length != 0">
        <div class="look-out">
          <template v-if="currentTime >= model.endTime">拼团活动结束</template>
          <template v-else-if="model.successNum >= model.groupNum">
            拼团成功
          </template>
          <template v-else>
            <template v-if="model.status == 1">
              拼团进行中
            </template>
            <template v-else-if="model.status == 2">
              拼团失败
            </template>
          </template>
        </div>
        <div class="partake-unit">
          <div class="head">
            <ul>
              <template v-for="(item, index) in groupList.customers">
                <li v-if="index < 5" :key="item.cid"><img :src="item.headImg" alt=""></li>
              </template>
            </ul>
            <template v-if="groupList.customers.length > 1">
              <span class="name">{{ groupList.firstName }}</span>等
            </template>
            <template v-else>
              <span class="name">{{ groupList.firstName }}</span>
            </template>
          </div>
          <div class="footer">
            还差<b>{{ groupList.num }}人</b>成团
             <template v-if="(currentTime < model.endTime) && (model.successNum < model.groupNum) && (model.status == 1)">
               <div class="join-but" v-if="(model.isMyTeam != true) && (model.ifJoin != 1)" @click="goJoinCollage(model.id, groupList.teamId, model.isMyTeam, model.ifJoin)">去参团</div>
             </template>
          </div>
        </div>
      </div>
      <div v-else class="none-collage">
        赶紧发起拼团吧
      </div>
    </div>
    <div class="main-box">
      <div class="title">活动详情</div>
      <div class="rich-text" v-html="model.content"></div>
    </div>
    <div class="bottom-box">
      <div class="left-box">
        <div class="icon-but customer-service" @click="customerService">
          <img src="../../assets/img/customer-service.png" alt="">
          客服
        </div>
        <div class="icon-but my-bargain" @click="myOrder">
          <img src="../../assets/img/my-collage.png" alt="">
          我的拼团
        </div>
      </div>
      <template v-if="currentTime <= model.endTime">
        <div v-if="model.successNum >= model.groupNum" class="text-but ed">拼团成功</div>
        <template v-else-if="model.status == 1">
          <div v-if="model.isMyTeam == true || model.ifJoin == 1" class="text-but ing" @click="shareWeChatAppBut">邀请好友来拼团</div>
          <div v-else class="text-but ing" @click="goCreateCollage">发起拼团</div>
        </template>
        <div v-else class="text-but ed">拼团失败</div>
        <!-- <div class="text-but ing" v-if="model.ifJoin != 1" @click="goCreateCollage">发起拼团</div>
        <div class="text-but ing" @click="goMyCollage" v-else>继续拼团</div> -->
      </template>
      <div v-else class="text-but ed">活动结束</div>
    </div>
    
    <!-- 订单信息 -->
    <order-info-collage :activityInfo="activityInfo" ref="orderInfo" @address-submit="goPay" />

    <!-- 支付 -->
    <pay-type ref="payType" :pay-info="payInfo" :jump-link="payJumpLink" />

    <!-- 分享弹窗 -->
    <mask-box ref="shareLinkPopup" @mask-event="shareLinkPopupEvent">
      <img class="share-lick-icon" src="../../assets/img/bargaining/share-icon.png" alt="">
    </mask-box>
    
  </div>
</template>

<script>
import appApi from '@/assets/js/appApi.js';
import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper';
import 'swiper/css/swiper.min.css';
import MaskBox from "@/components/MaskBox";
import { mapState } from 'vuex';
import Navigation from '@/components/Navigation.vue';
import OrderInfoCollage from "@/components/OrderInfoCollage";
import PayType from "@/components/PayType";
import { Toast, Dialog } from 'vant';
import { GROUPBUY_QUERY_ONE, GROUPBUY_CHECK_STOCK } from "@/request/api";

export default {
  name: 'collage',
  components: {
    Swiper, 
    SwiperSlide, 
    directive,
    MaskBox,
    OrderInfoCollage,
    PayType,
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
      id: '', // 拼团id
      payTypeShow: false, // 支付方式弹窗
      model: {}, // 拼团信息
      groupList: [], // 参加拼团列表
      activityInfo: {}, // 活动信息
      payInfo: {}, // 支付信息
      payJumpLink: '', // 支付跳转链接
      currentTime: new Date().getTime(),
    }
  },

  // 计算属性
  computed: {
   ...mapState(['token', 'type']),
  },

  // 生命周期
  mounted() {
    this.id = this.$route.query.teamId;
    this.getGroupBuyInfo();
  },

  // 事件
  methods:{
    // 检查拼团库存
    async inspectStock(type = 0) {
      // Toast.loading({
      //   message: '查询库存..',
      //   forbidClick: true,
      //   duration: 0,
      // });
      return this.$axios.post(GROUPBUY_CHECK_STOCK, {groupId: this.id, type}).then(await function(res) {
        Toast.clear();
        if (res.code == 0) {
          return res.data
        } else {
          Toast(res.msg);
          return false
        }
      })
    },
    // 获取拼团信息
    getGroupBuyInfo() {
      Toast.loading({
        message: '加载中...',
        forbidClick: true,
        duration: 0,
      });
      this.$axios.post(GROUPBUY_QUERY_ONE, {teamId: this.id}).then(res => {
        Toast.clear();
        if (res.code == 0) {
          if (res.data.model.detailImg != null) {
            res.data.model.detailImg = res.data.model.detailImg.split(",");
          } else {
            res.data.model.detailImg = [];
          }
          this.model = res.data.model;
          // 处理拼团人的数据
          this.groupList = res.data.model.joinTeam[0];
        } else {
          Toast(res.msg);
        }
      })
    },
    // 返回按钮
    returnEmit() {
      if (this.type == 'app') {
        // app关闭窗口  
        appApi.closePage();
      } else {
        this.$router.go(-1);
        // wx.miniProgram.switchTab({ url: '/pages/my/index' }); // 跳个人中心
        // // wx.miniProgram.navigateBack(); // 微信关闭窗口
        // console.log("微信关闭窗口");
      }
    },
    // 我的拼团
    myOrder() {
      this.$router.push({ path: "/order", query:{ menuIndex: 2, token: this.token, type: this.type} });
    },
    // 新建拼团
    async goCreateCollage() {
      const stockResult = await this.inspectStock(0);
      if (!stockResult) {
        Toast('暂无库存!');
        return
      }
      this.activityInfo = {
        type: true,
        id: this.model.id,
        price: this.model.price,
        factory: this.model.factory, // 1小康，2风光
        carSeriesId: this.model.carSeriesId, // 车系id
        carModelId: this.model.carModelId, // 车型id
      }
      this.$nextTick(() => {
        this.$refs.orderInfo.showState(true);
      })
    },

    // 参加别人的拼团
    async goJoinCollage(groupId, teamId, isMyTeam, ifJoin) {
      const stockResult = await this.inspectStock(1);
      if (!stockResult) {
        Toast('暂无库存!');
        return
      }
      if (isMyTeam) {
        Toast('这是你自己的团,不能加入!');
        return
      }
      if (ifJoin == 1) {
        Toast('这是你参加此团!');
        return
      }
      this.activityInfo = {
        type: false,
        id: groupId,
        teamId,
        price: this.model.price,
        factory: this.model.factory, // 1小康，2风光
        carSeriesId: this.model.carSeriesId, // 车系id
        carModelId: this.model.carModelId, // 车型id
      }
      this.$nextTick(() => {
        this.$refs.orderInfo.showState(true);
      })
    },

    // 去支付
    goPay(data) {
      if (data.state == true) {
        data.data['id'] = data.data.groupId;
        data.data['teamId'] = data.data.tempId;
        this.payInfo = data.data;
        this.payJumpLink = `/collage/pay-result?id=${data.data.groupId}&teamId=${data.data.tempId}`;
        this.$refs.payType.showState = true;
      }
    },

    // 跳转客服
    customerService(){
      window.location.href="https://cschat-ccs.aliyun.com/index.htm?tntInstId=_1194WK0&scene=SCE00003734"
    },

    // 跳转拼团
    goMyCollage() {
      this.$router.push({ path: "/collage/my-collage", query: {teamId: this.model.myTeam.teamId, id: this.model.myTeam.groupId,token: this.token, type: this.type, ifJoin: 1} });
    },

    // 小程序分享
    shareWeChatAppBut() {
      let path = `/pages/webpage/index?url=${encodeURIComponent(process.env.VUE_APP_SERVER_URL + "#/collage/my-collage?teamId=" + this.teamId)}`;
      wx.miniProgram.postMessage({
        data: {
          type: 'share_data',     //固定
          data: {
            title: this.model.title,      //分享标题，可选，不传使用小程序名
            imageUrl: this.model.detailImg[0],   //分享图片，可选，不传使用默认图
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
  }
}
</script>

<style scoped lang="scss">
.home {
  width: 100vw;
  background-color: #fff;
  box-sizing: border-box;
  // padding-top: 14vw;
  position: relative;
  .swiper-box{
    height: 80vw;
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
      margin-bottom: 2vw;
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
  .explain-box {
    width: 100vw;
    box-sizing: border-box;
    padding: 3vw;
    background-color: #fff;
    .none-collage {
      width: 100%;
      box-sizing: border-box;
      text-align: center;
      padding: 5vw 0;
      font-size: 3.5vw;
      color: rgb(145, 145, 145);
    }
    .partake-box{
      background-color: #FAFAFA;
      box-sizing: border-box;
      padding: 3vw;
      .look-out {
        font-size: 3vw;
        color: #454952;
        margin-bottom: 2vw;
      }
      .partake-unit {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .head {
          display: flex;
          align-items: center;
          font-size: 3.5vw;
          color: #454952;
          ul {
            display: flex;
            align-items: center;
            box-sizing: border-box;
            padding-left: 3vw;
            li {
              width: 10vw;
              height: 10vw;
              overflow: hidden;
              border-radius: 50%;
              position: relative;
              border: .5vw solid #fff;
              margin-left: -3vw;
              img {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 100%;
                min-height: 100%;
              }
            }
          }
          .name {
            display: block;
            max-width: 15vw;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
        .footer {
          font-size: 3vw;
          color: #444954;
          display: flex;
          align-items: center;
          b{
            color: #F76D3F;
          }
          .join-but {
            box-sizing: border-box;
            background-color: #F76D3F;
            padding: 1vw 3vw;
            font-size: 3.5vw;
            color: #fff;
            border-radius: 1.5vw;
            margin-left: 1vw;
          }
        }
      }
    } 
  }
  .main-box {
    background-color: #fff;
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
      /deep/ img{
        width: 100% !important;
      }
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
  .share-lick-icon {
    position: absolute;
    width: 55vw;
    height: 13vw;
    right: 15vw;
    top: 3vw;
  }
}
</style>
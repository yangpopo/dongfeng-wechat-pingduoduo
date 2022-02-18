<template>
  <div class="home" v-if="model.id">
    <Navigation @return-emit="returnEmit">
      <template v-slot:title>
        拼团
      </template>
    </Navigation>
    <swiper class="swiper-box" ref="mySwiper" :options="swiperOptions" v-if="model.detailImg.length > 0">
      <swiper-slide class="slide-box" v-for="imgItem in model.detailImg" :key="imgItem"><img class="img-slide" :src="imgItem" alt="" /></swiper-slide>
      <div class="swiper-pagination" slot="pagination"></div>
    </swiper>
    <div class="price-info">
      <dl class="price">
        <dt>定金<b>{{ model.price | priceUnit }}</b>元</dt>
      </dl>
      <span class="right-box">{{ model.groupNum }}人成团&nbsp;&nbsp;已拼:{{ model.successNum }}人</span>
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
          {{ groupList.length }}人正在发起拼团，点击参团可直接参与
        </div>
        <div class="partake-unit" v-for="group in groupList" :key="group.teamId">
          <div class="head">
            <ul>
              <template v-for="(item, index) in group.customers">
                <li v-if="index < 5" :key="item.cid"><img :src="item.headImg" alt=""></li>
              </template>
            </ul>
            <template v-if="group.customers.length > 1">
              <span class="name">{{ group.customers[0].nickName }}</span>等
            </template>
            <template v-else>
              <span class="name">{{ group.customers[0].nickName }}</span>
            </template>
          </div>
          <div class="footer">
            还差<b>{{ group.num }}人</b>成团
            <div class="join-but" @click="goJoinCollage(group.teamId)">去参团</div>
          </div>
        </div>
      </div>
      <div v-else class="none-collage">
        赶紧发起拼团吧
      </div>
    </div>
    <div class="main-box">
      <div class="title">活动详情</div>
      <div class="rich-text">
        {{ model.content }}
      </div>
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
      
      <div class="text-but ing" @click="goCreateCollage">发起拼图</div>
      <!-- <div class="text-but ing">继续砍价</div> -->
      <!-- <div class="text-but ed">活动结束</div> -->
    </div>
    
    <!-- 订单信息 -->
    <order-info-collage :activityInfo="activityInfo" ref="orderInfo" @address-submit="goPay" />

    <!-- 支付 -->
    <pay-type ref="payType" :pay-info="payInfo" :jump-link="payJumpLink" />
    
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
import { GROUPBUY_QUERY_ONE } from "@/request/api";

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
    }
  },

  // 计算属性
  computed: {
   ...mapState(['token', 'type']),
  },

  // 生命周期
  mounted() {
    this.id = this.$route.query.id;
    this.getGroupBuyInfo();
  },

  // 事件
  methods:{
    // 获取拼团信息
    getGroupBuyInfo() {
      Toast.loading({
        message: '加载中...',
        forbidClick: true,
        duration: 0,
      });
      this.$axios.post(GROUPBUY_QUERY_ONE, {id: this.id}).then(res => {
        Toast.clear();
        if (res.code == 0) {
          if (res.data.model.detailImg != null) {
            res.data.model.detailImg = res.data.model.detailImg.split(",");
          } else {
            res.data.model.detailImg = [];
          }
          this.model = res.data.model;
          this.groupList = res.data.groupList;
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
        // 微信关闭窗口
        wx.miniProgram.navigateBack();
      }
    },
    // 我的拼团
    myOrder() {
      this.$router.push({ path: "/order", query:{ menuIndex: 2, token: this.token, type: this.type} });
    },
    // 新建拼团
    goCreateCollage() {
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
    goJoinCollage(teamId) {
      this.activityInfo = {
        type: false,
        id: teamId,
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
}
</style>
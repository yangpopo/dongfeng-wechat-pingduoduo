<template>
  <div class="my-collage" v-if="model.id">
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
    <template v-if="model.joinTeam[0].customers.length != 0">
      <div class="explain-box">
        <div class="partake-box">
          <div class="look-out">
            {{ model.joinTeam[0].firstName }}发起拼团成功，还差{{ model.joinTeam[0].num }}人成团，赶快分享给好友吧！
          </div>
          <div class="partake-unit">
            <div class="head">
              <div class="user-box">
                <template v-for="(item, index) in model.joinTeam[0].customers" >
                  <dl class="user-info" v-if="index <= 4" :key="item.nickName">
                    <dt><img :src="item.headImg" alt=""></dt>
                    <dd>{{ item.nickName }}</dd>
                  </dl>
                </template>
              </div>
              {{ model.joinTeam[0].customers.length >= 4 ? '等' : ''}}
            </div>
            <div class="footer" @click="goJoinCollage" v-if="(model.joinTeam[0].num != 0) && (model.myTeam == null) && (model.ifJoin != 1)">
              <img class="join-but" src="../../assets/img/collage/join-but.png" alt="">
            </div>
          </div>
        </div>
      </div>
      <div class="common-but" v-if="model.myTeam != null" style="margin-bottom: 3vw;" @click="shareWeChatAppBut">邀请好友参加拼团</div>
      <template v-else>
        <!-- ifJoin 0:没有参加 1:参加了 -->
        <div v-if="model.ifJoin == 0" class="common-but" style="margin-bottom: 3vw;" @click="goJoinCollage">立即参团</div>
        <div class="common-but" @click="conveneMyCollage">发起我的拼团</div>
      </template>
    </template>
    <div v-else class="collage-end">拼团活动已结束</div>
    
    <!-- 订单信息 -->
    <order-info-collage :activityInfo="activityInfo" ref="orderInfo" @address-submit="goPay" />

    <!-- 支付 -->
    <pay-type ref="payType" :jump-link="payJumpLink" />

    <!-- 分享弹窗 -->
    <mask-box ref="shareLinkPopup" @mask-event="shareLinkPopupEvent">
      <img class="share-lick-icon" src="../../assets/img/bargaining/share-icon.png" alt="">
    </mask-box>
    
  </div>
</template>

<script>
import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper';
import 'swiper/css/swiper.min.css';
import MaskBox from "@/components/MaskBox";
import { Toast, Dialog } from 'vant';
import { mapState } from 'vuex';
import Navigation from '@/components/Navigation.vue';
import OrderInfoCollage from "@/components/OrderInfoCollage";
import PayType from "@/components/PayType";
import { GROUPBUY_QUERY_ONE } from "@/request/api";


export default {
  name: 'MyCollage',
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
      payTypeShow: false, // 支付方式弹窗
      model: {}, // 拼团信息
      groupList: [], // 参加拼团列表
      activityInfo: {}, // 活动信息
      payInfo: {}, // 支付信息
      payJumpLink: '', // 支付跳转链接
      id: '', // 拼团id
      teamId: '' // 团id
    }
  },

  // 计算属性
  computed: {
   ...mapState(['token', 'type']),
  },

  // 生命周期
  mounted() {
    this.id = this.$route.query.id;
    this.teamId = this.$route.query.teamId || null;
    this.getCollageInfo();
  },

  // 事件
  methods:{
    // 获取拼团信息
    getCollageInfo() {
      Toast.loading({
        message: '加载中...',
        forbidClick: true,
        duration: 0,
      });
      this.$axios.post(GROUPBUY_QUERY_ONE, {teamId: this.teamId}).then(res => {
        Toast.clear();
        if (res.code == 0) {
          if (res.data.model.detailImg != null) {
            res.data.model.detailImg = res.data.model.detailImg.split(",");
          } else {
            res.data.model.detailImg = [];
          }
          console.log(res.data.model.detailImg);
          this.model = res.data.model;
          this.groupList = res.data.groupList;
        } else {
          Toast(res.mes);
        }
      })
    },
    // 去参加拼团
    goJoinCollage() {
      this.activityInfo = {
        type: false,
        id: this.teamId,
        price: this.model.price,
      }
      console.log(this.activityInfo);
      this.$refs.orderInfo.showState(true);
    },

    // 发起我的拼团
    conveneMyCollage() {
      this.$router.push({ path: "/collage", query:{id: this.model.id, token: this.token, type: this.type}});
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
    // 返回
    returnEmit() {
      this.$router.push({ path: "/collage",  query:{ token: this.token, type: this.type, id: this.id} });
    },
    // 小程序分享
    shareWeChatAppBut() {
      let path = `/pages/webpage/index?url=${encodeURIComponent(process.env.VUE_APP_SERVER_URL + "/collage/my-collage?teamId=" + this.teamId)}`;
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
.my-collage {
  width: 100vw;
  background-color: #fff;
  padding-bottom: 10vw;
  box-sizing: border-box;
  position: relative;
  padding-top: 14vw;
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
  .cover-box{
    width: 100vw;
    position: relative;
    img {
      width: 100%;
      display: block;
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
    margin-bottom: 5vw;
    .partake-box{
      background-color: #FAFAFA;
      box-sizing: border-box;
      padding: 5vw 3vw;
      .look-out {
        font-size: 3vw;
        color: #454952;
        margin-bottom: 5vw;
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
          .user-box {
            display: flex;
            align-items: center;
            box-sizing: border-box;
            .user-info{
              margin: 0 1vw;
              dt {
                width: 10vw;
                height: 10vw;
                overflow: hidden;
                border-radius: 50%;
                position: relative;
                border: .5vw solid #fff;
                margin: 0 auto;
                margin-bottom: 1vw;
                img {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 100%;
                  min-height: 100%;
                }
              }
              dd {
                width: 14vw;
                font-size: 3vw;
                text-align: center;
                color: #454952;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              }
            }
          }
        }
        .footer {
          font-size: 3vw;
          color: #444954;
          display: flex;
          align-items: center;
          .join-but {
            width: 10vw;
            height: 10vw;
          }
        }
      }
    } 
  }
  .common-but {
    background-color: #F76D3F;
    box-sizing: border-box;
    padding: 3vw;
    font-size: 3.5vw;
    color: #fff;
    text-align: center;
    width: 90vw;
    margin: 0 auto;
    border-radius: 3vw;
  }
  .collage-end {
    width: 100%;
    box-sizing: border-box;
    padding: 15vw;
    font-size: 3.5vw;
    text-align: center;
    color: rgb(145, 145, 145);
  }
}
</style>
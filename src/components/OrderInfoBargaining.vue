<template>
  <mask-box ref="addressPopup">
    <div class="address-popup">
      <div class="title">{{ activityInfo.titleData }}</div>
      <div class="list-box">
        <div class="unit-box">
          <b>姓名</b>
          <input class="input-box" type="text" placeholder="请输入姓名" v-model="userName" maxlength="20">
        </div>
        <div class="unit-box">
          <b>电话</b>
          <input class="input-box" type="number" placeholder="请输入电话" v-model="phone" @blur="filterWords" maxlength="20">
        </div>
        <div class="unit-box">
          <b>省市</b>
          <div class="select-box" @click="openArea">
            <div class="title">
              {{ provinceName == "" || cityName == "" ? '请选择省市' : provinceName + '/' + cityName}}
            </div>
            <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3681"><path d="M312.888889 995.555556c-17.066667 0-28.444444-5.688889-39.822222-17.066667-22.755556-22.755556-17.066667-56.888889 5.688889-79.644445l364.088888-329.955555c11.377778-11.377778 17.066667-22.755556 17.066667-34.133333 0-11.377778-5.688889-22.755556-17.066667-34.133334L273.066667 187.733333c-22.755556-22.755556-28.444444-56.888889-5.688889-79.644444 22.755556-22.755556 56.888889-28.444444 79.644444-5.688889l364.088889 312.888889c34.133333 28.444444 56.888889 73.955556 56.888889 119.466667s-17.066667 85.333333-51.2 119.466666l-364.088889 329.955556c-11.377778 5.688889-28.444444 11.377778-39.822222 11.377778z" p-id="3682"></path></svg>
          </div>
        </div>
        <div class="unit-box">
          <b>经销商</b>
          <div class="select-box" @click="openDealer">
            <div class="title">
              {{ dealerName == "" ? '请选择经销商' : dealerName}}
            </div>
            <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3681"><path d="M312.888889 995.555556c-17.066667 0-28.444444-5.688889-39.822222-17.066667-22.755556-22.755556-17.066667-56.888889 5.688889-79.644445l364.088888-329.955555c11.377778-11.377778 17.066667-22.755556 17.066667-34.133333 0-11.377778-5.688889-22.755556-17.066667-34.133334L273.066667 187.733333c-22.755556-22.755556-28.444444-56.888889-5.688889-79.644444 22.755556-22.755556 56.888889-28.444444 79.644444-5.688889l364.088889 312.888889c34.133333 28.444444 56.888889 73.955556 56.888889 119.466667s-17.066667 85.333333-51.2 119.466666l-364.088889 329.955556c-11.377778 5.688889-28.444444 11.377778-39.822222 11.377778z" p-id="3682"></path></svg>
          </div>
        </div>
        <div class="unit-box">
          <b>订金</b>
          <span class="price">{{ activityInfo.price | priceUnit }}元</span>
        </div>
      </div>
      <div class="address-submit" @click="addressSubmit">{{ activityInfo.butData }}</div>
      <img class="address-close" @click="closeSubmit" src="../assets/img/close-01.png" alt="">
    </div>
    <!-- 省市选择 -->
    <van-action-sheet v-model="areaActionSheetShow" :closeable="false">
      <van-picker swipe-duration="5" ref="areaPicker" show-toolbar title="选择省市" value-key="name" :loading="areaLoading" :columns="areaColumns" @confirm="areaConfirm"   @cancel="areaCancel" @change="switchArea" />
    </van-action-sheet>

    <!-- 经销商选择 -->
    <van-action-sheet v-model="dealerActionSheetShow" :closeable="false">
      <van-picker swipe-duration="5" ref="dealerPicker" value-key="dealerName" show-toolbar title="选择经销商" :columns="dealerColumns" @confirm="dealerConfirm" @cancel="dealerCancel" />
    </van-action-sheet>
  </mask-box>
</template>

<script>
import MaskBox from "@/components/MaskBox";
import { Toast, Dialog } from 'vant';
import { SHOP_PROVINCE, SHOP_CITY, BARGAIN_ADD_ORDER, BARGAIN_PAY, BARGAIN_DEALERLIST, BARGAIN_ORDER_INFO } from "@/request/api";

export default {
  name: 'OrderInfo',
  components: {
    MaskBox,
  },
  props: {
    // 活动信息
    activityInfo: {
      type: Object,
      default: () => {
        return {
          type: false, // false: 填写信息 true: 确认信息
          titleData: '填写信息',
          id: '', // 活动id
          price: '', // 定金
          butData: '提交', // 按钮样式
          carSeriesId: -1, // 车系id
          carModelId: -1, // 车型id
          factory: 1, // 1小康，2风光
          orderName: null, // 活动名称
          orderId: 0, // 订单id
        }
      }
    },
  },
  data() {
    return {
      userName: '', // 姓名
      phone: '', // 电话
      dealerName: '', // 经销商名称
      dealerId: '', // 经销商id
      cityId: '', // 城市id 
      cityName: '', // 城市名称
      provinceId: '', // 省份id
      provinceName: '', // 省份名称
      price: '', // 订金
      activityId: '', // 砍价活动id
      target: '', // 用户砍价id
      orderId: '', // 订单id
      orderNo: '', // 订单编号
      areaActionSheetShow: false, // 区域弹窗
      // 省市多级选择
      areaColumns: [],
      areaLoading: true, // 省市加载状态
      dealerActionSheetShow: false, // 经销商弹窗
      areaCodeOld: '', // 旧的省市code
      initArea: true, // 初始化地址信息
      // 经销商多级选择
      dealerColumns: [],
    }
  },
  // 生命周期
  async mounted() {   
    
  },
  watch: {
    async activityInfo(newVal, oldVal) {
      this.price = newVal.price;
      this.activityId = newVal.id;
      if (newVal.type == true) {
        this.target = newVal.id;
        await this.getOrderInfo(newVal.id); // 信息回填
      }
    }
  },
  // 方法
  methods: {
    // 过滤中文
    filterWords() {
      this.phone = this.phone.replace(/[\u4e00-\u9fa5]/g,'')
    },
    // 获取订单信息
    async getOrderInfo() {
      await this.$axios.post(BARGAIN_ORDER_INFO, {orderId: this.activityInfo.orderId}).then(res => {
        if (res.code == 0) {
          this.userName = res.data.userName; // 姓名
          this.phone = res.data.phone; // 电话
          this.dealerName = res.data.dealerName; // 经销商名称
          this.dealerId = res.data.dealerId; // 经销商id
          this.cityId = res.data.cityId; // 城市id 
          this.cityName = res.data.cityName; // 城市名称
          this.provinceId = res.data.provinceId; // 省份id
          this.provinceName = res.data.provinceName; // 省份名称
          this.price = res.data.price; // 订金
          this.orderId = res.data.id; // 订单id
          this.orderNo = res.data.orderNo; // 订单编号
          // this.activityId = res.data.activityId; // 砍价id
          this.target = res.data.target; // 用户砍价id
        } else {
          Toast(res.mes);
        }
      })
      
    }, 
    // 获取省信息
    async getProvinceList() {
      this.areaLoading = true;
      await this.$axios.post(SHOP_PROVINCE, {factory: this.activityInfo.factory}).then((res) => {
        if (res.code == 0) {
          this.areaLoading = false;
          res.data.forEach(item => {
            item['name'] = item.provinceName;
            item['addressCode'] = item.provinceId;
          })
          this.areaColumns = [{values: res.data}, {values:[]}];
        } else {
          Toast(res.mes);
        }
      })
    },
    // 获取城市信息
    async getCityList(id) {
      this.areaLoading = true;
      return await this.$axios.post(SHOP_CITY, {provinceId: id, factory: this.activityInfo.factory}).then((res) => {
        if (res.code == 0) {
          this.areaLoading = false;
          res.data.forEach(item => {
            item['name'] = item.cityName;
            item['addressCode'] = item.cityId;
          })
          return res.data
        } else {
          Toast(res.mes);
        }
      })
    },
    // 切换省市信息
    async switchArea(picker, values) {
      // 只有当更新省的时候才请求市的数据
      if (this.areaCodeOld != values[0].addressCode) {
        let cityList = await this.getCityList(values[0].addressCode);
        this.areaCodeOld = values[0].addressCode; // 赋值旧的省code
        picker.setColumnValues(1, cityList);
      }
    },
    // 显示隐藏
    async showState(state) {
      if ((state == true) && (this.activityInfo.type == false)) {
        this.userName = ''; // 姓名
        this.phone = ''; // 电话
        this.dealerName = ''; // 经销商名称
        this.dealerId = ''; // 经销商id
        this.cityId = ''; // 城市id 
        this.cityName =''; // 城市名称
        this.provinceId = ''; // 省份id
        this.provinceName = ''; // 省份名称
        // 省市多级选择
        this.areaLoading = true; // 省市加载状态
        this.dealerActionSheetShow = false; // 经销商弹窗
        this.areaCodeOld = ''; // 旧的省市code
        this.initArea = true; // 初始化地址信息
        Toast.loading({
          message: '加载中...',
          forbidClick: true,
          duration: 0,
        });
        Toast.clear();
      }
      await this.getProvinceList(); // 获取省信息
      this.$refs.addressPopup.showState = state;
    },
    // 打开区域
   async openArea() {
      this.areaActionSheetShow = true;
      if (this.initArea == true) {
        this.$nextTick(async () => {
          let provinceId = '';
          try {
            provinceId = this.areaColumns[0].values[0].addressCode;
          } catch (error) {
            provinceId = this.provinceId;
          }
          console.log(provinceId, "-*---")
          let cityList = await this.getCityList(provinceId);
          this.$refs.areaPicker.setColumnValues(1, cityList);
          this.initArea = false;
        })
      }
    },

    // 区域弹窗确认
    areaConfirm(value, index) {
      this.cityId = value[1].cityCode; // 城市id 
      this.cityName = value[1].name; // 城市名称
      this.provinceId = value[0].provinceId, // 省份id
      this.provinceName = value[0].name; // 省份名称
      this.areaActionSheetShow = false;
      this.dealerName = ''; // 经销商名称
      this.dealerId =''; // 经销商id
    },

    // 区域弹窗取消
    areaCancel() {
      this.areaActionSheetShow = false;
    },

    // 打开经销商
    async openDealer() {
      if ((this.provinceName == '') || (this.cityName == '')) {
        Toast('请先选择区域!')
        return
      }
      await this.getDealerLis();
      if (this.dealerColumns[0].values.length != 0) {
        this.dealerActionSheetShow = true;
      } else {
        Toast('该区域没有经销商!')
      }
    },

    // 获取区域经销商信息
    async getDealerLis() {
      let data = {
        factory: this.activityInfo.factory, // 1小康，2风光
        bargainId: this.activityInfo.id, // 砍价活动id
        province: this.provinceName, // 省份名称
        cityId: this.cityId, // 城市id
        city: this.cityName, // 城市名称
      };
      await this.$axios.post(BARGAIN_DEALERLIST, { ...data }).then(res => {
        if (res.code == 0) {
          this.dealerColumns = [{values: res.data}];
        } else {
          Toast(res.mes);
        }
      })
    },

    // 经销弹窗确认
    dealerConfirm(value, index){
      this.dealerName = value[0].dealerName;
      this.dealerId = value[0].dealerId;
      this.dealerActionSheetShow = false;
    },

    // 经销商弹窗取消
    dealerCancel() {
      this.dealerActionSheetShow = false;
    },

    // 个人信息提交
    addressSubmit() {
      // 校验字段
      if (this.userName == '' || this.phone == '' || this.dealerName == '' || this.cityName == '' || this.provinceName == '' || this.price == '') {
        Toast("请填写相关信息,不能为空!")
        return
      }
      let data = {};
      let url = '';
      if (this.activityInfo.type == true) {
        // 确认下单
        data = {
          userName: this.userName, // 姓名
          phone: this.phone, // 电话
          dealerName: this.dealerName, // 经销商名称
          dealerId: this.dealerId, // 经销商id
          cityId: this.cityId, // 城市id 
          cityName: this.cityName, // 城市名称
          provinceId: this.provinceId, // 省份id
          provinceName: this.provinceName, // 省份名称
          price: this.price, // 订金
          target: this.target, // 用户的砍价id
          id: this.orderId, // 订单id
          orderNo: this.orderNo, // 订单编号
          factory: this.activityInfo.factory, // 1小康，2风光
          carSeriesId: this.activityInfo.carSeriesId, // 车系id
          carModelId: this.activityInfo.carModelId, // 车型id
          orderName: this.activityInfo.orderName, // 活动名称
        };
        url = BARGAIN_PAY;
      } else {
        // 提交订单
        data = {
          price: this.price, // 订金
          provinceId: this.provinceId, // 省份id
          provinceName: this.provinceName, // 省份名称
          cityName: this.cityName, // 城市名称
          cityId: this.cityId, // 城市id
          dealerId: this.dealerId, // 经销商id
          dealerName: this.dealerName, // 经销商名称
          phone: this.phone, // 电话
          userName: this.userName, // 姓名
          target: this.target, // 用户砍价id
          activityId: this.activityId, // 砍价活动id
          carSeriesId: this.activityInfo.carSeriesId, // 车系id
          carModelId: this.activityInfo.carModelId, // 车型id
          factory: this.activityInfo.factory, // 1小康，2风光
        };
        url = BARGAIN_ADD_ORDER;
      }
      this.$axios.post(url, { ...data }).then(res => {
        if(res.code == 0) {
          // 提交成功
          this.$emit("address-submit", {state: true, data:{...res.data}});
        } else {
          this.$emit("address-submit", {state: false, data:{...res.data}});
          Toast(res.mes);
        }
        this.$refs.addressPopup.showState = false;
      })
    },

    // 关闭个人信息提交
    closeSubmit() {
      this.$refs.addressPopup.showState = false;
    },
  }
}
</script>
<style scoped lang="scss">
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
        .title {
          width: 30vw;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          text-align: right;
        }
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
</style>

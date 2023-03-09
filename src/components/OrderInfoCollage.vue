<template>
  <mask-box ref="addressPopup">
    <div class="address-popup">
      <div class="title">填写信息</div>
      <div class="list-box">
        <div class="unit-box">
          <b>姓名</b>
          <input class="input-box" type="text" placeholder="请输入姓名" v-model="userName" maxlength="20">
        </div>
        <div class="unit-box">
          <b>电话</b>
          <input class="input-box" type="number" placeholder="请输入电话" v-model="phone" @blur="filterWords" maxlength="11">
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
      <div class="address-submit" @click="addressSubmit">提交并支付</div>
      <img class="address-close" @click="closeSubmit" src="../assets/img/close-01.png" alt="">
    </div>
    <!-- 省市选择 -->
    <van-action-sheet v-model="areaActionSheetShow" :closeable="false">
      <van-picker swipe-duration="5" ref="areaPicker" show-toolbar title="选择省市" value-key="name" :loading="areaLoading" :columns="areaColumns" @confirm="areaConfirm"   @cancel="areaCancel" @change="switchArea" />
    </van-action-sheet>

    <!-- 经销商选择 -->
    <van-action-sheet v-model="dealerActionSheetShow" :closeable="false">
      <van-picker swipe-duration="5" ref="dealerPicker" value-key="dealerName" show-toolbar title="选择经销商" :columns="dealerColumns" @confirm="dealerConfirm"   @cancel="dealerCancel" />
    </van-action-sheet>
  </mask-box>
</template>

<script>
import MaskBox from "@/components/MaskBox";
import {gpsDisplaceInfo} from "@/assets/js/public";
import { Toast, Dialog } from 'vant';
import { SHOP_PROVINCE, SHOP_CITY,  GROUPBUY_DEALER, GROUPBUY_ADD_ORDER, GROUPBUY_ADD_TEAM } from "@/request/api";

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
          id: 1, // 活动id
          type: true, // true: 创造拼团 false: 参与拼团
          price: 0, // 订金价格
          factory: 1, // 1小康，2风光
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
      areaActionSheetShow: false, // 区域弹窗
      // 省市多级选择
      areaColumns: [],
      areaLoading: true, // 省市加载状态
      dealerActionSheetShow: false, // 经销商弹窗
      addOrderUrl: '', // 添加修改接口地址
      areaCodeOld: '', // 旧的省市code
      initArea: true, // 初始化地址信息
      // 经销商多级选择
      dealerColumns: [],
      // 误触
      errorTouch: false,
      cityLocateInfo: {}, // 城市信息
      cityLocateCityList: [], // 城市信息的城市列表
    }
  },
  // 生命周期
  async mounted() {

  },
  watch: {
    activityInfo(newVal, oldVal) {
      if (newVal.type == true) {
      // true: 创造拼团
        this.addOrderUrl = GROUPBUY_ADD_TEAM;
      } else {
        //  false: 参与拼团
        // this.teamId = newVal.teamId;
        this.addOrderUrl = GROUPBUY_ADD_ORDER;
      }
    }
  },
  // 方法
  methods: {
    // 过滤中文
    filterWords() {
      this.phone = this.phone.replace(/[\u4e00-\u9fa5]/g,'')
    },
    // 获取省信息
    async getProvinceList() {
      this.areaLoading = true;
      await this.$axios.post(SHOP_PROVINCE, {factory: this.activityInfo.factory}).then((res) => {
        if (res.code == 0) {
          this.areaLoading = false;
          res.data.forEach(item => {
            item['name'] = item.provinceName;
            item['provinceId'] = item.provinceId;
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
            item['cityId'] = item.cityId;
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
      if (this.areaCodeOld != values[0].provinceId) {
        let cityList = await this.getCityList(values[0].provinceId);
        this.areaCodeOld = values[0].provinceId; // 赋值旧的省code
        picker.setColumnValues(1, cityList);
      }
    },
    // 显示隐藏
    async showState(state) {
      if (state == true) {
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
        await this.getProvinceList(); // 获取省信息
        this.cityLocateInfo = await gpsDisplaceInfo(); // 通过定位获取城市信息
        if (this.cityLocateInfo != false) {
          // 匹配省信息
          for (let i = 0; i < this.areaColumns[0].values.length; i++) {
            if (this.areaColumns[0].values[i].provinceName.indexOf(this.cityLocateInfo.province.slice(0, 2)) != -1) {
              this.provinceId = this.areaColumns[0].values[i].provinceId;
              this.provinceName = this.areaColumns[0].values[i].provinceName;
              break
            }
          }
          // 获取城市信息
          this.cityLocateCityList = await this.getCityList(this.provinceId);
          if (this.cityLocateCityList.length != 1) {
            for (let j = 0; j < this.cityLocateCityList.length; j++) {
              if (this.cityLocateCityList[j].cityName.indexOf(this.cityLocateInfo.district.slice(0, 2)) != -1) {
                this.cityId = this.cityLocateCityList[j].cityCode;
                this,cityName = this.cityLocateCityList[j].cityName;
              }
            }
          } else {
            this.cityId = this.cityLocateCityList[0].cityCode;
            this.cityName = this.cityLocateCityList[0].cityName;
          }
          console.log(this.cityLocateInfo, "定位城市信息")
          console.log(this.cityLocateCityList, "城市信息");
        }
        Toast.clear();
      }
      this.$refs.addressPopup.showState = state;
    },
    // 打开区域
     openArea() {
      this.areaActionSheetShow = true;
      if (this.initArea == true) {
        this.$nextTick(async () => {
          let cityList = await this.getCityList(this.areaColumns[0].values[0].provinceId);
          this.$refs.areaPicker.setColumnValues(1, cityList);
          this.initArea = false;
        })
      }
    },

    // 区域弹窗确认
    areaConfirm(value, index) {
      this.cityId = value[1].cityCode; // 城市id 
      this.cityName = value[1].cityName; // 城市名称
      this.provinceId = value[0].provinceId, // 省份id
      this.provinceName = value[0].provinceName; // 省份名称
      this.areaActionSheetShow = false;
      this.dealerName = '';
      this.dealerId = '';
      console.log(this.cityId, this.cityName, this.provinceId, this.provinceName);
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
      await this.$axios.post(GROUPBUY_DEALER, { id: this.activityInfo.id, provinceName: this.provinceName, cityName: this.cityName}).then(res => {
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
      if (this.errorTouch) {
        return
      }
      this.errorTouch = true;
      setTimeout(() => {
        this.errorTouch = false;
      }, 1000)
      // 校验字段
      if (this.userName == '' || this.phone == '' || this.dealerName == '' || this.cityName == '' || this.provinceName == '' || this.price == '' || this.activityInfo.id == '') {
        Toast("请填写相关信息,不能为空!")
        return
      }
      let data = {
        userName: this.userName, // 姓名
        phone: this.phone, // 电话
        dealerName: this.dealerName, // 经销商名称
        dealerId: this.dealerId, // 经销商id
        cityId: this.cityId, // 城市id 
        cityName: this.cityName, // 城市名称
        provinceId: this.provinceId, // 省份id
        provinceName: this.provinceName, // 省份名称
        price: this.activityInfo.price, // 订金
        target: this.activityInfo.type ? this.activityInfo.id : this.activityInfo.teamId, // 拼团/砍价id
        carSeriesId: this.activityInfo.carSeriesId, // 车系id
        carModelId: this.activityInfo.carModelId, // 车型id
        factory: this.activityInfo.factory, // 1小康，2风光
      };
      // if (this.type == true) {
      //   // 确认信息
      //   data['orderId'] = "54"
      // }
      this.$axios.post(this.addOrderUrl, { ...data }).then(res => {
        if(res.code == 0) {
          // 提交成功
          this.$emit("address-submit", {state: true, data:{...res.data}});
        } else {
          this.$emit("address-submit", {state: false});
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

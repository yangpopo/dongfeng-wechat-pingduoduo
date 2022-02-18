import appNative from './appNative'
/**
 * App 相关接口
 */

/**
 * 获取用户手机号
 * @param callback
 */
function getUserTel(callback) {
  appNative.nativeMethod('getUserTel', { callback })
}

/**
 * 微信支付
 * @param data
 * @param callback
 */
function wxPay(data, callback) {
  appNative.nativeMethod('wxPay', { data, callback })
}

/**
 * 支付宝支付
 * @param {*} data
 * @param {*} callback
 */
function aliPay(data, callback) {
  appNative.nativeMethod('aliPay', { data, callback })
}

function alert(msg) {
  appNative.nativeMethod('alert', {
    data: {
      msg
    }
  })
}

/**
 * app打开新链接
 * @param {*} url 链接
 * @param {*} showHeader 是否原生显示头部导航
 */
function openWebPage(url, showHeader = false) {
  appNative.nativeMethod('openWebPage', { data: { url, showHeader } })
}

/**
 * 打开APP登录页面
 */
function openLoginPage() {
  appNative.nativeMethod('openLoginPage')
}

/**
 * 打开APP我的优惠券
 */
function openCoupon() {
  appNative.nativeMethod('openCoupon')
}

/**
 * 关闭webview
 */
function closePage() {
  appNative.nativeMethod('closePage')
}

/**
 * 刷新token
 * 回到方法：updateToken(token)
 */
function refreshToken(callback) {
  appNative.nativeMethod('refreshToken', { callback })
}

/**
 * 选择了一个频道
 * @param name 频道名称
 * @param id   频道编号
 */
function selectedChannel(name, id) {
  const data = {
    data: {
      name: name,
      id: id
    }
  }
  appNative.nativeMethod('selectedChannel', data)
}

/**
 * 选择城市
 * @param name 城市名称
 */
function selectedCity(name) {
  const param = {
    data: {
      name: name
    }
  }
  appNative.nativeMethod('selectedCity', param)
}

/**
 * 打开搜索话题页面
 * @param name 话题名称
 */
function openSearchTopic(name) {
  const param = {
    data: {
      name: name
    }
  }
  appNative.nativeMethod('openSearchTopic', param)
}

/**
 * 打开车友会详情
 * @param id
 */
function openCarClubDetailPage(id) {
  const param = {
    data: {
      id: id
    }
  }
  appNative.nativeMethod('openCarClubDetailPage', param)
}

/**
 * 打开我的车友会
 */
function openMyCarClubPage() {
  appNative.nativeMethod('openMyCarClubPage')
}

/**
 * 获取定位信息
 */
function getLocation(callback) {
  appNative.nativeMethod('getLocation', { callback })
}

/**
 * 进入风迷币详情页面
 */
function goFMBPage() {
  appNative.nativeMethod('openFMcoinList')
}

/**
 * 进入社区
 */
function goCommunity() {
  appNative.nativeMethod('openXKCommunityPage', {})
}

/**
 * 拨打电话
 * @param number
 */
function callPhone(number) {
  const param = {
    data: {
      number: number
    }
  }
  appNative.nativeMethod('callPhone', param)
}

/**
 * 复制
 * @param val
 */
function copyInfo(val) {
  const param = {
    data: {
      text: val
    }
  }
  appNative.nativeMethod('copyText', param)
}

/**
 * 分享图片
 * @param picUrl 图片地址
 * @param scene 0 好友 1 朋友圈
 */
function shareImage(picUrl, scene) {
  const param = {
    data: {
      image: picUrl,
      scene: scene
    }
  }
  appNative.nativeMethod('shareImage', param)
}

/**
 * 分享url
 * @param obj
 */
function shareUrl(obj) {
  const param = {
    data: {
      url: obj.url,
      title: obj.title,
      text: obj.text,
      image: obj.image,
      scene: obj.scene
    }
  }
  appNative.nativeMethod('shareUrl', param)
}

/**
 * 打开二维码
 */
function openScanner(callback) {
  appNative.nativeMethod('openScanner', { callback })
}

/**
 * 打开商城
 * @param type  0风光 1小康 2风迷
 */
function openShopCenter(type) {
  const param = {
    data: {
      type: type
    }
  }
  appNative.nativeMethod('openShopCenter', param)
}

/**
 * 打开附近经销商
 */
function openNearbyStore() {
  appNative.nativeMethod('openNearbyStore')
}

/**
 * 图片
 * @param imgUrl 图片链接
 */
function saveImge(imgUrl) {
  const param = {
    data: {
      imgUrl: imgUrl
    }
  }
  appNative.nativeMethod('saveImge', param)
}

/**
 * 获取风迷商城token
 * @param callback
 */
function getFMToken(callback) {
  appNative.nativeMethod('getFMToken', { callback })
}

/**
 * 认证回调
 * @param data
 */
function realAuthenticationCompleted(data) {
  const param = {
    data: {
      status: data
    }
  }
  appNative.nativeMethod('realAuthenticationCompleted', param)
}

/**
 * 打开银行卡识别
 * @param callback
 */
function openBankScanner(callback) {
  appNative.nativeMethod('openBankScanner', { callback })
}

export default {
  alert, //
  openWebPage, // 打开APP链接
  closePage, // 关闭页面
  wxPay, // 支付方式
  aliPay, // 支付方式
  getUserTel, // 获取用户手机号
  openLoginPage, // 打开登录页面
  refreshToken, // 刷新token
  selectedChannel, // 选择频道
  selectedCity, // 选择城市
  openSearchTopic, // 打开话题页面
  openCarClubDetailPage, // 打开车友会详情页面
  openMyCarClubPage, // 打开我的车友会
  getLocation, // 获取定位信息
  goFMBPage, // 进入风迷币详情页面
  callPhone, // 拨打电话
  copyInfo, // 复制
  shareImage, // 分享图片
  shareUrl, // 分享URL
  openScanner, // 打开二维码
  goCommunity, // 进入社区
  openShopCenter, // 打开商城
  openNearbyStore, // 打开附近经销商
  saveImge, // App保存图片
  getFMToken, // 获取风迷商城token
  realAuthenticationCompleted, // 认证回调
  openBankScanner, // 打开银行卡
  openCoupon, // 打开我的优惠券
}

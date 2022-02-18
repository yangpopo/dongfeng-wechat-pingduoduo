import util from './index'
// import common from './common'
// import api from './../api/api'
import JSbridge from './JSbridge'
console.log('JSbridge', JSbridge)

const parseObj = data => {
  let obj = {}
  try {
    if (!isNaN(data)) return data

    obj = JSON.parse(data)
    if (obj.responseData) {
      return obj.responseData
    }
  } catch (error) {
    obj = data
  }
  return obj
}

const nativeMethod = (method, { data, callback } = {}) => {
  console.info('App交互数据', { method, ...data })
  try {
    if (util.isIOS) {
      iosNative(method, data, callback)
    } else if (util.isAndroid) {
      androidNative(method, data, callback)
    } else {
      console.log('非APP环境调用1：' + method)
      // eslint-disable-next-line standard/no-callback-literal
      callback && callback('bolaa')
    }
  } catch (error) {
    console.log('非APP环境调用2：' + error)
    // eslint-disable-next-line standard/no-callback-literal
    callback && callback({
      province: '重庆',
      city: '重庆市',
      lng: '106.495374',
      lat: '29.628575'
    })
  }
}

const iosNative = (method, data, callback) => {
  console.info('IOS jsapi', { method, ...data })
  callback && initIOSCallback(method, callback)
  window.webkit.messageHandlers.jsCallNative.postMessage({ method, ...data })
}

const androidNative = (method, data, callback) => {
  console.info('Android jsapi', { method, callback, ...data })
  callback && initAndroidCallback(method, callback)
  window.WebViewJavascriptBridge.callHandler(method, data, e => {
    console.info('Android jsapi', e)
    callback && callback(parseObj(e))
  })
}

const initIOSCallback = (method, callback) => {
  if (method === 'openScanner') {
    window.nativeScanCompleted = data => {
      callback && callback(parseObj(data))
    }
  } else if (method === 'getLocation') {
    window.updateLocation = async data => {
      /**
       * data
       * { lat:xx, lng:xx, province: xx, provinceCode: '', city:xx, cityCode: '', }
       */
      const rawData = parseObj(data)
      const res1 = await api.zhihuibao.getProvince({
        provinceName: rawData.province
      })
      rawData.provinceCode = res1.data
      const res2 = await api.zhihuibao.getCity({ cityName: rawData.city })
      rawData.cityCode = res2.data
      callback && callback(rawData)
    }
  } else if (method === 'refreshToken') {
    window.updateToken = data => {
      const obj = parseObj(data)
      common.setSystemToken(obj)
      callback && callback(obj)
    }
  } else {
    window[`${method}Completed`] = data => {
      callback && callback(parseObj(data))
    }
  }
}

const initAndroidCallback = (method, callback) => {
  window.WebViewJavascriptBridge.registerHandler(`${method}Complete`, function (
    data,
    responseCallback
  ) {
    console.log(`${method}`, data)
    callback && callback(parseObj(data))
  })
}

export default {
  nativeMethod,
  iosNative,
  androidNative
}

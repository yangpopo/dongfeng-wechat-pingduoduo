import requests from '@/request/axios.js';
import Store from '@/store/index.js';

// 通过gps获取省市想信息
export const gpsDisplaceInfo = () => {
  return new Promise(resolve => {
    if ((Store.state.lat == '') || (Store.state.lng == '')) {
      resolve(false) 
    }
    requests.requests.get('/jssdk/baiduAddressCode', {
      params: {
        url: `https://api.map.baidu.com/reverse_geocoding/v3/?ak=uvPuVrMnijMrdmwmiwSI5w81q2mbLco9&output=json&coordtype=bd09ll&location=${Store.state.lat},${Store.state.lng}`,
        methon: 'get'
      }
    }).then(async res => {
      if (res.code == 0) {
          let addressInfo = JSON.parse(res.data);
          // 百度返回正确值
          let province = addressInfo.result.addressComponent.province; // 省
          let district = addressInfo.result.addressComponent.district; // 市/区
          resolve({province, district})
      } else {
        resolve(false)
      }
    }).catch(err => {
      resolve(false)
    })
  })
 
}




import Vue from 'vue'

const awaitSleep = (time) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

const isProd = process.env.NODE_ENV === 'production'
const inBrowser = !Vue.prototype.$isServer || typeof window !== 'undefined'
const UA = inBrowser && window.navigator.userAgent.toLowerCase()
const isAndroid = UA && UA.indexOf('android') > 0
const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA)

export default {
  isProd,
  inBrowser,
  isAndroid,
  isIOS,
  awaitSleep
}

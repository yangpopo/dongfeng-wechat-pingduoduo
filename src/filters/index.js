const formatDate = function(date, fmts) {
  //时间戳转换
  var fmt = 'yyyy-MM-dd hh:mm:ss'
  if (fmts) {
    fmt = fmts
  }
  var date = new Date(date * 1000)
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padLeftZero(str))
    }
  }
  return fmt
}

function padLeftZero(str) {
  return ('00' + str).substr(str.length)
}

// 货币分转成元
const priceUnit = function(val) {
  val = Number.parseInt(val);
  return val / 100
}

const chineseFilter = function(value){
  return value.replace(/[\u4e00-\u9fa5]/g,'')
}
export{
  formatDate,
  priceUnit,
  chineseFilter,
}

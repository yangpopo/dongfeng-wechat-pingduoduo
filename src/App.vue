<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { APPLET_CUSTOMER_INFO } from "@/request/api";

export default {
  // 生命周期
  mounted() {
  },
  // 计算属性
  computed: {
    type: state => state.type, // app: 来自app null: 来自小程序
    token: state => state.token,
  }
}
</script>

<style lang="scss">
@charset "UTF-8";
body, textarea, input, select, option {
  color: #333;
  font-family: "Microsoft Yahei", "PingFang SC", "Hiragino Sans GB",  tahoma, arial, sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color:transparent;
}
body,h1,h2,h3,h4,h5,h6,blockquote,ol,ul,dl,dd,p,textarea,input,select,option,form {
    margin:0; padding:0;
}

ol,ul,textarea,input,option,th,td {
    padding:0;
}
.page{
    min-width: 320px;max-width: 750px;margin: 0 auto;
}
h1,h2,h3,h4,h5,h6 {
    font-weight: normal;
    font-size:100%;
}
a,select,input,textarea{
    outline: none;
}
article, aside, details, figcaption, figure, footer, header, menu, nav, section {
    display: block;
}
table {
    border-collapse:collapse;border-spacing: 0;
}
ul,ol {
    list-style-type:none;
}
img {
  display: block;
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;
  }
}
</style>

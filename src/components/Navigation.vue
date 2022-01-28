<template>
  <div class="navigation">
    <span class="left-box" @click="leftClick">
      <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6094"><path d="M222.451715 513.728968L722.745849 13.63942599c18.242732-18.242732 47.73799-18.106338 65.844327 0.30688701a47.226511 47.226511 0 0 1-0.272788 66.389904l-433.358652 433.154061L788.215092 943.643665A47.192413 47.192413 0 0 1 788.692472 1010.033569 46.30585 46.30585 0 0 1 722.848144 1010.545048l-500.396429-496.81608z" fill="" p-id="6095"></path></svg>
    </span>
    <div class="title-box">
      <slot name="title"></slot>
    </div>
    <span class="right-box">
      <slot name="right"></slot>
    </span>
  </div>
</template>
<script>

export default {
  components: {
  },
  // 事件
  methods: {
    leftClick(index) {
      this.$emit("return-emit")
    }
  }
}
</script>

<style lang="scss" scoped>
.navigation {
  box-sizing: border-box;
  padding: 4.5vw 5vw;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9;
  background-color: #fff;
  .left-box {
    width: 4vw;
    height: 4vw;
    color: #454952;
    svg.icon {
      width: 4vw;
      height: 4vw;
      vertical-align: middle;
      fill: currentColor;
      overflow: hidden;
    }
  }
  .title-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 4vw;
    color: #454952;
    width: 40vw;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }
}
</style>
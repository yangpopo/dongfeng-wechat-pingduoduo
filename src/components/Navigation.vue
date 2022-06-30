<template>
  <div class="navigation">
    <span class="left-box" @click="leftClick">
      <img class="icon" src="../assets/img/return-but.png" alt="" />
    </span>
    <!-- <span class="right-box">
      <slot name="right"></slot>
    </span> -->
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
  // padding: 4.5vw 5vw;
  // width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 3vw;
  left: 3vw;
  z-index: 9;
  .left-box {
    width: 7.5vw;
    height: 7.5vw;
    color: #fff;
    border-radius: 50%;
    position: relative;
    img.icon {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
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
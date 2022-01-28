<template>
  <transition name="fade">
    <div class="mask-box" v-if="showState" @click="maskClick">
      <slot></slot>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'MaskBox',
  props: {
    msg: String
  },
  data() {
    return {
      showState: false,
    }
  },
  // 事件
  methods:{
    // 点击遮罩
    maskClick() {
      this.$emit("mask-event")
    }
  }
}
</script>
<style scoped lang="scss">
.fade-enter-active, .fade-leave-active {
  transition: opacity .3s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.mask-box {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9;
  background-color: rgba(0, 0, 0, .8);
}
</style>

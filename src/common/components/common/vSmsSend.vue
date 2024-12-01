<template>
  <div class="sms-wrapper" @click="countDown">
    {{ !isCountDownOver && canClick ? nowSeconds : smsTest }}
    {{ !isCountDownOver && canClick ? 's' : '' }}
  </div>
</template>
<script>
export default {
  data() {
    return {
      smsTest: '获取验证码',
      maxSeconds: 60,
      nowSeconds: 0,
      isCountDownOver: true
    };
  },
  props: {
    canClick: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    countDown() {
      if (this.canClick && this.isCountDownOver) {
        this.isCountDownOver = false;
        this.$emit('sendSms');
        this.nowSeconds = this.maxSeconds;
        this.countTime = setInterval(() => {
          if (this.nowSeconds-- <= 0) {
            clearInterval(this.countTime);
            this.isCountDownOver = true;
          }
        }, 1000);
      } else {
        this.$emit('canNotSend');
        return false;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.sms-wrapper {
  color: rgba(27, 111, 251, 1);
  font-size: 26px;
  font-weight: 600;
}
</style>

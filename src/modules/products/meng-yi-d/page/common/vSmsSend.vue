<template>
  <div class="sms-content" @click="countDown">
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
.sms-content {
  width: 150px;
  font-size: 30px;
  margin-left: 26px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #ff5943;
  line-height: 42px;
}
</style>

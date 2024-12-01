<template>
  <div class="sms-wrapper" @click="readyCountDown">
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
      isCountDownOver: true,
      isWaitingSucc: false
    };
  },
  props: {
    canClick: {
      type: Boolean,
      default: false
    },
    isSucc: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    isSucc(newVal, oldVal) {
      if (newVal) {
        this.countDown();
      }
    }
  },
  methods: {
    readyCountDown() {
      if (this.canClick && this.isCountDownOver && !this.isWaitingSucc) {
        this.isWaitingSucc = true;
        this.$emit('sendSms');
      } else {
        this.$emit('canNotSend');
        return false;
      }
    },
    switchIsWaitingSucc() {
      this.isWaitingSucc = !this.isWaitingSucc;
    },
    countDown() {
      this.isWaitingSucc = false;
      this.isCountDownOver = false;
      this.nowSeconds = this.maxSeconds;
      this.countTime = setInterval(() => {
        if (this.nowSeconds-- <= 0) {
          clearInterval(this.countTime);
          this.isCountDownOver = true;
        }
      }, 1000);
    },

    // 重置状态
    resetStatus() {
      this.canClick = true;
      this.isCountDownOver = true;
      this.isWaitingSucc = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.sms-wrapper {
  color: rgba(27, 111, 251, 1);
  font-size: 28px;

  font-weight: 400;
  font-size: 26px;
}
</style>

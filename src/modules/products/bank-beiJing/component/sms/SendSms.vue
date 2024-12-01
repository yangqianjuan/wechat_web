<template>
  <div class="sms-code">
    <van-button :disabled="button.disable" @click.stop="sendSms">{{
      sending ? button.desc : button.normalDeac
    }}</van-button>
  </div>
</template>
<script>
let timeNum = 60;
let setIntervalInstance = null;
import { beijingDialog } from '../../utils/common';

export default {
  // 北京 -- 验证码的发送
  name: 'SendSms',
  data() {
    return {
      sending: false,
      button: {
        desc: '',
        normalDeac: '获取验证码',
        disable: false,
        loading: false
      },
      code: {
        status: 'pending'
      }
    };
  },
  methods: {
    sendSms() {
      this.$emit('sendSms');
    },
    sendSuccess() {
      this.$toasting.success({ msg: '已发送' });
      this.code.status = 'reslove';
    },
    sendError(msg) {
      beijingDialog({
        message: msg || '发送失败',
        confirmButtonText: '确定'
      });
      this.init();
      this.code.status = 'reject';
    },
    reset() {
      this.init();
      this.code.status = 'reject';
    },
    smsSending() {
      this.timingLoading();
    },
    // 验证码动态
    timingLoading() {
      setIntervalInstance = setInterval(() => {
        if (timeNum > 0) {
          this.sending = true;
          this.button.loading = true;
          this.button.disable = true;
          this.button.desc = timeNum + ' S';
          timeNum -= 1;
        } else {
          this.init();
        }
      }, 1000);
    },

    init() {
      clearInterval(setIntervalInstance);
      setIntervalInstance = null;
      timeNum = 60;
      this.sending = false;
      this.button = {
        desc: '',
        normalDeac: '获取验证码',
        disable: false,
        loading: false
      };
      this.code = {
        status: 'pending'
      };
    }
  },
  destroyed() {
    clearInterval(setIntervalInstance);
    timeNum = 60;
    setIntervalInstance = null;
  }
};
</script>
<style lang="scss" scoped>
.sms-code {
  display: flex;
  align-items: center;
  /deep/.van-button {
    height: unset;
    padding: 0;
    border: 0;
    color: #2d8cf0;
    .van-button__content {
      padding: 0;
    }
    span {
      font-size: 28px;
      font-weight: 500;
    }
  }
}
</style>

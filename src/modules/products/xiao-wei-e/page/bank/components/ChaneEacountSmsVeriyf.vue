<template>
  <div class="phone-varify-wrapper">
    <van-dialog
      v-model="isShow"
      title="填写验证码"
      showCancelButton
      @confirm="handleSubmit('formDynamic')"
      @cancel="handleCancel"
    >
      <div class="reset-form sms-form">
        <van-form validate-first ref="formDynamic">
          <van-field v-model="phoneNum" name="phoneNum" required disabled label="预留手机号" placeholder="请输入银行预留手机号" />
          <van-field
            v-model="formItem.smsCode"
            name="smsCode"
            required
            label="验证码"
            placeholder="请输入验证码"
            :rules="ruleValidate.smsCode"
          >
            <div slot="right-icon" class="sms-content">
              <SendSms ref="send-sms-bank" @sendSms="sendSmsBank"></SendSms>
            </div>
          </van-field>
        </van-form>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import SendSms from '../../../component/sms/SendSms.vue';
import { SESSION_ID } from '@/utils/common/config';
import { gfSendMess } from '@/request/interface/gf/common.js';
export default {
  // 换卡的时候，填写验证码
  props: {
    isShowMask: {
      type: Boolean,
      default: false
    },
    phoneNum: {
      type: String,
      default: ''
    }
  },
  data() {
    // 验证码校验函数
    const validateSmscode = (rule, value, callback) => {
      const reg = new RegExp(/^\d{6}$/);
      if (reg.test(value)) {
        callback();
      } else {
        callback(new Error('验证码格式不正确'));
      }
    };
    return {
      formItem: {
        phoneNum: '',
        smsCode: ''
      },
      smsSerialNo: '',
      maxPhone: 11,
      maxSmsCode: 6,
      ruleValidate: {
        smsCode: [{ required: true, message: '请输入验证码', trigger: 'onBlur' }]
      }
    };
  },
  computed: {
    isShow: {
      get() {
        return this.isShowMask;
      },
      set() {
        return this.isShowMask;
      }
    }
  },
  components: {
    SendSms
  },

  methods: {
    // 发送验证码
    sendSmsBank() {
      /**
       * 验证码发送的前提是：
       *      1、银行卡号存在，且有效
       *      2、手机号存在且有效
       * */
      let params = {
        applyUnionKey: sessionStorage.getItem('applyUnionKey_1035'),
        mobile: this.phoneNum,
        sessionId: sessionStorage.getItem(SESSION_ID.changeCardSessionId)
      };
      this.$toasting.show({ message: '发送中', forbidClick: true });
      this.$refs['send-sms-bank'].smsSending();
      gfSendMess(params)
        .then((res) => {
          if (res?.data?.data) {
            this.smsSerialNo = res.data.data;
            this.$refs['send-sms-bank'].sendSuccess();
          } else {
            this.$refs['send-sms-bank'].sendError();
          }
        })
        .catch((err) => {
          // console.log(err);
          // this.$notify.error({ msg: err.data.msg });
          if (err.code !== 403) {
            this.$refs['send-sms-bank'].sendError();
          } else {
            this.$refs['send-sms-bank'].reset();
          }
        });
    },

    // 取消
    handleCancel() {
      this.$emit('hideMask');
      this.isShow = false;
      this.$emit('update:isShowMask', false);
    },

    // 确定提交
    handleSubmit(name) {
      this.$refs[name].validate(['smsCode']).then((valid) => {
        if (!valid) {
          this.$emit('smsVerify', { code: this.formItem.smsCode, smsSerialNo: this.smsSerialNo });
          this.handleCancel();
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.phone-varify-wrapper {
  background: #ffffff;
  position: absolute;
  bottom: 0;
  width: 90%;
  padding-top: 10px;
  .model-title {
    font-size: 30px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
    text-align: center;
  }
}
.phone-sms-ver-sub-btn {
  width: 100%;
  margin-bottom: 10px;
}
.ivu-input-inner-container {
  border: none;
}
/deep/.ivu-modal {
  margin: 0 1.25rem;
}
/deep/.ivu-input {
  border: 0;
  border-radius: 0;
  border-bottom: 1px solid #edf1f5;
  padding: 0 4px;
}
/deep/.ivu-input-group-append {
  border: 0;
  border-radius: 0;
  border-bottom: 1px solid #edf1f5;
  background: #ffffff;
}
/deep/.ivu-modal-header {
  border: 0;
}
/deep/.ivu-modal-footer {
  border-top: 0;
}
/deep/.ivu-modal-footer {
  padding: 0 1rem;
}
.sms-form {
  height: 200px;
  padding: 12px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>

<template>
  <div class="phone-verify-content" @click.stop="stop">
    <Form
      :model="formItem"
      :rules="ruleValidate"
      ref="formDynamic"
      :label-width="95"
      label-position="left"
      class="common-from"
    >
      <FormItem prop="name" label="姓名">
        <i-input v-model="formItem.name" disabled></i-input>
      </FormItem>
      <FormItem prop="phoneNum" label="绑定手机号">
        <i-input
          v-model="formItem.phoneNum"
          :disabled="isReadOnly"
          :readonly="isReadOnly"
          :maxlength="11"
          placeholder="请输入手机号"
        ></i-input>
      </FormItem>
      <FormItem prop="smsCode" label="验证码">
        <i-input
          type="number"
          @input="smmInputChange"
          v-model="formItem.smsCode"
          :maxlength="maxSmsCode"
          placeholder="请输入验证码"
        >
          <v-sms slot="append" :canClick="smsCanClick" @sendSms="sendSms"></v-sms>
        </i-input>
      </FormItem>
    </Form>
    <div class="common-submit-btn">
      <div class="submit-btn">
        <Button @click="handleSubmit('formDynamic')">确定</Button>
      </div>
    </div>
  </div>
</template>

<script>
import vSmsSend from './vSmsSend';
import { sendSmsCode, verifySmsCode } from '@/request/interface/impower/UserInfo';
export default {
  name: 'MYDPhoneVerify',
  components: {
    'v-sms': vSmsSend
  },
  props: {
    name: {
      type: String,
      default: ''
    },
    phoneNum: {
      type: String,
      default: ''
    },
    isShowMask: {
      type: Boolean,
      default: false
    },
    isShowTitle: {
      type: Boolean,
      default: false
    },
    isReadOnly: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validatePhoneNum = (rule, value, callback) => {
      const reg = new RegExp(/^1\d{10}$/);
      reg.test(value) ? callback() : callback(new Error('手机号格式不正确'));
    };
    const validateSmsCode = (rule, value, callback) => {
      const reg = new RegExp(/^\d{4}$/);
      reg.test(value) ? callback() : callback(new Error('验证码格式不正确'));
    };
    return {
      formItem: {
        phoneNum: '',
        smsCode: '',
        userId: '',
        name: ''
      },
      maxPhone: 11,
      maxSmsCode: 4,
      userId: '',
      ruleValidate: {
        phoneNum: [
          { required: true, message: '请填写手机号' },
          { trigger: 'blur', validator: validatePhoneNum }
        ],
        smsCode: [
          { required: true, message: '请填写验证码' },
          { validator: validateSmsCode, trigger: 'blur' }
        ]
      }
    };
  },
  watch: {
    phoneNum(newVal, oldVal) {
      this.formItem.phoneNum = newVal;
    },
    name(newVal, oldVal) {
      this.formItem.name = newVal;
    }
  },
  computed: {
    smsCanClick() {
      const reg = new RegExp(/^1\d{10}$/);
      return reg.test(this.formItem.phoneNum) ? true : false;
    }
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.userId = this.getCookie('wecaheat_xm_userid');
      this.formItem.userId = this.userId;
    },
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.$toasting.show({ message: '验证中', forbidClick: true });
          verifySmsCode(this.formItem)
            .then((res) => {
              res?.data?.success && this.$emit('bindPhone', this.formItem.phoneNum);
            })
            .catch((err) => {
              this.$toasting.hide();
              this.$notify.error({ msg: err?.data?.msg || '验证码错误!' });
            });
        }
      });
    },

    smmInputChange() {
      let smsCode = this.formItem.smsCode;
      smsCode.length > 4 &&
        this.$nextTick(() => {
          this.formItem.smsCode = smsCode.substr(0, 4);
        });
    },
    stop() {},

    // 发送验证码
    sendSms() {
      sendSmsCode(this.formItem.phoneNum)
        .then((res) => {
          res?.data?.success && this.$notify.info({ msg: '验证码发送成功！' });
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '验证码发送失败！' });
        });
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../assets/css/common.scss';
.phone-verify-content {
  width: 686px;
  padding-bottom: 16px;
  ::v-deep(.ivu-form-item) {
    .ivu-form-item-label {
      padding-left: 0 !important;
    }
    .ivu-input.ivu-input-default {
      padding-right: 0 !important;
    }
    .ivu-form-item-error-tip {
      right: 0 !important;
    }
    .ivu-input-group-append {
      border: unset;
      background: $white;
    }
  }
}
</style>

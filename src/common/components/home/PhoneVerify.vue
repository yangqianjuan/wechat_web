<template>
  <div class="phone-varify-wrapper" @click.stop="stop">
    <div style="text-align:center">
      <Form :model="formItem" :rules="ruleValidate" ref="formDynamic" label-position="left" class="from-wrapper">
        <FormItem prop="phoneNum">
          <div class="phone-wrapper">
            <span class="phone-title" v-if="isShowTitle">手机号</span>
            <i-input
              class="input-item"
              size="large"
              v-model="formItem.phoneNum"
              :disabled="isReadOnly"
              :readonly="isReadOnly"
              :maxlength="11"
              placeholder="请输入手机号"
            ></i-input>
          </div>
        </FormItem>
        <FormItem prop="smsCode">
          <i-input
            class="input-item"
            size="large"
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
    </div>
    <div slot="footer">
      <Button class="phone-sms-ver-sub-btn" :loading="isLoading" type="primary" @click="handleSubmit('formDynamic')">确定</Button>
    </div>
  </div>
</template>

<script>
import vSmsSend from '../common/vSmsSend';
import { sendSmsCode, verifySmsCode } from '@/request/interface/impower/UserInfo';
export default {
  name: 'PhoneVerify',
  props: {
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
    const validatePhoenNum = (rule, value, callback) => {
      const reg = new RegExp(/^1\d{10}$/);
      if (reg.test(value)) {
        callback();
      } else {
        callback(new Error('手机号格式不正确'));
      }
    };
    const validateSmscode = (rule, value, callback) => {
      const reg = new RegExp(/^\d{4}$/);
      if (reg.test(value)) {
        callback();
      } else {
        callback(new Error('验证码格式不正确'));
      }
    };
    return {
      formItem: {
        phoneNum: '',
        smsCode: '',
        userId: ''
      },
      maxPhone: 11,
      maxSmsCode: 4,
      userId: '',
      isLoading: false,
      ruleValidate: {
        phoneNum: [
          { required: true, message: '请填写手机号' },
          { trigger: 'blur', validator: validatePhoenNum }
        ],
        smsCode: [
          { required: true, message: '请填写验证码' },
          { validator: validateSmscode, trigger: 'blur' }
        ]
      }
    };
  },
  watch: {
    phoneNum(newVal, oldVal) {
      this.formItem.phoneNum = newVal;
    },
    loading(newVal, oldVal) {
      this.isLoading = newVal;
    }
  },
  computed: {
    smsCanClick() {
      const reg = new RegExp(/^1\d{10}$/);
      return reg.test(this.formItem.phoneNum) ? true : false;
    }
  },
  components: {
    'v-sms': vSmsSend
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.userId = this.getCookie('wecaheat_xm_userid');
      this.formItem.userId = this.userId;
    },
    // 点击确定验证码通过之后，在进行三要素的验证
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.isLoading = true;
          verifySmsCode(this.formItem)
            .then((res) => {
              this.$emit('bindPhoneNoitfy', this.formItem.phoneNum);
            })
            .catch((err) => {
              this.isLoading = false;
              this.$notify.error({ msg: '验证码错误!' });
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
          this.$notify.info({ msg: '验证码发送成功！' });
        })
        .catch((err) => {
          this.$notify.error({ msg: '验证码发送失败！' });
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.phone-varify-wrapper {
  background: #ffffff;
  position: absolute;
  width: 100%;
  padding: 10px 25px 0 15px;
  .model-title {
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
    text-align: center;
  }
}
.phone-sms-ver-sub-btn {
  width: 80%;
  margin-left: 10%;
  margin-top: 40px;
}
.ivu-input-inner-container {
  border: none;
}
.phone-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
  border-bottom: 1px solid #eadfdf;
  .phone-title {
    flex: 0 1 11rem;
    font-size: 28px;
    font-weight: 500;
    text-align: left;
    padding-left: 2.4vw;
  }
}
::v-deep(.ivu-modal) {
  flex: 1 1 80%;
}
::v-deep(.ivu-modal) {
  margin: 0 1.25rem;
}
::v-deep(.ivu-input) {
  border: 0;
  border-radius: 0;
  border-bottom: 1px solid #edf1f5;
  // padding: 0 4px;
  padding-left: 4vw;
  font-size: 28px !important;
}
::v-deep(.ivu-form-item-error-tip) {
  font-size: 28px;
}
::v-deep(.ivu-input-group-append) {
  border: 0;
  border-radius: 0;
  border-bottom: 1px solid #edf1f5;
  background: #ffffff;
}
::v-deep(.ivu-modal-header) {
  border: 0;
}
::v-deep(.ivu-modal-footer) {
  border-top: 0;
}
::v-deep(.ivu-modal-footer) {
  padding: 0 1rem;
}
</style>

<template>
  <div class="phone-varify-wrapper" @click.stop="stop">
    <Modal v-model="isShow" width="360" mask :maskClosable="maskClosable" @on-cancel="handleCancel">
      <p slot="header" class="model-title">
        <span>填写验证码</span>
      </p>
      <div style="text-align:center">
        <Form :model="formItem" :rules="ruleValidate" ref="formDynamic" label-position="left" class="from-wrapper">
          <FormItem>
            <i-input class="input-item" size="large" v-model="phoneNum" readonly></i-input>
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
              <v-sms slot="append" ref="sms" :canClick="smsCanClick" @sendSms="sendSms"></v-sms>
            </i-input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button class="phone-sms-ver-sub-btn" type="primary" :loading="loading" @click="handleSubmit('formDynamic')">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import vSmsSend from '@/common/components/common/vSmsSend';
export default {
  props: {
    isShowMask: {
      type: Boolean,
      default: false
    },
    phoneNum: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
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
      maxPhone: 11,
      maxSmsCode: 6,
      userId: '',
      ruleValidate: {
        smsCode: [
          { required: true, message: '请填写验证码' },
          { validator: validateSmscode, trigger: 'blur' }
        ]
      },
      isFirst: true,
      maskClosable: false
    };
  },
  computed: {
    smsCanClick() {
      const reg = new RegExp(/^1\d{10}$/);
      if (reg.test(this.phoneNum)) {
        return true;
      } else {
        return false;
      }
    },
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
    'v-sms': vSmsSend
  },
  created() {},
  mounted() {
    this.$refs.sms.countDown();
  },
  methods: {
    handleCancel() {
      this.$emit('hideMask');
    },
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.$emit('smsVerify', this.formItem.smsCode);
        }
      });
    },
    smmInputChange() {
      let smsCode = this.formItem.smsCode;
      if (smsCode.length > 6) {
        this.$nextTick(() => {
          this.formItem.smsCode = smsCode.substr(0, 6);
        });
      }
    },
    stop() {},
    sendSms() {
      if (this.isFirst) {
        this.isFirst = false;
      } else {
        this.$emit('smsSend');
      }
      this.$refs.sms.countDown();
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
  margin-bottom: 15px;
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
</style>

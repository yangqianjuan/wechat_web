<template>
  <div class="phone-varify-wrapper" @click.stop="stop">
    <div style="text-align:center">
      <Form :model="formItem" :rules="ruleValidate" ref="formDynamic" label-position="left" class="from-wrapper">
        <FormItem prop="idCrad">
          <i-input class="input-item" size="large" v-model="formItem.idCrad" placeholder="请输入身份证号"></i-input>
        </FormItem>
        <FormItem prop="phoneNum">
          <i-input class="input-item" size="large" v-model="formItem.phoneNum" :maxlength="11" placeholder="请输入手机号"></i-input>
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
      <Button :loading="isLoading" class="phone-sms-ver-sub-btn" type="primary" @click="handleSubmit('formDynamic')">确定</Button>
    </div>
  </div>
</template>

<script>
import vSmsSend from '@/common/components/common/vSmsSend';
import { sendSmsCode, verifySmsCode, weChatChangeBind } from '@/request/interface/impower/UserInfo';
export default {
  props: {
    isShowMask: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateIdcard = (rule, value, callback) => {
      const reg = new RegExp(
        /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
      );
      if (reg.test(value)) {
        callback();
      } else {
        callback(new Error('身份证号格式不正确'));
      }
    };
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
        idCrad: '',
        smsCode: '',
        userId: ''
      },
      isLoading: false,
      maxPhone: 11,
      maxSmsCode: 4,
      userId: '',
      ruleValidate: {
        idCrad: [
          { required: true, message: '请填写身份证号' },
          { trigger: 'blur', validator: validateIdcard }
        ],
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
  computed: {
    smsCanClick() {
      const reg = new RegExp(/^1\d{10}$/);
      if (reg.test(this.formItem.phoneNum)) {
        return true;
      } else {
        return false;
      }
    }
  },
  components: {
    'v-sms': vSmsSend
  },
  created() {
    this.userId = this.getCookie('wecaheat_xm_userid');
    this.formItem.userId = this.userId;
  },
  methods: {
    handleCancel() {
      this.$emit('hideMask');
    },
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.isLoading = true;
          verifySmsCode(this.formItem)
            .then((res) => {
              this.verifySuccHandle();
            })
            .catch((err) => {
              this.isLoading = false;
              this.$notify.error({ msg: '验证码错误！' });
            });
        }
      });
    },
    verifySuccHandle() {
      let params = {
        idno: this.formItem.idCrad,
        mobileNo: this.formItem.phoneNum
      };
      weChatChangeBind(params)
        .then((res) => {
          console.log('weChatChangeBind: ', res);
          this.$notify.info({ msg: '改绑微信成功！' });
          setTimeout(() => {
            this.$router.back(-1);
          }, 2000);
        })
        .catch((err) => {
          let errMsg = err.data.msg;
          this.$notify.error({ msg: errMsg });
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    smmInputChange() {
      let smsCode = this.formItem.smsCode;
      if (smsCode.length > 4) {
        this.$nextTick(() => {
          this.formItem.smsCode = smsCode.substr(0, 4);
        });
      }
    },
    stop() {},
    sendSms() {
      sendSmsCode(this.formItem.phoneNum)
        .then((res) => {
          console.log(res);
          this.$notify.success({ msg: '验证码发送成功！' });
        })
        .catch((err) => {
          this.$notify.error({ msg: '验证码发送失败！' });
        });
    }
  }
};
</script>

<style lang="scss" scoped>
// ok
.phone-varify-wrapper {
  background: #ffffff;
  padding-top: 15px;
  .model-title {
    font-size: 30px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
    text-align: center;
  }
}
.phone-sms-ver-sub-btn {
  width: 100%;
  margin-bottom: 20px;
}
.ivu-input-inner-container {
  border: none;
}
::v-deep(.ivu-modal) {
  margin: 0 1.25rem;
}
::v-deep(.ivu-input) {
  border: 0;
  border-radius: 0;
  border-bottom: 1px solid #edf1f5;
  padding: 0 4px;
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

<template>
  <div class="reset-form">
    <div class="remind">{{ formItem.userName }}的手机号信息</div>
    <!--上传识别身份证-->
    <div class="item-wrapper">
      <van-form validate-first ref="formDynamic">
        <van-field
          v-model="formItem.userName"
          required
          name="userName"
          disabled
          label="姓名"
          placeholder="请输入姓名"
          :rules="ruleValidate.userName"
        />
        <van-field
          v-model="formItem.phoneNum"
          name="phoneNum"
          required
          disabled
          label="手机号"
          placeholder="请输入手机号"
          :rules="ruleValidate.phoneNum"
        />
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
      <van-button
        class="btn-foot-fixed foot-operate-btn next-btn"
        type="primary"
        @click="handleSubmit('formDynamic')"
      >下一步</van-button>
    </div>

    <div class="rebindbtn-wrapper">
      <a class="rebindbtn" @click="switchLogoutModel">更换手机号</a>
    </div>
    <p-modal v-show="isShowRelogin" title="确认更换手机号" @ok="logout" @cancel="switchLogoutModel">
      <p class="logout">确定登出？</p>
    </p-modal>
  </div>
</template>
<script>
import { jdugeNewUserRoute } from '@/controller/userController';
import { threeMianVerify, logout } from '@/request/interface/impower/UserInfo.js';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import SendSms from '../../../component/sms/SendSms.vue';
import { sendSmsCode, verifySmsCode } from '@/request/interface/impower/UserInfo';
import Modal from '@/common/components/common/Modal';

export default {
  /**
   * gf三要素页面
   * */
  name: 'XWEIdnoNamePhoneVerify',
  components: {
    SendSms,
    'p-modal': Modal
  },
  data() {
    return {
      // 表单信息
      formItem: {
        phoneNum: '',
        userName: '',
        smsCode: '',
        userId: ''
      },
      isShowRelogin: false,
      // 校验规则
      ruleValidate: {
        userName: [{ required: true, message: '请输入姓名', trigger: 'onBlur' }],
        phoneNum: [{ required: true, message: '请输入手机号', trigger: 'onBlur' }],
        smsCode: [{ required: true, message: '请输入验证码', trigger: 'onBlur' }]
      }
    };
  },
  created() {
    this.init();
  },

  methods: {
    init() {
      this.productId = this.$store.state.productId || '1035';
      this.$toasting.show({ message: '加载中', forbidClick: true });
      jdugeNewUserRoute()
        .then((user) => {
          if (user) {
            this.formItem.userName = user.name;
            this.formItem.phoneNum = user.phoneNum;
            this.formItem.userId = user.userId;
          } else {
            this.$toasting.info({ msg: '未获取到用户的信息！' });
          }
        })
        .catch((err) => {
          this.$notify.error({
            msg: err?.data?.msg || '用户信息获取失败！'
          });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },
    //  表单提交
    handleSubmit(name) {
      this.isShowProtocol = false;
      this.$refs[name].validate(['smsCode']).then((valid) => {
        if (!valid) {
          this.bindPhoneNoitfy();
        }
      });
    },
    // 三要素的绑定与验证
    bindPhoneNoitfy() {
      let params = {
        phoneNum: this.formItem.phoneNum,
        smsCode: this.formItem.smsCode,
        userId: this.formItem.userId
      };
      this.$toasting.show({ message: '验证中', forbidClick: true });
      verifySmsCode(params)
        .then((res) => {
          if (res?.data?.success) {
            return threeMianVerify({ mobileNo: this.formItem.phoneNum });
          } else {
            return Promise.reject();
          }
        })
        .then(async (res) => {
          if (res?.data?.data && res.data.data === '01') {
            let nextPath = await queryNextByUnionKeyAndProdId(this.productId ? this.productId : '1035');
            // 当code 为 01 才通过
            setTimeout(() => {
              this.$router.replace({ path: nextPath });
            }, 1000);
          } else {
            this.$notify.error({
              msg: `请使用${this.formItem.userName}实名的手机号！`
            });
          }
        })
        .catch((err) => {
          this.$notify.error({
            msg: err?.data?.msg || '三要素验证失败！'
          });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    switchLogoutModel() {
      this.isShowRelogin = !this.isShowRelogin;
    },
    // 发送验证码
    sendSmsBank() {
      /**
       * 验证码发送的前提是：
       *      1、银行卡号存在，且有效
       *      2、手机号存在且有效
       * */
      this.$refs.formDynamic.validate(['phoneNum']).then((res) => {
        if (!res) {
          this.$toasting.show({ message: '发送中', forbidClick: true });
          this.$refs['send-sms-bank'].smsSending();
          sendSmsCode(this.formItem.phoneNum)
            .then((res) => {
              if (res?.data?.success) {
                this.$refs['send-sms-bank'].sendSuccess();
              } else {
                this.$refs['send-sms-bank'].sendError();
              }
            })
            .catch((err) => {
              if (err?.code !== 403) {
                this.$refs['send-sms-bank'].sendError();
              } else {
                this.$refs['send-sms-bank'].reset();
              }
            });
        } else {
          this.$notify.info({
            msg: '暂无手机号！'
          });
        }
      });
    },

    /**
     * 更换手机号之后，退出登录
     * */
    logout() {
      let productId = localStorage.productId;
      let referrer = localStorage.referrer;
      let nextPath = `/prod_xwe?uid=${referrer}&prid=${productId}`;
      this.switchLogoutModel();
      this.$toasting.show({ message: '登出中', forbidClick: true });
      logout()
        .then((res) => {
          this.$toasting.success({ msg: '登出成功' });
          setTimeout(() => {
            this.$router.replace({ path: nextPath });
          }, 1000);
        })
        .catch((err) => {
          this.$notify.error({
            msg: err?.data?.msg || '登出失败'
          });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.errMsg {
  padding: 0 1.25rem;
  max-height: 120px;
  display: flex;
  overflow: auto;
}
.rebindbtn-wrapper {
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  a {
    font-size: 30px;
    font-weight: 500;
  }
}
.next-btn {
  bottom: 120px;
}
.logout {
  padding-left: 20px;
  text-align: center;
  font-size: 26px;
  font-weight: 500;
}
::v-deep(.model-wrapper) {
  .title-warpper {
    display: flex;
    justify-content: center;
  }
}
</style>

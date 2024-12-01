<template>
  <div class="login">
    <div class="login-content">
      <div class="login-info">
        <div class="logo">
          <img :src="instNoConfig.logo" />
        </div>
        <div class="name">客户注册</div>
      </div>
      <div class="iphone-content">
        <div class="label">手机号</div>
        <div class="content">
          <input class="mobile-num input" v-model="phoneNum" :maxlength="maxPhone" placeholder="请输入手机号" />
        </div>
      </div>
      <div class="sms-content">
        <div class="label">验证码</div>
        <div class="content">
          <input class="passwd input" v-model="smsCode" :maxlength="maxSmsCode" placeholder="请输入验证码" />
        </div>
        <div class="sms-code">
          <v-sms
            class="sms-btn-wrapper"
            ref="sms"
            :canClick="smsCanClick"
            @sendSms="openCaptchaHandler"
            :isSucc="isSmsSendSucc"
            @canNotSend="canNotSend"
          ></v-sms>
        </div>
      </div>

      <div class="send-captcha-btn">
        <p class="error-txt">{{ errText }}</p>
      </div>
      <Modal v-model="captchaModal" :closable="false" title="请输入图形验证码" :mask-closable="false">
        <div class="captcha-img">
          <div class="captcha-code">
            <input type="text" v-model="imgCode" />
            <p class="error-txt captcha-error">{{ captchaErrorTxt }}</p>
          </div>

          <div class="code-img">
            <van-image width="120" height="30" :src="codeUrl" />
            <div class="refresh-img" @click="refreshImg">
              看不清？换一张 <Icon type="ios-refresh" size="18" color="#1f1f1f" />
            </div>
          </div>
        </div>

        <template #footer>
          <Button class="captcha-cancel-btn" @click="captchaCancel">取消</Button>
          <Button type="primary" class="captcha-ok-btn" @click="captchaOk">确定</Button>
        </template>
      </Modal>
      <div class="login-btn" :class="smsCanClick && !isSmsCodeErr ? '' : 'canNotTapBtn'" @click="login">立即登录</div>
    </div>
  </div>
</template>
<script>
import vSmsSendWaitSucc from '@/common/components/common/vSmsSendWaitSucc';
import { sendSmsCode, weChatMpBind } from '@/request/interface/impower/UserInfo';
import { getWxAuthUrl } from '@/utils/wx/wxUtils';
import { getCodeUrl } from '@/request/interface/common/index';
import { getTokenByPhoneNum } from '@/controller/userController.js';
import product from '@/config/product/product';
import { gfAreaDictQuery } from '@/request/interface/gf/common.js';
import { loginAfterOperate } from './common/index';
export default {
  name: 'Login',
  components: {
    'v-sms': vSmsSendWaitSucc
  },
  data() {
    return {
      phoneNum: '',
      smsCode: '',
      loginBtnCanClick: false,
      smsCanClick: false,
      isSmsSendSucc: false,
      isSmsCodeErr: true,
      maxPhone: 11,
      maxSmsCode: 4,
      errText: '',
      timer: '',
      msg: '',
      loginSucc: false,
      pageCallbackUrl: '',
      code: '',
      nextPath: '',
      getAreaDictQueryNum: 0,
      // 图片验证
      captchaModal: false,
      imgCode: '',
      codeUrl: '',
      captchaId: '',
      captchaErrorTxt: '',
      instNoConfig: {}
    };
  },
  watch: {
    phoneNum(newVal, oldVal) {
      this.smsCanClick = this.valiPhone(newVal);
    },
    smsCode(newVal, oldVal) {
      this.isSmsCodeErr = !this.valiSmsCode();
    }
  },
  created() {
    this.init();
  },
  /**
   * 流程：
   *    1、手机号，和验证码的校验
   *    2、登录的时候，上传手机号和验证码获取token------------》在获取用户基本信息-------------------》绑定openid和手机号-------------》跳转到对应页面
   * */
  methods: {
    init() {
      // 获取instNo信息
      const instNoConfig = sessionStorage.getItem('instNoConfig');
      if (instNoConfig !== 'null' && instNoConfig) {
        this.instNoConfig = JSON.parse(instNoConfig);
      } else {
        // this.$notify.error({
        //   msg: '未获取到租户的配置信息！'
        // });
      }
      // getUrlParam 获取query的路径
      this.code = this.getUrlParam('code');
      this.pageCallbackUrl = this.getUrlParam('page_callback_url');
      // gf add
      this.getUrlQueryHandler(this.$route.query);
      let nextPath = this.pageCallbackUrl || product.entryRouter.common;
      this.nextPath = nextPath;
      // 如果code不存在，就会重新去通过微信认证获取code，(用户的code)
      !this.code && this.refreshCode(this.pageCallbackUrl);
    },

    /**
     * 获取广发的省市区的信息
     * */
    getGFAreaDictQuery() {
      if (!this.getAreaDictQueryNum) {
        gfAreaDictQuery();
        this.getAreaDictQueryNum += 1;
      }
    },

    // 登录
    login() {
      if (!this.valiPhone() || !this.valiSmsCode()) {
        return;
      }
      this.$toasting.show({ message: '登录中', forbidClick: true });
      !this.loginSucc ? this.getToken() : this.bindOpenidWithPhoneNum();
    },

    // 刷新code
    async refreshCode(pageCallbackUrl) {
      window.location.href = (await getWxAuthUrl(pageCallbackUrl, true)).url;
    },

    // 获取token
    getToken() {
      let params = {
        authType: 'mobile',
        authorCode: this.smsCode,
        username: this.phoneNum,
        instNo: this.instNoConfig.instNo
      };
      // 认证登录
      getTokenByPhoneNum(params)
        .then(res => {
          res?.id && sessionStorage.setItem('userId', res.id);
          this.loginSucc = true;
          this.bindOpenidWithPhoneNum();
        })
        .catch(err => {
          this.$toasting.hide();
          this.$notify.error({
            msg: err?.data?.msg
          });
        });
    },

    // 绑定openid
    bindOpenidWithPhoneNum() {
      // let instNo = this.getCookie('inst_no');
      weChatMpBind({ authorCode: this.code, instNo: this.instNoConfig.instNo })
        .then(res => {
          this.$toasting.success({ msg: '登录成功' });
          setTimeout(() => {
            loginAfterOperate.call(this, this.nextPath);
          }, 500);
        })
        .catch(err => {
          this.$notify.error({
            msg: err?.data?.msg
          });
          this.refreshCode(this.pageCallbackUrl);
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    openCaptchaHandler() {
      this.captchaModal = !this.captchaModal;
      this.getCaptchaCode();
    },

    getCaptchaCode() {
      getCodeUrl().then(res => {
        if (res?.data?.success && res?.data?.data) {
          this.codeUrl = res.data.data.captchaBase64;
          this.captchaId = res.data.data.captchaId;
        }
      });
    },

    captchaOk() {
      if (this.imgCode === '') {
        this.captchaErrorTxt = '请输入图片验证码';
        return;
      } else {
        this.captchaErrorTxt = '';
        this.sendSms();
      }
    },

    captchaCancel() {
      this.$refs.sms.resetStatus();
      this.captchaModal = !this.captchaModal;
      this.captchaErrorTxt = '';
    },

    refreshImg() {
      this.getCaptchaCode();
    },

    // 验证码发送
    sendSms() {
      this.$toasting.show({ message: '发送中', forbidClick: true });
      const params = {
        captchaId: this.captchaId,
        captchaText: this.imgCode,
        mobileno: this.phoneNum,
        instNo: this.instNoConfig.instNo
      };
      sendSmsCode(params)
        .then(res => {
          this.$toasting.success({ msg: '已发送' });
          this.captchaModal = !this.captchaModal;
          this.isSmsSendSucc = true;
          this.resetSmsStatus();
        })
        .catch(err => {
          this.$refs.sms.resetStatus();
          this.$toasting.error({ msg: err?.data?.msg || '发送失败' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    canNotSend() {
      let errText = this.valiFrom();
      errText !== '验证码格式错误' && (this.errText = errText);
    },
    valiFrom() {
      let errText = '';
      if (!this.phoneNum) {
        errText = '请输入手机号!';
      } else if (!this.valiPhone()) {
        errText = '手机号格式错误!';
      } else if (!this.smsCode) {
        errText = '请输入验证码!';
      } else if (!this.valiSmsCode()) {
        errText = '验证码格式错误!';
      }
      return errText;
    },
    resetSmsStatus() {
      this.timer && clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.isSmsSendSucc = false;
      }, 2000);
    },
    // 验证手机号
    valiPhone(phoneNum = this.phoneNum) {
      return /^1\d{10}$/.test(phoneNum);
    },
    // 验证码的验证
    valiSmsCode() {
      return /^\d{4}$/.test(this.smsCode);
    },

    /**
     * 针对授信结果不通过是因为职业信息的问题，路径的query的处理
     *    在授信结果页，需要这个入参
     * */

    getUrlQueryHandler(query) {
      query.page_callback_url &&
        query.page_callback_url === 'xwe_pre_credut_result' &&
        query.applyUnionKey &&
        sessionStorage.setItem('credit_job_fail_info', JSON.stringify(query));
    }
  }
};
</script>
<style lang="scss" scoped>
.login {
  background: #f7f8f9;
  height: 100vh;
  width: 100%;
  background: url('../../assets/imgs/common-login-bg.png');
  background-size: 100vw;
  box-sizing: border-box;
  .login-content {
    width: 628px;
    height: 570px;
    background-size: 728px;
    background-repeat: no-repeat;
    margin: 0 auto;
    position: relative;
    .login-info {
      padding-top: 76px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .logo {
        display: flex;
        justify-content: center;
        img {
          width: 208px;
          height: 208px;
        }
      }
      .name {
        margin-top: 16px;
        font-size: 40px;
        font-family: PingFangSC, PingFangSC-Medium;
        font-weight: 500;
        text-align: center;
        color: #333333;
      }
    }
    .iphone-content {
      margin-top: 180px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #eeeeee;
      .label {
        margin-left: 16px;
        margin-right: 64px;
        font-size: 30px;
        font-family: PingFangSC, PingFangSC-Medium;
        font-weight: 500;
        color: #333333;
      }
      .content {
        flex: 1;
        .mobile-num {
          border: none;
        }
        input {
          text-align: left !important;
          font-size: 30px;
          font-family: PingFangSC, PingFangSC-Regular;
          font-weight: 400;
          color: #333333;
          background-color: #fffdfc;
        }
        input::input-placeholder {
          color: #9c9c9c;
        }
      }
    }
    .sms-content {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #eeeeee;
      .label {
        margin-left: 16px;
        margin-right: 64px;
        font-size: 30px;
        font-family: PingFangSC, PingFangSC-Medium;
        font-weight: 500;
        color: #333333;
        white-space: nowrap;
      }
      .content {
        flex: 1;
        input {
          width: 80%;
          margin-top: 0 !important;
          border: none;
          text-align: left !important;
          font-size: 30px;
          font-family: PingFangSC, PingFangSC-Regular;
          font-weight: 400;
          color: #333333;
          background-color: #fffdfc;
        }
        input::input-placeholder {
          color: #9c9c9c;
        }
      }
      .sms-code {
        white-space: nowrap;
        .sms-wrapper {
          font-size: 28px;
          font-family: PingFangSC, PingFangSC-Medium;
          font-weight: 500;
          color: #333333;
        }
      }
    }
    .send-captcha-btn {
      margin-top: 20px;
      margin-bottom: 20px;
      padding-right: 100px;
      font-size: 28px;
      display: flex;
      font-weight: 500;
      justify-content: space-between;
      font-family: PingFangSC, PingFangSC-Medium;
    }
    .login-btn {
      margin-top: 40px;
      width: 632px;
      height: 96px;
      background-color: #e30315;
      border-radius: 6px;
      line-height: 96px;
      text-align: center;
      font-size: 32px;
      font-family: PingFangSC, PingFangSC-Medium;
      font-weight: 500;
      color: #ffffff;
    }
  }
  .canNotTapBtn {
    background: rgba(173, 173, 173, 0.6) !important;
  }
}
/deep/ .captcha-img {
  min-height: 70px;
  display: flex;
  margin-top: 25px;
  .captcha-code {
    flex: 1;
    input {
      width: 100%;
      height: 76px;
      background: #ffffff;
      border-radius: 4px;
      border: 1px solid #979797;
      margin-right: 7px;
      padding-left: 10px;
    }
  }

  .code-img {
    /* padding-top: 12px; */
    margin-left: 12px;
  }
  .refresh-img {
    display: flex;
    /* justify-content: space-between; */
    align-items: center;
    font-size: 24px;
    font-weight: 400;
    color: #1f1f1f;
    margin-top: 6px;
    .ivu-icon {
      margin-bottom: -4px;
    }
  }
}
.captcha-cancel-btn {
  color: #333333;
  font-weight: 500;
}
.captcha-ok-btn {
  background-color: #e30315;
  color: #ffffff;
  font-weight: 500;
  border: 0 !important;
}
.error-txt {
  color: #ff5252;
}
.captcha-error {
  margin-top: 8px;
  font-size: 20px;
}
</style>

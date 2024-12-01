<template>
  <div class="login">
    <div class="login-content">
      <img class="logo-icon" src="../../assets/imgs/login/logo.png" />
      <div class="user-info-input">
        <div class="operate-input">
          <div class="label">手机号</div>
          <div class="content">
            <input
              class="mobile-num input"
              v-model="phoneNum"
              :disabled="controlPhoneDisabled"
              :maxlength="maxPhone"
              placeholder="请输入手机号"
            />
          </div>
        </div>
        <div class="operate-input">
          <div class="label">验证码</div>
          <div class="content">
            <input class="passwd input" v-model="smsCode" :maxlength="maxSmsCode" placeholder="请输入验证码" />
          </div>
          <div class="sms-container">
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
              看不清？换一张
              <Icon type="ios-refresh" size="18" color="#1f1f1f" />
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
import { sendSmsSlideCode, weChatMpBind } from '@/request/interface/impower/UserInfo';
import { getWxAuthUrl } from '@/utils/wx/wxUtils';
import { getCodeUrl } from '@/request/interface/common/index';
import { getTokenByPhoneNum } from '@/controller/userController.js';
import product from '@/config/product/product';
import { gfAreaDictQuery } from '@/request/interface/gf/common.js';
import { loginAfterOperate, openPageHandler } from './common/index';

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
      instNoConfig: {},
      controlPhoneDisabled: false,
      // add sales login type / common user login 类型
      registerLoginType: 'mobile',
      cacheUserId: '',
      authLinkType: 'code'
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
    async init() {
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
      const authLinkType = this.getUrlParam('authLinkType');
      this.authLinkType = authLinkType;
      // gf add
      this.getUrlQueryHandler(this.$route.query);
      let nextPath = this.pageCallbackUrl || product.entryRouter.common;
      this.nextPath = nextPath;

      // 如果code不存在，就会重新去通过微信认证获取code，(用户的code)
      this.authLinkType !== 'open' && !this.code && this.refreshCode(this.pageCallbackUrl);

      this.setPhoneHandler();
      var script = document.createElement('script');
      script.src = 'https://turing.captcha.qcloud.com/TCaptcha.js';
      document.head.appendChild(script);

      this.authLinkType === 'open' && this.$toasting.hide();

      this.code && openPageHandler.call(this);
    },

    setPhoneHandler() {
      const phone = sessionStorage.getItem('salePhone');
      this.phoneNum = phone;
      if (phone) {
        this.controlPhoneDisabled = true;
        this.registerLoginType = 'saler_h5';
        let path = localStorage?.pathRedirect;
        try {
          if (path && path.indexOf('referrer=') !== -1) {
            this.cacheUserId = path.split('&')[0].split('=')[1];
          }
        } catch (e) {}
      }
    },

    sliderLogin() {
      try {
        var captcha = new TencentCaptcha('193663418', this.sliderCallback, { type: 'popup' });
        captcha.show();
      } catch (error) {
        debugger;
        // 加载异常，调用验证码js加载错误处理函数
        this.sliderLoadErrorCallback();
      }
    },
    sliderLoadErrorCallback() {
      var appid = '';
      // 生成容灾票据或自行做其它处理
      var ticket = 'terror_1001_' + appid + Math.floor(new Date().getTime() / 1000);
      this.sliderCallback({
        ret: 0,
        randstr:
          '@' +
          Math.random()
            .toString(36)
            .substr(2),
        ticket: ticket,
        errorCode: 1001,
        errorMessage: 'jsload_error'
      });
    },
    sliderCallback(res) {
      // ret         Int       验证结果，0：验证成功。2：用户主动关闭验证码。
      // ticket      String    验证成功的票据，当且仅当 ret = 0 时 ticket 有值。
      // CaptchaAppId       String    验证码应用ID。
      // bizState    Any       自定义透传参数。
      // randstr     String    本次验证的随机串，后续票据校验时需传递该参数。
      if (res.ret === 0) {
        this.sendSms(res.randstr, res.ticket);
      }
      if (res.ret === 2) {
        this.$refs.sms.resetStatus();
      }
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
        authType: this.registerLoginType,
        authorCode: this.smsCode,
        username: this.phoneNum,
        instNo: this.instNoConfig?.instNo || '1000000'
      };

      if (this.registerLoginType === 'saler_h5') {
        params.recommend = this.cacheUserId;
      }
      // 认证登录
      getTokenByPhoneNum(params)
        .then(res => {
          res?.id && sessionStorage.setItem('userId', res.id);
          this.loginSucc = true;
          if (this.registerLoginType === 'saler_h5') {
            this.$toasting.success({ msg: '登录成功' });
            setTimeout(() => {
              loginAfterOperate.call(this, this.nextPath);
            }, 500);
          } else {
            this.bindOpenidWithPhoneNum();
          }
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
      if (this.authLinkType === 'open') {
        setTimeout(() => {
          loginAfterOperate.call(this, this.nextPath);
        }, 500);

        return;
      }

      let instNo = this.getCookie('inst_no');
      weChatMpBind({ authorCode: this.code, instNo: this.instNoConfig.instNo || '1000000' })
        .then(res => {
          this.$toasting.success({ msg: '登录成功' });
          loginAfterOperate.call(this, this.nextPath);
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
      this.sliderLogin();
      // this.captchaModal = !this.captchaModal;
      // this.getCaptchaCode();
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
    sendSms(randStr, ticket) {
      this.$toasting.show({ message: '发送中', forbidClick: true });
      const params = {
        randStr,
        ticket,
        // captchaId: this.captchaId,
        // captchaText: this.imgCode,
        mobileNo: this.phoneNum,
        instNo: this.instNoConfig?.instNo || '1000000'
      };
      sendSmsSlideCode(params)
        .then(res => {
          this.$toasting.success({ msg: '已发送' });
          // this.captchaModal = !this.captchaModal;
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
        errText = '请输入手机号';
      } else if (!this.valiPhone()) {
        errText = '手机号格式错误';
      } else if (!this.smsCode) {
        errText = '请输入验证码';
      } else if (!this.valiSmsCode()) {
        errText = '验证码格式错误';
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
  height: 100vh;
  width: 100%;
  background: url('../../assets/imgs/login/login_bg.png');
  background-size: 100vw;
  padding-top: 307px;
  box-sizing: border-box;

  .login-content {
    width: 684px;
    height: 618px;
    background: url('../../assets/imgs/login/login-content-bg.png');
    background-size: contain;
    background-repeat: no-repeat;
    margin: 0 auto;
    position: relative;

    .logo-icon {
      width: 224px;
      display: block;
      margin: 0 auto;
      position: absolute;
      right: 0;
      left: 0;
      top: -24px;
    }

    .user-info-input {
      position: absolute;
      bottom: 0;
      top: 44px;
      right: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .operate-input {
        width: 82%;
        display: flex;
        border-bottom: 2px solid #f7f7f7;
        align-items: center;
        padding-bottom: 24px;
        margin-top: 52px;

        .label {
          margin-left: 16px;
          white-space: nowrap;
          font-size: 30px;
          font-family: PingFangSC, PingFangSC-Medium;
          font-weight: 500;
          text-align: center;
          color: #333333;
        }

        .content {
          flex: 1;
          margin-left: 36px;
          min-width: 40px !important;

          .mobile-num {
            border: none;
          }

          .passwd {
            border: none;
          }
        }

        .sms-container {
          white-space: nowrap;

          .sms-wrapper {
            width: 192px;
            height: 64px;
            background: #fff5f5;
            border-radius: 32px;
            font-size: 28px;
            font-family: PingFangSC, PingFangSC-Medium;
            font-weight: 500;
            text-align: center;
            color: #333333;
            line-height: 64px;
          }
        }
      }
    }

    .send-captcha-btn {
      width: 100%;
      margin-top: 20px;
      padding-left: 62px;
      display: flex;
      font-weight: 600;
      justify-content: flex-start;
    }

    .login-btn {
      width: 360px;
      height: 96px;
      background: #e30315;
      border-radius: 48px;
      position: absolute;
      bottom: -12px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 32px;
      font-family: PingFangSC, PingFangSC-Medium;
      font-weight: 500;
      text-align: center;
      color: #ffffff;
      line-height: 96px;
    }
  }

  .input {
    min-width: 60px !important;
    font-size: 30px;
    font-family: PingFangSC, PingFangSC-Regular;
    font-weight: 400;
    text-align: left;
    color: #333333;
    caret-color: #bfbfbf;
    outline: none;
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
  background: #e30315;
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

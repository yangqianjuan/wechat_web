<template>
  <div class="login-wrapper"></div>
</template>
<script>
import { getFacePToken } from '@/controller/faceP.js';
import { getVerification } from '@/request/interface/txQrc/faceP.js';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { faceErrorMessage } from '@/utils/common/common';
let wx = require('weixin-js-sdk');
/**
 * 人脸识别
 *
 * */
export default {
  data() {
    return {
      liveVerifyTime: 0,
      // 值是借款的时候，销售合同签署的url：sign_sass_contract?applyUnionKey=${this.applyUnionKey}&isLoans=true
      callBackRouter: '',
      applyUnionKey: '',
      productId: ''
    };
  },
  created() {
    let isOverVerify = this.getUrlParam('isOverVerify');
    this.callBackRouter = decodeURIComponent(this.getUrlParam('callBackRouter'));
    this.productId = localStorage.productId;
    this.isOverVerify = isOverVerify;
    let liveVerifyTime = localStorage.liveVerifyTime;
    liveVerifyTime = liveVerifyTime ? parseInt(liveVerifyTime) : 0;
    this.liveVerifyTime = liveVerifyTime;
    if (isOverVerify || liveVerifyTime) {
      this.getVerifyResult();
    } else {
      this.gotoLivingVerify();
    }
  },
  methods: {
    /**
     * 获取人脸的跳转路径，对接腾讯的人脸识别
     * 获取的结果中有跳转到人脸识别的连接地址（url， BizToken， "RequestId）
     * */
    gotoLivingVerify() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      if (this.liveVerifyTime >= 5) {
        this.$toasting.hide();
        this.$notify.error({ msg: '活体识别次数过多，请明天再尝试！' });
        return false;
      }
      let liveVerifyTime = this.liveVerifyTime;
      window.localStorage.setItem('liveVerifyTime', liveVerifyTime + 1);
      getFacePToken()
        .then(res => {
          this.redirectUrl = res.url;
          setTimeout(() => {
            window.location.href = res.url;
          }, 200);
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    /**
     * 获取人脸识别的结果
     *
     */
    getVerifyResult() {
      this.$toasting.show({ message: '获取识别结果', forbidClick: true });
      // let bizToken = this.getCookie('tencent_biz_token');
      let faceStage = undefined;

      // CREDIT 是用户授信的时候获取人脸识别结果的标识，LOAN是借款的时候的标识
      if (this.callBackRouter === 'null') {
        faceStage = this.callBackRouter = 'CREDIT';
      } else if (this.callBackRouter && this.callBackRouter !== 'null') {
        faceStage = this.callBackRouter = 'LOAN';
      }
      // { bizToken, faceStage }
      getVerification({ faceStage })
        .then(async res => {
          if (res?.data?.success) {
            this.$notify.info({ msg: '识别成功！' });
            window.localStorage.removeItem('liveVerifyTime');
            let nextPath = await queryNextByUnionKeyAndProdId(this.productId);
            // this.callBackRouter !== 'null' && (nextPath = `/${this.callBackRouter}`);
            this.$router.replace({ path: nextPath });
          } else {
            // 验证失败重新验证
            this.$notify.error({ msg: '活体识别失败！' });
            faceErrorMessage()
              .then(res => {
                if (res === 'ok') {
                  this.gotoLivingVerify();
                }
              })
              .catch(err => {
                if (err === 'no') {
                  wx.closeWindow();
                }
              });
          }
          // let detail = res?.data?.data?.detail;
          // let result = JSON.parse(detail.replace(new RegExp('\\\\', 'gm'), ''));
          // let isPass = false;
          // result.LivenessData.forEach(LiveneItem => {
          //   if (LiveneItem.ErrMsg === '成功') {
          //     isPass = true;
          //   }
          // });
          // if (isPass) {
          //   this.$notify.info({ msg: '识别成功！' });
          //   window.localStorage.removeItem('liveVerifyTime');
          //   let nextPath = await queryNextByUnionKeyAndProdId(this.productId);
          //   this.callBackRouter !== 'null' && (nextPath = `/${this.callBackRouter}`);
          //   this.$router.replace({ path: nextPath });
          // } else {
          //   // 验证失败重新验证
          //   this.$notify.error({ msg: '活体识别失败！' });
          //   setTimeout(() => {
          //     this.gotoLivingVerify();
          //   }, 1500);
          // }
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '活体识别失败！' });
          faceErrorMessage()
            .then(res => {
              if (res === 'ok') {
                this.gotoLivingVerify();
              }
            })
            .catch(err => {
              if (err === 'no') {
                wx.closeWindow();
              }
            });
        })
        .finally(_ => {
          this.$toasting.hide();
        });
    }
  }
};
</script>

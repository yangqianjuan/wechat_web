<template>
  <div class="credit-face beijing-common">
    <van-empty v-if="identifying" :description="identifyText" />
  </div>
</template>
<script>
import { getFacePToken } from '@/controller/faceP.js';
import { getVerification, getFaceBjBankCheck } from '@/request/interface/txQrc/faceP.js';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { SESSION_ID } from '@/utils/common/config.js';
import { faceErrorMessage } from '@/utils/common/common';
import { pageKeyInfoSearch, beijingDialog } from '../../../utils/common';

let wx = require('weixin-js-sdk');

export default {
  name: 'BjbFace',
  data() {
    return {
      // 今天验证的次数
      liveVerifyTime: 0,
      applyUnionKey: '',
      referrer: '',
      productId: '',
      identifying: false,
      identifyText: '识别中...'
    };
  },

  created() {
    this.init();
  },

  methods: {
    async init() {
      try {
        const { referrer, productId } = await pageKeyInfoSearch.call(this);
        if (referrer) {
          this.referrer = referrer;
          this.productId = productId;
        }
        this.liveVerifyTime = localStorage.creditLiveVerifyTime ? parseInt(localStorage.creditLiveVerifyTime) : 0;
        if (this.liveVerifyTime) {
          this.getVerifyResult();
        } else {
          this.gotoLivingVerify();
        }
      } catch (error) {
        console.log(error);
      }
    },

    async gotoLivingVerify() {
      this.$toasting.show({ message: '加载中', forbidClick: true });

      if (this.liveVerifyTime >= 50) {
        this.$toasting.hide();
        this.$toasting.info({ msg: '活体识别次数过多，请明天再尝试' });
        return false;
      }

      let liveVerifyTime = this.liveVerifyTime;
      localStorage.setItem('creditLiveVerifyTime', liveVerifyTime + 1);

      try {
        const faceTokenRes = await getFacePToken();
        if (faceTokenRes?.url) {
          this.redirectUrl = faceTokenRes.url;

          setTimeout(() => {
            window.location.href = this.redirectUrl;
          }, 800);

          return;
        }
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '获取人脸识别链接失败！',
          confirmButtonText: '确定'
        });
      } finally {
        this.$toasting.hide();
      }
    },

    async getVerifyResult() {
      this.$toasting.show({ message: '获取结果中', forbidClick: true });
      // this.$router.replace({
      //   path: '/sj_base_info',
      //   query: {
      //     referrer: this.referrer,
      //     productId: this.productId
      //   }
      // });

      let faceStage = 'CREDIT';
      try {
        const verifyFaceRes = await getVerification({ faceStage });
        if (verifyFaceRes?.data?.success) {
          this.clear();

          setTimeout(() => {
            this.$router.replace({
              path: '/sj_base_info',
              query: {
                referrer: this.referrer,
                productId: this.productId
              }
            });
          }, 800);

          // let verifyParams = {
          //   businessType: 2
          // };
          // const checkRes = await getFaceBjBankCheck(verifyParams);
          // if (checkRes?.data?.success) {
          //   let productId = this.productId || '9999';
          //   const nextPath = await queryNextByUnionKeyAndProdId(productId);

          //   if (nextPath !== '/bjb_face_pp') {
          //     this.$toasting.success({ msg: '人脸识别成功！' });

          //     setTimeout(() => {
          //       this.$router.replace({
          //         path: nextPath,
          //         query: {
          //           referrer: this.referrer,
          //           productId: this.productId
          //         }
          //       });
          //     }, 800);

          //     return;
          //   }
          //   return;
          // }

          // this.errorHandler();

          return;
        }

        this.errorHandler();
      } catch (error) {
        if (error?.data?.code === '10412') {
          this.errorHandler(error.data.msg, false);
          return;
        }
        this.errorHandler();
      } finally {
        this.$toasting.hide();
      }
    },

    errorHandler(msg, isCanFace = true) {
      this.$toasting.error({ msg: '获取失败' });
      faceErrorMessage(msg, isCanFace)
        .then((res) => {
          res === 'ok' && this.gotoLivingVerify();
        })
        .catch((err) => {
          err === 'no' && wx.closeWindow();
        });
    },

    clear() {
      window.localStorage.removeItem('creditLiveVerifyTime');
      window.sessionStorage.removeItem('face_type_c');
      this.setCookie('tencent_biz_token', '');
      window.sessionStorage.removeItem(SESSION_ID.bizUrl);
    }
  }
};
</script>

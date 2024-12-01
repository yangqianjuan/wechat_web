<template>
  <div class="login-wrapper"></div>
</template>
<script>
import { getFacePToken } from '@/controller/faceP.js';
import { getVerification } from '@/request/interface/txQrc/faceP.js';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { infoRegister } from '@/utils/common/common';
import { commonMydMixin } from '@/modules/products/meng-yi-d/utils/common';
import { faceErrorMessage } from '@/utils/common/common';
let wx = require('weixin-js-sdk');

export default {
  name: 'MYDFace',
  mixins: [commonMydMixin],
  data() {
    return {
      liveVerifyTime: 0,
      callBackRouter: '',
      isOverVerify: undefined
    };
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      this.getMydUnionKey();
      this.callBackRouter = decodeURIComponent(this.getUrlParam('callBackRouter'));
      this.isOverVerify = this.getUrlParam('isOverVerify');
      this.liveVerifyTime = parseInt(this.creditPreInfo.liveVerifyTime || 0);
      if (this.isOverVerify || this.liveVerifyTime) {
        this.getVerifyResult();
      } else {
        this.gotoLivingVerify();
      }
    },
    gotoLivingVerify() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      if (this.liveVerifyTime >= 5) {
        this.$toasting.hide();
        this.$notify.error({ msg: '活体识别次数过多，请明天再尝试！' });
        return false;
      }
      getFacePToken({ applyUnionKey: this.applyUnionKey, tokenType: 'myd' })
        .then(res => {
          let liveVerifyTime = this.liveVerifyTime + 1;
          this.infoSet(liveVerifyTime);
          this.redirectUrl = res?.url;
          setTimeout(() => {
            window.location.href = this.redirectUrl;
          }, 200);
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    getVerifyResult() {
      this.$toasting.show({ message: '获取识别结果', forbidClick: true });
      // let bizToken = this.getCookie('tencent_biz_token');
      let faceStage = undefined;
      if (this.callBackRouter === 'null') {
        faceStage = this.callBackRouter = 'CREDIT';
      } else if (this.callBackRouter && this.callBackRouter !== 'null') {
        faceStage = this.callBackRouter = 'LOAN';
      }
      // { bizToken, faceStage, applyUnionKey: this.applyUnionKey }
      getVerification({ faceStage, applyUnionKey: this.applyUnionKey })
        .then(async res => {
          if (res?.data?.success) {
            this.$notify.info({ msg: '识别成功！' });
            this.infoSet(0);
            let nextPath = await queryNextByUnionKeyAndProdId(this.creditPreInfo.productId, this.applyUnionKey);
            if (this.callBackRouter && this.callBackRouter !== 'null') {
              nextPath = `/${this.callBackRouter}`;
            }
            this.$router.replace({
              path: nextPath,
              query: { referrer: this.creditPreInfo.referrer, productId: this.creditPreInfo.productId }
            });
          } else {
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
          // let result = detail && JSON.parse(detail.replace(new RegExp('\\\\', 'gm'), ''));
          // let isPass = false;
          // result?.LivenessData?.forEach(LiveneItem => {
          //   if (LiveneItem.ErrMsg === '成功') {
          //     isPass = true;
          //   }
          // });
          // if (isPass) {
          //   this.$notify.info({ msg: '识别成功！' });
          //   this.infoSet(0);
          //   let nextPath = await queryNextByUnionKeyAndProdId(this.creditPreInfo.productId, this.applyUnionKey);
          //   if (this.callBackRouter && this.callBackRouter !== 'null') {
          //     nextPath = `/${this.callBackRouter}`;
          //   }
          //   this.$router.replace({
          //     path: nextPath,
          //     query: { referrer: this.creditPreInfo.referrer, productId: this.creditPreInfo.productId }
          //   });
          // } else {
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
    },

    infoSet(number) {
      infoRegister(this.creditPreInfo.productId, { ...this.creditPreInfo, liveVerifyTime: number });
    }
  }
};
</script>

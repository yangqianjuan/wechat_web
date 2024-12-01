<!--
 * @Author: hsf
 * @Date: 2023-06-27 09:18:54
 * @LastEditors: hsf
 * @LastEditTime: 2023-09-14 17:35:43
 * @Description:
-->
<template>
  <div class="borrow-face beijing-common">
    <van-empty v-if="identifying" :description="identifyText" />
  </div>
</template>
<script>
import { getFacePToken } from '@/controller/faceP.js';
import { getFaceBjBankCheck, getVerification } from '@/request/interface/txQrc/faceP.js';
import { SESSION_ID } from '@/utils/common/config.js';
import { faceErrorMessage } from '@/utils/common/common';
import { beijingDialog } from '../../../utils/common';

let wx = require('weixin-js-sdk');

/**
 * 北京银行 -- 人脸识别（ 借款 ）
 * */
export default {
  name: 'BjbFace',
  data() {
    return {
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
    init() {
      let applyUnionKey = sessionStorage.getItem('union_key_beijing');
      applyUnionKey && (this.applyUnionKey = applyUnionKey);
      this.productId = '1155';
      this.liveVerifyTime = localStorage.borrowLiveVerifyTime ? parseInt(localStorage.borrowLiveVerifyTime) : 0;
      this.liveVerifyTime ? this.getVerifyResult() : this.gotoLivingVerify();
    },

    async gotoLivingVerify() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      if (this.liveVerifyTime >= 50) {
        this.$toasting.hide();
        beijingDialog({
          message: '活体识别次数过多，请明天再尝试！',
          confirmButtonText: '确定'
        });

        return false;
      }
      window.localStorage.setItem('borrowLiveVerifyTime', this.liveVerifyTime + 1);
      // type: "withdraw" 提款
      try {
        const faceTokenRes = await getFacePToken({ type: 'withdraw' });
        if (faceTokenRes?.url) {
          this.redirectUrl = faceTokenRes.url;

          setTimeout(() => {
            window.location.href = this.redirectUrl;
          }, 500);

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
      try {
        this.$toasting.show({ message: '获取结果中', forbidClick: true });
        let faceStage = 'LOAN';
        const verifyFaceRes = await getVerification({ faceStage });
        if (verifyFaceRes?.data?.success) {
          let verifyParams = {
            businessType: 4
          };
          const checkRes = await getFaceBjBankCheck(verifyParams);

          if (checkRes?.data?.success) {
            this.clear();

            this.$router.replace({
              path: '/bjb_confirm_loan',
              query: {
                productId: '1155',
                applyUnionKey: this.applyUnionKey
              }
            });
            return;
          }

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
        .then(res => {
          res === 'ok' && this.gotoLivingVerify();
        })
        .catch(err => {
          err === 'no' && wx.closeWindow();
        });
    },

    clear() {
      // 清空
      window.localStorage.removeItem('borrowLiveVerifyTime');
      window.sessionStorage.removeItem('face_type_b');
      window.sessionStorage.removeItem(SESSION_ID.withdrawBizToken);
      window.sessionStorage.removeItem(SESSION_ID.withdrawBizUrl);
    }
  }
};
</script>

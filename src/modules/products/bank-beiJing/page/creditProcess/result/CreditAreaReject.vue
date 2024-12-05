<template>
  <div class="loans-result-wrapper beijing-common" v-if="isLoadOver">
    <div class="top-content">
      <div class="steps">
        <Steps :steps="[]"></Steps>
      </div>
    </div>
    <div class="middle-content">
      <div class="middle-desc">
        <div class="desc-apply-1">{{ approveCode[approve] }}</div>
        <div class="desc-apply-3">{{ commonDefaultMsg }}</div>
      </div>
      <div class="top-logo">
        <img :src="approveIconCode[approve]" alt="" />
      </div>

      <div class="exist-err-msg" v-if="errorCreditMsg" v-html="errorCreditMsg"></div>
    </div>
  </div>
</template>
<script>
import { queryApplyInfoIndexStatus } from '@/request/interface/impower/UserInfo.js';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import Steps from '../../../component/steps/Steps.vue';
import { beijingDialog, pageKeyInfoSearch } from '../../../utils/common';

export default {
  /**
   * 北京银行 -- 授信区域拒绝
   * */
  name: 'BJBCreditAreaReject',
  components: {
    Steps
  },
  data() {
    return {
      approveCode: {
        FAIL: '申请拒绝'
      },
      approveIconCode: {
        FAIL: require('../../../static/image/credit/credit-result-fail.png')
      },
      approve: 'FAIL',
      isLoadOver: true,
      referrer: '',
      productId: '',
      afterTimestamp: '',
      errorCreditMsg: '',
      commonDefaultMsg: '请勿取消关注公众号，以防错过审核通知!'
    };
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      this.setWechatTitle('申请结果');
      this.getPath();
    },

    async getPath() {
      try {
        if (this.$route.query.errorMsg) {
          let errTemplate = '';
          let indexWord = ['【小萌-萌e贷】', '北京银行'];
          if (this.$route.query.errorMsg.indexOf(indexWord[0]) !== -1) {
            let errTxtArr = this.$route.query.errorMsg.split(indexWord[0]);
            errTemplate = `${errTxtArr[0]}<span class='fill-product-title'>${indexWord[0]}</span>${errTxtArr[1]} `;
            this.errorCreditMsg = errTemplate;
          } else if (this.$route.query.errorMsg.indexOf(indexWord[1]) !== -1) {
            let errTxtArr = this.$route.query.errorMsg.split(indexWord[1]);
            errTemplate = `${errTxtArr[0]}<span class='fill-product-title'>${indexWord[1]}</span>${errTxtArr[1]} `;
            this.errorCreditMsg = errTemplate;
          } else {
            this.errorCreditMsg = this.$route.query.errorMsg;
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.loans-result-wrapper {
  min-height: 100vh;
  max-width: 100vw;
  overflow-x: hidden;
  background: #f8f8f8;
  display: flex;
  flex-direction: column;
  align-items: center;

  .top-content {
    width: 100%;
    height: 404px;
  }

  .middle-content {
    margin-top: -184px;
    width: 686px;
    height: 1160px;
    background: #ffffff;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .top-logo {
      margin-top: 40px;

      img {
        width: 558px;
        height: 380px;
      }
    }

    .middle-desc {
      display: flex;
      flex-direction: column;
      align-items: center;

      .desc-apply-1 {
        margin-top: 96px;
        font-size: 40px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #2b0e0c;
      }

      .desc-apply-3 {
        margin-top: 16px;
        font-size: 24px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #8f8b8a;
        padding: 0 12px;
      }
    }

    .desc-apply-2 {
      margin-top: 48px;
      font-size: 32px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #8f8b8a;

      span {
        color: #a60400;
        font-size: 32px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
      }
    }

    .exist-err-msg {
      text-align: center;
      margin-top: 48px;
      font-size: 32px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #8f8b8a;
      padding: 0 28px;
      text-indent: 2em;

      ::v-deep .fill-product-title {
        font-size: 34px;
        font-family: PingFangSC-Medium, PingFang SC;
        color: #a90600;
        font-weight: bold;
      }
    }

    .operate-auth {
      margin-top: 64px;

      ::v-deep .btn {
        border: unset !important;
        width: 320px;
        height: 88px;
        background: linear-gradient(129deg, #b80701 0%, #9a0400 100%), linear-gradient(129deg, #cd1101 0%, #a70500 100%);
        border-radius: 44px;
        line-height: 88px;

        .van-button__text {
          font-size: 28px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #ffffff;
        }
      }
    }
  }
}
</style>

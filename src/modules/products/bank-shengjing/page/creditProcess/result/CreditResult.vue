<template>
  <div class="loans-result-wrapper beijing-common" v-if="isLoadOver">
    <div class="top-content">
      <div class="steps">
        <Steps :steps="[0, 1, 2]"></Steps>
      </div>
    </div>
    <div class="middle-content">
      <div class="middle-desc">
        <div class="desc-apply-1 desc-apply-1-1">{{ approveCode[approve] }}</div>
        <div class="desc-apply-1" v-if="approve === 'PASS'">授信额度</div>
        <div class="desc-apply-1" v-if="approve === 'PASS'">
          <span style="font-size: 28px;">8000</span>元
        </div>
        <!--        <div class="desc-apply-3">{{ errorCreditMsg || commonDefaultMsg }}</div>-->
        <div class="desc-apply-3">{{ commonDefaultMsg }}</div>
      </div>
      <div class="top-logo">
        <img :src="approveIconCode[approve]" alt />
      </div>
      <div class="desc-apply-2" v-if="approve === 'APPLYING'">
        <!-- 预计
        <span>5分钟左右完成审核</span>，请耐心等待!-->
        审核中，请耐心等待!
      </div>
      <!--      {{ errorCreditMsg }}-->
      <div class="exist-err-msg" v-if="errorCreditMsg" v-html="errorCreditMsg"></div>
      <div class="operate-auth" v-if="approve === 'PASS'">
        <!-- <van-button class="btn" type="primary" @click="goBackHome">查看额度</van-button> -->
        <van-button class="btn" type="primary" @click="goBackHome">立即借款</van-button>
      </div>
      <div class="operate-auth" v-if="approve === 'APPLYING'">
        <!-- <van-button class="btn" type="primary" @click="refreshStatus">刷新</van-button> -->
        <van-button class="btn" type="primary" @click="test">刷新</van-button>
      </div>
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
   * 北京银行 -- 申请的结果
   * */
  name: 'BJBCreditResult',
  components: {
    Steps
  },
  data() {
    return {
      approveCode: {
        APPLYING: '授信审核中',
        FAIL: '授信审核不通过',
        PASS: '授信审核成功'
      },
      approveIconCode: {
        APPLYING: require('../../../static/image/credit/credit-result-apply.png'),
        FAIL: require('../../../static/image/credit/credit-result-fail.png'),
        PASS: require('../../../static/image/credit/credit-result-success.png')
      },
      approve: 'APPLYING',
      isLoadOver: true,
      referrer: '',
      productId: '',
      afterTimestamp: '',
      errorCreditMsg: '',
      commonDefaultMsg: '请勿取消关注公众号，以防错过审核通知!'
    };
  },

  created() {
    // this.init();

    this.test();
  },

  methods: {
    init() {
      this.setWechatTitle('申请结果');
      // this.getPath();
    },

    test() {
      if (this.approve === 'APPLYING') {
        setTimeout(() => {
          this.approve = 'PASS';
        }, 10000);
      }
    },

    async getPath() {
      try {
        const { referrer, productId } = await pageKeyInfoSearch.call(this);
        if (referrer) {
          this.referrer = referrer;
          this.productId = productId;

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
        }

        let pathStatusRes = await this.checkPagePathStatus();

        pathStatusRes && this.getStatus();
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '授信状态获取失败！',
          confirmButtonText: '确定'
        });
      }
    },

    async getStatus() {
      try {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        let creditRes = await queryApplyInfoIndexStatus();
        if (creditRes?.data?.data) {
          this.approve = creditRes.data.data;
          if (this.approve === 'APPLYING') {
            this.checkPagePathStatus();
          }
        }
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '授信状态获取失败！',
          confirmButtonText: '确定'
        });
      } finally {
        this.$toasting.hide();
        this.isLoadOver = true;
      }
    },

    async checkPagePathStatus() {
      let nextPath = await queryNextByUnionKeyAndProdId('9999');

      if (nextPath !== '/bjb_credit_result') {
        setTimeout(() => {
          this.$router.replace({
            path: nextPath,
            query: {
              referrer: this.referrer,
              productId: this.productId
            }
          });
        }, 1000);

        return false;
      }

      return true;
    },

    refreshStatus() {
      try {
        if (!this.afterTimestamp) {
          this.afterTimestamp = new Date();
          this.getStatus();
        } else {
          let nowDate = new Date();
          let intervalTime = nowDate.getTime() - this.afterTimestamp.getTime();
          if (intervalTime >= 10000) {
            this.afterTimestamp = nowDate;
            this.getStatus();
          }
        }
      } catch (error) {
        this.getStatus();
      }
    },

    goBackHome() {
      if (this.approve === 'PASS') {
        this.$router.replace({ path: '/sj_loans_home' });
      } else {
        window.close();
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

      .desc-apply-1-1 {
        margin-top: 96px;
      }

      .desc-apply-1 {
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

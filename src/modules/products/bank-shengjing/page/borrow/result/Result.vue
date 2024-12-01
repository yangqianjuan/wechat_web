<!--
 * @Author: yanpeng peng.yan01@weimob.com
 * @Date: 2023-06-25 09:10:25
 * @LastEditors: hsf
 * @LastEditTime: 2024-11-06 15:18:12
 * @FilePath: \mz-front\src\modules\products\bank-beiJing\page\borrow\result\Result.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="loans-result-wrapper beijing-common">
    <div class="top-back">
      <div class="result">
        <div class="title">{{ loansResultText[loanStatus] }}</div>
        <div class="tip">{{ msg }}</div>
        <img class="icon" :src="loansResultIcon[loanStatus]" alt />
        <div class="reminds" v-if="loanStatus === 'PENDING'">
          <span>预计</span>
          <!--          <span class="red">1分钟完成审核</span>-->
          <span class="red">1分钟完成放款</span>
          <span>，请耐心等待!</span>
        </div>
        <van-button class="check" v-if="loanStatus === 'SUCCESS'" @click="goRepayPlan">查看我的还款计划</van-button>
        <van-button class="check" v-if="loanStatus === 'FAIL'" @click="goStartBorrow">重新发起</van-button>
        <van-button class="check" v-if="loanStatus === 'PENDING'" @click="refreshStatus">刷新</van-button>
        <van-button
          class="submit"
          :class="[loanStatus === 'REFUSE' ? 'add-status' : '']"
          v-if="loanStatus !== 'PENDING'"
          @click="goBack"
        >完成</van-button>
        <!-- <img
          class="advertisement"
          v-if="loanStatus === 'PENDING' || loanStatus === 'SUCCESS'"
          src="../../../static/image/advertisement.png"
          @click="goDownloadApp"
          alt
        />-->
      </div>
    </div>
  </div>
</template>
<script>
import { beijingDialog } from '../../../utils/common';
import { getUserCreditResult, queryBeijingLoansInfoIndexStatus } from '@/request/interface/impower/UserInfo.js';

export default {
  /**
   * 借款的结果页
   * */
  data() {
    return {
      loansResultIcon: {
        SUCCESS: require('../../../static/image/credit/credit-result-success.png'),
        PENDING: require('../../../static/image/credit/credit-result-apply.png'),
        FAIL: require('../../../static/image/credit/credit-result-fail.png'),
        REFUSE: require('../../../static/image/credit/credit-result-fail.png')
      },
      loansResultText: {
        SUCCESS: '放款成功',
        // PENDING: '放款审核中',
        PENDING: '放款中',
        FAIL: '放款失败',
        // REFUSE: '放款审核未通过'
        REFUSE: '放款失败'
      },
      msg: '请勿取消关注公众号，以防错过审核通知!',
      isLoading: false,
      isShow: true,
      loansErrResult: '',
      repayStatusParams: {
        loanAmt: undefined,
        loanRate: undefined,
        loanPeriod: undefined,
        loanMode: undefined
      },
      loanStatus: 'PENDING',
      afterTimestamp: '',
      applyUnionKey: '',
      referrerId: ''
    };
  },
  created() {
    // this.init();
  },

  methods: {
    init() {
      this.getLoansResult();
    },

    async getLoansResult() {
      try {
        this.$toasting.show({ message: '加载中', forbidClick: true });

        let creditRes = await getUserCreditResult({ productId: '1155' });

        let applyUnionKey = this.$route.query.applyUnionKey;
        if (applyUnionKey) {
          this.applyUnionKey = applyUnionKey;
        } else {
          this.applyUnionKey = sessionStorage.getItem('union_key_beijing');
        }

        if (creditRes?.data?.data) {
          let canUseCredit = creditRes.data.data.find((creditItem) => {
            // creditItem.quotaValidFlag && creditItem.contStatus !== '104'
            return (
              String(creditItem.agreeProduct) === '1155' &&
              String(creditItem.applyUnionKey) === String(this.applyUnionKey)
            );
          });
          applyUnionKey = canUseCredit.applyUnionKey;
          this.applyUnionKey = applyUnionKey;
          this.referrerId = canUseCredit.saleManId;
        }

        if (!applyUnionKey) {
          return;
        }

        let res = await queryBeijingLoansInfoIndexStatus({ applyUnionKey, loanNo: this.$route.query.loanNo });
        if (res?.data?.success && res?.data?.data) {
          this.repayStatusParams.loanAmt = res.data.data.loanAmt;
          this.repayStatusParams.loanRate = res.data.data.loanRate;
          this.repayStatusParams.loanPeriod = res.data.data.loanPeriod;
          this.repayStatusParams.loanMode = res.data.data.loanMode;
          this.loanStatus = res.data.data.status;
          return;
        }
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '借款结果查询失败！',
          confirmButtonText: '确定'
        });
      } finally {
        this.$toasting.hide();
      }
    },

    goRepayPlan() {
      this.$router.push({
        path: '/bjb_repay_plan',
        query: {
          params: JSON.stringify(this.repayStatusParams)
        }
      });
    },

    goBack() {
      this.$router.replace({ path: '/' });
    },

    goDownloadApp() {
      beijingDialog({
        message: '前往下载北京银行APP',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then((_) => {
          window.location.href =
            'https://weixinbank.bankofbeijing.com.cn/weixinServer/htmlShow/mobileQrcode/mobileQrcode.html?a=bankofbj%3A%2F%2F95526.mobi';
        })
        .catch((_) => {});
    },

    refreshStatus() {
      try {
        if (!this.afterTimestamp) {
          this.afterTimestamp = new Date();
          this.getLoansResult();
        } else {
          let nowDate = new Date();
          let intervalTime = nowDate.getTime() - this.afterTimestamp.getTime();
          if (intervalTime >= 10000) {
            this.afterTimestamp = nowDate;
            this.getLoansResult();
          }
        }
      } catch (error) {
        this.getLoansResult();
      }
    },

    goStartBorrow() {
      beijingDialog({
        message: '重新发起借款？',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then((_) => {
          this.$router.replace({
            path: '/bjb_loans_base_info',
            query: {
              productId: '1155',
              applyUnionKey: this.applyUnionKey,
              referrerId: this.referrerId
            }
          });
        })
        .catch((_) => {});
    }
  }
};
</script>
<style lang="scss" scoped>
.loans-result-wrapper {
  min-height: 100vh;
  background: #f4f6f9;
  width: 100vw;

  .top-back {
    width: 100%;
    height: 404px;
    background-image: url('../../../static/image/top_bg.png');
    background-repeat: no-repeat;
    background-size: contain;
    padding: 40px 32px;

    .result {
      width: 686px;
      height: 1302px;
      background: #ffffff;
      border-radius: 16px;
      margin: 0 auto;
      padding-top: 96px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;

      .title {
        font-size: 40px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #2b0e0c;
      }

      .tip {
        font-size: 24px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #8f8b8a;
        margin-top: 16px;
      }

      .icon {
        width: 558px;
        height: 380px;
        margin-top: 64px;
      }

      .reminds {
        margin-top: 40px;

        span {
          font-size: 32px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #8f8b8a;
        }

        .red {
          color: #a60400;
          font-size: 32px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
        }
      }

      .check {
        width: 360px;
        height: 88px;
        background: linear-gradient(129deg, #b80701 0%, #9a0400 100%), linear-gradient(129deg, #cd1101 0%, #a70500 100%);
        border-radius: 44px;
        margin-bottom: 24px;
        margin-top: 88px;

        /deep/ .van-button__text {
          font-size: 28px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #ffffff;
        }
      }

      .submit {
        width: 360px;
        height: 88px;
        background: #ffffff;
        border-radius: 44px;
        border: 2px solid #a60400;

        /deep/ .van-button__text {
          font-size: 28px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #a60400;
        }
      }

      .add-status {
        margin-top: 88px;
      }

      .advertisement {
        width: 622px;
        height: 224px;
        position: absolute;
        bottom: 32px;
      }
    }
  }
}
</style>

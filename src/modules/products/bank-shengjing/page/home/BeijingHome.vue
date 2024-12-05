<template>
  <div class="beijing-borrow-home">
    <!-- quota information -->
    <div class="top-content">
      <div class="logo">
        <img src="../../static/image/home/logo.png" alt />
      </div>
    </div>
    <div class="middle-content">
      <div class="title">可借额度(元)</div>
      <div class="loan-amount">
        <!-- <div class="num">{{ avaliableCredit || 0.0 }}</div> -->
        <div class="num">8000</div>
        <div class="fill"></div>
      </div>
      <!-- <div class="total-amount">总额度：{{ nowCreditInfo.approveCredit || 0.0 }} 元</div> -->
      <div class="total-amount">总额度：8000 元</div>
      <div class="operate">
        <!-- <van-button
          class="btn"
          :disabled="borrowBtnDisabled || !nowCreditInfo.avaliableCredit"
          type="primary"
          @click="loanProcessor"
        >立即借款</van-button>-->

        <van-button class="btn" type="primary" @click="loanProcessor">立即借款</van-button>
      </div>
    </div>
    <div class="foot-content">
      <!-- account - module -->
      <div class="account-bank">
        <template v-for="(item, index) in accountList" >
          <div class="option"  @click="jumpSearchHandler(item.type)" :key="index">
            <div class="left">{{ item.txt }}</div>
            <div class="right">
              <img src="../../static/image/home/right-icon.png" alt />
            </div>
          </div>
        </template>
      </div>

      <!-- borrow info raw -->
      <div class="records">
        <template v-for="(item, index) in recordList" >
          <div class="option"  @click="jumpSearchHandler(item.type)" :key="index">
            <div class="left">{{ item.txt }}</div>
            <div class="right">
              <img src="../../static/image/home/right-icon.png" alt />
            </div>
          </div>
        </template>
      </div>
    </div>
    <div style="height: 90px;"></div>
  </div>
</template>
<script>
/**
 * beijing bank home on borrow
 * */
import { checkWithdrawBefore, checkWithdrawBeforeResult } from '@/utils/common/global';
import { beijingQuotaQuery } from '@/request/interface/common';
import { getUserCreditResult } from '@/request/interface/impower/UserInfo.js';

import { beijingDialog, clickControl } from '../../utils/common';

export default {
  name: 'BeijingHome',
  data() {
    return {
      nowCreditInfo: {},
      accountList: [
        {
          txt: '还款账户信息',
          type: 'account-info'
        }
      ],
      applyUnionKey: '',
      recordList: [
        {
          txt: '待还账单',
          type: 'outstand-bill'
        },
        {
          txt: '借款记录',
          type: 'borrow-record'
        },
        {
          txt: '还款记录',
          type: 'repay-record'
        },
        {
          txt: '银行卡管理',
          type: 'bank-manage'
        }
      ],
      loanSettlementStatus: 'settle',
      bankEffect: 'none',
      borrowBtnDisabled: false,
      // 可用额度
      avaliableCredit: 0.0
    };
  },

  created() {},

  methods: {
    async init() {
      try {
        let applyUnionKey = this.$route.query.key;
        let loanSettlementStatus = this.$route.query.settle;
        let bankEffect = this.$route.query.bankEffect;

        if (applyUnionKey && loanSettlementStatus) {
          this.applyUnionKey = applyUnionKey;
          this.loanSettlementStatus = loanSettlementStatus;
          this.bankEffect = bankEffect;
          this.getCredits();

          if (this.loanSettlementStatus === 'none' && this.bankEffect === 'lapse') {
            this.borrowBtnDisabled = true;
            this.avaliableCredit = this.nowCreditInfo.avaliableCredit;
            return;
          }

          try {
            const beijingCreditRes = await beijingQuotaQuery({ applyUnionKey });

            if (beijingCreditRes?.data?.data) {
              this.avaliableCredit = beijingCreditRes.data.data.surplusLimit;
            } else {
              this.avaliableCredit = this.nowCreditInfo.avaliableCredit;
            }
          } catch (error) {
            beijingDialog({
              message: error?.data?.msg || '系统异常，请联系管理员！',
              confirmButtonText: '确定'
            });
            this.avaliableCredit = this.nowCreditInfo.avaliableCredit;
          }
        }
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '系统异常，请联系管理员！',
          confirmButtonText: '确定'
        });
      }
    },

    async getCredits() {
      let creditList = await getUserCreditResult({ productId: '9999' }).catch((error) => {
        beijingDialog({
          message: error?.data?.msg || '获取借款信息异常！',
          confirmButtonText: '确定'
        });

        return Promise.reject(error);
      });

      if (!creditList?.data?.data) {
        return;
      }

      let canUseCreditInfo = creditList.data.data.find((creditItem) => {
        // String(creditItem.agreeProduct) === '9999' && creditItem.quotaValidFlag && creditItem.contStatus !== '104'
        return (
          String(creditItem.agreeProduct) === '9999' && String(creditItem.applyUnionKey) === String(this.applyUnionKey)
        );
      });

      this.nowCreditInfo = canUseCreditInfo;

      // check now borrow status
      if (this.nowCreditInfo.contStatus === '104') {
        this.bankEffect === 'lapse';
      } else {
        this.bankEffect === 'none';
      }

      if (!this.nowCreditInfo.loanSettlementStatus) {
        this.loanSettlementStatus === 'none';
      } else {
        this.loanSettlementStatus === 'settle';
      }

      // beijing 借款是否结清
      if (this.loanSettlementStatus === 'none' && this.bankEffect === 'lapse') {
        this.borrowBtnDisabled = true;
        return;
      }

      // 单比授信 contStatus: 104（ 银行额度失效 ）、105（ 银行额度冻结 ）、quotaValidFlag: （ 额度是否在有效期内 ）
      if (
        this.nowCreditInfo.contStatus === '104' ||
        this.nowCreditInfo.contStatus === '105' ||
        !this.nowCreditInfo.quotaValidFlag
      ) {
        this.borrowBtnDisabled = true;
      }
    },

    loanProcessor() {
      this.$router.push({
        path: '/sj_loans_base_info',
        query: {
          referrerId: '252',
          productId: '9999'
        }
      });
    },

    borrowJump(params) {
      let query = {
        productId: params?.productId,
        applyUnionKey: params?.applyUnionKey,
        referrer: params?.referrerId
      };
      if (params?.checkWithdrawType) query.checkWithdrawType = params.checkWithdrawType;
      this.$router.push({
        path: params?.path,
        query: query
      });
    },

    jumpSearchHandler(type) {
      if (!type) {
        return;
      }

      switch (type) {
        case 'account-info': {
          this.$router.push({
            path: '/sj_bank',
            query: {
              creditNo: this.nowCreditInfo.creditNo,
              productId: '9999'
            }
          });
          break;
        }
        case 'outstand-bill': {
          this.$router.push({
            path: '/sj_bank',
            query: {
              creditNo: this.nowCreditInfo.creditNo,
              productId: '9999'
            }
          });
          break;
        }
        case 'borrow-record': {
          this.$router.push({
            path: '/sj_bank',
            query: {
              creditNo: this.nowCreditInfo.creditNo,
              productId: '9999'
            }
          });
          break;
        }
        case 'repay-record': {
          this.$router.push({
            path: '/sj_bank',
            query: {
              creditNo: this.nowCreditInfo.creditNo,
              productId: '9999'
            }
          });

          break;
        }
        case 'bank-manage': {
          break;
        }
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.beijing-borrow-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  max-width: 100vw;
  background: #f8f8f8;

  .top-content {
    width: 100%;
    height: 404px;
    background-image: url('../../static/image/home/home-top-bg.png');
    background-repeat: no-repeat;
    background-size: contain;
    padding-top: 30px;
    display: flex;
    justify-content: center;

    .logo {
      width: 684px;

      img {
        width: 135px;
        height: 45px;
      }
    }
  }

  .middle-content {
    margin-top: -300px;
    width: 686px;
    height: 463px;
    background: #ffffff;
    box-shadow: 0px 0px 32px -8px rgba(78, 6, 6, 0.2);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .title {
      margin-top: 48px;
      text-align: center;
      font-size: 28px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #8f8b8a;
    }

    .loan-amount {
      display: flex;
      flex-direction: column;
      align-items: center;

      .num {
        font-size: 88px;
        font-family: DINAlternate-Bold, DINAlternate;
        font-weight: bold;
        color: #a90600;
      }

      .fill {
        margin-top: 8px;
        width: 400px;
        height: 4px;
        background: linear-gradient(90deg, rgba(207, 12, 0, 0) 0%, #b70900 51%, rgba(161, 5, 0, 0) 100%);
        border-radius: 1px;
        opacity: 0.2;
      }
    }

    .total-amount {
      margin-top: 30px;
      font-size: 28px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #2b0e0c;
    }

    .operate {
      margin-top: 36px;

      ::v-deep .btn {
        border: unset !important;
        width: 606px;
        height: 88px;
        background: linear-gradient(129deg, #b80701 0%, #9a0400 100%);
        border-radius: 45px;
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

  .foot-content {
    .account-bank {
      margin: 32px 0;

      .option {
        display: flex;
        justify-content: space-between;
        padding: 40px 32px 40px 40px;
        background: #ffffff;
        border-radius: 32px;
        width: 686px;
        height: 120px;

        .left {
          font-size: 28px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #2b0e0c;
        }

        .right {
          display: flex;
          align-items: center;

          img {
            width: 28px;
            height: 28px;
          }
        }
      }
    }

    .records {
      margin: 32px 0;
      border-radius: 32px;
      width: 686px;
      padding: 0 32px 0 40px;
      background: #ffffff;

      .option {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 120px;

        .left {
          font-size: 28px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #2b0e0c;
        }

        .right {
          display: flex;
          align-items: center;

          img {
            width: 28px;
            height: 28px;
          }
        }
      }

      .option + .option {
        border-bottom: 1px solid #f4f4f4;
      }

      .option:first-child {
        border-bottom: 1px solid #f4f4f4;
      }

      .option:last-child {
        border: unset;
      }
    }
  }
}
</style>

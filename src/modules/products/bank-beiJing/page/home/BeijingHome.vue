<template>
  <div class="beijing-borrow-home">
    <!-- quota information -->
    <div class="top-content">
      <div class="logo">
        <img src="../../static/image/home/logo.png" alt="" />
      </div>
    </div>
    <div class="middle-content">
      <div class="title">可借额度(元)</div>
      <div class="loan-amount">
        <div class="num">
          {{ avaliableCredit || 0.0 }}
        </div>
        <div class="fill"></div>
      </div>
      <div class="total-amount">总额度：{{ nowCreditInfo.approveCredit || 0.0 }} 元</div>
      <div class="operate">
        <van-button
          class="btn"
          :disabled="borrowBtnDisabled || !nowCreditInfo.avaliableCredit"
          type="primary"
          @click="loanProcessor"
          >立即借款
        </van-button>
      </div>
    </div>
    <div class="foot-content">
      <!-- account - module -->
      <div class="account-bank">
        <template v-for="(item, index) in accountList" >
          <div class="option"  @click="jumpSearchHandler(item.type)" :key="index">
            <div class="left">{{ item.txt }}</div>
            <div class="right">
              <img src="../../static/image/home/right-icon.png" alt="" />
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
              <img src="../../static/image/home/right-icon.png" alt="" />
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

  created() {
    this.init();
  },

  methods: {
    async init() {
      try {
        // let creditInfo = sessionStorage.getItem('beijing-user-credit-info');
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
        // if (creditInfo) {
        //   // this.nowCreditInfo = JSON.parse(creditInfo);
        //   return;
        // }

        // beijingDialog({
        //   message: '获取借款信息异常',
        //   confirmButtonText: '确定'
        // });
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '系统异常，请联系管理员！',
          confirmButtonText: '确定'
        });
      }
    },

    async getCredits() {
      let creditList = await getUserCreditResult({ productId: '1155' }).catch(error => {
        beijingDialog({
          message: error?.data?.msg || '获取借款信息异常！',
          confirmButtonText: '确定'
        });

        return Promise.reject(error);
      });

      if (!creditList?.data?.data) {
        return;
      }

      let canUseCreditInfo = creditList.data.data.find(creditItem => {
        // String(creditItem.agreeProduct) === '1155' && creditItem.quotaValidFlag && creditItem.contStatus !== '104'
        return (
          String(creditItem.agreeProduct) === '1155' && String(creditItem.applyUnionKey) === String(this.applyUnionKey)
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

    // async getCredits() {
    //   try {
    //     let creditList = await getUserCreditResult({ productId: '1155' });
    //     if (!creditList?.data?.data) {
    //       return;
    //     }

    //     let canUseCreditInfo = creditList.data.data.find(creditItem => {
    //       return String(creditItem.agreeProduct) === '1155' && creditItem.quotaValidFlag;
    //     });

    //     this.nowCreditInfo = canUseCreditInfo;
    //   } catch (error) {
    //     beijingDialog({
    //       message: error?.data?.msg || '获取借款信息异常！',
    //       confirmButtonText: '确定'
    //     });
    //   }
    // },

    loanProcessor() {
      let credit = this.nowCreditInfo;
      let applyUnionKey = credit.applyUnionKey;

      let paramsJump = {
        path: '/bjb_loans_base_info',
        productId: '1155',
        applyUnionKey: applyUnionKey,
        referrerId: credit.referrerId
      };

      clickControl.call(this, this.withdrawHandler(applyUnionKey, paramsJump));
    },

    /**
     * verification of withdrawal
     *      response: ( code )
     *               0: "拒绝"
     *               1: "通过"
     *               2: "补件"
     *               3: "税务授权"
     *               4: "存在处于借款审核中的件"
     *               5: "当前正在校验中，"
     *               6: "开启校验"
     *               7: "额度冻结"
     *               8: "您的借款申请正在处理中"
     *
     *  get result
     * */
    async withdrawHandler(applyUnionKey, paramsJump) {
      try {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        let verifyRes = await checkWithdrawBeforeResult(applyUnionKey);
        if (verifyRes?.data?.data) {
          this.checkWithdrawResponse(verifyRes.data.data, applyUnionKey, paramsJump);
          return;
        }

        this.$toasting.hide();
      } catch (error) {
        this.$toasting.hide();
        beijingDialog({
          message: error?.data?.msg || '系统异常，请联系管理员！',
          confirmButtonText: '确定'
        });
      }
    },

    /**
     * verify result handler
     * */
    async checkWithdrawResponse(response, applyUnionKey, paramsJump, isGetVerify) {
      if (!response) {
        this.$toasting.hide();
        beijingDialog({
          message: '系统异常，请联系管理员！',
          confirmButtonText: '确定'
        });
        return;
      }

      if (typeof response.verifyRsult === 'number') {
        this.$toasting.hide();
        switch (String(response.verifyRsult)) {
          case '0': {
            this.linesFreezeText = response?.reason
              ? response.reason[0] || '系统异常，请联系管理员！'
              : '系统异常，请联系管理员！';
            beijingDialog({
              message: this.linesFreezeText,
              confirmButtonText: '确定'
            });
            break;
          }
          case '1': {
            this.borrowJump(paramsJump);
            break;
          }
          case '2': {
            // credit patch, no handler
            break;
          }
          case '3': {
            // tax data, no handler
            break;
          }
          case '4': {
            this.linesFreezeText = response?.reason
              ? response.reason[0] || '存在处于借款审核中的件！'
              : '存在处于借款审核中的件！';
            beijingDialog({
              message: this.linesFreezeText,
              confirmButtonText: '确定'
            });
            break;
          }
          case '5': {
            this.linesFreezeText = response?.reason
              ? response.reason[0] || '当前正在校验中，请等待...'
              : '当前正在校验中，请等待...';
            beijingDialog({
              message: this.linesFreezeText,
              confirmButtonText: '确定'
            });
            break;
          }
          case '6': {
            // trigger verify start
            if (!isGetVerify) {
              try {
                let triggerRes = await checkWithdrawBefore(applyUnionKey);
                if (triggerRes?.data?.data) {
                  this.checkWithdrawResponse(triggerRes.data.data, applyUnionKey, paramsJump, 'no');
                }
              } catch (error) {
                beijingDialog({
                  message: error?.data?.msg || '系统异常，请联系管理员！',
                  confirmButtonText: '确定'
                });
              } finally {
                this.$toasting.hide();
              }

              return;
            }

            if (isGetVerify === 'no') {
              this.$toasting.hide();
              this.linesFreezeText = '当前正在校验中，请等待！';
              beijingDialog({
                message: this.linesFreezeText,
                confirmButtonText: '确定'
              });

              return;
            }

            break;
          }
          case '7': {
            this.linesFreezeText = response?.reason ? response.reason[0] || '当前额度已冻结！' : '当前额度已冻结！';
            beijingDialog({
              message: this.linesFreezeText,
              confirmButtonText: '确定'
            });
            break;
          }
          case '8': {
            this.linesFreezeText = response?.reason
              ? response.reason[0] || '您的借款申请正在处理中！'
              : '您的借款申请正在处理中！';
            beijingDialog({
              message: this.linesFreezeText,
              confirmButtonText: '确定'
            });
            break;
          }
          default: {
            // beijingDialog({
            //   message: `提款校验匹配出错，状态码--${response.verifyRsult}`,
            //   confirmButtonText: '确定'
            // });
            beijingDialog({
              message: `系统异常，请联系管理员！`,
              confirmButtonText: '确定'
            });
            break;
          }
        }

        return;
      }

      beijingDialog({
        message: '系统异常，请联系管理员！',
        confirmButtonText: '确定'
      });
      return;
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

      //   {
      //   title: '待还账单',
      //   targetPath: '/bill'
      // },
      // {
      //   title: '借款记录',
      //   targetPath: '/loans_record'
      // },
      // {
      //   title: '还款记录',
      //   targetPath: '/repay_record'
      // },
      // {
      //   title: '银行卡管理',
      //   targetPath: '/bank_card_mana'
      // }

      switch (type) {
        case 'account-info': {
          beijingDialog({
            message:
              "<div class='desc'>暂不支持查询还款账户</div><div class='desc'>请登录北京银行-手机银行APP操作</div>",
            confirmButtonText: '确定'
          });
          // this.$router.push({
          //   path: '/repayment_inform',
          //   query: {
          //     creditNo: this.nowCreditInfo.creditNo,
          //     productId: '1155'
          //   }
          // });
          break;
        }
        case 'outstand-bill': {
          this.$router.push({
            path: '/repayment_bill',
            query: {
              productId: '1155',
              applyUnionKey: this.nowCreditInfo.applyUnionKey
            }
          });
          break;
        }
        case 'borrow-record': {
          this.$router.push({
            path: '/borrow_records',
            query: {
              productId: '1155',
              applyUnionKey: this.nowCreditInfo.applyUnionKey
            }
          });
          break;
        }
        case 'repay-record': {
          this.$router.push({
            path: '/payment_history',
            query: {
              creditNo: this.nowCreditInfo.creditNo,
              productId: '1155',
              applyUnionKey: this.nowCreditInfo.applyUnionKey
            }
          });

          break;
        }
        case 'bank-manage': {
          beijingDialog({
            message: "<div class='desc'>暂不支持变更银行卡</div><div class='desc'>请登录北京银行-手机银行APP操作</div>",
            confirmButtonText: '确定'
          });
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

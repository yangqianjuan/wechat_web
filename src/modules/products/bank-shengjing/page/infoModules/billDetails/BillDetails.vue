<!--
 * @Author: hsf
 * @Date: 2023-08-01 09:41:14
 * @LastEditors: hsf
 * @LastEditTime: 2024-01-29 14:25:53
 * @Description:
-->
<template>
  <div class="bill-details">
    <!-- 借款信息 -->
    <div class="top-title">
      <div class="company-logo">
        <img src="../../../static/image/logo.png" alt="" class="logo" />
        <div class="tip">年化利率:采用单利方式计算</div>
      </div>
      <div class="information">
        <div class="title">
          <div class="label">借款金额(元)</div>
          <div class="clear" v-if="isShowPrepayBtn && nowSettleBillStatus === 'none'" @click="previewSettle">
            提前结清申请
          </div>
          <div class="clear" v-if="!isShowPrepayBtn && nowSettleBillStatus !== 'none'">
            {{ nowSettleBillStatusDesc }}
          </div>
        </div>
        <div class="num">{{ repaymentPlan.loanAmountShow }}</div>
        <img src="../../../static/image/repayment/line.png" alt="" class="line" />
        <div class="title-two">
          <span class="label">还款账户:</span>
          <span class="value">{{ accountInfo.bankCardDesc }}</span>
        </div>
        <div class="title-two">
          <span class="label">放款日期:</span>
          <span class="value">{{
            repaymentPlan.billDate ? repaymentPlan.billDate : repaymentPlan.formateCreateTime
          }}</span>
        </div>
      </div>
    </div>
    <!-- 还款记录 -->
    <div class="bottom-content">
      <div class="big-title">
        <div class="line"></div>
        <div class="small-title">还款账单记录</div>
      </div>
      <div v-for="(repayPlan, index) in repaymentPlan.repayList" :key="index" class="bill-record">
        <div class="left">
          <div class="one">
            <div class="label mr24">第{{ repayPlan.loanTerm }}/{{ repaymentPlan.repayList.length }}期</div>
            <div class="label mr8">应还款:</div>
            <!-- 逾期 -->
            <div class="num mr8" v-if="repayPlan.planStatus === '2'">
              {{ repayPlan.overdueAmt + repayPlan.overdueInte + repayPlan.amtFine + repayPlan.inteFine }}
            </div>
            <div class="num mr8" v-else>{{ repayPlan.piamt }}</div>
            <div class="label">元</div>
          </div>
          <div class="one mt15">
            <div class="label mr24">最后还款日:</div>
            <div class="label mr8">{{ repayPlan.actualRepayDate }}</div>
          </div>
          <div class="one mt24">
            <div class="color-b7c mr8">包含</div>
            <div class="color-b7c ">本金</div>
            <!-- 逾期 -->
            <div class="color-b7c " v-if="repayPlan.planStatus === '2'">
              {{ repayPlan.overdueAmt }}
            </div>
            <div class="color-b7c " v-else>{{ repayPlan.normalCorp }}</div>

            <div class="color-b7c ">元+利息</div>
            <div class="color-b7c " v-if="repayPlan.planStatus === '2'">
              {{ repayPlan.overdueInte + repayPlan.amtFine + repayPlan.inteFine }}
            </div>
            <div class="color-b7c " v-else>{{ repayPlan.normalInte }}</div>
            <div class="color-b7c ">元</div>
          </div>
        </div>

        <div class="complete" v-if="repayPlan.planStatus === '3'">
          <img src="../../../static/image/repayment/bill/yhk-status.png" alt="" />
        </div>
        <div class="expire" v-if="repayPlan.planStatus === '2'">
          <img src="../../../static/image/repayment/bill/yq-status.png" alt="" />
        </div>
        <div class="wait" v-if="repayPlan.planStatus === '1'">
          <img src="../../../static/image/repayment/bill/dhk-status.png" alt="" />
        </div>
      </div>
    </div>

    <!-- 提前结清弹窗 -->
    <van-popup
      closeable
      v-model="openPreview"
      round
      position="bottom"
      :close-on-click-overlay="false"
      :style="{ minHeight: '40%' }"
      class="my-preview"
    >
      <div class="title">提前结清申请</div>
      <div class="list">
        <div class="list-item">
          <div class="label">应还金额(元)</div>
          <div class="value">{{ prepayDetail.totalRepaymentDesc }}</div>
        </div>
        <div class="list-item">
          <div class="label">还款账户</div>
          <div class="value">{{ accountInfo.bankCardDesc }}</div>
        </div>
        <!-- <div class="list-item">
          <div class="label">账户余额</div>
          <div class="value">320,000</div>
          <div class="getNew">
            <img src="../../../static/image/repayment/refresh.png" alt="" class="refresh" />
            <div class="text">余额刷新</div>
          </div>
        </div> -->
      </div>
      <div class="bottom-btn">
        <div class="tip">请确认银行卡余额充足，余额不足无法结清!</div>
        <van-button @click="startSettleBill" class="submit-remind">确认还款</van-button>
      </div>
    </van-popup>
    <div style="height:30px"></div>
  </div>
</template>
<script>
/**
 * 北京 -- 还款账单 -- 账单详情
 *     1、还款试算
 *     2、提前结清
 */
import { beijingDialog, clickControl } from '../../../utils/common';
import { advanceRepayment, prepaymen } from '@/controller/bank.js';
import { getBorrowingAndRepaymentPlanList } from '@/controller/bill.js';
import { toThousands } from '@/utils/common/common';
import { beijingLoanRepaymentQuery } from '@/request/interface/impower/Bank';

export default {
  name: 'BjbRepayBillDetails',
  data() {
    return {
      // 打开提前结清申请
      openPreview: false,
      repaymentPlan: {},
      isOverAdvanceRepayment: false,
      isShowPrepayBtn: false,
      prepayDetail: {},
      accountInfo: {},
      nowSettleBillStatus: 'none',
      nowSettleBillStatusDesc: ''
    };
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      this.loanNo = this.$route.query.loanNo;
      this.getPreInfo();
      this.queryBorrowingAndRepaymentPlan();
    },

    async queryBorrowingAndRepaymentPlan() {
      try {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        let applyUnionKey = this.$route.query.applyUnionKey;

        let borrowRes = await getBorrowingAndRepaymentPlanList({ loanNo: this.loanNo, applyUnionKey });
        if (borrowRes?.repaymentPlanList) {
          this.repaymentPlan = borrowRes.repaymentPlanList[0];

          // 100 结清中；101 合同未签订；102 审批作废；103 已签订；104 贷款作废； 105 还款中；106 已经结清；107 逾期；
          switch (this.repaymentPlan.repayStatus) {
            case '105': {
              this.isShowPrepayBtn = true;
              break;
            }
            case '107': {
              this.isShowPrepayBtn = true;
              break;
            }
            default: {
              this.isShowPrepayBtn = false;
              break;
            }
          }
        }
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '还款账单查询失败！',
          confirmButtonText: '确定'
        });
      } finally {
        this.$toasting.hide();
      }
    },

    // 获取账户汇总信息
    async getPreInfo() {
      try {
        let queryResult = await beijingLoanRepaymentQuery({ loanNo: this.loanNo });
        if (queryResult?.data?.success && queryResult.data.data) {
          this.accountInfo = queryResult.data.data;
          if (this.accountInfo.bankCard) {
            this.accountInfo.bankCardDesc = `${this.accountInfo.bankCard.substr(
              0,
              4
            )}********${this.accountInfo.bankCard.substr(
              this.accountInfo.bankCard.length - 4,
              this.accountInfo.bankCard.length
            )}`;
          }
        }
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '账户信息查询失败！',
          confirmButtonText: '确定'
        });
      }
    },

    // 还款试算
    async getAdvanceRepayment() {
      try {
        this.$toasting.show({ message: '还款试算中', forbidClick: true });
        let repayRes = await advanceRepayment({ loanNo: this.loanNo });
        if (repayRes?.data?.data) {
          this.isOverAdvanceRepayment = true;
          this.prepayDetail = repayRes.data.data;
          this.prepayDetail.totalRepaymentDesc = toThousands(repayRes.data.data.totalRepayment);
          this.openPreview = true;
        }
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '还款试算失败！',
          confirmButtonText: '确定'
        });
      } finally {
        this.$toasting.hide();
      }
    },

    previewSettle() {
      clickControl.call(this, this.getAdvanceRepayment());
    },

    startSettleBill() {
      clickControl.call(this, this.sendSettleBill());
    },

    async sendSettleBill() {
      try {
        if (!this.isOverAdvanceRepayment) {
          beijingDialog({
            message: '提前结清失败!',
            confirmButtonText: '确定'
          });
          return;
        }
        this.$toasting.show({ message: '结清申请中', forbidClick: true });

        let params = {
          loanNo: this.loanNo,
          productId: '1155',
          repayApplyAmt: this.prepayDetail.totalRepayment,
          repayType: '4',
          svcAmt: this.prepayDetail.serviceAmt
          // loanBalance: this.prepayDetail.loanBalance,
          // loanEndDate: this.prepayDetail.loanEndDate,
          // loanReceipt: this.prepayDetail.loanReceipt,
          // loanStartDate: this.prepayDetail.loanStartDate,
          // returnInt: this.prepayDetail.returnInt
        };
        let preRes = await prepaymen(params);
        if (preRes?.data?.success) {
          this.$toasting.success({ msg: '结清处理中' });
          // change status
          this.openPreview = false;
          this.nowSettleBillStatus = 'settle';
          this.nowSettleBillStatusDesc = '提前还款成功';
          this.isShowPrepayBtn = false;
          this.init();
        }
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '结清提交失败！',
          confirmButtonText: '确定'
        });
      } finally {
        this.$toasting.hide();
      }
    }
  }
};
</script>

<style scoped lang="scss">
.bill-details {
  min-height: 100vh;
  background: #f8f8f8;

  .top-title {
    background: url('../../../static/image/common/top-bg-small.png');
    background-size: contain;
    background-repeat: no-repeat;
    width: 100vw;
    height: 320px;
    padding: 32px;

    .company-logo {
      display: flex;
      justify-content: space-between;
    }

    .logo {
      width: 135px;
      height: 45px;
    }

    .tip {
      font-size: 24px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #ffffff;
      opacity: 0.6;
    }

    .information {
      width: 686px;
      background: #ffffff;
      box-shadow: 0px 0px 32px -8px rgba(78, 6, 6, 0.2);
      border-radius: 16px;
      margin-top: 28px;
      padding: 48px 32px 28px 40px;

      .title {
        display: flex;
        justify-content: space-between;

        .clear {
          font-size: 28px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #df0301;
        }
      }

      .num {
        font-size: 72px;
        font-family: DINAlternate-Bold, DINAlternate;
        font-weight: bold;
        color: #a90600;
      }

      .line {
        width: 606px;
      }

      .label {
        font-size: 28px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #8f8b8a;
      }

      .title-two {
        margin-top: 24px;
      }

      .value {
        font-size: 28px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #2b0e0c;
        margin-left: 19px;
      }
    }
  }

  .bottom-content {
    padding: 0 32px;
    margin-top: 220px;
  }

  .big-title {
    display: flex;
    align-items: center;
    margin-top: 40px;
    margin-bottom: 24px;

    .line {
      width: 6px;
      height: 24px;
      background: linear-gradient(129deg, #b80701 0%, #9a0400 100%);
      border-radius: 3px;
      margin-right: 14px;
    }

    .small-title {
      font-size: 28px;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: #2b0e0c;
    }
  }

  .bill-record {
    position: relative;
    padding: 36px 24px;
    width: 686px;
    background: #ffffff;
    border-radius: 16px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .one {
      display: flex;
      align-items: center;
    }

    .label {
      font-size: 22px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #2b0e0c;
    }

    .mr24 {
      margin-right: 24px;
    }

    .mr8 {
      margin-right: 8px;
    }

    .num {
      font-size: 32px;
      font-family: DINAlternate-Bold, DINAlternate;
      font-weight: bold;
      color: #a90600;
    }

    .mt15 {
      margin-top: 15px;
    }

    .mt24 {
      margin-top: 24px;
    }

    .color-b7c {
      font-size: 22px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #7b7b7c;
    }

    .complete {
      position: absolute;
      top: 0;
      right: 0;

      img {
        width: 106px;
        height: 40px;
      }
    }

    .expire {
      position: absolute;
      top: 0;
      right: 0;

      img {
        width: 106px;
        height: 40px;
      }
    }

    .wait {
      position: absolute;
      top: 0;
      right: 0;

      img {
        width: 106px;
        height: 40px;
      }
    }
  }
}

.my-preview {
  .title {
    height: 125px;
    line-height: 125px;
    font-size: 30px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #2b0e0c;
    text-align: center;
    border-bottom: 2px solid #f8f9fa;
  }

  .list {
    margin: 0 48px;
  }

  .list-item {
    height: 104px;
    line-height: 104px;
    border-bottom: 2px solid #f4f4f4;
    display: flex;
    position: relative;

    .label {
      font-size: 28px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #8f8b8a;
      width: 200px;
    }

    .value {
      font-size: 28px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #2b0e0c;
    }

    .getNew {
      position: absolute;
      top: 0px;
      right: 0px;
      display: flex;
      align-items: center;

      .refresh {
        width: 28px;
        height: 28px;
        margin-right: 6px;
      }

      .text {
        font-size: 28px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #a90600;
      }
    }
  }

  .bottom-btn {
    position: fixed;
    bottom: 0;
    width: 750px;
    height: 212px;
    background: #ffffff;
    box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.11);
    margin-top: 37px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .tip {
      font-size: 28px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #2b0e0c;
      text-align: center;
      margin-top: 28px;
    }

    .submit-remind {
      width: 686px;
      height: 88px;
      background: linear-gradient(129deg, #b80701 0%, #9a0400 100%), linear-gradient(129deg, #cd1101 0%, #a70500 100%);
      border-radius: 45px;
      margin: 24px auto;

      /deep/ .van-button__text {
        font-size: 28px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #ffffff;
      }
    }
  }
}
</style>

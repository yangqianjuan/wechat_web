<template>
  <div class="repayment-bill">
    <div class="top-box">
      <!-- 总数 -->
      <div class="top-total">
        <div class="item">
          <div class="tip">待还款笔数(笔)</div>
          <div class="num">{{ nowNeedRepayTotal }}</div>
        </div>
        <div class="item ">
          <div class="tip">待还款总金额(元)</div>
          <div class="num">{{ total }}</div>
        </div>
      </div>
      <div class="tip">请您按时履行还款义务，您的贷款及还款情况会上报央行征信系统，逾期将影响您的个人征信。</div>
    </div>
    <!-- 账单记录 -->
    <div class="title">
      <div class="line"></div>
      <div class="small-title">还款账单记录</div>
    </div>
    <div class="list">
      <template v-if="repaymentPlanList.length">
        <div
          v-for="(repay, repayIndex) in repaymentPlanList"
          :key="repayIndex"
          @click="goBillDetail(repay)"
          class="bill-list"
        >
          <div class="detail">
            <div class="left">
              <div class="one">
                <span class="name">借款金额:</span>
                <span class="money">{{ repay.loanAmountShow }}</span>
                <span>元</span>
              </div>
              <div class="one">
                <span class="name">放款时间:</span>
                <span>{{ repay.billDate ? repay.billDate : repay.formateCreateTime }}</span>
              </div>
            </div>
            <div class="progress" v-if="repay.repayStatus !== '106'">
              <img src="../../../static/image/repayment/bill/hkz-status.png" alt="" />
            </div>
            <div class="over" v-if="repay.repayStatus === '106'">
              <img src="../../../static/image/repayment/bill/yjq-status.png" alt="" />
            </div>
          </div>
          <div class="goDetail">
            <div class="text">查看详情</div>
            <img src="../../../static/image/repayment/right.png" alt="" class="right" />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="page-empty">
          <div class="img">
            <img src="../../../static/image/repayment/repay-empty-icon.png" />
          </div>
          <div class="tip">
            暂无还款账单记录!
          </div>
        </div>
      </template>
    </div>
    <div style="height:30px"></div>
  </div>
</template>
<script>
/**
 * 北京 -- 还款账单
 */
import { getBorrowingAndRepaymentPlanList } from '@/controller/bill.js';
import { toThousands } from '@/utils/common/common';
import { beijingDialog } from '../../../utils/common';

export default {
  name: 'BjbRepaymentBill',
  data() {
    return {
      repaymentPlanList: [],
      total: '',
      nowNeedRepayTotal: 0,
      applyUnionKey: ''
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.queryBorrowingAndRepaymentPlanList();
    },
    goBillDetail(item) {
      this.$router.push({
        path: '/bill_details',
        query: { applyUnionKey: this.$route.query.applyUnionKey, loanNo: item.loanNo, productId: item.productId }
      });
    },
    async queryBorrowingAndRepaymentPlanList() {
      try {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        let applyUnionKey = this.$route.query.applyUnionKey;
        let borrowRes = await getBorrowingAndRepaymentPlanList({ applyUnionKey });

        if (borrowRes) {
          this.repaymentPlanList = borrowRes.repaymentPlanList;
          this.total = toThousands(borrowRes.total);
          this.nowNeedRepayTotal = borrowRes.needRepayNumber;
          // repayStatus: "还款状态:贷款合同状态: 100 结清中,101 合同未签订,102 审批作废,103 已签订,104 贷款作废,105 还款中 106 已结清 107 逾期
        }
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '还款账单查询失败！',
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
.repayment-bill {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 40px 28px;

  .top-box {
    background: url('../../../static/image/repayment/bg-bill.png');
    background-size: 100%;
    background-repeat: no-repeat;
    width: 686px;
    padding: 0 62px 24px 48px;
    min-height: 296px;

    .top-total {
      display: flex;
      justify-content: space-between;
    }

    .tip {
      font-size: 24px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #ffffff;
      margin-top: 37px;
      opacity: 0.6;
    }

    .num {
      font-size: 48px;
      font-family: DINAlternate-Bold, DINAlternate;
      font-weight: bold;
      color: #ffffff;
    }
  }

  .title {
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

  .bill-list {
    width: 686px;
    background: #ffffff;
    border-radius: 16px;
    margin-bottom: 16px;
    padding: 32px 24px 16px;

    .detail {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 2px solid #f4f4f4;

      .one {
        margin-bottom: 11px;

        .name {
          font-size: 22px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #7b7b7c;
          margin-right: 8px;
        }

        .money {
          font-size: 32px;
          font-family: DINAlternate-Bold, DINAlternate;
          font-weight: bold;
          color: #a90600;
          margin-right: 8px;
        }
      }

      .progress {
        position: absolute;
        top: -16px;
        right: -24px;

        img {
          width: 106px;
          height: 40px;
        }
      }

      .over {
        position: absolute;
        top: -16px;
        right: -24px;

        img {
          width: 106px;
          height: 40px;
        }
      }
    }

    .goDetail {
      display: flex;
      align-items: center;
      margin-top: 16px;

      .right {
        width: 28px;
      }

      .text {
        font-size: 22px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #2b0e0c;
      }
    }
  }

  .page-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 686px;
    min-height: 924px;
    background: #ffffff;
    border-radius: 16px;

    .img {
      display: flex;
      justify-content: center;

      img {
        width: 280px;
        height: 190px;
      }
    }

    .tip {
      text-align: center;
      margin-top: 40px;
      font-size: 32px;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: #2b0e0c;
    }
  }
}
</style>

<template>
  <div class="bill-wrapper" v-show="isOverLoading">
    <bill-item @gotoDetail="gotoDetail" :billItemConfig="repaymentPlan"></bill-item>
    <div class="bill-item-detail-wrapper">
      <bill-item-detail
        v-for="(repayPlan, index) in repaymentPlan.repayList"
        :key="index"
        :total="repaymentPlan.repayList.length"
        :billItemDetail="repayPlan"
        :isCard="isCard"
      ></bill-item-detail>
    </div>
    <div class="foot-btn">
      <Button
        class="detail-btn"
        type="primary"
        @click="gotoApply"
        v-if="isShowPrepayBtn"
        :disabled="isOverPrepay"
      >{{prePayBtnDesc}}</Button>
    </div>
    <bill-modal v-if="modal1" @ok="ok" @cancel="cancel" :title="title" :btnDesc="btnDesc" :modalNote="modalNote">
      <p class="prepay-count">{{prepayDetail.totalRepaymentDesc}}</p>
      <p class="prepay-unit">应还金额(元)</p>
    </bill-modal>
  </div>
</template>

<script>
import BillItem from '@/common/components/bill/BillItem';
import BillItemDetail from '@/common/components/bill/BillItemDetail';
import BillModal from '@/common/components/bill/BillModal';
import { advanceRepayment, prepaymen } from '@/controller/bank.js';
import { getBorrowingAndRepaymentPlanList } from '@/controller/bill.js';
import { toThousands } from '@/utils/common/common';
export default {
  data() {
    return {
      isCard: true,
      repaymentPlan: {},
      modal1: false,
      total: '',
      preayCount: '500',
      isOverPrepay: false,
      isOverAdvanceRepayment: false,
      isOverLoading: false,
      isShowPrepayBtn: true,
      prePayBtnDesc: '提前结清申请',
      prepayDetail: {},
      title: '提前结清申请',
      btnDesc: '确认还款',
      modalNote: '请确认银行卡余额充足，余额不足无法结清'
    };
  },
  components: {
    'bill-item': BillItem,
    'bill-item-detail': BillItemDetail,
    'bill-modal': BillModal
  },
  created() {
    this.loanNo = this.$route.query.loanNo;
    this.productId = this.$route.query.productId;
    this.queryBorrowingAndRepaymentPlan();
  },
  methods: {
    gotoDetail() {
      let params = {
        productName: this.repaymentPlan.productName,
        productLogo: this.repaymentPlan.productLogo,
        loanNo: this.loanNo
      };
      this.$router.push({ path: '/loans_detail', query: { loanInfo: JSON.stringify(params) } });
    },
    gotoApply() {
      this.getAdvanceRepayment();
    },
    ok() {
      if (!this.isOverAdvanceRepayment) {
        this.$notify.error({ msg: '还款试算失败！' });
        return;
      }
      let params = {
        loanNo: this.loanNo,
        productId: this.productId,
        repayApplyAmt: this.prepayDetail.totalRepayment,
        repayType: '4',
        svcAmt: this.prepayDetail.serviceAmt,
        loanBalance: this.prepayDetail.loanBalance,
        loanEndDate: this.prepayDetail.loanEndDate,
        loanReceipt: this.prepayDetail.loanReceipt,
        loanStartDate: this.prepayDetail.loanStartDate,
        returnInt: this.prepayDetail.returnInt
      };
      prepaymen(params)
        .then((res) => {
          this.$notify.info({ msg: '提前结清请求提交成功！' });
          this.prePayBtnDesc = '提前结清处理中';
          this.isOverPrepay = true;
          this.cancel();
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg });
        });
    },
    cancel() {
      this.modal1 = false;
    },
    getAdvanceRepayment() {
      advanceRepayment({ loanNo: this.loanNo })
        .then((res) => {
          this.isOverAdvanceRepayment = true;
          this.prepayDetail = res.data.data;
          this.prepayDetail.totalRepaymentDesc = toThousands(res.data.data.totalRepayment);
          this.modal1 = true;
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg });
        });
    },
    queryBorrowingAndRepaymentPlan() {
      let applyUnionKey = this.$store.state.applyUnionKey;
      getBorrowingAndRepaymentPlanList({ loanNo: this.loanNo, applyUnionKey })
        .then((res) => {
          this.repaymentPlan = res.repaymentPlanList[0];
          if (this.repaymentPlan.repayStatus === '106') {
            this.isShowPrepayBtn = false;
          } else if (this.repaymentPlan.repayStatus === '100') {
            this.prePayBtnDesc = '提前结清处理中';
            this.isOverPrepay = true;
          }
        })
        .finally(() => {
          this.isOverLoading = true;
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.bill-wrapper {
  background: rgba(244, 246, 249, 1);
  min-height: 100vh;
  padding-bottom: 3.75rem;
  padding-top: 10px;
  .bill-item-detail-wrapper {
    background: rgba(244, 246, 249, 1);
    margin: 10px;
    border-radius: 7.5px;
    padding-bottom: 16vh;
  }
}
.foot-btn {
  position: fixed;
  bottom: 0;
  // left: 7vw;
  width: 100%;
  height: 15vh;
  display: flex;
  align-items: center;
  justify-content: center;
  // background-color: #ffff;
  /deep/.detail-btn {
    width: 86vw;
    height: 75px;
    span {
      font-size: 28px;
    }
  }
}
.prepay-count {
  font-weight: 600;
  color: rgba(51, 51, 51, 1);
  text-align: center;
  margin-top: 1.875rem;
}
.prepay-unit {
  font-weight: 400;
  color: rgba(51, 51, 51, 1);
  text-align: center;
  margin-top: 0.25rem;
}
.prepay-desc {
  font-weight: 400;
  color: rgba(127, 127, 127, 1);
  text-align: center;
}
</style>

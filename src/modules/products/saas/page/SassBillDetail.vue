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
        @click="getAdvanceRepayment"
        v-if="isShowPrepayBtn"
        :loading="isBtnLoading"
        :disabled="isOverPrepay"
      >{{prePayBtnDesc}}</Button>
    </div>

    <bill-modal v-if="modal1" @ok="ok" @cancel="cancel" :title="title" :btnDesc="btnDesc" :modalNote="modalNote">
      <p class="prepay-count">{{prePayPrincipalAmt}}</p>
      <p class="prepay-unit">应还金额(元)</p>
      <p class="prepay-count">{{showEAcountBalance}}</p>
      <p class="prepay-unit">电子账户余额(元)</p>
    </bill-modal>
  </div>
</template>
<script>
import BillItem from '@/common/components/bill/BillItem';
import BillItemDetail from '@/common/components/bill/BillItemDetail';
import BillModal from '@/common/components/bill/BillModal';
import { sassAdvanceRepayment } from '@/controller/SassLoan.js';
import { getBorrowingAndRepaymentPlanList } from '@/controller/bill.js';
import { toThousands } from '@/utils/common/common';
import { saasEaAcountBalance, saasPreRepay } from '@/request/interface/impower/Sass.js';
export default {
  data() {
    return {
      applyUnionKey: '',
      isCard: true,
      repaymentPlan: {},
      modal1: false,
      total: '',
      preayCount: '500',
      isOverPrepay: false,
      isOverAdvanceRepayment: false,
      isOverLoading: false,
      isBtnLoading: false,
      isShowPrepayBtn: true,
      prePayBtnDesc: '提前结清申请',
      prepayDetail: {},
      eAcountBalance: 0,
      showEAcountBalance: '',
      prePayPrincipalAmt: '',
      title: '提前结清申请',
      btnDesc: '确认结清',
      modalNote: '请确认电子账户余额充足，余额不足无法结清',
      msg: ''
    };
  },
  components: {
    'bill-item': BillItem,
    'bill-item-detail': BillItemDetail,
    'bill-modal': BillModal
  },
  created() {
    this.applyUnionKey = this.$store.state.applyUnionKey;
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
    ok() {
      if (this.prepayDetail.cusPayAmt > this.eAcountBalance) {
        this.$notify.error({ msg: '电子账户余额不足！' });
        return;
      }
      if (this.isBtnLoading) {
        return;
      }
      this.isBtnLoading = true;
      let params = this.prepayDetail;
      params.prePayFlag = '00';
      saasPreRepay(params)
        .then((res) => {
          this.prePayBtnDesc = '提前结清处理中';
          this.isOverPrepay = true;
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg });
        })
        .finally(() => {
          this.isBtnLoading = false;
        });
    },
    cancel() {
      this.modal1 = false;
    },
    getAdvanceRepayment() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      let params = {
        applyUnionKey: this.applyUnionKey,
        loanNo: this.loanNo
      };
      this.isBtnLoading = true;
      if (!this.prepayDetail.loanNo) {
        sassAdvanceRepayment(params)
          .then((res) => {
            this.isOverAdvanceRepayment = true;
            let prepayDetail = res?.data?.data;
            this.prePayPrincipalAmt = toThousands(prepayDetail.cusPayAmt);
            this.prepayDetail = prepayDetail;
            this.querySaasEaAcountBalance();
          })
          .catch((err) => {
            this.hideLoading();
            this.$notify.error({ msg: err.data.msg });
          });
      } else {
        this.querySaasEaAcountBalance();
      }
    },
    querySaasEaAcountBalance() {
      saasEaAcountBalance({ applyUnionKey: this.applyUnionKey })
        .then((res) => {
          let eAcountBalance = res?.data?.data?.accountBalance;
          this.eAcountBalance = eAcountBalance;
          this.showEAcountBalance = toThousands(eAcountBalance);
          this.modal1 = true;
        })
        .catch((err) => {
          this.hideLoading();
          this.$notify.error({ msg: err?.data?.msg });
        })
        .finally(() => {
          this.hideLoading();
        });
    },
    queryBorrowingAndRepaymentPlan() {
      let applyUnionKey = this.applyUnionKey;
      getBorrowingAndRepaymentPlanList({ applyUnionKey, loanNo: this.loanNo })
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
    },
    hideLoading() {
      this.isBtnLoading = false;
      this.$toasting.hide();
    }
  }
};
</script>
<style lang="scss" scoped>
.bill-wrapper {
  background: rgba(244, 246, 249, 1);
  min-height: 100vh;
  padding-bottom: 3.75rem;
  padding-top: 12px;
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
  width: 100%;
  height: 15vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /deep/.detail-btn {
    width: 86vw;
    height: 75px;
    span {
      font-size: 28px;
    }
  }
}
.prepay-count {
  font-size: 32px;
  font-weight: 600;
  color: rgba(51, 51, 51, 1);
  text-align: center;
  margin-top: 1.875rem;
}
.prepay-unit {
  font-size: 24px;
  font-weight: 400;
  color: rgba(51, 51, 51, 1);
  text-align: center;
  margin-top: 0.25rem;
}
.prepay-desc {
  font-size: 24px;
  font-weight: 400;
  color: rgba(127, 127, 127, 1);
  text-align: center;
}
</style>

<template>
  <div class="bill-wrapper" v-if="isOverLoading">
    <div class="title-wrapper" v-if="isOverLoading && repayList.length">
      <repay-item
        v-for="(repay, index) in repayList"
        :key="index"
        :billItemConfig="repay"
        @gotoDetail="gotoDetail(index)"
      ></repay-item>
    </div>
    <Modal v-model="isShowModel" title="还款详情" @on-ok="ok" @on-cancel="cancel">
      <p class="prepay-item">
        还款金额
        <span class="prepay-value">{{selectItem.realRepayAmt}}</span>
      </p>
      <p class="prepay-item">
        还款时间
        <span class="prepay-value">{{selectItem.date}}</span>
      </p>
      <p class="prepay-item">
        支付单号
        <span class="prepay-value">{{selectItem.repaySeqNo}}</span>
      </p>
      <p class="prepay-item">
        借款单号
        <span class="prepay-value">{{selectItem.loanReceiptNo}}</span>
      </p>
    </Modal>
    <div class="empty-wrapper" v-if="isOverLoading && !repayList.length">
      <img class="empty-icon" :src="emptyIcon" alt />
      <p>暂无记录</p>
    </div>
  </div>
</template>

<script>
import { queryCapRepayRetByLoanReceiptNo } from '@/request/interface/impower/Bill.js';
import { toThousands } from '@/utils/common/common';
import RepayItem from '@/common/components/bill/RepayItem';
export default {
  data() {
    return {
      isShowModel: false,
      selectItem: {},
      repayList: [],
      isOverLoading: false,
      emptyIcon: require('@/assets/imgs/icon/ic_empty.png')
    };
  },
  created() {
    this.getCapRepayRetByLoanReceiptNo();
  },
  components: {
    'repay-item': RepayItem
  },
  methods: {
    getCapRepayRetByLoanReceiptNo() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      let applyUnionKey = this.$store.state.applyUnionKey;
      queryCapRepayRetByLoanReceiptNo({ applyUnionKey })
        .then((res) => {
          let repayList = res?.data?.data;
          repayList.forEach((repay) => {
            let date = repay.transDate;
            repay.realRepayAmt = toThousands(parseInt(repay.realRepayAmt).toFixed(2));
            repay.date = `${date.substr(0, 4)}-${date.substr(4, 2)}-${date.substr(6, 2)}`;
          });
          this.repayList = repayList;
        })
        .finally(() => {
          this.$toasting.hide();
          this.isOverLoading = true;
        });
    },
    gotoDetail(index) {
      let repay = this.repayList[index];
      this.selectItem = repay;
      this.isShowModel = true;
    },
    ok() {},
    cancel() {}
  }
};
</script>
<style lang="scss" scoped>
.bill-wrapper {
  background: rgba(244, 246, 249, 1);

  .title-wrapper {
    padding: 12px 12px 0 12px;
    background: #ffffff;
    border-radius: 5px;
  }
}
.prepay-item {
  font-size: 26px;
  font-weight: 500;
  color: rgba(51, 51, 51, 1);
}
.prepay-value {
  color: rgba(117, 117, 117, 1);
  margin-left: 0.625rem;
}
.empty-wrapper {
  position: absolute;
  top: -50px;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .empty-icon {
    width: 200px;
    height: 200px;
  }
  p {
    font-size: 26px;
  }
}
</style>

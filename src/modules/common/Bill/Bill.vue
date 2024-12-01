<template>
  <div>
    <div class="bill-wrapper" v-if="repaymentPlanList.length && isOverLoading">
      <div class="title-wrapper">
        <p class="total">{{total}}</p>
        <p class="count">共{{repaymentPlanList.length}}笔待还</p>
      </div>
      <div class="bill-item">
        <bill-item
          v-for="(repay, repayIndex) in repaymentPlanList"
          :key="repay.id"
          @gotoDetail="gotoDetail(repayIndex)"
          :billItemConfig="repay"
        >
          <bill-item-detail
            v-for="(repayPlan, index) in repay.repayList"
            :key="index"
            :total="repay.repayList.length"
            :billItemDetail="repayPlan"
          ></bill-item-detail>
        </bill-item>
      </div>
    </div>
    <v-empty v-if="!repaymentPlanList.length && isOverLoading" :desc="emptyDesc"></v-empty>
  </div>
</template>

<script>
import empty from '@/common/components/common/Empty.vue';
import BillItem from '@/common/components/bill/BillItem';
import BillItemDetail from '@/common/components/bill/BillItemDetail';
import { BILL_ROUTER } from '@/utils/common/config.js';
import { getBorrowingAndRepaymentPlanList } from '@/controller/bill.js';
import { toThousands } from '@/utils/common/common';
export default {
  data() {
    return {
      repaymentPlanList: [],
      isOverLoading: false,
      emptyDesc: '暂无记录',
      total: '',
      applyUnionKey: ''
    };
  },
  components: {
    'bill-item': BillItem,
    'bill-item-detail': BillItemDetail,
    'v-empty': empty
  },
  created() {
    this.queryBorrowingAndRepaymentPlanList();
  },
  methods: {
    gotoDetail(repayIndex) {
      let prepay = this.repaymentPlanList[repayIndex];
      let nextPath = BILL_ROUTER[prepay.productId];
      this.$router.push({ path: nextPath, query: { loanNo: prepay.loanNo, productId: prepay.productId } });
    },
    queryBorrowingAndRepaymentPlanList() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      let applyUnionKey = this.$store.state.applyUnionKey;
      getBorrowingAndRepaymentPlanList({ applyUnionKey })
        .then((res) => {
          this.repaymentPlanList = res.repaymentPlanList;
          this.total = toThousands(res.total);
        })
        .finally((err) => {
          this.$toasting.hide();
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
  .title-wrapper {
    background: #ffffff;
    border-radius: 5px;
    padding: 27px 0 28px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    .total {
      font-size: 60px;
      font-weight: 500;
      color: rgba(51, 51, 51, 1);
    }
    .count {
      font-size: 26px;
      font-weight: 400;
      color: rgba(102, 102, 102, 1);
    }
  }
  .bill-item {
    padding: 0 10px 0 10px;
  }
}
</style>

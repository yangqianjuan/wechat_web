<template>
  <div class="bill-wrapper">
    <div v-if="borrowingApplyList.length && isOverLoading">
      <bill-item
        v-for="(borrowingApply, index) in borrowingApplyList"
        :key="borrowingApply.id"
        @gotoDetail="gotoDetail(index)"
        :billItemConfig="borrowingApply"
      ></bill-item>
    </div>
    <v-empty v-if="!borrowingApplyList.length && isOverLoading" :desc="emptyDesc"></v-empty>
  </div>
</template>

<script>
import BillItem from '@/common/components/bill/BillItem';
import empty from '@/common/components/common/Empty.vue';
import { getBorrowingApplyList } from '@/controller/bill.js';
import { BILL_ROUTER } from '@/utils/common/config.js';
export default {
  data() {
    return {
      borrowingApplyList: [],
      isOverLoading: false,
      emptyDesc: '暂无记录'
    };
  },
  components: {
    'bill-item': BillItem,
    'v-empty': empty
  },
  created() {},
  mounted() {
    this.getBorrowingApplyList();
  },
  methods: {
    gotoDetail(applyIndex) {
      let borrowingApply = this.borrowingApplyList[applyIndex];
      let payload = {
        productLogo: borrowingApply.productLogo,
        productName: borrowingApply.productName,
        loanAmount: borrowingApply.loanAmount,
        loanNo: borrowingApply.loanNo
      };
      if (borrowingApply.loanAppCode === '00') {
        let nextPath = BILL_ROUTER[borrowingApply.productId];
        this.$router.push({
          path: nextPath,
          query: { productId: borrowingApply.productId, loanNo: borrowingApply.loanNo }
        });
      } else {
        this.$router.push({ path: '/loans_detail', query: { loanInfo: JSON.stringify(payload) } });
      }
    },
    getBorrowingApplyList() {
      let applyUnionKey = this.$store.state.applyUnionKey;
      getBorrowingApplyList({ applyUnionKey })
        .then((borrowingApplyList) => {
          this.borrowingApplyList = borrowingApplyList;
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
  padding: 12px 12px 0 12px;
  min-height: 100vh;
  .title-wrapper {
    background: #ffffff;
    border-radius: 5px;
  }
}
</style>

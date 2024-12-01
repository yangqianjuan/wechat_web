<template>
  <div class="bill-wrapper">
    <div class="content" v-if="borrowingApplyList.length && isOverLoading">
      <bill-item
        v-for="(borrowingApply, index) in borrowingApplyList"
        :key="borrowingApply.id"
        :isLoans="true"
        @gotoDetail="gotoDetail(index)"
        :billItemConfig="borrowingApply"
      ></bill-item>
    </div>
    <v-empty v-if="!borrowingApplyList.length && isOverLoading" :desc="emptyDesc"></v-empty>
  </div>
</template>

<script>
import BillItem from '../../bill/common/BillItem';
import empty from '@/common/components/common/Empty.vue';
import { getGFBorrowingApplyList } from '@/controller/bill.js';
export default {
  /***
   * 广发的借款记录列表
   *
   * */
  data() {
    return {
      borrowingApplyList: [],
      isOverLoading: false,
      emptyDesc: '暂无借款记录',
      applyUnionKey: ''
    };
  },

  components: {
    'bill-item': BillItem,
    'v-empty': empty
  },

  created() {
    this.getBorrowingApplyList();
  },

  methods: {
    /**
     * 借款详情
     * */
    gotoDetail(applyIndex) {
      let borrowingApply = this.borrowingApplyList[applyIndex];
      if (borrowingApply && borrowingApply.loanNo) {
        let payload = {
          productLogo: borrowingApply.productLogo,
          productName: borrowingApply.productName,
          loanAmount: borrowingApply.loanAmount,
          loanNo: borrowingApply.loanNo
        };
        // loanAppCode 放款状态：00 放款成功 01 放款中 02 放款失败
        if (borrowingApply.loanAppCode === '00') {
          // 00 的时候跳到账单详情页
          this.$router.push({ path: '/xwe_loans_detail', query: { loanInfo: JSON.stringify(payload) } });
        }
      } else {
        this.$toasting.info({ msg: '暂无详情' });
      }
    },

    /**
     * 获取借款的列表
     * */
    getBorrowingApplyList() {
      this.applyUnionKey = this.$route.query.applyUnionKey;
      if (this.applyUnionKey) {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        getGFBorrowingApplyList({ applyUnionKey: this.applyUnionKey })
          .then((borrowingApplyList) => {
            this.borrowingApplyList = borrowingApplyList ? borrowingApplyList : [];
          })
          .catch((err) => {
            this.$notify.error({ msg: err?.data?.msg || '获取借款记录失败！' });
          })
          .finally(() => {
            this.isOverLoading = true;
            this.$toasting.hide();
          });
      } else {
        this.$notify.info({ msg: '暂无借款记录！' });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.bill-wrapper {
  padding-top: 16px;
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .content {
    flex: 1;
    overflow: auto;
    margin-bottom: 5vh;
  }
  .title-wrapper {
    background: #ffffff;
    border-radius: 5px;
  }
}
</style>

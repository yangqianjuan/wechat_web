<template>
  <div class="xwe-bill">
    <!-- 代还账单汇总 -->
    <div class="bill-wrapper" v-if="repaymentPlanList.length && isOverLoading">
      <div class="title-wrapper">
        <p class="total">{{total}}</p>
        <p class="count">共{{needRepayNumber}}笔待还</p>
      </div>
      <!-- 单笔借款 -->
      <div class="bill-item">
        <bill-item
          v-for="(repay, repayIndex) in repaymentPlanList"
          :key="repay.id"
          @gotoDetail="gotoDetail(repayIndex)"
          :billItemConfig="repay"
        ></bill-item>
      </div>
    </div>
    <!-- 空 -->
    <v-empty v-if="!repaymentPlanList.length && isOverLoading" :desc="emptyDesc"></v-empty>
  </div>
</template>

<script>
import empty from '@/common/components/common/Empty.vue';
import BillItem from './common/BillItem';
import { getBorrowingAndRepaymentPlanList } from '@/controller/bill.js';
import { toThousands } from '@/utils/common/common';
export default {
  /**
   * 代还账单列表
   * */
  data() {
    return {
      // 代还列表
      repaymentPlanList: [],
      // 页面加载
      isOverLoading: false,
      emptyDesc: '暂无待还记录',
      // 总的代还笔数
      total: '',
      // 申请标识
      applyUnionKey: '',
      // 需还款的笔数
      needRepayNumber: 0
    };
  },

  components: {
    'bill-item': BillItem,
    'v-empty': empty
  },

  created() {
    this.getList();
  },

  methods: {
    gotoDetail(repayIndex) {
      let prepay = this.repaymentPlanList[repayIndex];
      // 如果是已经结清，直接跳转到借款详情
      if (prepay) {
        if (prepay?.repayStatus === '106') {
          // console.log("拿到的值", prepay);
          let payload = {
            productLogo: prepay.productLogo,
            productName: prepay.productName,
            loanAmount: prepay.loanAmount,
            loanNo: prepay.loanNo
          };
          this.$router.push({ path: '/xwe_loans_detail', query: { loanInfo: JSON.stringify(payload) } });
        } else {
          let nextPath = '/xwe_bill_detail';
          this.$router.push({
            path: nextPath,
            query: {
              loanNo: prepay.loanNo,
              productId: prepay.productId,
              applyUnionKey: this.applyUnionKey
            }
          });
        }
      } else {
        this.$notify.info({
          msg: '暂无待还账单详情信息！'
        });
      }
    },
    getList() {
      this.applyUnionKey = this.$route.query.applyUnionKey;
      if (this.applyUnionKey) {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        // getGFBorrowingAndRepaymentPlanList
        getBorrowingAndRepaymentPlanList({ applyUnionKey: this.applyUnionKey })
          .then((res) => {
            if (res.repaymentPlanList) {
              this.repaymentPlanList = res.repaymentPlanList;
              this.total = toThousands(res.total);
              this.needRepayNumber = res.needRepayNumber;
            } else {
              this.$notify.info({
                msg: '待还账单为空！'
              });
            }
          })
          .catch((err) => {
            this.$notify.error({
              msg: err?.data?.msg || '待还账单获取失败！'
            });
          })
          .finally((_) => {
            this.$toasting.hide();
            this.isOverLoading = true;
          });
      } else {
        this.$notify.error({
          msg: '待还账单获取失败！'
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.xwe-bill {
  display: flex;
  width: 100%;
  height: 100vh;
  flex-direction: column;
  overflow: hidden;
  .bill-wrapper {
    // background: rgba(244, 246, 249, 1);
    height: 100%;
    width: 100%;
    padding-bottom: 50px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .title-wrapper {
      // background: #ffffff;
      background: #f4f6f9;
      border-radius: 5px;
      padding: 27px 0 28px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      .total {
        font-size: 66px;
        font-weight: 600;
        color: rgba(51, 51, 51, 1);
      }
      .count {
        font-size: 28px;
        font-weight: 500;
        color: rgba(102, 102, 102, 1);
        margin-top: 12px;
      }
    }
    .bill-item {
      flex: 1;
      overflow: auto;
      margin-top: 8px;
    }
  }
}
</style>

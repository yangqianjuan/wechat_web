<!--
 * @Author: yanpeng peng.yan01@weimob.com
 * @Date: 2023-07-03 17:40:52
 * @LastEditors: yanpeng peng.yan01@weimob.com
 * @LastEditTime: 2023-07-04 10:42:01
 * @FilePath: \mz-front\src\modules\products\bank-beiJing\page\infoModules\paymentHistory\PaymentHistory.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="payment_history">
    <template v-if="repayList.length">
      <div v-for="(item, index) in repayList" :key="index" class="list-item">
        <div class="top-inform">
          <div>
            <div class="one">
              <div class="label mr8">还款金额:</div>
              <div class="value mr8">{{ item.realRepayAmt }}</div>
              <div class="label">元</div>
            </div>
            <div class="one">
              <div class="label mr8">还款时间:</div>
              <div class="label">{{ item.date }}</div>
            </div>
          </div>
        </div>
        <div class="detail" @click="goPaymentDetail(item)">
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
          暂无还款记录!
        </div>
      </div>
    </template>
    <div style="height:30px"></div>
  </div>
</template>
<script>
/**
 * 还款记录
 */
import { queryCapRepayRetByLoanReceiptNo } from '@/request/interface/impower/Bill.js';
import { toThousands } from '@/utils/common/common';
import { beijingDialog } from '../../../utils/common';

export default {
  data() {
    return {
      repayList: []
    };
  },
  created() {
    this.getCapRepayRetByLoanReceiptNo();
  },
  methods: {
    async getCapRepayRetByLoanReceiptNo() {
      try {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        let applyUnionKey = this.$route.query.applyUnionKey;
        let result = await queryCapRepayRetByLoanReceiptNo({ applyUnionKey });
        if (result?.data?.data) {
          let repayList = result.data.data;
          repayList.forEach(repay => {
            let date = repay.transDate;
            repay.realRepayAmt = toThousands(parseInt(repay.realRepayAmt).toFixed(2));
            repay.date = `${date.substr(0, 4)}-${date.substr(4, 2)}-${date.substr(6, 2)}`;
          });
          this.repayList = repayList;
          console.log('this.repayList', this.repayList);
        }
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '还款记录查询失败！',
          confirmButtonText: '确定'
        });
      } finally {
        this.$toasting.hide();
        this.isOverLoading = true;
      }
    },

    goPaymentDetail(item) {
      this.$router.push({
        path: '/repayment_details',
        query: {
          params: JSON.stringify(item)
        }
      });
    }
  }
};
</script>
<style scoped lang="scss">
.payment_history {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 40px 32px;

  .list-item {
    width: 686px;
    background: #ffffff;
    border-radius: 16px;
    padding: 32px 24px 16px;
    margin-bottom: 16px;

    .top-inform {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 2px solid #f4f4f4;

      .one {
        display: flex;
        align-items: center;
        margin-bottom: 11px;

        .mr8 {
          margin-right: 8px;
        }

        .label {
          font-size: 22px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #7b7b7c;
        }

        .value {
          font-size: 32px;
          font-family: DINAlternate-Bold, DINAlternate;
          font-weight: bold;
          color: #a90600;
        }
      }
    }

    .detail {
      display: flex;
      align-items: center;
      margin-top: 16px;

      .text {
        font-size: 22px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #2b0e0c;
        margin-right: 4px;
      }

      .right {
        width: 28px;
        height: 28px;
      }
    }
  }

  .page-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 686px;
    min-height: 100vh;
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

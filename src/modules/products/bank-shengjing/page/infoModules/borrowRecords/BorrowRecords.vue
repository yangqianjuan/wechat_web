<!--
 * @Author: yanpeng peng.yan01@weimob.com
 * @Date: 2023-07-03 16:19:06
 * @LastEditors: yanpeng peng.yan01@weimob.com
 * @LastEditTime: 2023-07-04 10:39:38
 * @FilePath: \mz-front\src\modules\products\bank-beiJing\page\infoModules\borrowRecords\BorrowRecords.VUE
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="borrow-records">
    <template v-if="borrowingApplyList.length">
      <div v-for="(item, index) in borrowingApplyList" :key="index" class="list-item">
        <div class="top-inform">
          <div>
            <div class="one">
              <div class="label mr8">借款金额:</div>
              <div class="value mr8">{{ item.loanAmount }}</div>
              <div class="label">元</div>
            </div>
            <div class="one">
              <div class="label mr8">放款时间:</div>
              <div class="label">{{ item.createTime }}</div>
            </div>
          </div>
          <img :src="loanApplyStatus[item.loanAppCode]" alt="" class="common-status" />
        </div>
        <div class="detail" @click="goRecordDetail(item)">
          <div class="text">查看详情</div>
          <img src="../../../static/image/repayment/right.png" alt="" class="right" />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="page-empty">
        <div class="img">
          <img src="../../../static/image/repayment/borrow-empty-icon.png" />
        </div>
        <div class="tip">
          暂无借款记录!
        </div>
      </div>
    </template>

    <div style="height:30px"></div>
  </div>
</template>
<script>
import { getBjbBorrowingApplyList } from '@/controller/bill.js';
import { beijingDialog } from '../../../utils/common';

/**
 * 借款记录
 */
export default {
  data() {
    return {
      borrowingApplyList: [],
      // 借款状态
      loanApplyStatus: {
        // 放款成功
        '00': require('../../../static/image/repayment/success.png'),
        // 放款中
        // '01': require(''),
        // 放款失败
        '02': require('../../../static/image/repayment/fail.png')
      }
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.getBorrowingApplyList();
    },

    goRecordDetail(item) {
      this.$router.push({
        path: '/loan_details',
        query: {
          loanNo: item.loanNo
        }
      });
    },

    async getBorrowingApplyList() {
      try {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        let applyUnionKey = this.$route.query.applyUnionKey;
        let result = await getBjbBorrowingApplyList({ applyUnionKey });
        result && (this.borrowingApplyList = result);
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '借款记录查询失败！',
          confirmButtonText: '确定'
        });
      } finally {
        this.$toasting.hide();
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.borrow-records {
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

      .success {
        width: 116px;
      }

      .reject {
        width: 174px;
      }

      .common-status {
        width: 116px;
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

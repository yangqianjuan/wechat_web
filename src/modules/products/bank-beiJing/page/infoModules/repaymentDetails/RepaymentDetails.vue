<!--
 * @Author: yanpeng peng.yan01@weimob.com
 * @Date: 2023-07-03 17:53:46
 * @LastEditors: hsf
 * @LastEditTime: 2023-09-18 16:33:54
 * @FilePath: \mz-front\src\modules\products\bank-beiJing\page\infoModules\repaymentDetails\RepaymentDetails.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="repayment-details">
    <div class="loan-content">
      <div class="loan-bg">
        <div class="label">还款金额(元)</div>
        <div class="value">
          {{ singleRepayInfo.realRepayAmt }}
        </div>
      </div>
      <div class="load-list">
        <div class="load-item">
          <div class="label">还款时间</div>
          <div class="value">{{ singleRepayInfo.date }}</div>
        </div>
        <div class="load-item">
          <div class="label">还款状态</div>
          <div class="value">还款成功</div>
        </div>
        <div class="load-item">
          <div class="label">还款流水号</div>
          <div class="value">{{ singleRepayInfo.repaySeqNo }}</div>
        </div>
        <div class="load-item">
          <div class="label">借据单号</div>
          <div class="value">{{ singleRepayInfo.loanReceiptNo }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/**
 * 还款详情
 */
export default {
  data() {
    return {
      singleRepayInfo: {}
    };
  },

  created() {
    this.getQueryParseData(this.$route.query.params);
  },

  methods: {
    getQueryParseData(params) {
      if (params) {
        let info = JSON.parse(params);
        this.singleRepayInfo = info;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.repayment-details {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 40px 32px;
  .loan-content {
    width: 100%;
    height: calc(100vh - 40px);
    background: #ffffff;
    border-radius: 20px 20px 0px 0px;
    padding: 40px 32px;
    .loan-bg {
      background: url('../../../static/image/repayment/loan_bg.png');
      background-size: contain;
      background-repeat: no-repeat;
      width: 622px;
      height: 228px;
      padding-top: 48px;
      .label {
        font-size: 28px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #8f8b8a;
        text-align: center;
      }
      .value {
        font-size: 64px;
        font-family: DINAlternate-Bold, DINAlternate;
        font-weight: bold;
        color: #a90600;
        text-align: center;
        margin-top: 10px;
      }
    }
    .load-list {
      .load-item {
        height: 104px;
        line-height: 104px;
        display: flex;
        justify-content: space-between;
        border-bottom: 2px solid #f4f4f4;
        .label {
          font-size: 28px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #8f8b8a;
        }
        .value {
          font-size: 28px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #2b0e0c;
        }
        .preview {
          font-size: 28px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #df0301;
        }
        &:last-child {
          border-bottom: none;
        }
      }
    }
  }
}
</style>

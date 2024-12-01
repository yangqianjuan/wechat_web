<!--
 * @Author: yanpeng peng.yan01@weimob.com
 * @Date: 2023-06-25 09:10:25
 * @LastEditors: yanpeng peng.yan01@weimob.com
 * @LastEditTime: 2023-06-25 13:50:03
 * @FilePath: \mz-front\src\modules\products\bank-beiJing\page\borrow\repayment\Schedule.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="repaymentPlan beijing-common">
    <div class="top-back">
      <div class="card">
        <div class="title">还款总额(元)</div>
        <div class="num">{{ totalAmount }}</div>
        <div class="line"></div>
        <div class="way">还款方式：等额本息</div>
      </div>
    </div>
    <div class="repay-detail">
      <div class="table">
        <div class="thead">
          <div v-for="(item, index) in tableHead" :key="index" class="headItem">{{ item }}</div>
        </div>
        <div class="tbody">
          <div v-for="(item, index) in planList" :key="index" class="bodyItem">
            <div class="date">第 {{ item.loanTerm }} 期<br />({{ item.repayDate }})</div>
            <div class="num">{{ item.amt }}</div>
            <div class="num">{{ item.interest }}</div>
            <div class="num">{{ rowRepayAmountSum(item.amt + item.interest) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-back">
      <img src="../../../static/image/repayment/back-float-icon.png" @click="goBack" />
    </div>
  </div>
</template>
<script>
import { getBeijingRepaymentPlanTrial } from '@/request/interface/impower/UserInfo';
import { beijingDialog } from '../../../utils/common';

export default {
  /**
   * 还款计划
   * */
  data() {
    return {
      tableHead: ['期数/还款时间', '本金', '利息', '总金额'],
      planList: [],
      totalAmount: '',
      params: {}
    };
  },
  created() {
    this.init();
  },

  methods: {
    init() {
      try {
        let params = this.$route.query.params;
        if (params) {
          this.params = JSON.parse(params);
          this.getRepayPlan();
        }
      } catch (error) {
        console.log(error);
      }
    },

    async getRepayPlan() {
      try {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        let repayRes = await getBeijingRepaymentPlanTrial(this.params);
        if (repayRes?.data?.success && repayRes.data.data) {
          this.planList = repayRes.data.data.details;
          this.totalAmount = repayRes.data.data.totalAmount;
          return;
        }
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '查询失败！',
          confirmButtonText: '确定'
        });
      } finally {
        this.$toasting.hide();
      }
    },
    /**
     * repay amount sum
     * */
    rowRepayAmountSum(sum) {
      if (typeof sum === 'number') {
        return sum.toFixed(2);
      }

      return 0;
    },

    goBack() {
      this.$router.replace({ path: '/' });
    }
  }
};
</script>
<style lang="scss" scoped>
.repaymentPlan {
  min-height: 100vh;
  height: 100vh;
  background: #f4f6f9;
  width: 100vw;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;

  .top-back {
    //height: 320px;
    background-image: url('../../../static/image/common/top-bg-small.png');
    background-repeat: no-repeat;
    background-size: contain;
    padding: 40px 32px 0;

    .card {
      margin: 0 auto;
      width: 686px;
      height: 353px;
      background: #ffffff;
      box-shadow: 0px 0px 32px -8px rgba(78, 6, 6, 0.2);
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .title {
        font-size: 28px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #8f8b8a;
        margin-top: 48px;
      }

      .num {
        font-size: 88px;
        font-family: DINAlternate-Bold, DINAlternate;
        font-weight: bold;
        color: #a90600;
        margin-top: 16px;
      }

      .line {
        width: 400px;
        height: 4px;
        background: linear-gradient(90deg, rgba(207, 12, 0, 0) 0%, #b70900 51%, rgba(161, 5, 0, 0) 100%);
        border-radius: 1px;
        opacity: 0.2;
        margin-top: 8px;
      }

      .way {
        font-size: 28px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #2b0e0c;
        margin-top: 28px;
      }
    }
  }

  .repay-detail {
    padding-bottom: 60px;
    flex: 1;
    flex-direction: column;
    overflow: auto;

    .table {
      width: 686px;
      margin: 0 auto;
      margin-top: 32px;
      border-radius: 8px;
      border: 1px solid #e7e7e7;
      border-bottom: none;

      .thead {
        display: flex;

        .headItem {
          width: 160px;
          height: 66px;
          background: #f9f7f7;
          //border-radius: 8px;
          border-right: 1px solid #e7e7e7;
          border-bottom: 1px solid #e7e7e7;
          line-height: 66px;
          text-align: center;
          font-size: 24px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #8f8b8a;

          &:first-child {
            width: 204px;
          }

          &:last-child {
            border-right: none;
          }
        }
      }

      .tbody {
        .bodyItem {
          height: 80px;
          display: flex;

          .date {
            width: 204px;
            background: #f9f7f7;
            font-size: 24px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #8f8b8a;
            text-align: center;
            border-right: 1px solid #e7e7e7;
            border-bottom: 1px solid #e7e7e7;
          }

          .num {
            background-color: #fff;
            font-size: 24px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #2b0e0c;
            line-height: 80px;
            text-align: center;
            width: 160px;
            border-right: 1px solid #e7e7e7;
            border-bottom: 1px solid #e7e7e7;

            &:last-child {
              border-right: none;
            }
          }
        }
      }
    }
  }

  .page-back {
    position: absolute;
    left: -8px;
    bottom: 124px;

    img {
      width: 136px;
      height: 96px;
    }
  }
}
</style>

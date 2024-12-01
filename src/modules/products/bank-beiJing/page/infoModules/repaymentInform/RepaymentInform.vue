<!--
 * @Author: yanpeng peng.yan01@weimob.com
 * @Date: 2023-07-03 11:14:35
 * @LastEditors: yanpeng peng.yan01@weimob.com
 * @LastEditTime: 2023-07-03 18:04:43
 * @FilePath: \mz-front\src\modules\products\bank-beiJing\page\infoModules\RepaymentInform.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="repayment-inform">
    <div class="inform-content">
      <div class="inform-item">
        <div class="label">客户姓名</div>
        <div class="value">{{ repayBankCard.userName }}</div>
      </div>
      <div class="inform-item">
        <div class="label">账号</div>
        <div class="value">{{ desensitizationInfo(repayBankCard.bankCardNo, 'bankCard') }}</div>
      </div>
      <div class="inform-item">
        <div class="label">账号类型</div>
        <div class="value">一类户</div>
      </div>
      <div class="inform-item">
        <div class="label">账号余额(元)</div>
        <div class="value">{{ repayBankCard.remainingSum }}</div>
      </div>
    </div>
  </div>
</template>
<script>
/**
 * 还款账户信息
 */
import { queryReapyAcountInfo } from '@/controller/bank.js';
import { beijingDialog } from '../../../utils/common';
import { desensitizationInfo } from '@/utils/common/common.js';

export default {
  data() {
    return {
      repayBankCard: {},
      accountTypeMap: {
        0: '',
        1: '一类户',
        2: '二类户',
        3: '三类户'
      }
    };
  },

  created() {
    this.getRepayAccountInfo();
  },

  methods: {
    async getRepayAccountInfo() {
      try {
        this.$toasting.show({ message: '加载中...', forbidClick: true });
        let creditNo = this.creditNo;
        let result = await queryReapyAcountInfo({ creditNo: this.$route.query.creditNo, productId: '1155' });
        console.log('dadaaaaaa', result);
        this.repayBankCard = result;
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '账户信息查询失败！',
          confirmButtonText: '确定'
        });
      } finally {
        this.$toasting.hide();
      }
    },

    desensitizationInfo
  }
};
</script>

<style scoped lang="scss">
.repayment-inform {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 40px 32px;

  .inform-content {
    padding: 0px 32px;
    background: #ffffff;
    border-radius: 20px 20px 0px 0px;
    .inform-item {
      height: 104px;
      line-height: 104px;
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #f4f4f4;
      &:last-child {
        border-bottom: none;
      }
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
    }
  }
}
</style>

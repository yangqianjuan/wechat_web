<template>
  <div class="adance-payment-wrapper" v-if="isPageOverLoading">
    <div class="title-card-wrapper">
      <img class="logo" :src="logo" alt />
      <p class="prod-name">快享无忧分</p>
    </div>

    <div class="amount-wrapper">
      <p class="payment-title">预付款金额</p>
      <p class="amount">{{confirmInfo.advanceCharge}}</p>
    </div>

    <div class="loans-detail-wrapper">
      <div v-for="(item, key) in confirmInfo" :key="key">
        <div class="item-wrapper" v-if="confirmInfoKeyInfo[key]">
          <p class="confirm-key">{{confirmInfoKeyInfo[key]}}</p>
          <p class="confirm-val">{{item}}</p>
        </div>
      </div>
    </div>

    <Button class="sub-btn" type="primary" @click="nextStep">确认支付</Button>
  </div>
</template>

<script>
import { toThousands } from '@/utils/common/common';
import { errHandle } from '@/utils/common/common.js';
import { querySassLoansAdvanceCharge } from '@/request/interface/impower/Sass.js';
import { jdugeSaasLoanNextPath } from '@/controller/SassLoan.js';
export default {
  /**
   *  sass 预付款
   *
   * */
  name: 'AdvancePayment',
  data() {
    return {
      logo: 'https://prod-xm-1256921822.cos.ap-shanghai.myqcloud.com/audit_file/1037_1616644365023.jpg',
      confirmInfoKeyInfo: {
        actName: '户名',
        actNo: '账号',
        bankName: '开户行'
      },
      isPageOverLoading: false,
      confirmInfo: {},
      msg: ''
    };
  },
  methods: {
    init() {
      this.applyUnionKey = this.getUrlParam('applyUnionKey');
      this.getLoanNextPath();
    },
    getLoanNextPath() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      jdugeSaasLoanNextPath({ applyUnionKey: this.applyUnionKey })
        .then((nextPath) => {
          this.nextPath = nextPath;
          this.nextPathHanle(nextPath);
        })
        .catch((err) => {
          this.$toasting.hide();
          errHandle(this, err, '获取借款状态失败');
        });
    },

    // // 预付款额度查询
    getSassAdvanceCharge() {
      querySassLoansAdvanceCharge({ applyUnionKey: this.applyUnionKey })
        .then((res) => {
          let confirmInfo = res?.data?.data;
          confirmInfo.advanceCharge = toThousands(confirmInfo.advanceCharge.toFixed(2));
          this.confirmInfo = confirmInfo;
        })
        .catch((err) => {
          errHandle(this, err, '获取预付款失败');
        })
        .finally(() => {
          this.$toasting.hide();
          this.isPageOverLoading = true;
        });
    },

    // 下一步，路径的处理
    nextPathHanle(nextPath) {
      let applyUnionKey = this.applyUnionKey;
      // 携带 用户唯一标识
      let query = { applyUnionKey };
      if (nextPath === '/sass_contract_result') {
        // 进入合同审核结果页面
        query.msg = '您的转账记录已提交，请等待管理员确认到账';
        query.title = '转账记录审核结果';
        this.$toasting.hide();
        this.nextStep(query);
      } else if (nextPath === '/sass_transer_voucher') {
        // 上传转账凭证页
        this.getSassAdvanceCharge();
      } else if (nextPath === '/face_pp') {
        let facePPCBPath = `sign_sass_contract?applyUnionKey=${this.applyUnionKey}&isLoans=true`;
        facePPCBPath = encodeURIComponent(facePPCBPath);
        nextPath = `${nextPath}?callBackRouter=${facePPCBPath}`;
        this.$router.replace({ path: nextPath, query: { applyUnionKey: this.applyUnionKey } });
      } else if (nextPath === '/sign_sass_contract') {
        // 跳转签署销售合同  applyUnionKey 用户的标识   isLoans 借款的流程
        let facePPCBPath = `sign_sass_contract?applyUnionKey=${this.applyUnionKey}&isLoans=true`;
        this.$router.replace({ path: facePPCBPath });
      } else {
        this.$toasting.hide();
        // 处理下一步，在以上的情况都不满足的时候，下一步的路径是，默认接口返回数据的匹配的路径，（不匹配的其他页面）
        this.nextStep(query);
      }
    },

    // 确认支付，到下一步
    nextStep(query = '') {
      // 赋值
      if (!query.applyUnionKey) {
        let applyUnionKey = this.applyUnionKey;
        query = { applyUnionKey };
      }
      this.$router.replace({ path: this.nextPath, query });
    }
  }
};
</script>

<style lang="scss" scoped>
.adance-payment-wrapper {
  min-height: 100vh;
  background: #f4f6f9;
  padding-bottom: 2.1875rem;
}
.title-card-wrapper {
  background: linear-gradient(180deg, #1b6ffb 0%, #3a9fff 100%);
  padding: 0.8125rem 0 3.3125rem 1.5625rem;
}
.prod-name {
  font-size: 30px;
  font-weight: 500;
  color: #ffffff;
}
.amount-wrapper {
  width: 93vw;
  height: 10.5625rem;
  margin: 0 auto;
  margin-top: -2rem;
  background: #ffffff;
  border-radius: 7px;
  padding: 1.3125rem 0 3.0625rem;
  box-shadow: 0 -0.125rem 0.75rem 0px rgba(53, 82, 208, 0.45);
  .payment-title {
    padding-left: 1.3125rem;
    font-size: 26px;
    font-weight: 500;
    color: #333333;
  }
  .amount {
    text-align: center;
    font-size: 80px;
    font-weight: bold;
    color: #1b6ffb;
  }
}
.logo {
  width: 53px;
  height: 53px;
}
.loans-detail-wrapper {
  margin-top: 10px;
  background: #ffffff;
  margin-top: 10px;
  border-radius: 10px;
  .item-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px rgba(238, 241, 245, 1) solid;
    .last-item {
      font-size: 28px;
      font-weight: 400;
      color: rgba(27, 111, 251, 1);
    }
    .ic-arrow {
      height: 26px;
      width: 23px;
    }
  }
}
.sub-btn {
  width: 80%;
  margin-left: 10%;
  margin-top: 30px;
  background: #1b6ffb;
}
</style>

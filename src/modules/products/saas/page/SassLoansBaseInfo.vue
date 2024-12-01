<template>
  <div class="adance-payment-wrapper">
    <div class="title-card-wrapper">
      <img class="logo" :src="logo" alt />
      <p class="prod-name">快享无忧分</p>
    </div>

    <div class="amount-wrapper">
      <p class="payment-title">借款金额</p>
      <p class="amount">{{ advanceCharge }}</p>
    </div>

    <div class="loans-detail-wrapper">
      <div v-for="(item, key) in confirmInfo" :key="key">
        <div class="item-wrapper" v-if="confirmInfoKeyInfo[key]">
          <p class="confirm-key">{{confirmInfoKeyInfo[key]}}</p>
          <p class="confirm-val">{{item}}</p>
          <p class="rate-desc" v-if="key === 'interestRate'">（年化利率按照单利计算）</p>
        </div>
      </div>
    </div>

    <Button class="sub-btn" type="primary" :loading="isLoading" @click="gotoLoans">确认借款</Button>
  </div>
</template>

<script>
import { toThousands } from '@/utils/common/common';
import { errHandle } from '@/utils/common/common.js';
import { querySaasLoansLimit, saasLoans, queryLoanEcontract } from '@/request/interface/impower/Sass.js';
export default {
  /**
   *  sass 借款基础信息填写
   * */
  name: 'SassLoansBaseInfo',
  data() {
    return {
      logo: 'https://prod-xm-1256921822.cos.ap-shanghai.myqcloud.com/audit_file/1037_1616644365023.jpg',
      confirmInfoKeyInfo: {
        interestRate: '年化利率',
        loansTimeLimit: '借款期限',
        refundMode: '还款方式',
        loansPurpose: '借款用途',
        actName: '收款账户',
        loansUser: '借款人',
        idCradNum: '证件号'
      },
      confirmInfo: {
        interestRate: '',
        loansTimeLimit: '11个月',
        refundMode: '等额本金',
        loansPurpose: '个人经营',
        actName: '',
        debitCardNum: '',
        loansUser: '',
        idCradNum: ''
      },
      isLoading: false,
      applyUnionKey: '',
      advanceCharge: '',
      msg: '',
      nextPath: '/saas_loans_result'
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.applyUnionKey = this.getUrlParam('applyUnionKey');
      this.$toasting.show({ message: '加载中', forbidClick: true });
      this.formateConfirmInfo();
      this.queryLoanEcontractStatus();
    },
    formateConfirmInfo() {
      let userInfo = this.$store.state.userInfo;
      this.confirmInfo.loansUser = userInfo.name;
      this.confirmInfo.idCradNum = userInfo.idNo;
    },
    queryLoanEcontractStatus() {
      let applyUnionKey = this.applyUnionKey;
      queryLoanEcontract({ applyUnionKey })
        .then((res) => {
          let loanEcontractStatus = res?.data?.data;
          if (loanEcontractStatus) {
            this.getSaasLoansLimit();
          } else {
            this.$toasting.hide();
            let facePPCBPath = `sign_sass_contract?applyUnionKey=${applyUnionKey}&isLoans=true`;
            this.$notify.error({ msg: '合同签署失败，重新签署！' });
            setTimeout(() => {
              this.$router.replace({ path: facePPCBPath });
            }, 1500);
          }
        })
        .catch((_) => {
          this.$toasting.hide();
        });
    },
    gotoLoans() {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;
      let applyUnionKey = this.applyUnionKey;
      this.$toasting.show({ message: '加载中', forbidClick: true });
      saasLoans({ applyUnionKey })
        .then((res) => {
          this.$router.replace({ path: this.nextPath, query: { applyUnionKey } });
        })
        .catch((err) => {
          errHandle(this, err, '借款失败');
        })
        .finally(() => {
          this.$toasting.hide();
          this.isLoading = false;
        });
    },
    getSaasLoansLimit() {
      querySaasLoansLimit({ applyUnionKey: this.applyUnionKey })
        .then((res) => {
          let confirmInfo = res?.data?.data;
          this.confirmInfo.interestRate = '0%';
          this.confirmInfo.actName = confirmInfo.actName;
          this.advanceCharge = toThousands(confirmInfo.advanceCharge.toFixed(2));
        })
        .catch((err) => {
          errHandle(this, err, '借款基础信息查询失败');
        })
        .finally(() => {
          this.$toasting.hide();
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.adance-payment-wrapper {
  min-height: 100vh;
  background: #f4f6f9;
  padding-bottom: 5.1875rem;
}
.title-card-wrapper {
  background: linear-gradient(180deg, #1b6ffb 0%, #3a9fff 100%);
  padding: 0.8125rem 0 3.3125rem 1.5625rem;
  display: flex;
  align-items: center;
}
.prod-name {
  font-size: 30px;
  font-weight: 500;
  color: #ffffff;
  margin-left: 20px;
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
    position: relative;
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
.rate-desc {
  position: absolute;
  font-size: 18px;
  left: 60px;
  bottom: 3px;
}
.logo {
  width: 53px;
  height: 53px;
}
.sub-btn {
  width: 80%;
  margin-left: 10%;
  margin-top: 30px;
  background: #1b6ffb;
}
</style>

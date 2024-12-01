<template>
  <div class="loans-result-wrapper">
    <div class="title-wrapper" slot="title">
      <img class="status-icon" :src="loansResultIcon[loansSstatusCode]" alt />
      <p class="loans-result">{{loansResultText[loansSstatusCode]}}</p>
      <p class="desc" v-if="loansSstatusCode === '01'">{{msg}}</p>
    </div>
    <div class="sub-btn-wrapper">
      <Button class="sub-btn bg-blue" v-if="loansSstatusCode === '01'" @click="goBack">返回</Button>
      <Button class="sub-btn bg-blue" v-if="loansSstatusCode === '00'" @click="goBack">查看我的还款账单</Button>
      <Button class="sub-btn" v-if="loansSstatusCode === '02'" @click="goBack">关闭</Button>
    </div>
  </div>
</template>
<script>
import { saasLoanBeforeStatusQuery } from '@/request/interface/impower/Sass';
import { LOANS_RESULT_ICON, LOANS_RESULT_TEXT } from './utils/util';
export default {
  /**
   * 借款的申请结果
   * */
  name: 'SaasLoansResult',
  data() {
    return {
      approveIcon: require('@/assets/imgs/icon/ic_cre_succ.png'),
      loansResultIcon: LOANS_RESULT_ICON,
      loansResultText: LOANS_RESULT_TEXT,
      loansSstatusCode: '01',
      msg: '请勿取消关注，以防错过放款通知',
      timer: ''
    };
  },
  created() {
    this.applyUnionKey = this.$route.query.applyUnionKey;
  },
  beforeDestroy() {
    this.clearTimer();
  },
  methods: {
    queryLoansStatusInter() {
      this.timer = setInterval(this.queryLoansStatus, 5000);
    },
    queryLoansStatus() {
      saasLoanBeforeStatusQuery({ applyUnionKey: this.applyUnionKey }).then((res) => {
        let loansSstatusCode = res.data.data.loanStatus;
        this.loansSstatusCode = loansSstatusCode;
        if (loansSstatusCode !== '01') {
          this.clearTimer();
        }
      });
    },
    goBack() {
      this.$router.replace({ path: '/' });
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.loans-result-wrapper {
  height: 100%;
  background: rgba(244, 246, 249, 1);
}
.sub-btn-wrapper {
  position: fixed;
  bottom: 58px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  .sub-btn {
    width: 80%;
    margin-left: 10%;
  }
  .bg-blue {
    background: #1b6ffb;
    color: #ffffff;
    box-shadow: -2px 2px 5px 2px rgba(27, 111, 251, 0.26);
  }
  .bg-gary {
    color: #b0b0b0;
    box-shadow: -2px 2px 5px 2px rgba(153, 153, 153, 0.21);
    border-radius: 3px;
    border: 1px solid #b0b0b0;
  }
  .tip {
    text-align: center;
    margin-top: 10px;
    color: #1b6ffb;
  }
}
.warning-text {
  padding: 0 5vw;
  font-weight: 400;
  color: #db2b13;
  margin-top: 0.9375rem;
  background: #ffffff;
}
.title-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  background: #ffffff;
  .status-icon {
    height: 10rem;
  }
  .loans-result {
    margin-top: 30px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
  }
  .desc {
    margin-top: 8px;
    font-weight: 400;
    color: #0e80ed;
  }
}
</style>

export default {
  /**
   * beijing -- mixin
   * */
  data() {
    return {
      lockPage: true
    };
  },
  methods: {
    beijingPageMount(userCreditSummary) {
      if (userCreditSummary.creditInfoArr.length === 1) {
        const creditInfo = userCreditSummary.creditInfoArr[0];
        if (creditInfo?.agreeProduct === 1155) {
          this.loadBeijingHome(creditInfo);
          return;
        }

        this.lockPage = false;
        return;
      }

      this.lockPage = false;
      return;
    },

    loadBeijingHome(creditInfo) {
      // if (creditInfo.isBankOnEffect) {
      //   beijingDialog({
      //     message: '您的额度已失效，请重新授信!',
      //     confirmButtonText: '确定'
      //   });
      //   return;
      // }
      sessionStorage.setItem('beijing-user-credit-info', JSON.stringify(creditInfo));
      this.$router.replace({
        path: 'bjb_loans_home',
        query: {
          key: creditInfo.applyUnionKey,
          settle: creditInfo.loanSettlementStatus ? 'settle' : 'none',
          bankEffect: creditInfo.isBankOnEffect ? 'lapse' : 'none'
        }
      });
    }
  }
};

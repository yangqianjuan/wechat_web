
<template>
  <div class="login-wrapper"></div>
</template>
<script>
import { querySassContractUrl } from '@/request/interface/impower/Sass.js';
import { creditCallBackUrl, loansCallBackUrl } from './utils/replenishUtil';
export default {
  /**
   * sass 的合同预览
   * */
  name: 'SingSassContract',
  data() {
    return {
      liveVerifyTime: 0,
      productId: '',
      isLoans: false,
      applyUnionKey: ''
    };
  },
  created() {
    let isLoans = this.getUrlParam('isLoans');
    this.applyUnionKey = this.getUrlParam('applyUnionKey');
    this.productId = this.$store.state.productId;
    !isLoans ? this.getSassContractUrl() : this.getSassLoansContractUrl();
  },
  methods: {
    // 获取进件的合同路径
    getSassContractUrl() {
      this.$toasting.show({ message: '获取合同', forbidClick: true });
      let params = {
        docType: '01',
        productId: this.$store.state.productId
      };
      let env = process.env.NODE_ENV;
      let callBack = creditCallBackUrl[env];
      callBack = this.encode(callBack);
      querySassContractUrl(params)
        .then((res) => {
          let sassContractUrl = res?.data?.data;
          sassContractUrl = `${sassContractUrl}&appType=webPage&callback=${callBack}`;
          window.location.href = sassContractUrl;
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '获取合同路径失败!' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    // 获取借款的合同路径
    getSassLoansContractUrl() {
      this.$toasting.show({ message: '获取合同', forbidClick: true });
      let params = {
        docType: '04',
        productId: this.$store.state.productId
      };
      let env = process.env.NODE_ENV;
      let callBack = `${loansCallBackUrl[env]}&applyUnionKey=${this.applyUnionKey}`;
      callBack = this.encode(callBack);
      querySassContractUrl(params)
        .then((res) => {
          let saasLoansContractUrl = res?.data?.data;
          (saasLoansContractUrl = `${saasLoansContractUrl}&appType=webPage&callback=${callBack}`),
            (window.location.href = saasLoansContractUrl);
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '获取合同路径失败!' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    encode(str) {
      let encode = encodeURI(str);
      let base64 = btoa(encode);
      return base64;
    }
  }
};
</script>


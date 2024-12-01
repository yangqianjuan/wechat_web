<template>
  <div class="loans-result-wrapper"></div>
</template>
<script>
import { qeurySassLoansEcontractStatus } from '@/request/interface/impower/Sass.js';
export default {
  data() {
    return {
      applyUnionKey: ''
    };
  },
  created() {
    this.setWechatTitle('合同签署结果');
    this.applyUnionKey = this.getUrlParam('applyUnionKey');
  },
  mounted() {
    let sourceFrom = this.getUrlParam('src');
    if (sourceFrom) {
      this.getEcontractStatus();
    }
  },
  methods: {
    gotoBindBankCard() {
      this.$router.replace({ path: '/bind_bank_card' });
    },
    getEcontractStatus() {
      qeurySassLoansEcontractStatus().then((res) => {
        let isSucc = res.data.data;
        let query = {
          applyUnionKey: this.applyUnionKey,
          isLoans: true
        };
        if (!isSucc) {
          this.$notify.error({ msg: '合同签署失败！' });
          setTimeout(() => {
            this.$router.replace({ path: '/sing_sass_contract', query });
          }, 2000);
        } else {
          // let facePPPathCallBack = "sass_loans_baseinfo";
          // nextPath = `/face_pp?callBackRouter=${facePPPathCallBack}&applyUnionKey=${this.applyUnionKey}`;
          // this.$router.replace({ path: nextPath });
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
// .loans-result-wrapper {
//   height: 100%;
//   background: rgba(244, 246, 249, 1);
// }
// .sub-btn-wrapper {
//   position: fixed;
//   @include property-dpr("bottom", 58);
//   width: 100%;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   .sub-btn {
//     width: 76%;
//     margin-left: 12%;

//     font: 400 0.9375rem PingFangSC-Regular, PingFang SC;
//     @include property-dpr("height", 48);
//     @include property-dpr("margin-top", 10);
//   }
//   .bg-blue {
//     background: #1b6ffb;
//     color: #ffffff;
//     box-shadow: -2px 2px 5px 2px rgba(27, 111, 251, 0.26);
//   }
//   .bg-gary {
//     color: #b0b0b0;
//     box-shadow: -2px 2px 5px 2px rgba(153, 153, 153, 0.21);
//     border-radius: 3px;
//     border: 1px solid #b0b0b0;
//   }
//   .tip {
//     text-align: center;
//     @include property-dpr("margin-top", 10);
//     font: 400 0.75rem PingFangSC-Regular, PingFang SC;
//     color: #1b6ffb;
//   }
// }
// .warning-text {
//   padding: 0 5vw;
//   font-size: 12px;

//   font-weight: 400;
//   color: #db2b13;
//   margin-top: 0.9375rem;
//   background: #ffffff;
// }
// .title-wrapper {
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   @include property-dpr("margin-top", 30);
//   background: #ffffff;
//   .status-icon {
//     height: 10rem;
//     // @include property-dpr("height", 160);
//     // @include property-dpr("width", 160);
//   }
//   .loans-result {
//     @include property-dpr("margin-top", 20);
//     font: 500 1.25rem PingFangSC-Medium, PingFang SC;
//     color: rgba(51, 51, 51, 1);
//   }
//   .desc {
//     @include property-dpr("font-size", 15);
//     @include property-dpr("margin-top", 7);

//     font-weight: 400;
//     color: #0e80ed;
//   }
// }
</style>

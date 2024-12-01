<template>
  <div class="repay-acount-wrapper">
    <!-- 银行卡类型 -->
    <div v-if="repayBankCard && repayBankCard.type === '01'">
      <div class="info-item">
        <div class="title">姓名</div>
        <div class="desc black-col">{{repayBankCard.userName}}</div>
      </div>
      <div class="info-item">
        <!-- <div class="title">{{repayBankCard.type === '01' ? '银行卡号' : '电子账户'}}</div> -->
        <div class="title">银行卡号</div>
        <div class="bank-card-no">
          <span
            class="desc"
          >{{ bankCardShow ? formatBankNo(repayBankCard.bankCardNo) : desensitizationInfo(repayBankCard.bankCardNo, 'bankCard')}}</span>
          <img class="search-eye" v-if="!bankCardShow" :src="eyeClose" @click="bankCardShow = !bankCardShow" />
          <img class="search-eye" v-if="bankCardShow" :src="eyeOpen" @click="bankCardShow = !bankCardShow" />
        </div>
      </div>
      <div class="info-item">
        <div class="title">开户行</div>
        <div class="desc">{{repayBankCard.bankName}}</div>
      </div>

      <!-- <div class="info-item" v-if="repayBankCard.type === '02'">
        <div class="title">账户余额</div>
        <div class="desc">{{repayBankCard.eaccountBalance}}</div>
      </div>-->
    </div>
    <!-- 电子账户类型 -->
    <div v-if="repayBankCard && repayBankCard.type === '02'">
      <ElecAccountInfo :info="repayBankCard"></ElecAccountInfo>
    </div>
  </div>
</template>
<script>
import { queryReapyAcountInfo } from '@/controller/bank.js';
import ElecAccountInfo from '@/modules/products/xiao-meng-kd/page/repay/electronicAccountInfo/ElecAccountInfo.vue';
import { desensitizationInfo } from '@/utils/common/common.js';
import commonFilters from '@/utils/vue/filters/common.js';
export default {
  data() {
    return {
      creditNo: '',
      productId: '',
      repayBankCard: {},
      bankCardShow: false,
      eyeOpen: require('@/assets/imgs/icon/ic_eye.svg'),
      eyeClose: require('@/assets/imgs/icon/ic-eye-close.svg')
    };
  },
  components: { ElecAccountInfo },
  created() {
    this.creditNo = this.getUrlParam('creditNo');
    this.productId = this.getUrlParam('productId');
    this.getRepayAcountInfo();
  },
  methods: {
    getRepayAcountInfo() {
      this.$toasting.show({ message: '加载中...', forbidClick: true });
      let creditNo = this.creditNo;
      queryReapyAcountInfo({ creditNo, productId: this.productId })
        .then((repayBankCard) => {
          this.repayBankCard = repayBankCard;
          this.repayBankCard.routerProductId = this.productId;
          this.repayBankCard.routerCreditNo = this.creditNo;
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },
    desensitizationInfo,
    formatBankNo: commonFilters.formatBankNo
  },
  beforeDestroy() {}
};
</script>
<style lang="scss" scoped>
.repay-acount-wrapper {
  min-height: 100vh;
  padding-top: 30px;
}
.info-item {
  font-weight: 500;
  font-size: 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 27px;
  background: #ffffff;
  border-bottom: 1px solid #eee;
}
.desc {
  font-weight: 400;
  color: #333333;
}

.title {
  color: #333333;
  font-weight: 400;
}
.black-col {
  color: #333333;
}
.bank-card-no {
  display: flex;
  align-items: center;
  .search-eye {
    margin-left: 18px;
    width: 40px;
    height: 32px;
  }
}
</style>

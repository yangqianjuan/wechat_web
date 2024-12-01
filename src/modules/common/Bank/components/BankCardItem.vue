<template>
  <div class="bank-card--warpper">
    <div class="logo-warpper">
      <bank-card-icon :bankId="bankcardConfig.bankNo"></bank-card-icon>
    </div>
    <div class="bank-card-desc">
      <div class="bank-card-name">{{bankcardConfig.bankName}}</div>
      <div class="bank-card-type">储蓄卡</div>
      <div class="bank-card-no bank-card-num">
        <span
          class="desc"
        >{{ bankCardShow ? formatBankNo(bankcardConfig.bankCardNo) : desensitizationInfo(bankcardConfig.bankCardNo, 'bankCard')}}</span>
        <img class="search-eye" v-if="!bankCardShow" :src="eyeClose" @click="bankCardShow = !bankCardShow" />
        <img class="search-eye" v-if="bankCardShow" :src="eyeOpen" @click="bankCardShow = !bankCardShow" />
      </div>
    </div>
    <div class="change-btn" v-if="bankcardConfig.isInUse" @click="changeBankCard">变更申请</div>
    <div class="change-btn" v-else>使用中</div>
  </div>
</template>
<script>
import BankCardIcon from '@/common/components/bill/BankCardItem.vue';
import { desensitizationInfo } from '@/utils/common/common.js';
import commonFilters from '@/utils/vue/filters/common.js';

export default {
  props: {
    bankcardConfig: {
      type: Object,
      default() {
        return {};
      }
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      bankCardShow: false,
      eyeOpen: require('@/assets/imgs/icon/ic_eye.svg'),
      eyeClose: require('@/assets/imgs/icon/ic-eye-close.svg')
    };
  },
  components: {
    'bank-card-icon': BankCardIcon
  },
  methods: {
    changeBankCard() {
      !this.loading && this.$emit('changeBankCard', this.bankcardConfig);
    },
    desensitizationInfo,
    formatBankNo: commonFilters.formatBankNo
  }
};
</script>
<style lang="scss" scoped>
.bank-card--warpper {
  display: flex;
  height: 200px;
  border-radius: 0.1875rem;
  background: linear-gradient(270deg, #6ea2da 0%, #507ad2 100%);
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
  position: relative;
  .logo-warpper {
    display: flex;
    width: 50px;
    height: 50px;
    padding: 8px;
    margin-right: 20px;
    margin-top: 10px;
    background: #ffffff;
    border-radius: 50%;
  }
  .bank-card-desc {
    color: #ffffff;
    margin-top: 10px;
    .bank-card-name {
      font-size: 28px;
      font-weight: 500;
    }
    .bank-card-type {
      margin-top: 10px;
      font-size: 22px;
      font-weight: 400;
    }
    .bank-card-num {
      font-size: 48px;
      font-weight: 500;
      margin-top: 10px;
    }
  }
  .change-btn {
    position: absolute;
    top: 0.625rem;
    right: 0.625rem;
    border-radius: 0.5rem;
    font-size: 20px;
    padding: 4px 12px;
    color: #1b6ffb;
    background: #ffffff;
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
}
</style>

<template>
  <div class="bank-card--warpper">
    <div class="logo-warpper">
      <bank-card-icon :bankId="bankcardConfig.bankNo"></bank-card-icon>
    </div>
    <div class="bank-card-desc">
      <div class="bank-card-name">{{bankcardConfig.bankName}}</div>
      <div class="bank-card-type">储蓄卡</div>
      <div class="bank-card-num">{{bankcardConfig.bankCardNo}}</div>
    </div>
    <div class="change-btn" v-if="bankcardConfig.isInUse" @click="changeBankCard">变更申请</div>
    <div class="change-btn" v-else>使用中</div>
  </div>
</template>
<script>
import BankCardIcon from "@/common/components/bill/BankCardItem.vue";
export default {
  /**
   * 银行卡信息展示 （换绑卡）
   *
   * */
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
    return {};
  },
  components: {
    "bank-card-icon": BankCardIcon
  },
  created() {},
  methods: {
    changeBankCard() {
      if (!this.loading) {
        this.$emit("changeBankCard", this.bankcardConfig);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.bank-card--warpper {
  display: flex;
  padding: 0.625rem 0 0 0.9375rem;
  height: 5.1875rem;
  border-radius: 0.1875rem;
  background: linear-gradient(270deg, #6ea2da 0%, #507ad2 100%);
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
  position: relative;
  .logo-warpper {
    display: flex;
    height: 2.125rem;
    width: 2.125rem;
    padding: 0.3125rem;
    background: #ffffff;
    border-radius: 50%;
  }
  .bank-card-desc {
    margin-left: 0.625rem;
    color: #ffffff;
    .bank-card-name {
      font: 500 0.875rem PingFangSC-Medium, PingFang SC;
    }
    .bank-card-type {
      font: 400 0.625rem PingFangSC-Medium, PingFang SC;
    }
    .bank-card-num {
      font: 500 0.875rem PingFangSC-Medium, PingFang SC;
      margin-top: 0.625rem;
    }
  }
  .change-btn {
    position: absolute;
    top: 0.625rem;
    right: 0.625rem;
    font: 400 0.625rem PingFangSC-Regular, PingFang SC;
    border-radius: 0.5rem;
    padding: 1px 5px;
    color: #1b6ffb;
    background: #ffffff;
  }
}
</style>

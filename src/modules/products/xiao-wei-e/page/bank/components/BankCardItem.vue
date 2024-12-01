<template>
  <div class="card-manage">
    <div class="card-content">
      <div class="single-card">
        <div class="name">
          <div class="card-icon">
            <bank-card-icon :bankId="bankcardConfig.bankNo"></bank-card-icon>
          </div>
          <div class="desc">{{bankcardConfig.bankName}}</div>
        </div>
        <div class="no">
          <div class="number">{{bankcardConfig.bankCardNo | formatBankNo}}</div>
          <div class="type">储蓄卡</div>
        </div>
        <div class="status" v-if="bankcardConfig.isInUse" @click="changeBankCard">变更申请</div>
        <div class="status" v-else>使用中</div>
      </div>
    </div>
  </div>
</template>
<script>
import BankCardIcon from "@/common/components/bill/BankCardItem.vue";
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
.card-manage {
  display: flex;
  flex-direction: column;
  align-items: center;
  .card-content {
    .single-card {
      position: relative;
      width: 677px;
      height: 260px;
      padding: 30px;
      background: linear-gradient(200deg, #658aea 0%, #3552d0 100%);
      border-radius: 5px;
      margin-bottom: 20px;
      .name {
        display: flex;
        align-items: center;
        margin-bottom: 50px;
        .card-icon {
          margin-right: 30px;
          width: 80px;
          height: 80px;
          svg {
            width: 80px;
            height: 80px;
          }
        }
        .desc {
          height: 56px;
          font-size: 36px;
          font-weight: 600;
          color: #ffffff;
        }
      }
      .no {
        display: flex;
        align-items: center;
        width: 100%;
        .number {
          width: 80%;
          font-size: 36px;
          font-weight: 400;
          color: #ffffff;
        }
        .type {
          width: 20%;
          text-align: right;
          font-size: 26px;
          font-weight: 400;
          color: #ffffff;
        }
      }
      .status {
        position: absolute;
        right: 0;
        top: 20px;
        width: 146px;
        padding: 10px 0 10px 8px;
        text-align: center;
        background: #ffffff;
        border-radius: 100px 0px 0px 100px;
        font-size: 24px;
        font-weight: 550;
        color: #4767da;
      }
    }
  }
}
</style>

<template>
  <div class="credit-card">
    <div class="blue-bg"></div>
    <div class="item-content">
      <div class="prod-info-content">
        <div class="prod-info">
          <img class="prod-logo" :src="cardConfig.productImage" alt />
          <span class="prod-name">{{cardConfig.productName}}</span>
        </div>
        <div class="select-credit-btn" @click="gotoLoans">立即借款</div>
      </div>
      <div class="credit-info-content">
        <div class="credit-left">
          <span class="credit-amount">{{cardConfig.avaliableCredit}}</span>
          <span class="credit-desc">可用额度(元)</span>
        </div>
        <div class="credit-right">
          <div>
            <span class="credit-title">年化利率</span>
            <span class="credit-inet" v-if="isShowRate">(年化利率按照单利计算)</span>
            <span class="colon">:</span>
            <span class="credit-desc">{{isShowRate ? '0' : interestRateHandler(cardConfig.interestRate) }}%</span>
          </div>
          <div class="bottom-credit-desc">
            <span class="credit-title">最长期限:</span>
            <span class="credit-desc">{{cardConfig.crdTerm}}</span>
          </div>
        </div>
        <div class="credit-notice">
          <Icon type="ios-alert-outline" />可用额度仅供参考，请以银行结果为准；
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    cardConfig: {
      type: Object
    }
  },
  data() {
    return {
      isShowRate: false
    };
  },
  created() {
    let prodId = this.cardConfig.agreeProduct;
    this.isShowRate = prodId === 1023;
  },
  methods: {
    gotoLoans() {
      let creditInfo = this.cardConfig;
      creditInfo.show = true;
      this.$emit('getNowCredit', creditInfo);
    },
    interestRateHandler(value) {
      return value ? parseFloat(value * 100).toFixed(2) : '';
    }
  }
};
</script>

<style scoped lang="scss">
@import '../../assets/css/common.scss';
.credit-card {
  margin-top: 50px;
  position: relative;
  background-color: $white;
  width: 100%;
  box-shadow: 0px 0px 15px 15px rgba(179, 179, 179, 0.14);
  border-radius: 9px;
  .blue-bg {
    background: $bg-color-3;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 10px;
  }

  .item-content {
    padding-top: 37px;
    .prod-info-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px 0 46px;
      .prod-info {
        display: flex;
        align-items: center;
        .prod-logo {
          width: 54px;
          height: 54px;
          padding: 4px;
          border-radius: 50%;
          border: 1px solid #979797;
        }
        .prod-name {
          font-size: 32px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: $font-color-4;
          margin-left: 30px;
        }
      }
      .select-credit-btn {
        padding: 6px 22px;
        background: $bg-color-3;
        border-radius: 23px;
        color: $white;
        font-size: 26px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        margin-right: 40px;
      }
    }

    .credit-info-content {
      margin-left: 46px;
      .credit-inet {
        font-size: 20px;
        color: $default-font-color;
        margin-left: 8px;
      }
      .credit-left {
        margin-top: 22px;
        .credit-amount {
          font-weight: bold;
          margin-right: 12px;
          width: 274px;
          font-size: 32px;
          font-family: PingFangSC-Medium, PingFang SC;
          color: $bg-color-3;
        }
        .credit-desc {
          font-size: 26px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: $font-color-8;
        }
      }
      .credit-right {
        margin-top: 22px;
        display: flex;
        align-items: center;
        .colon {
          margin-left: 3px;
          font-size: 24px;
        }
        .credit-title {
          font-size: 26px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: $font-color-8;
        }
        .credit-desc {
          font-weight: bold;
          margin-left: 12px;
          font-size: 24px;
          font-family: PingFangSC-Medium, PingFang SC;
          color: $bg-color-3;
        }
        .bottom-credit-desc {
          margin-left: 60px;
        }
      }
      .credit-notice {
        margin-top: 22px;
        padding-bottom: 28px;
        font-size: 18px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: $font-color-9;
        i {
          color: $font-color-1;
          font-size: 30px;
          margin-right: 12px;
          font-weight: 500;
        }
      }
    }
  }
}
</style>

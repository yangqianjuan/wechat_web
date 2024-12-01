<template>
  <div class="card-wrapper">
    <div class="blue-bg"></div>
    <div class="item-contaner">
      <div class="prod-info-wrapper">
        <div class="prod-info">
          <img class="prod-logo" :src="cardConfig.productImage" alt />
          <span class="prod-name">{{ cardConfig.productName }}</span>
        </div>
        <template v-if="cardConfig.agreeProduct === 1155">
          <div
            class="select-credit-btn"
            v-if="!cardConfig.isBankOnEffect && !cardConfig.isBankQuotaPause"
            @click="gotoLoans"
          >
            立即借款
          </div>
          <div
            class="select-credit-btn"
            v-if="cardConfig.isBankOnEffect || cardConfig.isBankQuotaPause"
            @click="gotoLoans"
          >
            查看详情
          </div>
        </template>
        <template v-if="cardConfig.agreeProduct !== 1155">
          <div class="select-credit-btn" v-if="cardConfig.quotaValidFlag" @click="gotoLoans">立即借款</div>
        </template>
      </div>
      <div class="credit-info-wrapper">
        <div class="credit-left">
          <span class="credit-amount" v-if="cardConfig.quotaValidFlag">{{ cardConfig.avaliableCredit || 0 }}</span>
          <span class="credit-amount" v-if="!cardConfig.quotaValidFlag">{{ cardConfig.historyCredit || 0 }}</span>
          <template v-if="cardConfig.agreeProduct === 1155">
            <span class="creidt-desc" v-if="!cardConfig.isBankOnEffect">可用额度(元)</span>
            <span class="creidt-desc" v-if="cardConfig.isBankOnEffect">历史额度(元)</span>
          </template>
          <template v-if="cardConfig.agreeProduct !== 1155">
            <span class="creidt-desc" v-if="cardConfig.quotaValidFlag">可用额度(元)</span>
            <span class="creidt-desc" v-if="!cardConfig.quotaValidFlag">历史额度(元)</span>
          </template>
        </div>
        <div class="credit-right">
          <div class="left-content">
            <div class="bottom-credit-desc">
              <span class="cridit-title">申请单号:</span>
              <span class="cridit-desc">{{ cardConfig.applyId || '' }}</span>
            </div>
            <div class="bottom-credit-desc">
              <span class="cridit-title">年化利率</span>
              <span class="colon">:</span>
              <span class="cridit-desc">{{ isShowRate ? '0' : interestRateHandler(cardConfig.interestRate) }}%</span>
            </div>
          </div>
          <div class="right-content">
            <div class="bottom-credit-desc">
              <span class="cridit-title">授信日期:</span>
              <span class="cridit-desc">{{
                cardConfig.approveExpiryDate ? dateFormate(cardConfig.approveExpiryDate) : ''
              }}</span>
            </div>
            <div class="bottom-credit-desc">
              <span class="cridit-title">额度有效期:</span>
              <span class="cridit-desc">{{ cardConfig.crdEndDate ? dateFormate(cardConfig.crdEndDate) : '' }}</span>
            </div>
          </div>
        </div>
        <span class="cridit-inet">(年化利率按照单利计算)</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  /**
   * 授信产品信息的展示
   *
   * */
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
    },
    dateFormate(date) {
      if (date) {
        const year = date.substring(0, 4);
        const month = date.substring(4, 6);
        const day = date.substring(6, 8);
        return `${year}-${month}-${day}`;
      }
      return '';
    }
  }
};
</script>

<style scoped lang="scss">
.card-wrapper {
  display: flex;
  margin-top: 30px;
  padding: 12px 12px;
  box-shadow: 0px 0px 30px 1px rgba(94, 94, 94, 0.27);
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  position: relative;
}

.blue-bg {
  background: #3552d0;
  flex: 0 1 0.21875rem;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
}

.item-contaner {
  padding-top: 0.9375rem;
  padding-bottom: 0.9375rem;
  flex: 1 1 0.21875rem;

  .prod-info-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.25rem 0 1rem;

    .prod-info {
      display: flex;
      align-items: center;

      .prod-logo {
        width: 60px;
        height: 60px;
        padding: 4px;
        border-radius: 50%;
        // background-size: cover;
        border: 1px solid #eeeeee;
      }

      .prod-name {
        font-size: 30px;
        font-weight: 500;
        color: #333333;
        margin-left: 15px;
      }
    }

    .select-credit-btn {
      padding: 6px 22px;
      background: #3552d0;
      border-radius: 23px;
      color: #ffffff;
      font-weight: 500;
    }
  }
}

.cridit-inet {
  font-size: 20px;
  color: #333333;
  margin-left: 8px;
}

.credit-info-wrapper {
  margin-top: 12px;
  padding-left: 50px;

  .credit-left {
    flex-grow: 1;
    letter-spacing: 1px;

    .credit-amount {
      font-size: 34px;
      font-weight: bold;
      color: #3552d0;
      margin-right: 12px;
    }

    .credit-desc {
      letter-spacing: 1px;
      font-size: 24px;
      color: #333333;
    }
  }

  .gap-line {
    background: #979797;
    flex: 0 1 0.0625rem;
    height: 3.1875rem;
  }

  .credit-right {
    flex-grow: 1;
    margin-top: 0.3125rem;
    letter-spacing: 1px;
    display: flex;
    justify-content: space-between;

    .left-content {
      width: 50%;
    }

    .right-content {
      width: 50%;
    }

    .colon {
      margin-left: 3px;
      font-size: 24px;
    }

    .cridit-title {
      color: #333333;
    }

    .cridit-desc {
      font-weight: 500;
      color: #3552d0;
      margin-left: 0.3125rem;
    }

    .bottom-credit-desc {
      width: 100%;
      margin-top: 4px;
      margin-bottom: 4px;
    }
  }
}
</style>

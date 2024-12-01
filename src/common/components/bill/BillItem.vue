<template>
  <div class="bill-item-wrapper">
    <div class="item-hearder">
      <div class="logo-wrapper">
        <img class="company-logo" :src="billItemConfig.productLogo" />
        <span class="company-name">{{billItemConfig.productName}}</span>
      </div>
      <div class="bill-date">{{billItemConfig.billDate ? billItemConfig.billDate : billItemConfig.formateCreateTime}}</div>
    </div>
    <div class="item-body">
      <div>
        <p class="bill-count">{{billItemConfig.loanAmountShow}}</p>
        <p class="bill-count-unit">借款金额(元)</p>
      </div>
      <div class="bill-status" @click="gotoDetail">
        {{billItemConfig.loansStatusDesc}}
        <img class="ic-arrow" :src="icArrow" />
      </div>
      <img class="bill-status-icon" :src="icHasPayment" v-if="billItemConfig.repayStatus === '106'" alt />
    </div>
    <!-- <div class="wraning" v-if="billItemConfig.wraning">
      {{billItemConfig.wraning}}
    </div>-->
    <div class="bill-item-detail-wrapper">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  /**
   * 贷还账单展示列表
   * */
  props: {
    billItemConfig: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      icArrow: require('@/assets/imgs/icon/ic_arrow.png'),
      icHasPayment: require('@/assets/imgs/icon/ic_bill_clear.png')
    };
  },
  methods: {
    gotoDetail() {
      this.$emit('gotoDetail');
    }
  }
};
</script>
<style lang="scss" scoped>
.bill-item-wrapper {
  margin: 4px 20px 16px 20px;
  padding: 20px;
  border-radius: 6px;
  margin-top: 15px;
  background: #ffffff;
  position: relative;
}
.logo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
.item-hearder {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  .company-logo {
    height: 50px;
    max-width: 80px;
    background-size: 100% 100%;
  }
  .company-name {
    font-size: 30px;
    margin-left: 12px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
  }
  .bill-date {
    font-size: 36px;
    font-weight: 500;
    color: rgba(102, 102, 102, 1);
  }
}

.item-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .bill-count {
    font-size: 40px;
    font-weight: 600;
    color: rgba(51, 51, 51, 1);
    margin-bottom: 8px;
  }
  .bill-count-unit {
    font-size: 24px;
    font-weight: 500;
    // text-align: center;
    color: rgba(127, 127, 127, 1);
  }
  .bill-status {
    display: flex;
    align-items: flex-end;
    font-size: 28px;
    font-weight: 500;
    height: 100%;
    .ic-arrow {
      width: 34px;
      margin-left: 10px;
      height: 34px;
    }
  }
}
.bill-status-icon {
  width: 90px;
  position: absolute;
  right: 40px;
  top: 60px;
}
.wraning {
  font-size: 24px;
  margin-top: 20px;
  font-weight: 500;
  color: rgba(153, 153, 153, 1);
}
</style>

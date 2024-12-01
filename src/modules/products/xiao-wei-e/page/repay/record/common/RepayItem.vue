<template>
  <div class="bill-item-wrapper">
    <div class="item-hearder">
      <div class="logo-wrapper">
        <img class="company-logo" :src="billItemConfig.productImage" />
        <span class="company-name">{{billItemConfig.productName}}</span>
      </div>
      <div class="bill-date">{{billItemConfig.date}}</div>
    </div>
    <div class="item-body">
      <div>
        <p class="bill-count">{{billItemConfig.realRepayAmt}}</p>
        <p class="bill-count-unit">借款金额(元)</p>
      </div>
      <div class="bill-status" @click="gotoDetail">
        详情
        <img class="ic-arrow" :src="icArrow" />
      </div>
    </div>
    <div class="bill-item-detail-wrapper">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
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
      productLogo: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=316180510,103269786&fm=26&gp=0.jpg',
      icArrow: require('@/assets/imgs/icon/ic_arrow.png'),
      modal1: false
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
  padding: 12px 25px;
  border-radius: 6px;
  margin-top: 15px;
  background: #f4f6f9;
  -moz-box-shadow: 0 0 10px #f4f6f9;
  -webkit-box-shadow: 0 0 10px #f4f6f9;
  box-shadow: 0 0 10px #f4f6f9;
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
  padding-bottom: 10px;
  .company-logo {
    height: 40px;
    max-width: 80px;
    background-size: 100% 100%;
  }
  .company-name {
    font-size: 28px;
    margin-left: 12px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
  }
  .bill-date {
    font-size: 32px;
    font-weight: 500;
    color: rgba(102, 102, 102, 1);
  }
}

.item-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .bill-count {
    font-size: 38px;
    font-weight: 600;
    color: rgba(51, 51, 51, 1);
    margin-bottom: 6px;
  }
  .bill-count-unit {
    font-size: 24px;
    font-weight: 500;
    color: rgba(127, 127, 127, 1);
  }
  .bill-status {
    display: flex;
    align-items: center;
    font-size: 26px;
    font-weight: 500;
    height: 100%;
    .ic-arrow {
      width: 34px;
      margin-left: 10px;
      height: 34px;
      margin-bottom: -9px;
    }
  }
}
.bill-status-icon {
  width: 90px;
  position: absolute;
  right: 40px;
  top: 50px;
}
.wraning {
  font-size: 22px;
  margin-top: 20px;
  font-weight: 500;
  color: rgba(153, 153, 153, 1);
}
</style>

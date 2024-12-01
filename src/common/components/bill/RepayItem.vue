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
  margin: 0 20px 16px 20px;
  padding: 15px 20px 16px 20px;
  border-radius: 5px;
  margin-top: 10px;
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
  padding-bottom: 15px;
  .company-logo {
    height: 60px;
    max-width: 100px;
  }
  .company-name {
    font-size: 26px;
    margin-left: 4px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
  }
  .bill-date {
    font-size: 30px;
    font-weight: 400;
    color: rgba(102, 102, 102, 1);
  }
}

.item-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 400;
  .bill-count {
    font-size: 35px;
    font-weight: 600;
    color: rgba(51, 51, 51, 1);
  }
  .bill-count-unit {
    font-size: 24px;
    color: rgba(127, 127, 127, 1);
  }
  .bill-status {
    display: flex;
    align-items: center;
    padding: 10px 2px 4px 2px;
    font-size: 26px;
    .ic-arrow {
      width: 25px;
      margin-left: 10px;
      height: 30px;
    }
  }
}
.bill-status-icon {
  width: 80px;
  position: absolute;
  right: 2.275rem;
  top: 3.375rem;
}
.wraning {
  font-size: 24px;
  margin-top: 15px;
  font-weight: 400;
  color: rgba(153, 153, 153, 1);
}
</style>

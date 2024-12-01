<template>
  <!-- v-if="billItemDetail.planStatus !== '3'" -->
  <div :class="isCard ? 'card-wrapper' : 'bill-detail-wrapper'">
    <div class="detail-header">
      <p class="detail-trem">第{{billItemDetail.loanTerm}}/{{total}}期</p>
      <div>
        <span class="heder-date">{{billItemDetail.actualRepayDate}}</span>
        <span class="header-desc">还款</span>
      </div>
    </div>
    <p class="refund-desc">{{billItemDetail.piamt}}</p>
    <div class="refund-count-wrapper">
      <p class="body-count">应还金额(元)</p>
      <!-- <p>已逾期10天</p> -->
    </div>
    <div v-if="isCard" class="warning-info">
      本金{{billItemDetail.normalCorp}}
      <span v-if="billItemDetail.isShowNormalInte">+利息{{billItemDetail.normalInte}}</span>
      <span v-if="billItemDetail.planStatus === '2'">+逾期罚金{{billItemDetail.overduePunishmentAmt}}</span>
    </div>

    <img class="bill-status-icon" :src="billItemDetail.planStatusIcon" alt />
    <!-- <img class="bill-status-icon" :src="url" alt /> -->
  </div>
</template>
<script>
export default {
  props: {
    billItemDetail: {
      type: Object
    },
    isCard: {
      type: Boolean
    },
    total: {
      type: Number
    }
  },
  data: function () {
    return {
      url: require('@/assets/imgs/icon/ic_overdue.png')
    };
  },
  created() {}
};
</script>
<style lang="scss" scoped>
.card-wrapper {
  padding: 8px 18px;
  position: relative;
  border-radius: 4px;
  // background: #ffffff;
  background: #f4f6f9;
  -moz-box-shadow: 0 0 10px #f4f6f9;
  -webkit-box-shadow: 0 0 10px #f4f6f9;
  box-shadow: 0 0 10px #f4f6f9;
  margin-top: 16px;
  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .header-desc {
      margin-left: 14px;
    }
    .heder-date {
      margin-left: 6px;
    }
  }
  .refund-desc {
    font-size: 32px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
  }
  .detail-trem {
    font-size: 24px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
  }
  .body-desc {
    margin-top: 8px;
  }
  .refund-count-wrapper {
    display: flex;
    align-items: space;
    justify-content: space-between;
  }
  .warning-info {
    font-size: 22px;
  }
}
.bill-detail-wrapper {
  border-radius: 5px;
  margin-top: 18px;
  font-size: 22px;
  padding-top: 10px;
  position: relative;
  font-weight: 400;
  color: rgba(127, 127, 127, 1);
  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #eef1f5;
    padding-top: 10px;
    .header-desc {
      margin-left: 8px;
    }
    .heder-date {
      margin-left: 6px;
    }
  }
  .refund-desc {
    margin-top: 12px;
    font-size: 28px;
    font-weight: 600;
    color: rgba(51, 51, 51, 1);
  }
  .detail-trem {
    font-size: 24px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
  }
  .body-desc {
    margin-top: 12px;
  }
  .refund-count-wrapper {
    margin-top: 9px;
    display: flex;
    align-items: space;
    justify-content: space-between;
  }
  .warning-info {
    margin-top: 18px;
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.bill-status-icon {
  width: 100px;
  position: absolute;
  right: 20px;
  top: 35px;
}
</style>

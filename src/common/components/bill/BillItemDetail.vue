<template>
  <div :class="isCard ? 'card-wrapper' : 'bill-detail-wrapper'" v-if="billItemDetail.planStatus !== '3'">
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
  }
};
</script>
<style lang="scss" scoped>
.card-wrapper {
  padding: 20px;
  font-size: 24px;
  position: relative;
  font-weight: 400;
  color: rgba(127, 127, 127, 1);
  background: #ffffff;
  margin-top: 0.625rem;
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
    margin-top: 16px;
    font-size: 32px;
    font-weight: 600;
    color: rgba(51, 51, 51, 1);
  }
  .detail-trem {
    font-size: 24px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
  }
  .body-desc {
    margin-top: 14px;
  }
  .refund-count-wrapper {
    margin-top: 12px;
    display: flex;
    align-items: space;
    justify-content: space-between;
  }
  .warning-info {
    margin-top: 18px;
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
    margin-top: 18px;
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
  width: 5rem;
  position: absolute;
  right: 0.875rem;
  top: 3.375rem;
}
</style>

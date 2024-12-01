<template>
  <div class="apply-record-wrapper">
    <div v-if="applyList.length && isOverLoading">
      <div class="apply-record-item-wrapper" v-for="(apply, applyIndex) in applyList" :key="apply.applyId">
        <div class="apply-item-top">
          <div class="top-left">
            <img :src="apply.productImage" class="logo" />
            <p class="product-name">{{ apply.productName }}</p>
          </div>
          <div class="apply-status">{{ approveCode[apply.applyStatus] }}</div>
        </div>
        <div class="credit-amt" v-if="apply.applyStatus === 'PASS'">
          <div class="num">{{ apply.approveCredit }}</div>
          <div class="label">授信额度（元）</div>
        </div>
        <div class="apply-item-body">
          <div class="desc-item">
            <p class="product-desc">申请单号:</p>
            <p class="product-num">{{ apply.applyId || '' }}</p>
          </div>
          <div class="desc-item" v-if="apply.applyStatus === 'PASS'">
            <p class="product-desc">授信日期:</p>
            <p class="product-num">{{ apply.creditDate ? dateFormate1(apply.creditDate) : '' }}</p>
          </div>
          <div class="desc-item" v-else>
            <p class="product-desc">申请时间:</p>
            <p class="product-num">{{ apply.applyDate ? dateFormate1(apply.applyDate) : '' }}</p>
          </div>
        </div>
        <div class="apply-item-body" v-if="apply.applyStatus === 'PASS'">
          <div class="desc-item year-rate-option">
            <span class="product-desc">年化利率:</span>
            <span class="product-num"
              >{{ String(apply.productId) === '1023' ? '0' : interestRateHandler(apply.interestRate) }}%</span
            >
          </div>
          <div class="desc-item">
            <p class="product-desc">额度有效期:</p>
            <p class="product-num">{{ apply.crdTerm || '' }}</p>
          </div>
        </div>
        <div class="cridit-inet" v-if="apply.applyStatus === 'PASS'">(年化利率按照单利计算)</div>
        <img
          class="arrow"
          v-if="apply.applyStatus !== 'FAIL' && String(apply.productId) === '1051'"
          :src="icArrow"
          @click="gotoDetail(applyIndex)"
        />
        <img
          class="arrow"
          v-else-if="apply.applyStatus === 'APPLYING'"
          :src="icArrow"
          @click="gotoDetail(applyIndex)"
        />
      </div>
    </div>
    <v-empty v-if="!applyList.length && isOverLoading" :desc="emptyDesc">
      <van-button @click="gotoApply" class="record-btn foot-operate-btn" type="primary">马上去申请</van-button>
    </v-empty>
  </div>
</template>
<script>
import sanXianMixin from './mixin/sanXianMixin';
import commonMixin from './mixin/commonMixin';
export default {
  name: 'ApplyRecord',
  mixins: [commonMixin, sanXianMixin]
};
</script>
<style lang="scss" scoped>
.apply-record-wrapper {
  min-height: 100vh;
  background: rgba(244, 246, 249, 1);
  .apply-record-item-wrapper {
    background: #ffffff;
    position: relative;
    padding: 12px 24px;
    border: 1px solid rgba(244, 246, 249, 1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .credit-amt {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      .num {
        margin-left: 70px;
        font-size: 38px;
        font-weight: bold;
        /* color: #3552d0; */
        margin-right: 12px;
      }
      .label {
        letter-spacing: 1px;
        font-size: 26px;
        color: #333333;
        font-weight: 400;
      }
    }
    .apply-item-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .top-left {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .logo {
          width: 66px;
          background-size: 100% 100%;
          margin-right: 4px;
        }
        .product-name {
          font-size: 26px;
          font-weight: 500;
          color: rgba(51, 51, 51, 1);
          margin-right: 20px;
        }
        .product-tag-wrapper {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          flex: 1 1 7.625rem;
        }
        .product-tag {
          background: rgba(239, 245, 255, 1);
          font-size: 22px;
          font-weight: 500;
          color: rgba(57, 130, 255, 1);
          text-align: center;
          margin-right: 20px;
          padding: 4px 8px;
          margin-top: 4px;
        }
      }
      .apply-status {
        font-size: 26px;
        font-weight: 500;
        white-space: nowrap;
        color: rgba(27, 111, 251, 1);
      }
    }
    .apply-item-body {
      display: flex;
      justify-content: space-between;
      margin-top: 4px;
      padding: 0 72px;
      .year-rate-option {
        display: block !important;
      }
      .desc-item {
        width: 50%;
        display: flex;
        align-items: center;

        .product-desc {
          font-size: 22px;
          font-weight: 400;
          color: rgba(117, 117, 117, 1);
        }
        .product-num {
          margin-left: 4px;
          text-align: center;
          font-size: 22px;
          font-weight: 500;
          color: rgba(117, 117, 117, 1);
          /* color: rgba(51, 51, 51, 1); */
        }
      }
    }
    .cridit-inet {
      padding: 0 72px;
      font-size: 20px;
      color: #333333;
      /* margin-bottom: -8px; */
    }
  }
  .arrow {
    padding: 10px;
    width: 45px;
    position: absolute;
    right: 15px;
    bottom: 8px;
  }
}
.record-btn {
  background: rgba(27, 111, 251, 1);
  margin-top: 42px;
  width: 33%;
  padding: 4px 0;
  height: unset;
  /deep/.van-button__content {
    padding: 12px 0;
  }
}
</style>

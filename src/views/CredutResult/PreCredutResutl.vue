<template>
  <div class="loans-result-wrapper">
    <div class="product-wrapper">
      <img class="product-logo" :src="applyInfo.productImage" alt="产品logo" />
      <p class="product-name">{{applyInfo.productName}}</p>
    </div>
    <div class="title-wrapper" slot="title">
      <img class="logo" :src="approveIconCode[applyInfo.applyStatus]" alt />
      <p class="loans-result">{{approveCode[applyInfo.applyStatus]}}</p>
      <p class="desc">{{approveStatus}}</p>
    </div>
    <div class="warning-text" v-if="applyInfo.applyStatus === 'PASS'">{{warnText}}</div>
    <Button
      class="sub-btn"
      type="primary"
      @click="goBackHome"
    >{{applyInfo.applyStatus === "PASS" ? '查看我的额度，去借款' : '关闭'}}</Button>
  </div>
</template>
<script>
import { APPROVE_CODE, APPROVE_ICON } from '@/utils/common/config';
import { WARN_TEXT_BYPROD } from '@/modules/products/xiao-meng-kd/page/loans/config.js';
export default {
  name: 'PreCreditResult',
  data() {
    return {
      logo: require('@/assets/imgs/icon/ic_logo.png'),
      resIcon: require('@/assets/imgs/icon/ic_result.png'),
      succIcon: require('@/assets/imgs/icon/ic_cre_succ.png'),
      applyingIcon: require('@/assets/imgs/icon/ic_cre_ing.png'),
      failIcon: require('@/assets/imgs/icon/ic_cre_fail.png'),
      isFistCome: true,
      approveStatus: '预计1天内完成审核',
      applyInfo: {},
      approveCode: APPROVE_CODE,
      approveIconCode: APPROVE_ICON,
      warnText: ''
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.setWechatTitle('申请结果');
      this.applyInfo = JSON.parse(this.$route.query.applyInfo || {});
      this.warnText = WARN_TEXT_BYPROD[this.applyInfo.productId];
      this.jdugeApplyDesc();
    },
    goBackHome() {
      this.applyInfo.applyStatus === 'PASS'
        ? this.$router.replace({ path: '/', query: { isShowList: true } })
        : this.$router.back(-1);
    },
    jdugeApplyDesc() {
      let applyStatus = this.applyInfo.applyStatus;
      let approveDesc = this.approveCode[applyStatus];
      this.approveStatus = '';
      approveDesc === '审核中' && (this.approveStatus = '预计1天内完成审核');
      approveDesc === '审核拒绝' && (this.approveStatus = '很抱歉，暂时无法为你提供借款服务');
    }
  }
};
</script>
<style lang="scss" scoped>
.loans-result-wrapper {
  height: 100%;
  background: #ffffff;
}
.product-wrapper {
  display: flex;
  align-items: center;
  margin-top: 40px;
  .product-logo {
    width: 60px;
    height: 60px;
    margin-left: 40px;
  }
  .product-name {
    font-size: 28px;
    font-weight: 400;
    color: rgba(51, 51, 51, 1);
    margin-left: 20px;
  }
}
.sub-btn {
  width: 80%;
  margin-left: 10%;
  font-size: 26px;
  margin-top: 55px;
  bottom: 40px;
  background: rgba(27, 111, 251, 1);
}
.title-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 40px;
  background: #ffffff;
  .logo {
    height: 8rem;
  }
  .loans-result {
    font-size: 28px;
    margin-top: 40px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
  }
  .desc {
    font-size: 28px;
    margin-top: 20px;
    font-weight: 400;
    color: rgba(134, 134, 134, 1);
  }
}
.warning-text {
  padding: 0 5vw;
  font-size: 24px;
  font-weight: 400;
  color: #db2b13;
  margin-top: 0.9375rem;
  background: #ffffff;
}
</style>

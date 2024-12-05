<template>
  <div>
    <div class="elec-account-info" v-if="Object.keys(elecInfo).length">
      <div class="option">
        <div class="title">客户姓名</div>
        <div class="desc">{{ elecInfo.userName }}</div>
      </div>
      <div class="fill"></div>
      <div class="option">
        <div class="title">电子账户</div>
        <div class="desc">{{ elecInfo.bankCardNo | formatBankNo }}</div>
      </div>
      <div class="fill"></div>
      <div class="option">
        <div class="title">开户银行</div>
        <div class="desc">{{ elecInfo.bankName }}</div>
      </div>
      <div class="fill"></div>
      <div class="option">
        <div class="title">账户余额</div>
        <div class="desc">{{ elecInfo.remainingSum ? elecInfo.remainingSum + " 元" : '0.00 元' }}</div>
      </div>
      <div class="fill"></div>
      <div class="operate">
        <van-button v-if="isShowBtn" type="primary" class="btn-l foot-operate-btn" @click.stop="charge">充值</van-button>
        <van-button v-if="isShowBtn" type="primary" class="btn-r foot-operate-btn" @click.stop="withDrawal">提现</van-button>
      </div>
    </div>
    <div v-else>
      <NoData></NoData>
    </div>
  </div>
</template>
<script>
import NoData from '@/common/components/common/showStatus/NoData.vue';
export default {
  // 还款电子账户信息
  name: 'ElecAccountInfo',
  props: {
    info: {
      type: Object
    }
  },
  data() {
    return {
      elecInfo: {},
      // 按钮是否展示
      isShowBtn: true
    };
  },
  components: {
    NoData
  },
  watch: {
    info: {
      handler: function (nVal, oVal) {
        if (nVal) {
          this.elecInfo = nVal;
        }
      },
      immediate: true,
      deep: true
    }
  },

  methods: {
    // 提现
    withDrawal() {
      this.elecInfo.routerProductId
        ? this.$router.push({
            name: 'XWEBankAcountWithDrawal',
            query: { pro_id: this.elecInfo.routerProductId, cre_no: this.elecInfo.routerCreditNo }
          })
        : this.$notify.info({
            msg: '并未查到对应的产品信息！'
          });
    },
    // 充值
    charge() {
      this.elecInfo.routerProductId
        ? this.$router.push({
            name: 'XWEBankAcountCharge',
            query: { pro_id: this.elecInfo.routerProductId, cre_no: this.elecInfo.routerCreditNo, isFromRepay: 'no' }
          })
        : this.$notify.info({
            msg: '并未查到对应的产品信息！'
          });
    }
  }
};
</script>
<style lang="scss" scoped>
.elec-account-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100vh;
  background-color: #f4f6f9;
  .option {
    width: 690px;
    display: flex;
    align-items: center;
    .title {
      width: 25%;
      font-size: 28px;
      font-weight: 400;
      color: #333333;
      margin: 20px 0;
    }
    .desc {
      flex: 1;
      font-size: 28px;
      font-weight: 400;
      color: #333333;
    }
  }
  .operate {
    margin-top: 80px;
    width: 80%;
    display: flex;
    justify-content: space-between;
    ::v-deep(.van-button) {
      height: unset;
      border-radius: 5px;
      padding: 12px 0;
      background: #1b6ffb;
    }
    .btn-l {
      width: 40%;
    }
    .btn-r {
      width: 40%;
    }
  }
  .detail {
    font-size: 30px;
    font-weight: 500;
    color: #3552d0;
    margin-top: 42px;
    text-align: center;
  }
  .fill {
    width: 710px;
    height: 1px;
    border-bottom: 1px solid #d8d8d8;
  }
}
</style>

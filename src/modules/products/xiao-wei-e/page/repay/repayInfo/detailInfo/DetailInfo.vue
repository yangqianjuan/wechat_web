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
        <van-button v-if="isShowBtn" type="primary" class="btn btn-l foot-operate-btn" @click.stop="withDrawalList">提现明细</van-button>
        <van-button v-if="isShowBtn" type="primary" class="btn btn-r foot-operate-btn" @click.stop="chargeList">充值明细</van-button>
      </div>
    </div>
    <div v-if="noDataShow">
      <van-empty description="暂无数据" />
    </div>
  </div>
</template>
<script>
export default {
  /**
   * 电子账户信息，展示明细按钮
   * */
  props: {
    info: {
      type: Object
    }
  },
  data() {
    return {
      elecInfo: {},
      // 按钮是否展示
      isShowBtn: true,
      noDataShow: false
    };
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      this.$toasting.show({ message: "加载中", forbidClick: true });
      setTimeout(() => {
        this.$toasting.hide();
        if (this.$route.query.info) {
          this.elecInfo = JSON.parse(this.$route.query.info);
        } else {
          this.$notify.info({ msg: "暂无还款账户信息！" });
          this.noDataShow = true;
        }
      }, 500);
    },

    withDrawalList() {
      if (this.elecInfo.routerProductId) {
        this.$router.push("/xwe_bank_withDrawal_detail_list");
      } else {
        this.$notify.info({ msg: "并未查到对应的信息！" });
      }
    },

    // 充值明细
    chargeList() {
      if (this.elecInfo.routerProductId) {
        this.$router.push("/xwe_bank_Charge_detail_list");
      } else {
        this.$notify.info({ msg: "并未查到对应的信息！" });
      }
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
  padding-top: 12px;
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
}
.fill {
  width: 710px;
  height: 1px;
  // background-color: #d8d8d8;
  border-bottom: 1px solid #d8d8d8;
}
</style>
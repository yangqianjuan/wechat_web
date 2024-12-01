<template>
  <div>
    <div class="qrcode-title-wrapper">
      <div class="qrcode-warn-btn-wrapper" @click="switchShowWarnText">
        <span class="warn-btn-desc">您将授权平台查询您的税务电子信息</span>
        <img class="warn-btn" :src="isShowWarnText ? icUnreadingInfo : icReadingInfo" />
      </div>
      <!-- <div class="skip-btn" v-if="isShowSkipBtn" @click="skip">跳过</div> -->
      <!-- 税局自动化采集可以跳过 -->
      <div class="skip-btn" v-if="taxInitSkipBtn" @click="skip">跳过</div>
    </div>
    <p class="warning-text" v-show="isShowWarnText">不进行税务查询授权，后续仍必须进行税务授信查询，否则申请无法进行审批</p>
  </div>
</template>

<script>
export default {
  /**
   * 税局自动化采集，可以跳过操作页
   *
   * */
  data() {
    return {
      isShowWarnText: true,
      isShowSkipBtn: false,
      icReadingInfo: require("@/assets/imgs/icon/ic_read_info.png"),
      icUnreadingInfo: require("@/assets/imgs/icon/ic_unread_info.png")
    };
  },
  created() {
    // this.showSkipBtn();
  },
  computed: {
    taxInitSkipBtn: function () {
      return this.$store.state.taxInitSkipBtn;
    }
  },
  methods: {
    // showSkipBtn() {
    //   setTimeout(() => {
    //     this.isShowSkipBtn = true;
    //   }, 7000);
    // },
    skip() {
      this.$emit("skip");
    },
    switchShowWarnText() {
      this.isShowWarnText = !this.isShowWarnText;
    }
  }
};
</script>

<style lang="scss" scoped>
.qrcode-title-wrapper {
  padding: 0.9375rem 1.0625rem 0.5rem 0.9375rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .qrcode-warn-btn-wrapper {
    display: flex;
    align-items: center;
    .warn-btn-desc {
      font: 500 0.8125rem PingFangSC-Medium, PingFang SC;
      color: #333333;
    }
    .warn-btn {
      height: 0.875rem;
      margin-left: 0.1875rem;
    }
  }
  .skip-btn {
    font: 400 0.75rem PingFangSC-Regular, PingFang SC;
    color: #999999;
  }
}
.warning-text {
  padding-left: 0.9375rem;
  width: 67vw;
  text-align: left;
  font: 400 0.6875rem PingFangSC-Regular, PingFang SC;
  color: #db2b13;
  margin-bottom: 0.625rem;
}
</style>
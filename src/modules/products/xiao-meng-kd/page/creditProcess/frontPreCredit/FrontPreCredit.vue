<template>
  <div class="loans-result-wrapper">
    <div class="title-wrapper" slot="title">
      <img class="logo" :src="applyingIcon" alt />
      <p class="loans-result">审核中</p>
    </div>
    <div class="warning-text">
      <div class="tip-time">预计10分钟内完成审核！</div>
      <div class="tip">温馨提示：本次审核非最终授信审批结果，若您通过审核，请继续完成后续企业税务信息授权等流程！</div>
    </div>
    <div class="sub-btn-wrapper">
      <van-button class="sub-btn bg foot-operate-btn" @click="close">完成</van-button>
      <p class="tip">请勿取消关注，以防错过审核通知！</p>
    </div>
  </div>
</template>
<script>
import { queryNextByUnionKeyAndProdId } from "@/utils/credit/jdugeNextPath.js";
let timerInstance = null;
export default {
  // 预授信结果页
  name: "XMFrontPreCredit",
  data() {
    return {
      applyingIcon: require("@/assets/imgs/icon/ic_cre_ing.png")
    };
  },
  created() {
    this.searchCreditResult();
  },
  beforeDestroy() {
    clearInterval(timerInstance);
  },
  methods: {
    close() {
      this.$router.replace({ path: "/" });
    },

    /**
     * 2分钟查一次
     * */
    searchCreditResult() {
      timerInstance = setInterval(async () => {
        let nextPath = await queryNextByUnionKeyAndProdId("1000");
        if (nextPath !== "/xm_front_pre_credit") {
          this.$router.replace({ path: nextPath });
        }
      }, 120000);
    }
  }
};
</script>
<style lang="scss" scoped>
.loans-result-wrapper {
  height: 100vh;
  background: #ffffff;
  overflow: hidden;
}

.title-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 40px;
  background: #ffffff;
  .logo {
    height: 11rem;
  }
  .loans-result {
    font-size: 30px;
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
.sub-btn-wrapper {
  position: fixed;
  bottom: 50px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  .sub-btn {
    width: 80%;
    margin-left: 10%;
    margin-bottom: 18px;
  }
  .bg-blue {
    margin-bottom: 18px;
  }
  .bg {
    border: 1px solid #d8d8d8;
    /deep/.van-button__text {
      color: #333 !important;
      font-size: 28px;
    }
  }
  .tip {
    text-align: center;
    margin-top: 16px;
    color: #1b6ffb;
  }
}
.warning-text {
  padding: 0 6vw;
  .tip {
    font-weight: 400;
    margin-top: 26px;
    color: #db2b13;
    text-indent: 2em;
  }
  .tip-time {
    text-align: center;
    color: #0e80ed;
    font-size: 28px;
    font-weight: 400;
    margin-top: 10px;
  }
}
</style>

<template>
  <div class="loans-result-wrapper">
    <div class="title-wrapper" slot="title">
      <img class="status-icon" :src="approveIcon" alt />
      <p class="loans-result">已提交</p>
      <p class="desc">{{msg}}</p>
    </div>
  </div>
</template>
<script>
export default {
  /**
   * sass 销售合同的审核结果
   * */
  name: 'SassContractResult',
  data() {
    return {
      approveIcon: require('@/assets/imgs/icon/ic_cre_succ.png'),
      msg: '您的合同已提交，请等待管理员进行审核' // 您的转账记录已提交，请等待管理员确认到账
    };
  },
  created() {
    let msg = this.$route.query.msg;
    let title = this.$route.query.title;
    // 转账记录审核结果
    if (msg) {
      this.msg = msg;
      this.setWechatTitle(title);
    }
  },
  mounted() {}
};
</script>
<style lang="scss" scoped>
.loans-result-wrapper {
  height: 100%;
  background: rgba(244, 246, 249, 1);
}
.sub-btn-wrapper {
  position: fixed;
  bottom: 58px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  .sub-btn {
    width: 76%;
    margin-left: 12%;
    margin-top: 8px;
  }
  .bg-blue {
    background: #1b6ffb;
    color: #ffffff;
    box-shadow: -2px 2px 5px 2px rgba(27, 111, 251, 0.26);
  }
  .bg-gary {
    color: #b0b0b0;
    box-shadow: -2px 2px 5px 2px rgba(153, 153, 153, 0.21);
    border-radius: 3px;
    border: 1px solid #b0b0b0;
  }
  .tip {
    text-align: center;
    margin-top: 18px;
    font-size: 24px;
    color: #1b6ffb;
  }
}
.warning-text {
  padding: 0 5vw;
  font-size: 22px;
  font-weight: 400;
  color: #db2b13;
  margin-top: 0.9375rem;
  background: #ffffff;
}
.title-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  background: #ffffff;
  .status-icon {
    height: 200px;
  }
  .loans-result {
    margin-top: 20px;
    font-weight: 500;
    font-size: 30px;
    color: rgba(51, 51, 51, 1);
  }
  .desc {
    font-size: 26px;
    margin-top: 14px;
    font-weight: 400;
    color: #0e80ed;
  }
}
</style>

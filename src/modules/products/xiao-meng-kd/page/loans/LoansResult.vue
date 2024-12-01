<template>
  <div class="loans-result-wrapper">
    <div class="title-wrapper" slot="title">
      <img class="logo" :src="resIcon" alt />
      <p class="loans-result">提交成功</p>
      <p class="desc">预计1天内完成审核</p>
    </div>
    <Button class="sub-btn" type="primary" @click="goBackHome">返回</Button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      resIcon: require('@/assets/imgs/icon/ic_result.png')
    };
  },
  created() {
    console.log('loans result created');
  },
  methods: {
    goBackHome() {
      this.$router.replace({ path: '/' });
    }
  }
};
</script>
<style lang="scss" scoped>
.loans-result-wrapper {
  height: 100%;
  background: rgba(244, 246, 249, 1);
}
.sub-btn {
  width: 80%;
  margin-left: 10%;
  position: fixed;
  margin-top: 40px;
}
.title-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 40px;
  background: #ffffff;
  .logo {
    width: 100px;
    height: 100px;
  }
  .loans-result {
    font-size: 30px;
    margin-top: 30px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
  }
  .desc {
    font-size: 24px;
    margin-top: 18px;
    font-weight: 400;
    color: rgba(134, 134, 134, 1);
  }
}
</style>

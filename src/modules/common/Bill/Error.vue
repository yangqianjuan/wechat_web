<template>
  <div class="error-wrapper">
    <img class="err-icon" :src="errIcon" alt />
    <p class="title">{{errMsg}}</p>
  </div>
</template>
<script>
export default {
  data() {
    return {
      errMsg: '',
      errIcon: require('@/assets/imgs/icon/ic_err.png')
    };
  },
  created() {
    this.errMsg = this.$route.query.msg;
  }
};
</script>
<style lang="scss" scoped>
.error-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .err-icon {
    height: 8rem;
    margin: -8.375rem 0 0.9375rem;
  }
  .title {
    font-size: 26px;
    font-weight: 500;
    color: rgba(51, 51, 51, 0.5);
  }
  .poster {
    margin-top: 17px;
    width: 100%;
  }
}
</style>

<template>
  <div class="search-home">
    <div class="search-content">
      <div class="title">
        <img src="../../static/image/company-logo.png" class="logo" />
        <div class="name">萌e贷</div>
      </div>
      <van-field clearable v-model="idCard" class="my-input" placeholder="请输入产品申请的身份证号">
        <template slot="left-icon">
          <img src="../../static/image/searchProduct/card.png" class="card" />
        </template>
      </van-field>
      <van-button class="myBtn" @click="search">立即查询</van-button>
    </div>
  </div>
</template>
<script>
import { userProductApplyInfo } from '@/request/interface/common/index';

export default {
  data() {
    return {
      idCard: ''
    };
  },
  methods: {
    search() {
      if (this.idCard.match(/(^\d{15}$|(^\d{18}$)|(^\d{17}(\d|X|x)$))/)) {
        userProductApplyInfo({
          idNum: this.idCard
        })
          .then(res => {
            if (res?.data?.data?.details) {
              let obj = res.data.data;
              this.$router.push({
                path: '/searchDetail',
                query: {
                  productItem: encodeURIComponent(JSON.stringify(obj))
                }
              });
            } else {
              this.$toasting.info({
                msg: '未查询到记录，请确认后再试!'
              });
            }
          })
          .catch(err => {
            this.$toasting.info({
              msg: err
            });
          });
      } else {
        this.$toasting.info({
          msg: '身份证格式错误，请确认后再试!'
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.search-home {
  width: 100vw;
  height: 100vh;
  position: relative;
  background-color: #f6f9ff;
  background-image: url('../../static/image/searchProduct/bg.png');
  background-repeat: no-repeat;
  background-size: contain;
  .search-content {
    width: 670px;
    height: 400px;
    background: #ffffff;
    box-shadow: 0px 4px 24px -8px rgba(6, 16, 78, 0.2);
    border-radius: 32px;
    position: absolute;
    bottom: 5%;
    left: 5%;
    display: flex;
    flex-direction: column;
    align-items: center;
    .title {
      display: flex;
      justify-content: center;
      margin-top: 50px;
    }
    .logo {
      width: 78px;
      height: 62px;
      border-radius: 10px;
    }
    .name {
      margin-top: 4px;
      margin-left: 6px;
      font-size: 40px;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: #474749;
    }

    .my-input {
      width: 548px;
      height: 80px;
      margin-top: 40px;
      background: #f7f8f9;
      ::v-deep(.van-field__left-icon) {
        margin-right: 30px;
        margin-top: 4px;
      }
      .card {
        width: 40px;
        height: 40px;
      }
    }

    .myBtn {
      width: 584px;
      height: 88px;
      background: #164bff linear-gradient(225deg, #194bd7 0%, #3b77ff 100%);
      border-radius: 44px;
      font-size: 28px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #ffffff;
      margin-top: 40px;
    }
  }
}
</style>

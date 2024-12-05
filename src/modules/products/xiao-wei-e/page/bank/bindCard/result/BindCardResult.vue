<template>
  <div class="gf-bind-card-result" v-if="loading">
    <div class="bank-info" v-if="Object.keys(bankInfo).length">
      <div class="info-item">
        <div class="title">姓名:</div>
        <div class="desc black-col">{{bankInfo.userName}}</div>
      </div>
      <div class="info-item">
        <div class="title">银行卡号:</div>
        <div class="desc">{{bankInfo.bankCard | formatBankNo}}</div>
      </div>
      <div class="info-item">
        <div class="title">开户行:</div>
        <div class="desc">{{bankInfo.bankName}}</div>
      </div>
      <div class="info-item" v-if="bankInfo.stCard">
        <div class="title">电子账户:</div>
        <div class="desc">{{bankInfo.stCard}}</div>
      </div>
      <div class="info-item">
        <div class="title">换绑状态:</div>
        <div v-if="loginStatus === 'pending'" class="desc">换绑中</div>
        <div v-if="loginStatus === 'reject'" class="desc" style="color: red;">换绑失败</div>
        <div v-if="loginStatus === 'resolve'" class="desc" style="color: green;">换绑成功</div>
      </div>
    </div>
    <div v-else>
      <van-empty description="暂无换绑信息" />
    </div>
    <van-button class="add-card-btn foot-operate-btn refresh" type="primary" @click="getBindResult">刷新</van-button>
    <van-button class="add-card-btn foot-operate-btn" type="primary" @click="goHome">返回</van-button>
  </div>
</template>
<script>
import { getQueryWaitBankChangeReslut } from '@/request/interface/gf/common';
export default {
  /**
   * 广发换绑卡的结果
   * */
  name: 'GFBindCardResult',
  data() {
    return {
      loginStatus: 'pending',
      bankInfo: {},
      loading: false
    };
  },
  created() {
    this.getBindResult();
  },
  methods: {
    // 获取绑定的结果
    getBindResult() {
      let params = {
        changeId: this.$route.query.changeNo,
        applyUnionKey: this.$route.query.applyUnionKey
      };
      this.$toasting.show({ message: '加载中', forbidClick: true });
      getQueryWaitBankChangeReslut(params)
        .then((res) => {
          if (res.data.data && res.data.data.bancardInfo) {
            this.bankInfo = res.data.data.bancardInfo;
            if (res.data.data.code === '0') {
              this.loginStatus = 'reject';
            } else if (res.data.data.code === '1') {
              this.loginStatus = 'resolve';
            } else if (res.data.data.code === '2') {
              this.loginStatus = 'pending';
            }
          } else {
            this.$notify.error({ msg: '暂未获取到换绑结果信息！' });
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '换绑结果查询失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
          this.loading = true;
        });
    },

    goHome() {
      this.$router.replace({ path: '/' });
    }
  }
};
</script>
<style lang="scss" scoped>
.login-success {
  ::v-deep(.van-empty__image) {
    width: 180px;
    height: 180px;
  }
}
.bank-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 8px 16px;
  padding: 16px 16px;
  background-color: #f4f6f9;
  border-radius: 8px;
  -moz-box-shadow: 0 0 10px #f4f6f9;
  -webkit-box-shadow: 0 0 10px #f4f6f9;
  box-shadow: 0 0 10px #f4f6f9;
  .info-item {
    width: 100%;
    display: flex;
    align-items: center;
    // background: #ffffff;
    padding: 0 12px;
    // border-bottom: 1px solid #d8d8d8;
    // border-radius: 10px;
    // margin-top: 12px;

    .title {
      width: 23%;
      font-size: 28px;
      font-weight: 400;
      color: #333333;
      margin: 12px 8px;
      // border: 1px solid #d8d8d8;
    }
    .desc {
      flex: 1;
      font-size: 28px;
      // text-align: right;
      font-weight: 400;
      color: #333333;
    }
  }
}
.add-card-btn {
  width: 80%;
  margin-left: 10%;
  margin-top: 30px;
  // box-shadow: -2px 2px 5px 2px rgba(27, 111, 251, 0.26);
}
::v-deep(.refresh) {
  margin-top: 60px;
  background-color: #fff !important;
  box-shadow: unset !important;
  span {
    color: #333333 !important;
  }
}
</style>

<template>
  <div class="loans-result-wrapper" v-if="isLoading">
    <div class="title-wrapper" slot="title" v-if="isShow">
      <img class="status-icon" :src="loansResultIcon[loansSstatusCode]" alt />
      <p v-if="loansSstatusCode === '02'" class="loans-result">{{ loansErrResult }}</p>
      <p v-if="loansSstatusCode !== '02'" class="loans-result">{{loansResultText[loansSstatusCode]}}</p>
      <p class="desc" v-if="loansSstatusCode === '01'">{{msg}}</p>
    </div>
    <div class="empty-wrapper" v-if="!isShow">
      <img class="empty-icon" :src="emptyIcon" alt />
      <p>暂无放款结果</p>
    </div>
    <div class="sub-btn-wrapper">
      <van-button class="sub-btn bg-blue foot-operate-btn" @click="goBack">回到首页</van-button>
    </div>
  </div>
</template>
<script>
import { LOANS_RESULT_ICON, LOANS_RESULT_TEXT } from './util';
export default {
  /**
   * 借款的结果页
   * */
  data() {
    return {
      approveIcon: require('@/assets/imgs/icon/ic_cre_succ.png'),
      emptyIcon: require('@/assets/imgs/icon/ic_empty.png'),
      loansResultIcon: LOANS_RESULT_ICON,
      loansResultText: LOANS_RESULT_TEXT,
      loansSstatusCode: '',
      msg: '请勿取消公众号关注，以防错过放款通知',
      isLoading: false,
      isShow: true,
      loansErrResult: ''
    };
  },
  created() {
    this.$toasting.show({ message: '加载中', forbidClick: true });
    setTimeout(() => {
      this.$toasting.hide();
      if (this.$route.query.borrowRes) {
        this.isLoading = true;
        this.init(this.$route.query.borrowRes);
      } else {
        this.isLoading = true;
        this.isShow = false;
        this.$notify.info({ msg: '暂无放款结果！' });
      }
    }, 1500);
  },

  methods: {
    init(code) {
      // 放款成功
      if (code.code === '00') {
        this.loansSstatusCode = '00';
      }
      // 放款中
      if (code.code === '01') {
        this.loansSstatusCode = '01';
      }
      // 放款失败
      if (code.code === '02') {
        this.loansSstatusCode = '02';
        this.loansErrResult = code.desc;
      }
    },

    goBack() {
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
.sub-btn-wrapper {
  position: fixed;
  bottom: 58px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  .sub-btn {
    width: 80%;
    margin-left: 10%;
  }
  .bg-blue {
    background: #1b6ffb;
    color: #ffffff;
  }
  .bg-gary {
    color: #b0b0b0;
    border-radius: 3px;
    border: 1px solid #b0b0b0;
  }
  .tip {
    text-align: center;
    margin-top: 10px;
    color: #1b6ffb;
  }
}
.warning-text {
  padding: 0 5vw;
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
    height: 25vh;
  }
  .loans-result {
    margin-top: 30px;
    font-weight: 600;
    font-size: 30px;
    color: rgba(51, 51, 51, 1);
  }
  .desc {
    margin-top: 12px;
    font-size: 26px;
    font-weight: 400;
    color: #0e80ed;
  }
}
.close-btn {
  border: 1px solid #d8d8d8;
  span {
    color: #333 !important;
  }
}
.empty-wrapper {
  position: absolute;
  top: -70px;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  p {
    font-size: 36px;
    margin-top: 22px;
    font-weight: 600;
  }
  .empty-icon {
    width: 330px;
    height: 330px;
  }
}
</style>

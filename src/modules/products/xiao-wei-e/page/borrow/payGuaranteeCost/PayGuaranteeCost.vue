<template>
  <div class="guarantee-wrapper">
    <!--担保金额支付-->
    <div class="card">
      <p class="guarantee-count">¥{{ producDetail.guaranteeFee }}</p>
      <p class="guarantee-unit">担保费（元）</p>
    </div>
    <div class="account-info-wrapper">
      <div class="acount-info-item">
        <span class="title">{{ isEacount ? '电子账户' : '广发卡号' }}</span>
        <span class="desc">{{ repayBankCard.bankCardNo }}</span>
      </div>
      <div class="acount-info-item" v-if="isEacount">
        <span class="title">余额（元）</span>
        <div class="desc">
          <span>{{ repayBankCard.eaccountBalance }}</span>
          <img class="icRefresh" @click="getRepayAcountInfo" src="../../../../../../assets/imgs/icon/ic_refresh.png" />
        </div>
      </div>
    </div>
    <div class="notic-wrapper">
      <img class="icNotic" src="../../../../../../assets/imgs/icon/ic_tip.png" alt />
      <span class="noitc"
        >请将担保费充值到展示的{{
          isEacount ? '电子账户' : '广发卡号'
        }}中，若充值金额不足则无法完成提款，望您知悉！</span
      >
    </div>
    <van-button class="sub-btn foot-operate-btn" type="primary" @click="handleSubmit">确认</van-button>
  </div>
</template>
<script>
import { getVerification } from '@/request/interface/txQrc/faceP.js';
import { getFacePToken } from '@/controller/faceP.js';
import { gotoBorrowingApply } from '@/controller/bank.js';
import { queryReapyAcountInfo } from '@/controller/bank.js';
import { gfSendMess, gfUnionPayVerify, gfBorrowingApply } from '@/request/interface/gf/common.js';
import { faceErrorMessage } from '@/utils/common/common';
let wx = require('weixin-js-sdk');

export default {
  data() {
    return {
      logo: require('@/assets/imgs/icon/ic_logo.png'),
      arrowIcon: require('@/assets/imgs/icon/ic_arrow.png'),
      isPassLiveVerify: false,
      isEacount: false,
      redirectUrl: '',
      liveVerifyTime: '',
      env: '',
      producDetail: {},
      loansInfo: {},
      repayBankCard: {}
    };
  },

  created() {
    this.init();
  },
  methods: {
    init() {
      let ENV = process.env.NODE_ENV;
      this.env = ENV;
      let isOverVerify = this.getUrlParam('isOverVerify');
      let liveVerifyTime = localStorage.liveVerifyTime;
      liveVerifyTime = liveVerifyTime ? parseInt(liveVerifyTime) : 0;
      this.liveVerifyTime = liveVerifyTime;
      this.loansInfo = localStorage.loansInfo ? JSON.parse(localStorage.loansInfo) : {};
      this.producDetail = localStorage.producDetail ? JSON.parse(localStorage.producDetail) : {};
      this.getRepayAcountInfo();
      if (ENV !== 'development') {
        if (isOverVerify || liveVerifyTime) {
          this.getVerifyResult();
        } else {
          this.gotoLivingVerify();
        }
      }
    },

    handleSubmit() {
      if (!this.isPassLiveVerify && this.env !== 'development') {
        this.$notify.error({
          msg: '人脸识别未通过！'
        });
        return;
      }
      if (this.isEacount) {
        let producDetail = this.producDetail;
        let guaranteeFee = parseFloat(producDetail.guaranteeFee);
        let eaccountBalance = parseFloat(this.repayBankCard.eaccountBalance);
        if (eaccountBalance < guaranteeFee) {
          this.$notify.error({
            msg: '电子账户余额不足！'
          });
          return;
        }
      }
      let params = {
        applyUnionKey: this.loansInfo.applyUnionKey,
        guaranteeFee: this.loansInfo.guaranteeFee,
        loanApplyAmount: this.loansInfo.borrowBalance,
        loanPurpose: Number(this.loansInfo.loansPurpose),
        loanTerm: this.loansInfo.loansTimeLimit,
        paymentType: '04',
        productId: this.loansInfo.productId,
        returninterestType: '4',
        returnperiod: '4',
        sessionId: sessionStorage.getItem('withdraw_session_id'),
        thirdLoanNo: ''
      };
      this.$toasting.show({ message: '借款申请中', forbidClick: true });
      gfBorrowingApply(params)
        .then(res => {
          if (res?.data?.data?.loanNo) {
            this.$router.replace({ path: '/xwe_loans_result', query: { loanNo: res.data.data.loanNo } });
          }
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '借款失败' });
        })
        .finally(() => {
          this.$router.replace({ path: '/xwe_loans_result', query: { loanNo: '11111' } });
          this.$toasting.hide();
        });
    },

    // 获取活体识别结果
    getVerifyResult() {
      // let bizToken = this.getCookie('tencent_biz_token');
      let faceStage = 'LOAN';
      this.$toasting.show({ message: '获取识别结果', forbidClick: true });
      // { bizToken, faceStage }
      getVerification({ faceStage })
        .then(res => {
          if (res?.data?.success) {
            this.$notify.info({ msg: '人脸识别通过！' });
            window.localStorage.removeItem('liveVerifyTime');
            this.isPassLiveVerify = true;
          } else {
            this.$notify.error({ msg: '人脸识别未通过！' });
            faceErrorMessage()
              .then(res => {
                if (res === 'ok') {
                  this.gotoLivingVerify();
                }
              })
              .catch(err => {
                if (err === 'no') {
                  wx.closeWindow();
                }
              });
          }
          // let detail = res?.data?.data?.detail;
          // let result = JSON.parse(detail.replace(new RegExp('\\\\', 'gm'), ''));
          // let isPass = false;
          // result.LivenessData.forEach((LiveneItem) => {
          //   if (LiveneItem.ErrMsg === '成功') {
          //     isPass = true;
          //   }
          // });
          // if (isPass) {
          //   this.$notify.info({ msg: '人脸识别通过！' });
          //   window.localStorage.removeItem('liveVerifyTime');
          //   this.isPassLiveVerify = true;
          // } else {
          //   this.$notify.error({ msg: '人脸识别未通过！' });
          //   setTimeout(() => {
          //     this.gotoLivingVerify();
          //   }, 1500);
          // }
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '活体识别失败！' });
          faceErrorMessage()
            .then(res => {
              if (res === 'ok') {
                this.gotoLivingVerify();
              }
            })
            .catch(err => {
              if (err === 'no') {
                wx.closeWindow();
              }
            });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    gotoLivingVerify() {
      if (this.liveVerifyTime >= 5) {
        this.$notify.error({ msg: '活体识别次数过多，请明天再尝试！' });
        return false;
      }
      getFacePToken().then(res => {
        let liveVerifyTime = this.liveVerifyTime;
        window.localStorage.setItem('liveVerifyTime', liveVerifyTime + 1);
        this.redirectUrl = res.url;
        setTimeout(() => {
          window.location.href = res.url;
        }, 200);
      });
    },

    // 获取还款账户信息
    getRepayAcountInfo() {
      let creditNo = this.loansInfo.creditNum;
      let productId = this.loansInfo.productId;
      this.$toasting.show({ message: '加载中', forbidClick: true });
      queryReapyAcountInfo({ creditNo, productId })
        .then(repayBankCard => {
          this.repayBankCard = repayBankCard;
          this.isEacount = repayBankCard.type === '02';
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.guarantee-wrapper {
  min-height: 100vh;
  background: #ffffff;
  .card {
    padding: 1.3125rem 0 2.3125rem;
    background: linear-gradient(180deg, #3552d0 100%, rgba(53, 82, 208, 0) 100%);
    text-align: center;
    color: #ffffff;
    .guarantee-count {
      font-size: 66px;
      font-weight: 400;
    }
    .guarantee-unit {
      font-size: 30px;
      margin-top: 1rem;
    }
  }
  .account-info-wrapper {
    padding: 0 1.125rem;
    .acount-info-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.125rem 0 0.625rem;
      border-bottom: 1px solid #d8d8d8;
      .title {
        font-size: 26px;
        font-weight: 500;
        color: #333333;
      }
      .desc {
        font-size: 26px;
        font-weight: 500;
        color: #999999;
      }
      .icRefresh {
        width: 40px;
        margin-left: 0.75rem;
      }
    }
  }
  .notic-wrapper {
    display: flex;
    align-content: flex;
    padding: 0 1.125rem;
    margin-top: 20px;
    .icNotic {
      height: 30px;
      width: 30px;
      margin-right: 20px;
      margin-top: 10px;
    }
    .notic {
      font-size: 26px;
      font-weight: 400;
      color: #767676;
    }
  }
  .from-wrapper {
    margin-top: 25px;
    margin-left: 10px;
  }
  .sub-btn {
    position: relative;
    width: 80%;
    margin-left: 10vw;
    background: #3552d0;
    box-shadow: 0px 5px 6px 0px rgba(53, 82, 208, 0.3);
    margin-top: 40px;
  }
}
</style>

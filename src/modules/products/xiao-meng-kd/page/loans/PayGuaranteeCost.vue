<template>
  <div class="guarantee-wrapper">
    <!--担保金额支付-->
    <div class="card">
      <p class="guarantee-count">¥{{ borrowInfo.guaranteeFee }}</p>
      <p class="guarantee-unit">担保费（元）</p>
    </div>
    <div class="account-info-wrapper">
      <div class="acount-info-item">
        <div class="title">借款金额</div>
        <div class="desc">{{ borrowInfo.loanAmount }}</div>
      </div>
      <div class="acount-info-item">
        <div class="title">{{ isEacount ? '电子账户' : '浦发卡号' }}</div>
        <!-- 电子户 -->
        <div class="desc" v-if="isEacount">
          <div class="bank-card-no">
            <span class="desc">{{
              ecCardOperateNo.bankCardShow
                ? formatBankNo(repayBankCard.bankCardNo)
                : desensitizationInfo(repayBankCard.bankCardNo, 'bankCard')
            }}</span>
            <img class="search-eye" v-if="!ecCardOperateNo.bankCardShow" :src="eyeClose" @click="elecShowNo" />
            <img class="search-eye" v-if="ecCardOperateNo.bankCardShow" :src="eyeOpen" @click="elecShowNo" />
          </div>
        </div>
        <!-- 非电子户 -->
        <div class="desc" v-else>
          <div class="bank-card-no">
            <span class="desc">{{
              bankCardOperateNo.bankCardShow
                ? formatBankNo(repayBankCard.bankCardNo)
                : desensitizationInfo(repayBankCard.bankCardNo, 'bankCard')
            }}</span>
            <img
              class="search-eye"
              v-if="!bankCardOperateNo.bankCardShow"
              :src="eyeClose"
              @click="bankCardOperateNo.bankCardShow = !bankCardOperateNo.bankCardShow"
            />
            <img
              class="search-eye"
              v-if="bankCardOperateNo.bankCardShow"
              :src="eyeOpen"
              @click="bankCardOperateNo.bankCardShow = !bankCardOperateNo.bankCardShow"
            />
          </div>
        </div>
      </div>
      <div class="acount-info-item" v-if="isEacount">
        <span class="title">余额（元）</span>
        <div class="desc">
          <span>{{ repayBankCard.eaccountBalance }}</span>
          <img class="icRefresh" @click="getAccountInfo" src="../../../../../assets/imgs/icon/ic_refresh.png" />
        </div>
      </div>
    </div>
    <div class="notic-wrapper">
      <img class="icNotic" src="../../../../../assets/imgs/icon/ic_tip.png" alt />
      <span class="noitc"
        >请将担保费充值到展示的{{
          isEacount ? '电子账户' : '浦发卡号'
        }}中，若充值金额不足则无法完成提款，望您知悉！</span
      >
    </div>
    <van-dialog
      v-model="ecCardOperateNo.openIframe"
      title="账户信息"
      cancelButtonText="关闭"
      show-cancel-button
      :showConfirmButton="false"
    >
      <iframe :src="ecCardOperateNo.cardShowlink" width="100%" height="100%" frameborder="0"></iframe>
    </van-dialog>
    <!-- 担保费合同 -->
    <div class="protocol-link-wrapper" v-if="guaranteeContract.needToSignDanBao">
      <input class="protocol-select-btn" id="agree" type="radio" value="agree" v-model="isAgree" />
      <p>
        <label for="agree">请阅读并同意协议</label>
        <span @click="signContract" class="protocol">《担保服务合同》</span>
      </p>
    </div>
    <Button class="sub-btn" :disabled="isSubmitDisabled" type="primary" @click="handleSubmit">确认</Button>
    <!-- <Button class="sub-btn-back" @click="modifyAmountHandler">修改金额</Button> -->
  </div>
</template>
<script>
import { getVerification } from '@/request/interface/txQrc/faceP.js';
import { getFacePToken } from '@/controller/faceP.js';
import { gotoFinallyBorrowingApply } from '@/controller/bank.js';
import { borrowingApplyGuaranteeContract, guaranteeContractAddress } from '@/request/interface/impower/Bank';
import { queryReapyAcountInfo } from '@/controller/bank.js';
import { desensitizationInfo } from '@/utils/common/common.js';
import commonFilters from '@/utils/vue/filters/common.js';
import { checkWithdrawPassAfterPreBorrowingApply } from '@/utils/common/global';
import { faceErrorMessage } from '@/utils/common/common';
let wx = require('weixin-js-sdk');

export default {
  /**
   * 浦发的担保费
   * */
  name: 'PFPayGuaranteeCost',
  data() {
    return {
      isPassLiveVerify: false,
      isEacount: false,
      redirectUrl: '',
      liveVerifyTime: '',
      env: '',
      repayBankCard: {},
      // bank (实体卡)
      bankCardOperateNo: {
        bankCardShow: false
      },
      // 电子户
      ecCardOperateNo: {
        bankCardShow: false,
        cardShowlink: '',
        openIframe: false
      },
      eyeOpen: require('@/assets/imgs/icon/ic_eye.svg'),
      eyeClose: require('@/assets/imgs/icon/ic-eye-close.svg'),
      // 担保费合同信息
      // guaranteeContract: {
      //   contractUrl: 'https://www.hhcloudchain.com/qyscontract/scql/2942013889899921546.pdf',
      //   hhSignUrl: '/static/11.pdf',
      //   isContractPrepared: 1,
      //   loanReceiptNo: '111111111',
      //   signStatus: 1
      // },
      guaranteeContract: {},
      isAgree: '',
      isSubmitDisabled: false,
      // 合同接口定时器
      contractTimer: null,
      // 借款信息
      borrowInfo: {},
      applyUnionKey: ''
    };
  },
  created() {
    this.init();
  },
  beforeDestroy() {
    clearInterval(this.contractTimer);
  },
  methods: {
    /**
     * 初始化
     * */
    init() {
      let query = this.$route.query;
      if (query.applyUnionKey) {
        this.applyUnionKey = query.applyUnionKey;
        if (typeof this.applyUnionKey !== 'string') {
          this.applyUnionKey = String(this.applyUnionKey);
        }
        if (this.applyUnionKey && this.applyUnionKey.indexOf('?isOverVerify=true') !== -1) {
          this.applyUnionKey = this.applyUnionKey.split('?')[0];
        }
        Promise.all([this.isNeedFace(), this.getGuaranteeContract()]);
      } else {
        this.$notify.info({ msg: '未获取到用户申请唯一标识！' });
      }
    },

    /**
     * 是否需要人脸识别
     * */
    isNeedFace() {
      let ENV = process.env.NODE_ENV;
      this.env = ENV;
      let isOverVerify = this.getUrlParam('isOverVerify');
      let liveVerifyTime = localStorage.liveVerifyTime;
      liveVerifyTime = liveVerifyTime ? parseInt(liveVerifyTime) : 0;
      this.liveVerifyTime = liveVerifyTime;

      if (ENV !== 'development') {
        if (isOverVerify || liveVerifyTime) {
          this.getVerifyResult();
        } else {
          this.gotoLivingVerify();
        }
      }
    },

    /**
     * 借款的最终申请
     *
     * */
    async handleSubmit() {
      if (!this.isPassLiveVerify && this.env !== 'development') {
        this.$notify.error({ msg: '人脸识别未通过！' });
        return;
      }

      if (this.isEacount) {
        // 电子户余额是否大于担保费
        let guaranteeFee = parseFloat(this.borrowInfo.guaranteeFee);
        let eaccountBalance = parseFloat(this.repayBankCard.eaccountBalance);
        if (eaccountBalance < guaranteeFee) {
          this.$notify.error({ msg: '电子账户余额不足！' });
          return;
        }
      }

      if (this.guaranteeContract.needToSignDanBao) {
        if (!this.isAgree || !this.guaranteeContract.signStatus) {
          // signStatus=0 合同未签订，必须签订
          this.$notify.info({ msg: '请阅读并签订担保服务合同！' });
          return;
        }
      }

      this.$toasting.show({ message: '借款中', forbidClick: true });
      let params = {
        loanNo: this.borrowInfo.loanNo
      };
      gotoFinallyBorrowingApply(params)
        .then(res => {
          if (res?.data?.success) {
            this.$router.replace({ path: '/loans_result' });
          } else {
            this.$notify.error({ msg: '借款失败！' });
          }
        })
        .catch(err => {
          let errMsg = err?.data?.msg || '借款失败！';
          this.$notify.error({ msg: errMsg });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    /**
     * 电子户与实体卡的切换与展示
     * */
    desensitizationInfo,
    formatBankNo: commonFilters.formatBankNo,
    elecShowNo() {
      if (this.repayBankCard.successfulLink) {
        this.ecCardOperateNo.cardShowlink = this.repayBankCard.successfulLink;
        this.ecCardOperateNo.openIframe = true;
      } else {
        this.ecCardOperateNo.bankCardShow = !this.ecCardOperateNo.bankCardShow;
      }
    },

    // 获取活体识别结果
    getVerifyResult() {
      // let bizToken = this.getCookie('tencent_biz_token');
      let faceStage = 'LOAN';
      this.$toasting.show({ message: '获取人脸识别结果中', forbidClick: true });
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

    /**
     * 人脸识别
     * */
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

    /**
     * 获取担保费合同
     * */
    async getGuaranteeContract() {
      try {
        let borrowInfo = await checkWithdrawPassAfterPreBorrowingApply(this.applyUnionKey);
        if (borrowInfo?.data?.data) {
          if (borrowInfo.data.data.needGuaranteeConfirmOrder === 1) {
            this.borrowInfo = borrowInfo.data.data;
            this.isAgree = borrowInfo.data.data.signStatus ? 'agree' : '';
            this.getAccountInfo();
          } else {
            this.$notify.info({ msg: '当前页面的会话已失效，请重新借款！' });
            setTimeout(() => {
              this.$router.replace({ path: '/' });
            }, 2000);
          }
        } else {
          this.$notify.error({ msg: '放款准备信息获取失败！' });
        }
      } catch (e) {
        this.$notify.error({ msg: e?.data?.msg || '放款准备信息获取失败！' });
        return;
      }
      if (this.borrowInfo.loanNo) {
        let params = {
          applyUnionKey: this.applyUnionKey,
          callBackUrl:
            process.env.VUE_APP_API_DOMAIN +
            `front/?code=&state=#/pay_guarantee_cost?applyUnionKey=${this.applyUnionKey}`,
          loanNo: this.borrowInfo.loanNo
        };
        this.getContract(params);
      } else {
        this.$notify.error({ msg: '借款单号获取失败！' });
      }
    },

    /**
     * 获取账户信息
     */
    getAccountInfo() {
      let params = {
        creditNo: this.borrowInfo.creditNo,
        productId: 1000
      };
      queryReapyAcountInfo(params)
        .then(repayBankCard => {
          this.repayBankCard = repayBankCard;
          this.isEacount = repayBankCard.type === '02';
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '账户信息获取失败！' });
        });
    },

    getContract(params) {
      /**
         * res: 0 否 1 是
            "contractUrl": "", 已经签订的地址
            "hhSignUrl": "", 签订的页面地址
            "isContractPrepared": 0, 合同是否生成
            "loanReceiptNo": "", 借据号
            "signStatus": 0 签订状态
            needToSignDanBao: 0 否 1 是  合同是否需要签署
         *
         * */
      borrowingApplyGuaranteeContract(params)
        .then(res => {
          if (res?.data?.success && res.data.data) {
            this.guaranteeContract = res.data.data;
            if (res.data.data.needToSignDanBao) {
              if (res.data.data.isContractPrepared === 0) {
                this.$notify.info({ msg: '担保合同生成中...', duration: 0 });
                this.isSubmitDisabled = true;
                if (!this.contractTimer) {
                  this.contractTimer = setInterval(() => {
                    this.getContract(params);
                  }, 10000);
                }
              } else if (res.data.data.isContractPrepared === 1) {
                if (this.contractTimer) {
                  this.$notify.success({ msg: '合同已经生成！' });
                }
                clearInterval(this.contractTimer);

                if (res.data.data.signStatus === 1) {
                  this.isAgree = 'agree';
                }
              }
            }
          } else {
            this.$notify.error({ msg: '担保服务合同获取失败！' });
          }
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '担保服务合同获取失败！' });
        })
        .finally(_ => {
          this.$toasting.hide();
        });
    },

    /**
     * 签订担保合同
     * */
    signContract() {
      if (this.guaranteeContract.needToSignDanBao) {
        if (this.guaranteeContract.isContractPrepared === 0) {
          this.$notify.info({ msg: '担保合同生成中...', duration: 0 });
        } else if (this.guaranteeContract.isContractPrepared === 1) {
          // 合同已经生成
          if (this.guaranteeContract.signStatus === 0) {
            this.$toasting.show({ message: '跳转中', forbidClick: true });
            if (this.guaranteeContract.hhSignUrl) {
              // 去签署合同
              try {
                guaranteeContractAddress(this.guaranteeContract.hhSignUrl)
                  .then(res => {
                    if (res?.data?.rows && res.data.rows[0] && res.data.rows[0].singURL) {
                      setTimeout(() => {
                        window.location.href = res.data.rows[0].singURL;
                      }, 200);
                    } else {
                      res.data.respinfo && this.$notify.info({ msg: res.data.respinfo });
                    }
                  })
                  .catch(err => {
                    this.$notify.error({ msg: '签署合同跳转链接获取失败！' });
                  })
                  .finally(_ => {
                    this.$toasting.hide();
                  });
              } catch (e) {
                this.$notify.error({ msg: '签署合同查看失败！' });
                this.$toasting.hide();
              }
            } else {
              setTimeout(() => {
                this.$notify.error({ msg: '签署合同查看失败！' });
                this.$toasting.hide();
              }, 500);
            }
          } else if (this.guaranteeContract.signStatus === 1) {
            // 查看已经签署的合同
            this.isAgree = 'agree';
            this.toBrowseContract();
          }
        }
      }
    },

    /**
     * 查看pdf合同
     * */
    toBrowseContract() {
      this.$router.push({
        path: 'xm_browse_contract',
        query: {
          applyUnionKey: this.applyUnionKey,
          contractUrl: this.guaranteeContract.contractUrl,
          prePage: '/pay_guarantee_cost'
        }
      });
    },

    /**
     * 修改金额
     * */
    modifyAmountHandler() {
      if (this.applyUnionKey) {
        this.$toasting.show({ message: '跳转中', forbidClick: true });
        setTimeout(() => {
          this.$router.replace({ path: '/loans_base_info', query: { applyUnionKey: this.applyUnionKey } }).then(() => {
            this.$toasting.hide();
          });
        }, 1000);
      } else {
        this.$notify.error({ msg: '修改金额失败！' });
      }
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
      font-size: 62px;
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
      font-size: 26px;
      font-weight: 400;
      border-bottom: 1px solid #d8d8d8;
      .title {
        color: #333333;
      }
      .desc {
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
  .sub-btn-back {
    color: #333333;
    width: 80%;
    margin-left: 10%;
    margin-top: 30px;
  }
}

.protocol-link-wrapper {
  padding: 1rem 0.875rem 1.25rem 1.25rem;
  display: flex;
  align-items: flex-start;
  font-size: 24px;
  .protocol-select-btn {
    margin-top: 0.25rem;
    margin-right: 0.25rem;
  }
  .protocol {
    color: #1b6ffb;
  }
}
.bank-card-no {
  display: flex;
  align-items: center;
  width: 100%;
  .desc {
    width: 85%;
    padding: 0 8px;
  }
  .search-eye {
    margin-left: 18px;
    margin-right: 8px;
    width: 40px;
    height: 32px;
  }
}
/deep/.van-dialog__content {
  height: 50vh !important;
}
</style>

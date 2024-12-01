<template>
  <div class="wrapper">
    <div class="card">
      <div class="title-wrapper" slot="title">
        <img class="logo" :src="producDetail.productLogo" alt />
        {{ producDetail.productName }}
      </div>
      <div @click="switchModel">
        <span class="guarantee-count">{{ loansInfo.borrowBalanceDesc }}</span>
        <img class="qa-icon" :src="qaIcon" alt />
      </div>
      <p class="guarantee-unit">借款金额(元)</p>
    </div>
    <div class="list-wrapper">
      <div class="item-wrapper" v-for="(item, key) in confirmInfo" :key="key">
        <p class="confirm-key">{{ confirmInfoKeyInfo[key] }}</p>
        <p class="confirm-val">{{ item }}</p>
      </div>
      <div class="loan-roat-desc">年化利率:采用单利方法计算</div>
      <!-- <div class="lines-freeze-text" v-show="linesFreezeText.length">{{ linesFreezeText }}</div> -->
      <div class="protocol-link-wrapper">
        <input class="protocol-select-btn" id="agree" type="radio" value="agree" v-model="isAgree" />
        <p>
          <label for="agree">请阅读并同意协议</label>
          <span @click="switchShowProtocol" class="protocol">《互联网个人经营性贷款借款合同》《用途申明书》《还款账户变更和授信期限变更协议》</span>
        </p>
      </div>
    </div>
    <div class="sub-btn">
      <Button :loading="!subBtnCanclick" type="primary" @click="handleSubmit">确认借款</Button>
    </div>

    <div class="pdf-wrapper" v-if="isShowProtocol">
      <p-protocol-list
        @closeProtocol="switchShowProtocol"
        @getProtocolText="getProtocolText"
        :protocolText="protocolText"
        :protocolList="protocolList"
      ></p-protocol-list>
    </div>
    <v-com-model v-if="isShowModel" @ok="switchModel" title="担保费计算公式" btnDesc="关闭">
      <div class="model-desc">
        <p>担保费=放款金额 * 担保费率 * 借款期限/12</p>
        <p>(保留2位有效数字，四舍五入)</p>
      </div>
    </v-com-model>
  </div>
</template>
<script>
import { toThousands } from '@/utils/common/common.js';
import { quertProtocolUrl } from '@/controller/protocol.js';
import { LOANS_REOUND, LOANS_TREM_PROTOCOL, CONFIRM_LOANS_PURPOSE, CONFIRM_LOANS_REFUND_TYPE } from './config';
import ProtocolList from '@/common/components/common/ProtocolList.vue';
import ComModel from '@/common/components/common/ComModel.vue';
import { SESSION_ID } from '../../../../../utils/common/config';
import { computeGuaranteeFee } from '@/request/interface/impower/Bank.js';
import { gotoBorrowingApply } from '@/controller/bank';
import { checkWithdrawBeforeResult } from '@/utils/common/global';
export default {
  /**
   * 借款信息确认页
   *
   * */
  name: 'PFConfirmLoansInfo',
  data() {
    return {
      logo: require('@/assets/imgs/icon/ic_logo.png'),
      arrowIcon: require('@/assets/imgs/icon/ic_arrow.png'),
      qaIcon: require('@/assets/imgs/icon/ic_qa.png'),
      producDetail: {},
      loansInfo: {},
      isAgree: '',
      confirmInfoKeyInfo: {
        loansInterstRate: '综合利率',
        guaranteeIr: '担保费率',
        // guaranteeFee: '担保费',
        refundMode: '还款方式',
        loansTimeLimit: '借款期限',
        loansPurpose: '借款用途',
        debitCardNum: '收款账户',
        loansUser: '借款人',
        idCradNum: '证件号'
      },
      confirmInfo: {
        loansInterstRate: '',
        guaranteeIr: '',
        guaranteeFee: '',
        refundMode: '',
        loansTimeLimit: '',
        loansPurpose: '',
        debitCardNum: '',
        loansUser: '',
        idCradNum: ''
      },
      guaranteeFee: '',
      protocolList: [
        { code: '07', name: '互联网个人经营性贷款借款合同', isNess: true, isReadOver: false },
        // { code: '10', name: '担保服务合同', isReadOver: false },
        { code: '08', name: '用途申明书', isReadOver: false },
        { code: '02', name: '还款账户变更和授信期限变更协议', isReadOver: false }
      ],
      isShowProtocol: false,
      protocolText: [],
      redirectUrl: '',
      subBtnCanclick: true,
      isShowModel: false,
      // 提款校验的部分
      isSubmitClickedJump: false,
      isInitSubmit: true,
      linesFreezeText: '',
      timingCheckInstance: null
    };
  },
  components: {
    'v-com-model': ComModel,
    'p-protocol-list': ProtocolList
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    clearInterval(this.timingCheckInstance);
    this.timingCheckInstance = null;
    this.$notify.clear();
  },
  methods: {
    /**
     * 初始化
     * */
    init() {
      this.loansInfo = JSON.parse(this.$route.query.loansInfo);
      let applyUnionKey = this.loansInfo.applyUnionKey;
      sessionStorage.setItem(SESSION_ID.unionKey, applyUnionKey);
      this.loansInfo.borrowBalanceDesc = toThousands(parseFloat(this.loansInfo.borrowBalance).toFixed(2));
      this.producDetail = JSON.parse(this.$route.query.producDetail);
      this.getGuaranteeFee();
    },

    /**
     * 借款信息的格式化
     * */
    formateConfirmInfo() {
      let loansInfo = this.loansInfo;
      this.loansInfo.guaranteeFee = this.guaranteeFee;
      this.producDetail.guaranteeFee = this.guaranteeFee;
      let confirmInfo = {
        loansInterstRate: `年化${loansInfo.interestRate * 100}%+担保费（${this.guaranteeFee}）`,
        loansTimeLimit: loansInfo.loansTimeLimit,
        refundMode: CONFIRM_LOANS_REFUND_TYPE[loansInfo.refundMode],
        loansPurpose: CONFIRM_LOANS_PURPOSE[loansInfo.loansPurpose],
        debitCardNum: loansInfo.bankCardDesc,
        loansUser: this.$store.state.userInfo.name,
        idCradNum: this.$store.state.userInfo.idNo
      };
      this.confirmInfo = confirmInfo;
    },

    /**
     * 借款提交
     * */
    handleSubmit() {
      if (!this.subBtnCanclick) {
        return true;
      }
      if (!this.isAgree) {
        this.$notify.info({ msg: '请阅读并同意协议！' });
        return;
      }
      if (!this.protocolList[0].isReadOver) {
        this.$notify.info({ msg: '请阅读借款合同！' });
        this.isShowProtocol = true;
        return;
      }
      this.subBtnCanclick = false;
      this.timingCheckWithdrawResult();
    },

    /**
     * 定时查询提款校验的结果
     * */
    timingCheckWithdrawResult() {
      if (this.isSubmitClickedJump) {
        clearInterval(this.timingCheckInstance);
        this.timingCheckInstance = null;
        this.borrowingInApplication();
      }
      if (this.timingCheckInstance) {
        this.$notify.info({ msg: this.linesFreezeText, duration: 0 });
        this.subBtnCanclick = true;
        return;
      }
      this.checkWithdrawResult();
      this.timingCheckInstance = setInterval(() => {
        this.checkWithdrawResult();
      }, 60000);
    },

    /**
     * 获取提款校验结果
     *      0, "拒绝" 1, "通过"  2, "补件"  3,"税务授权"  4,"存在处于借款审核中的件" 5，"审核中"
     * */
    checkWithdrawResult() {
      checkWithdrawBeforeResult(this.loansInfo.applyUnionKey)
        .then((res) => {
          if (res?.data?.success && res.data.data) {
            if (res.data.data.verifyRsult === 0) {
              this.linesFreezeText =
                res.data.data.reason && res.data.data.reason[0]
                  ? res.data.data.reason[0]
                  : '提款审核未通过，无法提款！';
              this.isInitSubmit = false;
              this.$notify.info({ msg: this.linesFreezeText, duration: 0 });
            } else if (res.data.data.verifyRsult === 5) {
              this.linesFreezeText =
                res.data.data.reason && res.data.data.reason[0] ? res.data.data.reason[0] : '提款校验审核中...';
              this.isInitSubmit = false;
              this.$notify.info({ msg: this.linesFreezeText, duration: 0 });
            } else if (res.data.data.verifyRsult === 1) {
              if (this.isInitSubmit) {
                this.borrowingInApplication();
              } else {
                this.linesFreezeText = '提款审核通过，请确认提款！';
                this.isSubmitClickedJump = true;
                this.$notify.info({ msg: this.linesFreezeText, duration: 0 });
              }
            } else if (res.data.data.verifyRsult === 3) {
              this.linesFreezeText =
                res.data.data.reason && res.data.data.reason[0]
                  ? res.data.data.reason[0]
                  : '财税数据正在采集中，请等待...';
              this.isInitSubmit = false;
              this.$notify.info({ msg: this.linesFreezeText, duration: 0 });
            } else if (res.data.data.verifyRsult === 6) {
              this.linesFreezeText = '当前并没有进行提款校验，正回到首页！';
              this.$notify.info({ msg: this.linesFreezeText, duration: 0 });
              setTimeout(() => {
                this.$router.replace({ path: '/' });
              }, 1500);
            } else if (res.data.data.verifyRsult === 4) {
              this.linesFreezeText =
                res.data.data.reason && res.data.data.reason[0] ? res.data.data.reason[0] : '存在处于借款审核中的件！';
              this.isInitSubmit = false;
              this.$notify.info({ msg: this.linesFreezeText, duration: 0 });
            }
          } else {
            this.$notify.error({ msg: '提款校验失败！' });
          }
        })
        .catch((err) => {
          if (err && err.data) {
            this.$notify.error({ msg: err?.data?.msg || '提款校验结果获取失败！' });
          } else {
            this.$notify.error({ msg: '提款校验结果获取失败！' });
          }
        })
        .finally((_) => {
          this.subBtnCanclick = true;
        });
    },

    /**
     * 支用申请 (用的是之前的借款申请接口作为支用的申请接口)
     *    借款校验通过之后----借款支用申请
     * */
    borrowingInApplication() {
      let params = this.loansInfo;
      this.$toasting.show({ message: '支用申请中', forbidClick: true });
      gotoBorrowingApply(params)
        .then((res) => {
          if (res?.data?.success) {
            this.$notify.success({ msg: res?.data?.data || '借款支用申请成功！' });
            setTimeout(() => {
              this.jumpPath();
            }, 2000);
          } else {
            this.$notify.error({ msg: '借款支用申请失败！' });
          }
        })
        .catch((err) => {
          let msg = err?.data?.msg || '借款支用申请失败！';
          this.$notify.error({ msg: msg });
        })
        .finally((_) => {
          clearInterval(this.timingCheckInstance);
          this.timingCheckInstance = null;
          this.$toasting.hide();
        });
    },

    /**
     * 页面跳转
     *
     * */
    jumpPath() {
      this.$router.replace({
        path: '/pay_guarantee_cost',
        query: { applyUnionKey: this.loansInfo.applyUnionKey }
      });
    },

    /**
     * 获取合同
     * */
    getProtocolText(protocol) {
      this.protocolText = [];
      let fileType = protocol.code;
      let index = protocol.index;
      let userInfo = this.$store.state.userInfo;
      let loansInfo = this.loansInfo;
      let params = {
        applyUnionKey: this.loansInfo.applyUnionKey,
        loanAmt: loansInfo.borrowBalance,
        loanPurpose: '个人经营',
        loanTerm: LOANS_TREM_PROTOCOL[loansInfo.loansTimeLimit],
        paymentType: LOANS_REOUND[loansInfo.refundMode],
        userName: userInfo.name,
        idCard: userInfo.idNo,
        fileType
      };
      quertProtocolUrl(params)
        .then((textArr) => {
          if (textArr) {
            this.protocolList[index].isReadOver = true;
            this.protocolText = textArr;
          } else {
            this.$notify.error({ msg: '合同获取失败！' });
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err.data.msg });
        });
    },

    switchShowProtocol() {
      this.isShowProtocol = !this.isShowProtocol;
    },

    switchModel() {
      this.isShowModel = !this.isShowModel;
    },

    /**
     * 担保费获取
     * */
    getGuaranteeFee() {
      let params = {
        productId: this.loansInfo.productId ? this.loansInfo.productId : localStorage.getItem('productId'),
        loanAmount: this.loansInfo.borrowBalance ? this.loansInfo.borrowBalance : ''
      };
      computeGuaranteeFee(params)
        .then((res) => {
          if (res?.data?.data) {
            this.guaranteeFee = res.data.data;
          } else {
            this.$notify.error({ msg: '获取担保费出错！' });
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg });
        })
        .finally((_) => {
          this.formateConfirmInfo();
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.wrapper {
  min-height: 100vh;
  background: rgba(244, 246, 249, 1);
  padding-bottom: 1.875rem;
  .card {
    text-align: center;
    background: #ffffff;
    padding: 23px 20px 20px 20px;
    border-radius: 10;
    .guarantee-count {
      font-size: 61px;
      margin-top: 20px;
      font-weight: 600;
      color: rgba(51, 51, 51, 1);
    }
    .qa-icon {
      height: 30px;
      width: 30px;
      position: relative;
      bottom: 10px;
      left: 15px;
    }
    .guarantee-unit {
      font-size: 28px;
      font-weight: 400;
      color: rgba(51, 51, 51, 1);
    }
  }
  .title-wrapper {
    display: flex;
    align-items: center;
    font-size: 28px;
    .logo {
      height: 80px;
      width: 80px;
      margin-right: 25px;
    }
  }
  .list-wrapper {
    background: #ffffff;
    margin-top: 15px;
    border-radius: 10px;
  }
  .lines-freeze-text {
    color: red;
    text-align: center;
    margin: 12px 16px 0;
  }
  .item-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px rgba(238, 241, 245, 1) solid;
    .last-item {
      font-size: 24px;
      font-weight: 400;
      color: rgba(27, 111, 251, 1);
    }
    .ic_arrow {
      height: 20px;
      width: 20px;
    }
  }
  .model-desc {
    font-size: 24px;
    font-weight: 400;
    color: rgba(217, 50, 50, 1);
    margin: 3.5rem 0 4.5rem 0;
    text-align: center;
  }
  .sub-btn {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    button {
      width: 80%;
      font-weight: 500;
    }
  }
}
.protocol-link-wrapper {
  padding: 0.875rem 0.875rem 1.25rem 1.25rem;
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
.loan-roat-desc {
  position: absolute;
  top: 30px;
  right: 20px;
  font-size: 20px;
}
.confirm-key {
  font-size: 24px;
}
.confirm-val {
  font-size: 24px;
}
</style>

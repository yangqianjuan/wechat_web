<template>
  <div class="bill-wrapper reset-form" v-show="isOverLoading">
    <!-- 代还单单个展示 -->
    <div class="bill-item-wrapper">
      <div class="item-hearder">
        <div class="logo-wrapper">
          <img class="company-logo" :src="repaymentPlan.productLogo" />
          <span class="company-name">{{repaymentPlan.productName}}</span>
        </div>
        <div class="bill-date">{{repaymentPlan.billDate ? repaymentPlan.billDate : repaymentPlan.formateCreateTime}}</div>
      </div>
      <div class="item-body">
        <div>
          <p class="bill-count">{{repaymentPlan.loanAmountShow}}</p>
          <p class="bill-count-unit">借款金额(元)</p>
        </div>
        <img class="bill-repay-status-icon" :src="icHasPayment" v-if="repaymentPlan.repayStatus === '106'" alt />
        <div class="bill-status" @click="gotoDetail">
          {{repaymentPlan.loansStatusDesc?repaymentPlan.loansStatusDesc:"详情"}}
          <img class="ic-arrow" :src="icArrow" />
        </div>
      </div>
    </div>
    <!-- 单笔代还的单期还款计划展示 -->
    <div class="bill-item-detail-wrapper">
      <bill-item-detail
        v-for="(repayPlan, index) in repaymentPlan.repayList"
        :key="index"
        :total="repaymentPlan.repayList.length"
        :billItemDetail="repayPlan"
        :isCard="isCard"
      ></bill-item-detail>
    </div>
    <!-- 还款试算按钮 -->
    <div class="foot-btn">
      <van-button
        class="detail-btn"
        type="primary"
        @click="gotoApply"
        v-if="isShowPrepayBtn"
        :disabled="isOverPrepay"
      >{{prePayBtnDesc}}</van-button>
    </div>

    <!-- 还款试算展示 -->
    <van-popup round v-model="modal1" position="bottom">
      <div class="trial">
        <div class="title-dialog">还款试算</div>
        <div class="bank-info">
          <div class="tip">{{bankInfo.type === '01' ? '银行卡' : '电子'}}账户信息</div>
          <div class="info-item">
            <div class="title">姓名</div>
            <div class="desc black-col">{{bankInfo.userName}}</div>
          </div>
          <div class="info-item">
            <div class="title">{{bankInfo.type === '01' ? '银行卡号' : '电子账户'}}</div>
            <div class="desc">{{bankInfo.bankCardNo}}</div>
          </div>
          <div class="info-item">
            <div class="title">开户行</div>
            <div class="desc">{{bankInfo.bankName}}</div>
          </div>
          <div class="info-item">
            <div class="title">手机号</div>
            <div class="desc">{{bankInfo.mobile}}</div>
          </div>
          <div class="info-item" v-if="bankInfo.type === '02'">
            <div class="title">账户余额</div>
            <div class="desc">{{ bankInfo.remainingSum ? bankInfo.remainingSum + " 元" : '0.00 元' }}</div>
          </div>
        </div>
        <div class="repay-type" @click.stop="()=>{}">
          <div class="tip">还款方式</div>
          <van-cell is-link class="self-cell" :value="repay.name" @click.stop="repayTypeShow = true" />
          <van-action-sheet
            v-model="repayTypeShow"
            class="self-popup"
            :actions="repayTypeList"
            @select="onRepayTypeSelect"
            description="还款方式"
            cancel-text="取消"
            :close-on-click-overlay="false"
            close-on-click-action
          />
        </div>
        <div class="res">
          <div class="tip">试算金额</div>
          <div class="prepay-info">
            <div class="prepay-unit">应还金额(元)</div>
            <div class="prepay-count">{{prepayDetail.repayTotalAmt?prepayDetail.repayTotalAmt:'0.00'}} 元</div>
          </div>
        </div>
        <van-form validate-first ref="formDynamic">
          <!-- <van-field v-model="formItem.phone" disabled label="手机号"></van-field> -->
          <van-field
            v-model="formItem.smsCode"
            name="smsCode"
            label="验证码"
            placeholder="请输入验证码"
            :rules="ruleValidate.smsCode"
          >
            <div slot="right-icon" class="sms-content">
              <div @click.stop="()=>{}">
                <SendSms ref="send-sms-bank" @sendSms="sendSmsBank"></SendSms>
              </div>
            </div>
          </van-field>
        </van-form>
        <div class="to-charge" v-if="bankInfo.type === '02' && bankInfo.remainingSum" @click.stop="toCharge">
          <u>去充值!</u>
        </div>
        <van-button
          class="modal-sub-btn foot-operate-btn"
          v-if="bankInfo.type === '01' || bankInfo.remainingSum"
          type="primary"
          @click="ok"
        >{{btnDesc}}</van-button>

        <!-- 账户余额不存在 -->
        <van-button
          class="modal-sub-btn foot-operate-btn"
          v-if="!bankInfo.remainingSum && bankInfo.type === '02'"
          type="primary"
          @click="toCharge"
        >充值</van-button>
        <div class="account-balance" v-if="!bankInfo.remainingSum && bankInfo.type === '02'">账户余额不足，请前去充值！</div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import BillItemDetail from '../common/BillItemDetail';
import { advanceGFRepayment } from '@/controller/bank.js';
import { getGFBorrowingAndRepaymentPlanList } from '@/controller/bill.js';
import { toThousands } from '@/utils/common/common';
import { queryReapyAcountInfo } from '@/controller/bank.js';
import { getGfSessionId } from '@/controller/common.js';
import { SESSION_ID } from '@/utils/common/config.js';
import { gfRepayApply, gfRepayDetail, gfSendMess } from '@/request/interface/gf/common.js';
import SendSms from '../../../../component/sms/SendSms.vue';
export default {
  /**
   * gf还款的详情的列表
   * */
  data() {
    return {
      repay: {
        value: '04',
        name: '全部结清'
      },
      icHasPayment: require('@/assets/imgs/icon/ic_bill_clear.png'),
      repayTypeShow: false,
      repayTypeList: [],

      formItem: { smsCode: '', smsSerialNo: '', phone: '' },
      ruleValidate: {
        smsCode: [{ required: true, message: '请输入验证码', trigger: 'onBlur' }]
      },
      // repayTypeList: [
      //   { name: "正常还款（到期或逾期还款）", value: "01" },
      //   { name: "提前部分还款", value: "02" },
      //   // { name: "提前还当期", value: "03" },
      //   { name: "全部结清", value: "04" }
      //   // { name: "部分还款（先还欠款如有剩余提前还本）", value: "05" },
      //   // { name: "按期次提前还款", value: "06" }
      // ],

      applyUnionKey: '',
      isCard: true,
      repaymentPlan: {},
      modal1: false,
      total: '',
      preayCount: '500',
      isOverPrepay: false,
      isOverAdvanceRepayment: false,
      // 页面展示
      isOverLoading: false,
      // 还款按钮的展示
      isShowPrepayBtn: false,
      // 还款按钮的描述
      prePayBtnDesc: '主动还款',

      prepayDetail: {},
      btnDesc: '确认还款',
      modalNote: '请确认银行卡余额充足，余额不足无法结清',
      bankInfo: {},
      loanNo: '',
      productId: '',
      icArrow: require('@/assets/imgs/icon/ic_arrow.png')
    };
  },
  components: {
    // "bill-item": BillItem,
    'bill-item-detail': BillItemDetail,
    SendSms
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      this.loanNo = this.$route.query.loanNo;
      this.productId = this.$route.query.productId;
      if (this.loanNo && this.productId) {
        this.queryBorrowingAndRepaymentPlan();
      }
    },

    // 当选择还款方式
    onRepayTypeSelect(item) {
      // console.log("item,", item);
      if (this.repay.value !== item.value) {
        this.repay.name = item.name;
        this.repay.value = item.value;
        this.$toasting.show({ message: '还款试算中', forbidClick: true });
        // 获取还款信息
        this.getAdvanceRepayment();
      }
    },

    gotoDetail() {
      let params = {
        productName: this.repaymentPlan.productName,
        productLogo: this.repaymentPlan.productLogo,
        loanNo: this.loanNo
      };
      if (params.loanNo) {
        this.$router.push({ path: '/xwe_loans_detail', query: { loanInfo: JSON.stringify(params) } });
      } else {
        this.$notify.info({ msg: '暂无待还详情信息！' });
      }
    },

    /**
     * 打开还款试算按钮
     * */
    gotoApply() {
      this.getRepayAcountInfo();
    },

    ok() {
      if (!this.isOverAdvanceRepayment) {
        this.$notify.error({ msg: '还款申请失败！' });
        return;
      }
      this.$refs.formDynamic.validate(['smsCode']).then((valid) => {
        if (!valid) {
          this.$dialog
            .confirm({
              title: '提示',
              message: '确定还款？'
            })
            .then(() => {
              let params = {
                loanNo: this.loanNo,
                repayType: this.repay.value,
                repayTotalAmt: this.prepayDetail.repayTotalAmt,
                sessionId: sessionStorage.getItem(SESSION_ID.repaySessionId),
                // 验证码
                verifyCode: this.formItem.smsCode,
                // 流水号
                smsSerialNo: this.formItem.smsSerialNo
              };
              if (params.smsSerialNo) {
                this.$toasting.show({ message: '申请中', forbidClick: true });
                gfRepayApply(params)
                  .then((res) => {
                    if (res?.data?.success) {
                      this.$toasting.success({ msg: '成功' });

                      let payload = {
                        productLogo: this.repaymentPlan.productLogo,
                        productName: this.repaymentPlan.productName,
                        loanAmount: this.repaymentPlan.loanAmount,
                        loanNo: this.repaymentPlan.loanNo
                      };
                      this.$router.push({ path: '/xwe_loans_detail', query: { loanInfo: JSON.stringify(payload) } });
                    } else {
                      this.$toasting.error({ msg: '失败' });
                    }
                  })
                  .catch((err) => {
                    this.$notify.error({ msg: err?.data?.msg || '申请失败！', duration: 3000 });
                  })
                  .finally(() => {
                    this.$toasting.hide();
                  });
              } else {
                this.$notify.info({ msg: '验证码失效，请一分钟之后，再次发送！' });
              }
            });
        }
      });
    },

    cancel() {
      this.modal1 = false;
    },

    /**
     * 获取还款试算
     *
     * */
    getAdvanceRepayment() {
      advanceGFRepayment({ loanNo: this.loanNo, repayType: this.repay.value })
        .then((res) => {
          if (res?.data?.data) {
            this.isOverAdvanceRepayment = true;
            this.prepayDetail = res.data.data;
            this.prepayDetail.totalRepaymentDesc = toThousands(res.data.data.repayTotalAmt);
            // 打开还款试算的按钮
            this.modal1 = true;
          } else {
            this.$notify.info({ msg: '获取到还款试算的信息！' });
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '还款试算失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    /**
     * 获取还款列表和还款计划
     * */
    queryBorrowingAndRepaymentPlan() {
      this.applyUnionKey = this.$route.query.applyUnionKey;
      if (this.applyUnionKey) {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        getGFBorrowingAndRepaymentPlanList({ loanNo: this.loanNo, applyUnionKey: this.applyUnionKey })
          .then((res) => {
            if (res.repaymentPlanList && res.repaymentPlanList.length) {
              this.repaymentPlan = res.repaymentPlanList[0];
              this.getRepayDetail();
            } else {
              this.isShowPrepayBtn = false;
            }
          })
          .catch((err) => {
            this.$notify.error({ msg: err?.data?.msg || '获取还款详情失败！' });
          })
          .finally(() => {
            this.isOverLoading = true;
            this.$toasting.hide();
          });
      } else {
        this.$notify.info({ msg: '暂无还款详情！' });
      }
    },

    /**
     * 获取广发还款金额信息
     *
     * */
    getRepayDetail() {
      gfRepayDetail({ loanNo: this.loanNo })
        .then((res) => {
          if (res.data.data) {
            if (res.data.data.allPrepaymentFlag === '1' || res.data.data.prepaymentFlag === '1') {
              this.isShowPrepayBtn = true;
              this.repayTypeList.push({ name: '全部结清', value: '04' });
            } else {
              this.isShowPrepayBtn = false;
            }
            //  allPrepaymentFlag 状态 0 不允许  1 允许
            //  prepaymentFlag   状态 0 不允许  1 允许
            //  unAllPrepaymentReason 不允许提前结清贷款原因
            //  unPrepaymentReason 不允许部分提前还款原因
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '获取账单详情失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    // 获取还款账户信息
    getRepayAcountInfo() {
      let creditNo = sessionStorage.getItem('creditNo');
      if (creditNo) {
        this.$toasting.show({ message: '试算中', forbidClick: true });
        queryReapyAcountInfo({ creditNo, productId: this.productId })
          .then((repayBankCard) => {
            if (repayBankCard) {
              this.bankInfo = repayBankCard;
              this.bankInfo.routerProductId = this.productId;
              this.bankInfo.routerCreditNo = creditNo;
              // 获取还款会话的id
              getGfSessionId({ applyUnionKey: this.applyUnionKey, type: 2 });
              this.getAdvanceRepayment();
            } else {
              this.$toasting.hide();
              this.$notify.info({ msg: '暂无还款账户信息！' });
            }
          })
          .catch((err) => {
            this.$toasting.hide();
            this.$notify.error({ msg: err?.data?.msg || '获取还款账户信息失败！' });
          });
      } else {
        this.$notify.info({ msg: '暂无授信单号，还款试算失败！' });
      }
    },

    // 发送验证码
    sendSmsBank() {
      if (sessionStorage.getItem(SESSION_ID.repaySessionId) && sessionStorage.getItem('applyUnionKey_1035')) {
        let params = {
          applyUnionKey: sessionStorage.getItem('applyUnionKey_1035'),
          sessionId: sessionStorage.getItem(SESSION_ID.repaySessionId)
        };
        this.$toasting.show({ message: '发送中', forbidClick: true });
        this.$refs['send-sms-bank'].smsSending();
        gfSendMess(params)
          .then((res) => {
            if (res?.data?.success && res?.data?.data) {
              this.formItem.smsSerialNo = res.data.data;
              this.$refs['send-sms-bank'].sendSuccess();
            } else {
              this.$refs['send-sms-bank'].sendError();
            }
          })
          .catch((err) => {
            if (err.code !== 403) {
              this.$refs['send-sms-bank'].sendError();
            } else {
              this.$refs['send-sms-bank'].reset();
            }
          });
      } else {
        this.$refs['send-sms-bank'].sendError();
      }
    },

    // 电子账户的情况下，去充值
    toCharge() {
      this.$router.replace({
        path: '/xwe_bank_Charge',
        query: { isFromRepay: 'yes', cre_no: this.prepayDetail.creditNo, pro_id: this.productId, loanNo: this.loanNo }
      });
    },

    // 刷新
    reset() {
      this.init();
    }
  }
};
</script>
<style lang="scss" scoped>
.bill-wrapper {
  min-height: 100vh;
  height: 100vh;
  padding-bottom: 3.75rem;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .bill-item-detail-wrapper {
    flex: 1;
    overflow: auto;
    border-radius: 10px;
    margin: 16px 25px;
    padding-bottom: 5vh;
  }
}

.reset-form {
  /deep/.van-form {
    .van-field__label {
      span {
        font-size: 26px !important;
        font-weight: 500;
      }
    }
    .van-field__control {
      font-size: 26px !important;
      font-weight: 500;
    }
    // .van-field__error-message {
    //   // bottom: -25px !important;
    // }
    .van-cell {
      overflow: unset;
    }
  }
}

.foot-btn {
  position: fixed;
  bottom: 0;
  // left: 7vw;
  width: 100%;
  height: 15vh;
  display: flex;
  align-items: center;
  justify-content: center;
  // background-color: #ffff;
  /deep/.detail-btn {
    background-color: #2d8cf0;
    border: 0;
    width: 86vw;
    height: 75px;
    span {
      font-size: 28px;
      font-weight: 400;
    }
  }
}
.prepay-count {
  font-weight: 600;
  color: rgba(51, 51, 51, 1);
  text-align: center;
}
.prepay-unit {
  font-size: 26px;
  font-weight: 500;
  color: rgba(51, 51, 51, 1);
  text-align: center;
  margin-top: 0.25rem;
}
.prepay-desc {
  font-weight: 400;
  color: rgba(127, 127, 127, 1);
  text-align: center;
}
.trial {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 12px 30px;
  padding-bottom: 50px;
  .title-dialog {
    font-size: 32px;
    font-weight: 600;
    text-align: center;
    margin: 12px 0;
  }
  .bank-info {
    // margin-bottom: 12px;
    .name {
      font-size: 26px;
      font-weight: 500;
      text-align: center;
      margin-bottom: 12px;
    }
    .desc {
      font-size: 34px;
      font-weight: 500;
      text-align: center;
      //   margin-bottom: 12px;
    }
  }
  .modal-note {
    font-size: 26px;
    font-weight: 500;
    color: rgba(127, 127, 127, 1);
    margin-top: 14px;
    margin-bottom: 18px;
    text-align: center;
  }
  .modal-sub-btn {
    width: 60%;
    margin-top: 30px;
    font-weight: 500;
    color: rgba(255, 255, 255, 1);
    margin-left: 20%;
    height: unset;
    padding: 16px 0;
  }
  .repay-type {
    // width: 70%;
    // margin-left: 15%;
    padding: 8px 0;
  }
  .res {
    .prepay-info {
      display: flex;
      justify-content: space-between;
      padding: 12px 30px;
    }
    .prepay-count {
      font-size: 28px;
      font-weight: 500;
      color: #333;
    }
  }
  .van-cell::after {
    border-color: #d8d8d8;
  }
  .to-charge {
    text-align: right;
    margin-right: 30px;
    margin-top: 12px;
    u {
      font-size: 26px;
      font-weight: 400;
      color: #3552d0;
      padding: 4px 4px;
    }
    // border-bottom: 1px solid #3552d0;
  }
}
.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 27px;
  background: #ffffff;
  border-bottom: 1px solid #f2f4f8;
  .title {
    font-weight: 500;
    font-size: 26px;
  }
  .desc {
    font-weight: 500;
    font-size: 26px !important;
  }
}
.account-balance {
  margin-top: 20px;
  margin-bottom: 20px;
  color: red;
  text-align: center;
  font-size: 24px;
  font-weight: 500;
}
/deep/.van-cell__value {
  span {
    font-weight: 500;
    font-size: 26px !important;
  }
}
//

// 列表
.bill-item-wrapper {
  padding: 30px 25px;
  margin-top: 15px;
  // background: #ffffff;
  background: #f4f6f9;
  -moz-box-shadow: 0 0 10px #f4f6f9;
  -webkit-box-shadow: 0 0 10px #f4f6f9;
  box-shadow: 0 0 10px #f4f6f9;
  position: relative;
}
.logo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
.item-hearder {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  .company-logo {
    height: 44px;
    max-width: 80px;
    background-size: 100% 100%;
  }
  .company-name {
    font-size: 30px;
    margin-left: 12px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
  }
  .bill-date {
    font-size: 36px;
    font-weight: 500;
    color: rgba(102, 102, 102, 1);
  }
}

.item-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .bill-count {
    font-size: 44px;
    font-weight: 600;
    color: rgba(51, 51, 51, 1);
    margin-bottom: 12px;
  }
  .bill-count-unit {
    font-size: 24px;
    font-weight: 500;
    // text-align: center;
    color: rgba(127, 127, 127, 1);
  }
  .bill-status {
    display: flex;
    align-items: center;
    font-size: 28px;
    font-weight: 400;
    margin-top: 40px;
    height: 100%;
    .ic-arrow {
      width: 36px;
      margin-left: 8px;
      height: 34px;
      margin-bottom: -6px;
    }
  }
}
.bill-status-icon {
  width: 90px;
  position: absolute;
  right: 40px;
  top: 60px;
}

.bill-repay-status-icon {
  width: 100px;
  position: absolute;
  right: 80px;
  top: 65px;
}
.wraning {
  font-size: 22px;
  margin-top: 20px;
  font-weight: 500;
  color: rgba(153, 153, 153, 1);
}
</style>

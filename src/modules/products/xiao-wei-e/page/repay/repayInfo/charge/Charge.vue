<template>
  <div class="repay-charge-account reset-form" v-if="Object.keys(repayBankCard).length">
    <div class="remind">客户 {{ repayBankCard.userName }} 的电子户充值</div>
    <div class="account-info">
      <div class="account-info-title">电子户信息</div>
      <div class="account-info-show">
        <div class="left-icon">
          <van-image width="100%" height="100%" fit="cover" :src="repayBankCard.bankIconUrl" />
        </div>
        <div class="right-desc">
          <div class="card-desc">{{repayBankCard.bankName}} ( {{ repayBankCard.bankCardNo | bankShowAfterFour }} )</div>
          <div class="account-balance">
            <span
              class="account-balance-text"
            >账户余额 {{ repayBankCard.remainingSum ?'￥' + repayBankCard.remainingSum: '￥0.00' }}</span>
            <span class="reload-balance" @click.stop="reflesh">
              <van-icon name="replay" />
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="fill"></div>
    <div class="repay-type" v-if="repayTypeShow">
      <van-cell is-link class="self-cell" title="还款方式" :value="repay.type" @click="repayShow = true" />
      <van-action-sheet
        v-model="repayShow"
        class="self-popup"
        :actions="repayTypeList"
        description="还款方式"
        @select="onRepayTypeSelect"
        cancel-text="取消"
        close-on-click-action
      />
    </div>
    <div class="fill"></div>
    <div class="charge-account-detail">
      <div class="charge-account-detail-title">充值金额</div>
      <div class="account-detail-operate">
        <van-field
          class="charge-account"
          left-icon="gold-coin-o"
          v-model="chargeAccount"
          type="number"
          @input="balanceChange"
        />

        <van-form validate-first ref="formDynamic">
          <van-field>
            <div slot="input" style="width:100%" class="bank-name">
              <van-cell is-link class="self-cell" title="付款账户" :value="payment.value" @click="paymentShow = true" />
              <van-action-sheet
                v-model="paymentShow"
                class="self-popup"
                :actions="paymentList"
                description="付款账户"
                @select="onPaymentListSelect"
                cancel-text="取消"
                close-on-click-action
              />
            </div>
          </van-field>
        </van-form>
      </div>
    </div>
    <div class="operate">
      <van-button class="foot-operate-btn" type="primary" @click.stop="charge">确定充值</van-button>
    </div>
  </div>
</template>
<script>
import { gfRechargeApply } from '@/request/interface/gf/common.js';
import { queryReapyAcountInfo, advanceGFRepayment } from '@/controller/bank.js';
import { getUnionKey } from '@/request/interface/common/index';
export default {
  /**
   * gf电子账户充值
   * */
  name: 'ChargeAccount',
  data() {
    return {
      chargeAccount: '',

      // 还款类型
      repay: {
        type: '全部结清',
        value: '04'
      },
      repayTypeList: [
        { name: '全部结清', value: '04' }
        // { name: "提前部分还款", value: "02" }
      ],
      repayShow: false,
      // 是否展示还款类型
      repayTypeShow: false,

      // 选择付款账户的信息
      payment: {
        value: '',
        info: {}
      },
      // 付款账户的选择
      paymentShow: false,
      // 付款账户
      paymentList: [],
      // 验证码
      smsCode: {
        value: ''
      },
      repayBankCard: {},

      applyUnionKey: ''
    };
  },
  components: {
    // SendSms
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      if (this.$route.query.isFromRepay === 'yes') {
        this.repayTypeShow = true;
      }
      if (!sessionStorage.getItem('repayApplyUnionKey')) {
        this.getApplyUnionKey();
      } else {
        this.applyUnionKey = sessionStorage.getItem('repayApplyUnionKey');
      }
      this.getRepayAcountInfo();
    },

    // 获取充值银行卡的信息
    getRepayAcountInfo() {
      let creditNo = this.$route.query.cre_no;
      let productId = this.$route.query.pro_id;
      if (creditNo && productId) {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        queryReapyAcountInfo({ creditNo, productId })
          .then((repayBankCard) => {
            if (Object.keys(repayBankCard).length && repayBankCard.accountToBeCredited) {
              this.repayBankCard = repayBankCard;
              let paymentList = {
                name: repayBankCard.accountToBeCredited.bankName,
                ...repayBankCard.accountToBeCredited
              };
              this.paymentList = [paymentList];
              this.payment.value = this.paymentList[0].name;
              if (this.$route.query.isFromRepay === 'yes') {
                this.getAdvanceRepayment();
              }
            }
          })
          .catch((err) => {
            this.$notify.error({
              msg: err?.data?.msg || '充值信息获取失败！'
            });
          })
          .finally(() => {
            this.$toasting.hide();
          });
      }
    },

    getApplyUnionKey() {
      let payload = {};
      payload.referrer = this.$store.state.referrer;
      payload.productId = this.$store.state.productId;
      getUnionKey(payload)
        .then((res) => {
          if (res?.data?.data) {
            this.applyUnionKey = res.data.data;
            sessionStorage.setItem('repayApplyUnionKey', res.data.data);
          }
        })
        .catch((err) => {
          this.$notify.error({
            msg: err?.data?.msg || '充值信息获取失败！'
          });
        })
        .finally(() => {});
    },

    // 还款方式
    onRepayTypeSelect(item) {
      if (item) {
        this.repay.type = item.name;
        this.repay.value = item.value;
        this.$toasting.show({ message: '试算中', forbidClick: true });
        this.getAdvanceRepayment();
      }
    },

    // 控制输入的数字类型
    balanceChange(value) {
      if (value) {
        value = /^[0-9]*\.?[0-9]{0,2}$/.test(value) ? value : value.substring(0, value.length - 1);
      }
      this.chargeAccount = value;
    },

    // 收款账户
    onPaymentListSelect(item) {
      if (item) {
        this.payment.value = item.name;
        this.payment.info = item;
      }
    },

    // 充值
    charge() {
      let drawAmount = parseFloat(this.chargeAccount);
      if (!drawAmount || drawAmount <= 0) {
        this.$notify.info({
          msg: '请输入大于 0 的金额！'
        });
        return;
      }
      this.$dialog
        .confirm({
          title: '提示',
          message: '确定充值？'
        })
        .then(() => {
          this.$toasting.show({ message: '申请中', forbidClick: true });
          gfRechargeApply({ rechargeMoney: drawAmount, applyUnionKey: this.applyUnionKey })
            .then((res) => {
              if (res?.data?.success) {
                this.$toasting.success({ msg: '成功' });
                setTimeout(() => {
                  this.$router.replace({
                    name: 'XWEBankAcountChargeDetail',
                    query: {
                      rechargeApplyId: res.data.data.rechargeId,
                      // no yes 依据标准
                      isFromRepay: this.$route.query.isFromRepay,
                      loanNo: this.$route.query.loanNo,
                      cre_no: this.$route.query.cre_no,
                      pro_id: this.$route.query.pro_id
                    }
                  });
                }, 1000);
              }
            })
            .catch((err) => {
              this.$notify.error({
                msg: err?.data?.msg || '申请失败！'
              });
            })
            .finally(() => {
              this.$toasting.hide();
            });
        });
    },

    // 重新获取电子账户信息
    reflesh() {
      this.getRepayAcountInfo();
    },

    /**
     * 获取还款试算
     *
     * */
    getAdvanceRepayment() {
      let loanNo = this.$route.query.loanNo;
      let repayType = this.repay.value;
      if (loanNo && repayType) {
        advanceGFRepayment({ loanNo: loanNo, repayType: repayType })
          .then((res) => {
            if (res?.data?.success && res?.data?.data) {
              this.chargeAccount = res.data.data.repayTotalAmt || 0;
            } else {
              this.$notify.info({ msg: '未获取到还款试算的信息！' });
            }
          })
          .catch((err) => {
            this.$notify.error({ msg: err?.data?.msg || '获取还款试算信息失败！' });
          })
          .finally(() => {
            this.$toasting.hide();
          });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.remind {
  width: 100%;
}

.repay-charge-account {
  display: flex;
  flex-direction: column;
  align-items: center;
  .card-info {
    width: 100%;
    height: 89px;
    background: #f0f4ff;
    border: 1px solid #f4f4f4;
    display: flex;
    align-items: center;
    justify-content: center;
    .desc {
      width: 675px;
      font-size: 24px;
      font-weight: 500;
      color: #868686;
    }
  }
  .fill {
    width: 100%;
    height: 25px;
    background: #f0f4ff;
    border: 1px solid #f4f4f4;
  }
  .account-info {
    height: 260px;
    width: 100%;
    padding-left: 25px;
    .account-info-title {
      margin: 42px 0 35px 0;
      font-size: 30px;
      font-weight: 500;
      color: #444444;
    }
    .account-info-show {
      padding: 0 44px 50px 20px;
      display: flex;
      align-items: center;
      .left-icon {
        margin-right: 33px;
        width: 76px;
        height: 78px;
      }
      .right-desc {
        .card-desc {
          font-size: 30px;
          font-weight: 500;
          color: #333333;
          margin-bottom: 20px;
        }
        .account-balance {
          .account-balance-text {
            font-size: 27px;
            font-weight: 500;
            color: #939393;
            margin-right: 24px;
          }
          .reload-balance {
            vertical-align: middle;
            .van-icon {
              font-size: 28px;
              font-weight: 600;
              color: #3552d0;
            }
          }
        }
      }
    }
  }
  .repay-type {
    padding: 8px 25px;
    display: flex;
    width: 100%;
    align-items: center;
    .van-cell::after {
      border: 0;
    }
  }
  .charge-account-detail {
    padding: 31px 25px;
    width: 100%;
    .charge-account-detail-title {
      text-align: left;
      font-size: 34px;
      font-weight: 500;
      color: #444444;
      margin-bottom: 20px;
    }
    .account-detail-operate {
      .self-cell {
        padding: 0;
      }
      .self-cell.van-cell::after {
        border: 0;
      }
      .van-cell::after {
        border-color: #d8d8d8;
        left: 0;
        right: 0;
      }

      .account-num {
        margin-top: 41px;
      }
      .account-no {
        display: flex;
        align-items: center;
        width: 100%;
        .bank-name {
          width: 80%;
          font-size: 34px;
          font-weight: 500;
          color: #333333;
        }
        .right {
          width: 20%;
          display: flex;
          justify-content: flex-end;
          .van-icon {
            font-size: 42px;
            color: #666666;
          }
        }
      }
    }
  }
  .operate {
    margin-top: 130px;
    margin-bottom: 130px;
    width: 80%;
    .van-button {
      width: 100%;
      border-radius: 5px;
      font-weight: 400;
      color: #ffffff;
    }
  }
  .line-fill {
    width: 710px;
    height: 1px;
    border-bottom: 1px solid #d8d8d8;
  }
}
/deep/.charge-account.van-field {
  padding: 0;
  .van-field__control {
    font-size: 80px;
    font-weight: 500;
    color: #333333;
    letter-spacing: 3px;
  }
  /deep/.van-field__left-icon {
    display: flex;
    align-items: center;
    .van-icon-gold-coin-o::before {
      content: '￥';
      font-size: 76px;
      font-weight: 500;
      color: #333333;
    }
  }
}
.van-cell {
  padding: 20px 0;
}
</style>

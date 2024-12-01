<template>
  <div>
    <div class="with-drawal" v-if="Object.keys(repayBankCard).length">
      <div class="card-show">
        <div class="title">收款账户</div>
        <div class="desc" v-if="repayBankCard.accountToBeCredited">
          <div class="left-icon">
            <van-image width="100%" height="100%" fit="cover" :src="repayBankCard.accountToBeCredited.bankIconUrl" />
          </div>
          <div class="right-show">
            <div class="row-1">
              <div class="bank-name">{{repayBankCard.accountToBeCredited.bankName}}</div>
              <div class="bank-type">{{repayBankCard.accountToBeCredited.bankTypeStr}}</div>
            </div>
            <div class="row-2">{{ repayBankCard.accountToBeCredited.bankCardNo | formatBankNo}}</div>
          </div>
        </div>
      </div>
      <div class="fill-area"></div>
      <div class="content">
        <div class="title">提现金额</div>
        <div class="number">
          <van-field
            left-icon="gold-coin-o"
            v-model="balance"
            :disabled="inputDisabled"
            type="number"
            @input="balanceChange"
          />
        </div>
        <div class="fill"></div>
        <div class="card-info">
          <div class="name">电子账户</div>
          <div
            class="desc"
          >{{repayBankCard.bankName + ' ( ' + handleShow('bankCardNo', repayBankCard.bankCardNo) + ' ) '}}</div>
        </div>
        <div class="card-operate">
          <div class="balance">余额 {{ repayBankCard.remainingSum ?'￥' + repayBankCard.remainingSum: '￥0.00' }}</div>
          <div class="balance-operate" @click="allWithDrawal">全部提现</div>
        </div>
      </div>
      <div class="operate">
        <van-button class="foot-operate-btn" :disabled="inputDisabled" @click.stop="withdrawalSure">确定提现</van-button>
      </div>
    </div>
    <div v-if="noData">
      <van-empty description="暂无数据" />
    </div>
  </div>
</template>
<script>
import { queryReapyAcountInfo } from '@/controller/bank.js';
import { gfWithDrawApply } from '@/request/interface/gf/common.js';
import { getUnionKey } from '@/request/interface/common/index';
export default {
  // 余额提现
  data() {
    return {
      balance: 0,
      repayBankCard: {},
      inputDisabled: false,
      noData: false,
      applyUnionKey: ''
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      if (!sessionStorage.getItem('repayApplyUnionKey')) {
        this.getApplyUnionKey();
      } else {
        this.applyUnionKey = sessionStorage.getItem('repayApplyUnionKey');
      }
      this.getRepayAcountInfo();
    },
    // 获取银行卡的信息
    getRepayAcountInfo() {
      let creditNo = this.$route.query.cre_no;
      let productId = this.$route.query.pro_id;
      if (creditNo && productId) {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        queryReapyAcountInfo({ creditNo, productId })
          .then((repayBankCard) => {
            if (Object.keys(repayBankCard).length) {
              this.repayBankCard = repayBankCard;
              if (!repayBankCard.remainingSum) {
                this.inputDisabled = true;
              }
            } else {
              this.noData = true;
            }
          })
          .catch((err) => {
            this.$notify.error({
              msg: err?.data?.msg || '提现信息获取失败！'
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
        });
    },

    balanceChange(value) {
      if (value) {
        value = /^[0-9]*\.?[0-9]{0,2}$/.test(value) ? value : value.substring(0, value.length - 1);
      }
      this.balance = value;
    },

    // 确认提现
    withdrawalSure() {
      let drawAmount = parseFloat(this.balance);
      if (drawAmount <= 0) {
        this.$notify.info({
          msg: '请输入大于 0 的金额！'
        });
        return;
      }
      if (drawAmount > this.repayBankCard.remainingSum) {
        this.$notify.info({
          msg: '请输入金额小于或等于本身的余额！'
        });
        return;
      }
      this.$dialog
        .confirm({
          title: '提示',
          message: '确定提现？'
        })
        .then(() => {
          this.$toasting.show({ message: '提现申请中', forbidClick: true });
          gfWithDrawApply({ withdrawMoney: drawAmount, applyUnionKey: this.applyUnionKey })
            .then((res) => {
              if (res?.data?.data) {
                this.$toasting.success({ msg: '申请成功' });
                setTimeout(() => {
                  this.$router.replace({
                    name: 'XWEBankAcountWithDrawalDetail',
                    query: { withdrawId: res.data.data.withdrawId }
                  });
                }, 1000);
              } else {
                this.$notify.info({
                  msg: '暂无数据！'
                });
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
    allWithDrawal() {
      this.balance = this.repayBankCard.remainingSum;
    },
    handleShow(type, data) {
      if (type === 'bankCardNo' && typeof data === 'string' && data.length && data.length > 4) {
        return data.substring(data.length - 4);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.with-drawal {
  display: flex;
  flex-direction: column;
  align-items: center;
  .card-show {
    height: 300px;
    width: 669px;
    .title {
      font-size: 34px;

      font-weight: 400;
      color: #444444;
      margin-top: 54px;
    }
    .desc {
      display: flex;
      align-items: center;
      margin-top: 48px;
      .left-icon {
        width: 76px;
        height: 78px;
        margin-right: 37px;
      }
      .right-show {
        .row-1 {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          .bank-name {
            font-size: 32px;

            font-weight: 500;
            color: #333333;
            margin-right: 18px;
          }
          .bank-type {
            font-size: 24px;

            font-weight: 400;
            color: #999999;
            vertical-align: bottom;
          }
        }
        .row-2 {
          font-size: 26px;

          font-weight: 500;
          color: #999999;
        }
      }
    }
  }

  .content {
    width: 669px;
    .title {
      font-size: 34px;

      font-weight: 400;
      color: #444444;
      margin: 48px 0 41px 0;
    }
    // .number {
    // }
    .card-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 19px 0 25px 0;
      .name {
        font-size: 28px;

        font-weight: 400;
        color: #333333;
      }
      .desc {
        font-size: 28px;

        font-weight: 400;
        color: #333333;
      }
    }
    .card-operate {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      .balance {
        font-size: 26px;

        font-weight: 400;
        color: #999999;
        margin-right: 40px;
      }
      .balance-operate {
        font-size: 26px;

        font-weight: 400;
        color: #3552d0;
      }
    }
  }
  .operate {
    margin-top: 200px;
    width: 80%;
    .van-button {
      width: 100%;
      border-radius: 5px;
      font-size: 36px;
      color: #ffffff;
      background: #1b6ffb;
      font-weight: 600;
    }
    .detail {
      font-size: 30px;

      font-weight: 400;
      color: #3552d0;
      margin-top: 42px;
      text-align: center;
    }
  }
  .fill-area {
    width: 750px;
    height: 25px;
    background: #f0f4ff;
    border: 1px solid #f4f4f4;
  }
  .fill {
    width: 669px;
    height: 1px;
    background-color: #e2e2e2;
  }
  /deep/.van-field {
    padding: 0;
    .van-field__control {
      font-size: 80px;

      font-weight: 500;
      color: #333333;
      letter-spacing: 3px;
    }
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
</style>

<template>
  <div>
    <div class="with-drawal-detail" v-if="repayResInfo.rechargeId">
      <div class="desc">
        <div
          class="title"
        >充值到{{repayResInfo.payeeBankName + ' ( '}}{{ repayResInfo.payeeAccountNo | bankShowAfterFour }}{{' )'}}</div>
        <div class="num">{{ repayResInfo.rechargeAmt }}</div>
      </div>
      <div class="status">
        <van-steps
          direction="vertical"
          :active-icon="activeIcon"
          :active="trsState"
          :active-color="activeColor"
          inactive-color="#BBBBBB"
        >
          <van-step>
            <div class="title">发起充值申请</div>
            <div class="date">{{ repayResInfo.createTime }}</div>
          </van-step>
          <van-step>
            <div class="pending">{{ twoLevel()? twoLevel(): '充值中'}}</div>
          </van-step>
          <van-step>
            <div class="result">{{ repayResInfo.rechargeStatusStr ? repayResInfo.rechargeStatusStr:"充值成功" }}</div>
          </van-step>
        </van-steps>
      </div>
      <div class="fill"></div>
      <div class="card">
        <div class="row-1">
          <div class="title">付款银行</div>
          <div class="name">{{ repayResInfo.payerBankName }}</div>
        </div>
        <div class="row-2">
          <div class="title">付款账号</div>
          <div class="num">{{ repayResInfo.payerAccountNo | formatBankNo }}</div>
        </div>
      </div>
      <div class="operate">
        <van-button class="foot-operate-btn" @click.stop="judge">完成</van-button>
      </div>
    </div>
    <div v-if="noData">
      <NoData></NoData>
    </div>
  </div>
</template>
<script>
import { gfRechargeResult } from '@/request/interface/gf/common.js';
import NoData from '@/common/components/common/showStatus/NoData.vue';
export default {
  // 充值结果页
  data() {
    return {
      trsState: 1,
      activeColor: '#1b6ffb',
      noData: false,
      activeIcon: 'underway',
      repayResInfo: {}
    };
  },
  created() {
    //     createTime: "2021-11-01"
    // finRechargeId: "4000000000202111011446183000002845"
    // payeeAccountName: "钱互联"
    // payeeAccountNo: "6236431091000849465"
    // payeeBankIconUrl: "https://dev-xm-1256921822.cos.ap-shanghai.myqcloud.com/banklogo/5c24120d1b1149bba7906876ae4ee4b1.PNG"
    // payeeBankName: "中关村银行"
    // payerAccountName: "钱互联"
    // payerAccountNo: "6217000489641625611"
    // payerBankIconUrl: "https://dev-xm-1256921822.cos.ap-shanghai.myqcloud.com/banklogo/de22df871ab049729638d747f56335a0.PNG"
    // payerBankName: "中国建设银行"
    // rechargeAmt: 1111
    // rechargeId: "GFCZ202111011446170000000010"
    // rechargeStatus: 3
    // rechargeStatusStr: "失败"

    //     createTime	充值申请时间	string(date-time)
    // finRechargeId	普惠充值id	string
    // payeeAccountName	收款账户户名	string
    // payeeAccountNo	收款账户编号	string
    // payerAccountName	付款账户户名	string
    // payerAccountNo	付款账户编号	string
    // rechargeId	充值单号	string
    // rechargeAmt	充值金额	number
    // rechargeStatus	充值状态:1_充值中,2_成功,3_失败,0_未知	integer(int32)
    // rechargeStatusStr	充值状态描述	string
    // console.log("ceshi1", this.$route.query);
    this.getCharge();
    // this.test();
  },
  components: {
    NoData
  },
  methods: {
    getCharge() {
      let rechargeApplyId = this.$route.query.rechargeApplyId;
      if (rechargeApplyId) {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        gfRechargeResult({ rechargeApplyId })
          .then((res) => {
            if (res?.data?.data) {
              this.repayResInfo = res.data.data;
              this.trsStateHandle(this.repayResInfo.rechargeStatus);
            }
          })
          .catch((err) => {
            this.$notify.error({
              msg: err?.data?.msg || '获取充值记录失败！'
            });
          })
          .finally(() => {
            this.$toasting.hide();
          });
      } else {
        this.$notify.error({
          msg: '获取充值记录失败！'
        });
      }
    },

    judge() {
      /**
       * 充值是否成功 ，成功 看是否是来自于还款页面，再到账单详情去主动还款，不是则直接跳到充值明细页面
       *  失败 则再次回到充值界面
       */
      if (this.$route.query.isFromRepay === 'no') {
        // 充值明细
        this.$router.replace('/xwe_bank_Charge_detail_list');
      } else {
        if (this.repayResInfo.rechargeStatus === '2') {
          this.$router.push({
            path: '/xwe_bill_detail',
            query: {
              loanNo: this.$route.query.loanNo,
              productId: this.$route.query.pro_id
            }
          });
        } else if (this.repayResInfo.rechargeStatus === '1') {
          this.$notify.info({
            msg: '充值中，请等重新充值成功之后，再还款！'
          });
        } else if (this.repayResInfo.rechargeStatus === '3') {
          this.$notify.error({
            msg: '充值失败，请重新充值！'
          });
          setTimeout(() => {
            this.$router.replace({
              path: '/xwe_bank_Charge',
              query: { ...this.$route.query }
            });
          }, 1000);
        }
      }
    },

    handleShow(type, data) {
      if (type === 'bankCardNo' && typeof data === 'string' && data.length && data.length > 4) {
        return data.substring(data.length - 4);
      }
    },

    twoLevel() {
      if (this.repayResInfo.rechargeStatus === '1') {
        return this.repayResInfo.rechargeStatusStr;
      }
      if (this.repayResInfo.rechargeStatus === '0') {
        return '充值中';
      }
      return undefined;
    },

    // 查询结果的状态的处理
    trsStateHandle(trsState) {
      // 充值状态:1_充值中,2_成功,3_失败,0_未知	integer(int32)
      if (trsState === 2) {
        this.trsState = 2;
        // this.activeColor = "#009700";
        this.activeIcon = 'checked';
      }
      if (trsState === 3) {
        this.trsState = 2;
        // this.activeColor = "#E41E26";
        this.activeIcon = 'clear';
      }
      // this.trsState = 1;
      // this.activeIcon = "checked";
    }
  }
};
</script>
<style lang="scss" scoped>
.with-drawal-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  .desc {
    width: 750px;
    height: 295px;
    background: #f0f4ff;
    display: flex;
    flex-direction: column;
    align-items: center;
    .title {
      font-size: 32px;
      font-weight: 500;
      color: #333333;
      margin: 58px 0 23px 0;
    }
    .num {
      font-size: 80px;
      font-weight: 600;
      color: #333333;
      margin-right: 18px;
    }
  }
  .status {
    width: 100%;
    padding: 75px 0 64px 95px;
  }
  .card {
    width: 675px;
    padding: 56px 31px;

    .row-1 {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
      .title {
        font-size: 32px;

        font-weight: 400;
        color: #333333;
      }
      .name {
        font-size: 32px;

        font-weight: 400;
        color: #333333;
      }
    }
    .row-2 {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .title {
        font-size: 32px;

        font-weight: 400;
        color: #333333;
      }
      .num {
        font-size: 32px;

        font-weight: 400;
        color: #333333;
      }
    }
  }
  .operate {
    margin: 70px 0 150px 0;
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
  .fill {
    width: 675px;
    height: 0.5px;
    background-color: #d8d8d8;
  }
  ::v-deep(.van-step__circle-container) {
    .van-step__circle {
      width: 30px;
      height: 30px;
    }
    .van-step__icon--active {
      width: 62px;
      height: 52px;
    }
    .van-step__icon--active::before {
      font-size: 62px;
    }
  }
  :v-deep(.van-steps__items) {
    height: 100%;
  }
  // 未激活,
  ::v-deep(.van-step) .van-step__title {
    div {
      font-size: 26px !important;
      font-weight: 400;
      margin-left: 30px;
    }
  }
  // 结束
  ::v-deep(.van-step--finish) {
    .van-step__title {
      margin-bottom: 54px;
      div {
        font-size: 26px !important;
        font-weight: 500;
        color: #333333;
        margin-left: 30px;
      }
    }
  }
  // 激活
  ::v-deep(.van-step--process) {
    .van-step__title--active {
      div {
        font-size: 33px !important;
        font-weight: 600;
        margin-bottom: 95px;
        margin-left: 30px;
      }
    }
  }
  ::v-deep(.van-step--vertical:not(:last-child)::after) {
    border-bottom-width: 0;
  }
  ::v-deep(.van-step--finish) .van-step__line {
    background-color: unset !important;
    border-left: 1px dashed #3552d0 !important;
    width: 1.5px;
  }
  ::v-deep(.van-step--process) .van-step__line {
    background-color: unset !important;
    border-left: 1px dashed rgb(187, 187, 187) !important;
    width: 1.5px;
  }
  ::v-deep(.van-step:last-child) .van-step__line {
    display: none;
  }
  ::v-deep(.van-step__line) {
    height: 93% !important;
  }
}
</style>

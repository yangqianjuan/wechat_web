<template>
  <div class="repay-charge-account">
    <div class="card-info">
      <div class="desc">请进行电子户充值还款</div>
    </div>
    <div class="account-info">
      <div class="account-info-title">电子户信息</div>
      <div class="account-info-show">
        <div class="left-icon">
          <van-icon name="chat-o" color="#ee0a24" />
        </div>
        <div class="right-desc">
          <div class="card-desc">招商银行（3245)</div>
          <div class="account-balance">
            <span class="account-balance-text">账户余额 ¥500</span>
            <span class="reload-balance">
              <van-icon name="replay" />
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="fill"></div>
    <div class="repay-type">
      <div class="left">还款方式</div>
      <div class="middle">正常/逾期还款</div>
      <div class="right">
        <van-icon name="arrow" />
      </div>
    </div>
    <div class="fill"></div>
    <div class="charge-account-detail">
      <div class="charge-account-detail-title">充值金额</div>
      <div class="account-detail-operate">
        <i-input class="account-num" v-model="chargeAccount" placeholder="充值金额"></i-input>
        <Form :label-width="120" ref="formDynamic" label-position="left">
          <div class="line-fill"></div>
          <FormItem label="付款账户" prop="bankName">
            <div class="account-no">
              <div class="bank-name">招商银行 (7680)</div>
              <div class="right">
                <van-icon name="arrow" />
              </div>
            </div>
          </FormItem>
          <div class="line-fill"></div>
          <FormItem class="sms-code" label="验证码" prop="smsCode">
            <div class="sms-content">
              <i-input placeholder="验证码" type="text"></i-input>
              <SendSms ref="send-sms-bank"></SendSms>
            </div>
          </FormItem>
          <div class="line-fill"></div>
        </Form>
      </div>
    </div>
    <div class="operate">
      <van-button round type="info">确定转账</van-button>
    </div>
  </div>
</template>
<script>
import SendSms from "../../../component/sms/SendSms.vue";
export default {
  // 电子账户充值
  name: "ChargeAccount",
  data() {
    return {
      chargeAccount: "￥9798.70"
    };
  },
  components: {
    SendSms
  },
  methods: {}
};
</script>
<style lang="scss" scoped>
.repay-charge-account {
  //   height: 100vh;
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
      line-height: 33px;
    }
  }
  .fill {
    width: 100%;
    height: 25px;
    background: #f0f4ff;
    border: 1px solid #f4f4f4;
  }
  .account-info {
    height: 280px;
    width: 100%;
    .account-info-title {
      margin: 42px 0 35px 41px;
      font-size: 34px;

      font-weight: 400;
      color: #444444;
    }
    .account-info-show {
      padding: 0 44px 50px 41px;
      display: flex;
      .left-icon {
        margin-right: 33px;
        .van-icon {
          font-size: 84px;
        }
      }
      .right-desc {
        .card-desc {
          font-size: 32px;

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
              color: #3552d0;
            }
          }
        }
      }
    }
  }
  .repay-type {
    padding: 31px 41px;
    display: flex;
    width: 100%;
    align-items: center;
    .left {
      width: 30%;
      font-size: 34px;

      font-weight: 400;
      color: #999999;
    }
    .middle {
      width: 50%;
      font-size: 34px;
      text-align: left;

      font-weight: 500;
      color: #333333;
    }
    .right {
      width: 20%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      .van-icon {
        font-size: 42px;
        color: #666666;
      }
    }
  }
  .charge-account-detail {
    padding: 31px 41px;
    width: 100%;
    .charge-account-detail-title {
      text-align: left;
      font-size: 34px;

      font-weight: 400;
      color: #444444;
    }
    .account-detail-operate {
      .account-num {
        margin-top: 41px;
        ::v-deep(.ivu-input-inner-container) {
          .ivu-input {
            height: 120px;
            font-size: 80px;

            font-weight: 500;
            color: #333333;
            border: 0px !important;
          }
        }
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
    .van-button {
      width: 532px;
      background: #3552d0;
      box-shadow: 0px 14px 23px -2px rgba(53, 82, 208, 0.45);
      border-radius: 50px;
      font-size: 34px;

      font-weight: 400;
      color: #ffffff;
    }
  }
  .line-fill {
    width: 675px;
    height: 1px;
    // margin: 2px 0;
    background-color: #d8d8d8;
  }
  ::v-deep(.ivu-form-item) {
    height: 110px;
    display: flex;
    align-items: center;
    margin: 0;
    //   margin-bottom: 25px;
    label {
      width: 128px;
      font-size: 32px;

      font-weight: 400;
      color: #999999;
    }
    .ivu-form-item-content {
      margin: 0 !important;
      flex: 1;
      display: flex;
      align-items: center;
      line-height: unset;
      height: 100%;
      .ivu-input-inner-container {
        height: 100%;
        display: flex;
        align-items: center;
      }
      .sms-content {
        display: flex;
        align-items: center;
        height: 100%;
        .ivu-input-wrapper {
          height: 100%;
        }
      }
      .ivu-input-wrapper {
        height: 100%;
      }
      .ivu-input {
        border: 0;
        height: 100%;
        font-size: 32px;

        font-weight: 400;
        color: #333333;
        letter-spacing: 1px;
      }
      .ivu-input-group-append {
        border: 0;
        background-color: #ffffff;
        font-size: 50px;
        padding: 0 !important;
        //   top: 0;
      }
      .ivu-input-group {
        top: 0;
      }
      .ivu-form-item-error-tip {
        font-size: 32px;
        z-index: 10000;
      }
    }
  }
  ::v-deep(.ivu-input) {
    padding: 0 !important;
  }
}
</style>
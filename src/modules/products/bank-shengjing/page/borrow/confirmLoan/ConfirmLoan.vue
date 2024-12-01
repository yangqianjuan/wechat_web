<!--
 * @Author: hsf
 * @Date: 2023-06-27 09:18:54
 * @LastEditors: hsf
 * @LastEditTime: 2024-12-01 10:15:53
 * @Description:
-->
<template>
  <div class="confirm-loan beijing-common">
    <div class="confirm-loan-content">
      <div class="top-back">
        <div class="title">
          <img src="../../../static/image/logo.png" alt class="logo" />
          <div class="tip">年化利率:采用单利方式计算</div>
        </div>
      </div>
      <div class="cache-info">
        <div class="total-amount">
          <div class="desc">借款金额(元)</div>
          <!-- <data class="num">{{ cacheInfo.loanAmount }}</data> -->
          <data class="num">8000</data>
        </div>
        <div class="row-txt">
          <div class="row-txt__left">年化利率</div>
          <!-- <div class="row-txt__right">{{ cacheInfo.interestRateDesc }}</div> -->
          <div class="row-txt__right">24%</div>
        </div>
        <div class="row-txt">
          <div class="row-txt__left">借款期限</div>
          <!-- <div class="row-txt__right">{{ cacheInfo.loanTermDesc }}</div> -->
          <div class="row-txt__right">12期</div>
        </div>
        <div class="row-txt">
          <div class="row-txt__left">借款用途</div>
          <!-- <div class="row-txt__right">{{ cacheInfo.loanPurposeDesc }}</div> -->
          <div class="row-txt__right">消费</div>
        </div>
        <div class="row-txt">
          <div class="row-txt__left">还款方式</div>
          <div class="row-txt__right">等额本息</div>
        </div>
        <div class="row-txt">
          <div class="row-txt__left">收款账户</div>
          <div class="row-txt__right">{{ cacheInfo.repayAccount }}</div>
        </div>
      </div>

      <div class="information">
        <div class="table1 beijing-common">
          <van-form :label-width="80" ref="formDynamicUser">
            <van-field
              v-model="borrowUserInfo.name"
              name="name"
              readonly
              label="借款人"
              placeholder="请输入借款人姓名"
              :rules="userInfoRuleValidate.name"
            ></van-field>
            <van-field
              v-model="borrowUserInfo.phone"
              name="phone"
              readonly
              label="手机号码"
              :rules="userInfoRuleValidate.phone"
              placeholder="请输入借款人手机号码"
            ></van-field>
            <van-field
              v-model="borrowUserInfo.smsCode"
              name="smsCode"
              label="短信验证码"
              minlength="4"
              maxlength="4"
              :rules="userInfoRuleValidate.smsCode"
              placeholder="请输入验证码"
            >
              <template #button>
                <div class="tableTip">
                  <SendSms ref="send-sms-bank" @sendSms="sendSmsBank"></SendSms>
                </div>
              </template>
            </van-field>
          </van-form>
        </div>

        <!-- 协议信息 -->
        <div class="protocol-link-wrapper agreement" v-if="!isShowProtocol">
          <img v-if="isAgree" @click="isAgree = !isAgree" src="../../../static/image/selected.png" alt class="checkBox" />
          <img v-else @click="isAgree = !isAgree" src="../../../static/image/unselected.png" alt class="checkBox" />
          <p>
            <label for="agree">本人己阅读并同意签署</label>
            <span @click="switchShowProtocol" class="sign">{{ ptotocolListShowText }}</span>
          </p>
        </div>

        <div class="pdf-wrapper beijing-protocol" v-if="isShowProtocol">
          <p-protocol-list
            @closeProtocol="switchShowProtocol"
            @getProtocolText="getProtocolText"
            :isPdf="true"
            :protocolText="protocolText"
            :protocolList="protocolList"
          ></p-protocol-list>
        </div>
      </div>
    </div>

    <div style="height:86px"></div>
    <div class="submitBox">
      <van-button class="submit" @click="submitBorrow">确认借款</van-button>
    </div>
  </div>
</template>
<script>
import { jdugeNewUserRoute } from '@/controller/userController.js';
import SendSms from '../../../component/sms/SendSms.vue';
import { getUserCreditResult } from '@/request/interface/impower/UserInfo.js';
import { beijingDialog, clickControl, validatePhoneNo, validateSmsCode } from '../../../utils/common';
import {
  beijingLoansSendCode,
  beijingLoansVerifySmsCode,
  getBeijingSingleBorrowInfoRecord,
  sendSmsCode
} from '@/request/interface/impower/UserInfo';
import { getBeijingProtocolUrl } from '@/request/interface/impower/Product';
import MxProtocol from '@/common/mixin/MxProtocol.js';

export default {
  name: 'BJBConfirmLoan',
  mixins: [MxProtocol],
  components: {
    SendSms
  },
  data() {
    return {
      applyUnionKey: '',

      cacheInfo: {
        loanAmount: '',
        interestRate: '',
        interestRateDesc: '',
        // 借款期限
        loanTerm: '',
        loanTermDesc: '',
        // 借款用途
        loanPurpose: '',
        loanPurposeDesc: '',
        // 还款方式
        repaymentType: '01',
        repaymentTypeDesc: '等额本息',
        // 还款账户
        repayAccount: '',
        // 单笔单号
        loanNo: ''
      },
      borrowUserInfo: {
        phone: '',
        smsCode: '',
        name: '网一四四',
        smsIdentificationCode: ''
      },
      isAgree: '',

      protocolText: [],
      isShowProtocol: false,

      // 借款期限
      loanTerm: [
        { label: '6期', value: '6' },
        { label: '12期', value: '12' }
      ],
      // 借款用途
      loansUseType: [
        { label: '购固定资产', value: '86' },
        { label: '经营流动资金', value: '87' }
      ],

      userInfo: {},

      // 用户信息校验
      userInfoRuleValidate: {
        name: [{ required: true, message: '请输入借款人信息', trigger: 'onBlur' }],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'onBlur' },
          { required: true, validator: validatePhoneNo, message: '手机号格式错误' }
        ],
        smsCode: [
          { required: true, message: '请输入验证码', trigger: 'onBlur' },
          { required: true, validator: validateSmsCode, message: '验证码格式错误' }
        ]
      },

      formateProtocolRaw: [{ code: '09', name: '借款合同', isPdf: true, isReadOver: false, isNess: true }]
    };
  },

  created() {
    this.init();
    // this.getProtocolList('9999');
  },

  beforeDestroy() {
    this.clearStatusRead('/bjb_confirm_loan', '9999', this.formateProtocolRaw);
  },

  methods: {
    init() {
      try {
        // let applyUnionKey = this.$route.query.applyUnionKey;
        // if (applyUnionKey) {
        //   this.applyUnionKey = applyUnionKey;
        // } else {
        //   this.applyUnionKey = sessionStorage.getItem('union_key_beijing');
        // }
        Promise.all([
          jdugeNewUserRoute().then((res) => {
            if (res) {
              this.userInfo = res;
              this.borrowUserInfo.name = res.name;
              this.borrowUserInfo.phone = res.phoneNum;
            }
          }),
          this.getProtocolList('9999')
        ]);
      } catch (error) {
        console.log(error);
      }
    },

    sendSmsBank() {
      this.$refs.formDynamicUser.validate(['name', 'phone']).then(async (res) => {
        if (!res) {
          this.$toasting.show({ message: '发送中', forbidClick: true });
          this.$refs['send-sms-bank'].smsSending();
          try {
            let params = {
              applyUnionKey: this.applyUnionKey,
              idAddress: this.userInfo.address,
              idBirthday: this.userInfo.birthDate,
              idNo: this.userInfo.idNo,
              idValidityStart: this.userInfo.validityStart,
              idValidityStop: this.userInfo.validityStop,
              mobileNo: this.borrowUserInfo.phone,
              userName: this.borrowUserInfo.name
            };
            // let sendRes = await beijingLoansSendCode(params);

            let sendRes = await sendSmsCode(this.borrowUserInfo.phone);
            if (sendRes?.data?.success && sendRes.data.data) {
              this.borrowUserInfo.smsIdentificationCode = '123456';
            }
            sendRes?.data?.success
              ? this.$refs['send-sms-bank'].sendSuccess()
              : this.$refs['send-sms-bank'].sendError(sendRes?.data?.msg);
          } catch (error) {
            if (error?.code !== 403) {
              this.$refs['send-sms-bank'].sendError(error?.data?.msg);
            } else {
              this.$refs['send-sms-bank'].reset();
            }
            this.$toasting.hide();
          }
        } else {
          this.$toasting.info({ msg: '暂无手机号' });
        }
      });
    },

    /**
     * check from
     * */
    submitBorrow() {
      clickControl.call(this, this.handleSubmit);
    },

    handleSubmit(name) {
      this.$refs.formDynamicUser.validate(['name', 'phone', 'smsCode']).then(async (res) => {
        if (!res) {
          // if (!this.borrowUserInfo.smsIdentificationCode) {
          //   this.$toasting.info({ msg: '请发送验证码' });
          //   return;
          // }

          if (!this.borrowUserInfo.smsCode) {
            this.$toasting.info({ msg: '请发送验证码' });
            return;
          }

          // if (!this.protocolList[0].isReadOver) {
          //   this.$toasting.info({ msg: '请阅读并同意协议', className: 'read-protocol' });
          //   // this.isShowProtocol = true;
          //   return;
          // }

          if (!this.isAgree) {
            this.$toasting.info({ msg: '请选择我已知晓' });
            return;
          }

          this.$router.replace({
            path: '/sj_loans_result',
            query: {
              productId: '9999',
              // loanNo: res.data.data,
              applyUnionKey: this.applyUnionKey
            }
          });
        }
      });
    },

    async getProtocolText(protocol) {
      try {
        let protocolRes = await getBeijingProtocolUrl({ contractType: 1, loanNo: this.cacheInfo.loanNo });
        if (protocolRes?.data?.success && protocolRes?.data?.data) {
          this.protocolText = protocolRes.data.data.baseImages;
          this.protocolList[0].isReadOver = true;
          let isAllRead = this.protocolList.every((item) => {
            return item.isReadOver;
          });
          isAllRead && (this.isAgree = true);
        }
      } catch (error) {
        this.isShowProtocol = false;
        beijingDialog({
          message: error?.data?.msg,
          confirmButtonText: '确定'
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.confirm-loan {
  min-height: 100vh;
  background: #f4f6f9;
  width: 100vw;
  position: relative;

  .confirm-loan-content {
    display: flex;
    flex-direction: column;
    align-items: center;

    .top-back {
      width: 100%;
      height: 404px;
      background-image: url('../../../static/image/top_bg.png');
      background-repeat: no-repeat;
      background-size: contain;
      padding: 30px 36px 0;

      .title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 29px;

        .logo {
          width: 135px;
          height: 45px;
        }

        .tip {
          font-size: 24px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #ffffff;
          opacity: 0.7;
        }
      }
    }

    .cache-info {
      margin-top: -300px;
      width: 686px;
      height: 812px;
      background: #ffffff;
      border-radius: 16px;
      padding: 40px 32px;

      .total-amount {
        background: url('../../../static/image/repayment/loan_bg.png');
        background-size: contain;
        background-repeat: no-repeat;
        width: 622px;
        height: 228px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .desc {
          font-size: 28px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #8f8b8a;
        }

        .num {
          margin-top: 10px;
          font-size: 64px;
          font-family: DINAlternate-Bold, DINAlternate;
          font-weight: bold;
          color: #a90600;
        }
      }

      .row-txt {
        display: flex;
        align-items: center;
        min-height: 104px;
        margin-top: 16px;
        border-bottom: 2px solid #f4f4f4;

        .row-txt__left {
          font-size: 28px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #8f8b8a;
          margin-right: 56px;
        }

        .row-txt__right {
          font-size: 28px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #8f8b8a;
        }
      }

      .row-txt + .row-txt {
        margin-top: 0;
      }

      .row-txt:last-child {
        border: unset;
      }
    }

    .repayment {
      margin: 0 auto;
      margin-top: 32px;
      width: fit-content;
    }

    .information {
      margin: 0 auto;
      margin-top: 32px;
      width: fit-content;

      .table1 {
        background: #ffffff;
        box-shadow: 0px 0px 32px -8px rgba(78, 6, 6, 0.2);
        border-radius: 16px;
        width: 686px;
        padding: 10px 0;

        .tableTip {
          font-size: 28px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #df0301;

          /deep/ .van-button__text {
            font-size: 28px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #df0301;
          }
        }

        .bank__arrow--select {
          display: flex;
          justify-content: flex-end;
          align-items: center;

          img {
            width: 28px;
            height: 28px;
          }
        }
      }
    }
  }

  .agreement {
    margin: 29px 0;
    display: flex;
    align-items: center;

    .checkBox {
      width: 24px;
      height: 24px;
      margin-right: 8px;
    }

    .sign {
      color: #335af5;
    }
  }

  .submitBox {
    width: 750px;
    height: 152px;
    background: #ffffff;
    box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.11);
    position: fixed;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;

    .submit {
      width: 686px;
      height: 88px;
      background: linear-gradient(129deg, #b80701 0%, #9a0400 100%), linear-gradient(129deg, #cd1101 0%, #a70500 100%);
      border-radius: 45px;
      margin: 0 auto;
      margin-top: 24px;

      /deep/ .van-button__text {
        font-size: 28px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #ffffff;
      }
    }
  }
}
</style>

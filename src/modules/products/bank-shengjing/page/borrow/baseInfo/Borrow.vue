<!--
 * @Author: hsf
 * @Date: 2023-06-27 09:18:54
 * @LastEditors: hsf
 * @LastEditTime: 2024-12-01 10:15:08
 * @Description:
-->
<template>
  <div class="loans-base-info-wrapper beijing-common">
    <div class="borrow-content">
      <div class="top-back">
        <div class="title">
          <img src="../../../static/image/logo.png" alt class="logo" />
          <div class="tip">年化利率:采用单利方式计算</div>
        </div>

        <div class="form-module beijing-common">
          <van-form :label-width="80" ref="formDynamicBorrow">
            <div class="other-module">
              <van-field
                v-model="formItem.borrowBalance"
                name="borrowBalance"
                label="借款金额"
                :placeholder="'最高可借' + formItem.approveCredit + '元'"
                :rules="ruleValidate.borrowBalance"
              >
                <template #button>
                  <div class="tableTip" @click="operateLoansAll">借全部</div>
                </template>
              </van-field>
              <van-field v-model="formItem.interestRateDesc" disabled name="interestRate" label="年化利率" readonly></van-field>
              <van-field
                v-model="formItem.loansTimeLimitName"
                :rules="ruleValidate.loansTimeLimitName"
                is-link
                readonly
                name="loansTimeLimitName"
                label="借款期限"
                placeholder="请选择借款期限"
                @click="loansTimeLimitShow = true"
              />
              <!--              @click="loansPurposeShow = true"-->
              <van-field
                v-model="formItem.loansPurposeName"
                :rules="ruleValidate.loansPurposeName"
                disabled
                name="loansPurposeName"
                label="借款用途"
                placeholder="请选择借款用途"
              />
            </div>
          </van-form>
        </div>
      </div>

      <!-- module - 2 -->
      <div class="repayment">
        <div class="form-module">
          <van-form :label-width="80" ref="formDynamicSms">
            <div class="other-module">
              <van-field v-model="formItem.refundModeName" disabled name="refundModeName" label="还款方式"></van-field>
              <van-field disabled label="还款计划">
                <template #button>
                  <div @click="getReplanList" class="tableTip">预览还款计划</div>
                </template>
              </van-field>
            </div>
          </van-form>
        </div>
      </div>
    </div>

    <div style="height:106px"></div>
    <div class="submitBox">
      <van-button class="submit" @click="submitBorrow">确认提交</van-button>
    </div>

    <!-- 借款期限 -->
    <van-popup closeable v-model="loansTimeLimitShow" round position="bottom" class="my-loan">
      <!-- :style="{ height: '25%' }" -->
      <div class="title">借款期限</div>
      <div class="list">
        <div
          v-for="(item, index) in loanTerm"
          :key="index"
          class="list-item"
          :class="item.value === formItem.loansTimeLimit && 'selected'"
          @click="
            () => {
              onLoansTimeLimitSelect(item);
            }
          "
        >{{ item.label }}</div>
      </div>
    </van-popup>

    <!-- 借款用途 -->
    <!-- :style="{ height: '40%' }" -->
    <van-popup closeable v-model="loansPurposeShow" round position="bottom" class="my-loan">
      <div class="title">借款用途</div>
      <div class="list">
        <div
          v-for="(item, index) in loansUseType"
          :key="index"
          class="list-item"
          :class="item.value === formItem.loansPurpose && 'selected'"
          @click="
            () => {
              onLoansPurposeSelect(item);
            }
          "
        >{{ item.label }}</div>
      </div>
    </van-popup>

    <!-- 银行卡列表 -->
    <van-popup closeable v-model="openAccountSelect" round position="bottom" :style="{ height: '40%' }" class="my-loan">
      <div class="title">银行卡</div>
      <div class="list">
        <div
          v-for="(item, index) in bankCardList"
          :key="index"
          class="list-item"
          :class="item.cardNo === formItem.bankCard && 'selected'"
          @click="
            () => {
              onLoansAccountSelect(item);
            }
          "
        >{{ `北京银行 - ${item.cardNo}` }}</div>
        <!-- ${item.accountType ? ' - (' + accountTypeMap[item.accountType] + ')' : ''} -->
      </div>
    </van-popup>

    <!-- 预览还款计划 -->
    <van-popup position="bottom" v-model="previewRepayment" round class="confirm-loan">
      <div class="header-content">
        <div class="title">预览还款计划</div>
        <div class="close-icon" @click="previewRepayment = false">
          <img src="../../../static/image/close-icon.png" />
        </div>
      </div>
      <div class="body-content">
        <div class="borrow-info">
          <div class="title">
            <div class="fill"></div>
            <div class="txt">借款信息</div>
          </div>
          <div class="content">
            <div class="table">
              <div class="thead">
                <div class="headOne">借款金额(元)</div>
                <div class="headOne headTwo">收款账户</div>
              </div>
              <div class="tbody">
                <div class="bodyOne">{{ formItem.borrowBalance }}</div>
                <div class="bodyOne bodyTwo">{{ formItem.bankCard }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="repay-plan-content">
          <div class="title">
            <div class="fill"></div>
            <div class="txt">还款试算</div>
          </div>
          <div class="table">
            <div class="thead">
              <div class="headOne">还款总额(元)</div>
              <div class="headOne headTwo">还款方式</div>
            </div>
            <div class="tbody">
              <div class="bodyOne">{{ totalAmount }}</div>
              <div class="bodyOne bodyTwo">等额本息</div>
            </div>
          </div>
          <div class="repay-plan-detail">
            <div class="table-1">
              <div class="thead-1">
                <div v-for="(item, index) in tableHead" :key="index" class="headItem">{{ item }}</div>
              </div>
              <div class="tbody-1">
                <div v-for="(item, index) in planList" :key="index" class="bodyItem">
                  <div class="date">
                    第 {{ item.loanTerm }} 期
                    <br />
                    ({{ item.repayDate }})
                  </div>
                  <div class="num">{{ item.amt }}</div>
                  <div class="num">{{ item.interest }}</div>
                  <div class="num">{{ rowRepayAmountSum(item.amt + item.interest) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-fixed">
        <div class="footer-tip">请仔细核对您的借款信息</div>
        <van-button @click="previewRepayment = false" class="submit-confirm">确认</van-button>
      </div>
    </van-popup>
  </div>
</template>
<script>
import { jdugeNewUserRoute } from '@/controller/userController.js';
import { getBeijingRepayAccountList } from '@/controller/bank.js';
import { getUserCreditResult } from '@/request/interface/impower/UserInfo.js';
import { toThousands } from '@/utils/common/common.js';
import { beijingDialog, clickControl } from '../../../utils/common';
import { addBeijingSingleBorrowInfo, getBeijingRepaymentPlanTrial } from '@/request/interface/impower/UserInfo';
import borrowFaceMixin from './faceMixin';

export default {
  /**
   * 盛京 -- 借款基本信息
   * */
  name: 'BjbBorrow',
  mixins: [borrowFaceMixin],
  data() {
    return {
      // 还款账户是否有数据
      repayment: false,
      // 预览还款计划
      previewRepayment: false,
      // 借款期限
      loanTerm: [
        { label: '6期', value: '6' },
        { label: '12期', value: '12' }
      ],
      // 借款用途
      loansUseType: [
        { label: '经营流动资金', value: '87' }
        // { label: '购固定资产', value: '86' }
      ],
      refundModeShow: false,
      loansTimeLimitShow: false,
      loansPurposeShow: false,
      bankCardShow: false,
      openAccountSelect: false,
      formItem: {
        // 借款的金额
        borrowBalance: '',

        // 还款的方式
        refundMode: '04',
        refundModeName: '等额本息',

        // 借款期限
        loansTimeLimit: '6',
        loansTimeLimitName: '6期',

        // 借款用途
        loansPurpose: '87',
        // loansPurposeName: '经营流动资金',
        loansPurposeName: '日常消费',

        receiptAcount: '',

        // 收款银行卡号
        bankCard: '',
        // 收款账号的描述
        bankCardName: '',
        bankCardDesc: '',

        // 产品id
        productId: '',
        // 授信申请的记录标识
        applyUnionKey: '',
        // 销售人员id
        referrerId: '',
        // 授信的单号
        creditNum: '',
        // 最高可以借的额度
        approveCredit: '8000',
        // 贷款利率
        interestRate: '',

        interestRateDesc: '24%'
      },

      refundMode: '',

      accountTypeMap: {
        0: '',
        1: '一类户',
        2: '二类户',
        3: '三类户'
      },

      userInfo: {},

      planList: [],
      // 还款试算总金额
      totalAmount: 0,

      // is need face
      isBorrowNeedFace: true,

      // 收款账户列表
      bankCardList: [],
      isHasAccount: false,
      emptyIcon: require('@/assets/imgs/icon/ic_empty.png'),
      // 表单的验证
      ruleValidate: {
        bankCard: [
          { required: true, message: '请填写银行卡号', trigger: 'onBlur' }
          // { required: true, validator: bankCardCheck, message: '银行卡格式错误' }
        ],
        borrowBalance: [
          { required: true, message: '请填写借款金额', trigger: 'onBlur' },
          { required: true, validator: this.borrowBalanceCheck, message: this.borrowBalanceCheckMsg, trigger: 'onBlur' }
        ]
      },
      tableHead: ['期数/还款时间', '本金', '利息', '总金额']
    };
  },

  created() {
    // this.init();
  },

  methods: {
    init() {
      try {
        this.formItem.productId = this.$route.query.productId || '9999';
        this.formItem.applyUnionKey = this.$route.query.applyUnionKey;
        jdugeNewUserRoute().then((res) => {
          if (res) {
            this.userInfo = res;
          }
        });
        this.getCreditNum();
      } catch (error) {
        console.log(error);
      }
    },

    /**
     * @description: form borrow balance check
     * @param {*} value
     * @return {*} boolean
     */
    borrowBalanceCheck(value) {
      const { isTip } = this.balanceCheckMiddle(value);
      return !isTip;
    },

    borrowBalanceCheckMsg(value, rule) {
      const { msg } = this.balanceCheckMiddle(value);
      return msg;
    },

    balanceCheckMiddle(val) {
      try {
        let value = Number(val);
        let result = {
          msg: '',
          isTip: false
        };

        if (value < 1000) {
          result = {
            msg: '请输入的额度大于 1000',
            isTip: true
          };
        }

        if (value > this.formItem.approveCredit) {
          result = {
            msg: '请输入的额度小于 ' + this.formItem.approveCredit.toString(),
            isTip: true
          };
        }

        if (Number.isNaN(value)) {
          result = {
            msg: '请输入有效数字',
            isTip: true
          };
        }

        if (!Number.isInteger(value)) {
          result = {
            msg: '请输入的额度为整数',
            isTip: true
          };
        }

        return result;
      } catch (error) {
        return {
          msg: '请输入正确的额度',
          isTip: true
        };
      }
    },

    /**
     * check from
     * */
    submitBorrow() {
      this.$refs.formDynamicBorrow.validate(['bankCard', 'borrowBalance']).then(async (res) => {
        if (!res) {
          this.$router.replace({
            path: '/sj_confirm_loan',
            query: {
              productId: '9999'
            }
          });
        }
      });
    },

    cacheInfoPage(operateType = 'set') {
      try {
        switch (operateType) {
          case 'set': {
            //  save info
            sessionStorage.setItem(
              'bei-bank-borrow',
              JSON.stringify({
                borrowBalance: this.formItem.borrowBalance,
                bankCard: this.formItem.bankCard
              })
            );
            break;
          }

          case 'get': {
            let singleInfoCache = sessionStorage.getItem('bei-bank-borrow');

            if (singleInfoCache) {
              singleInfoCache = JSON.parse(singleInfoCache);

              let { borrowBalance, bankCard, name, phone } = singleInfoCache;
              return { borrowBalance, bankCard, name, phone };
            }

            return { borrowBalance: '', bankCard: '', name: '', phone: '' };
          }

          case 'clear': {
            sessionStorage.removeItem('bei-bank-borrow');
            break;
          }
        }
      } catch (error) {
        console.log(error);
      }
    },

    // get plan of replan
    async getReplanList() {
      this.$refs.formDynamicBorrow.validate(['bankCard', 'borrowBalance']).then(async (res) => {
        if (!res) {
          try {
            this.$toasting.show({ message: '加载中', forbidClick: true });
            let params = {
              loanAmt: this.formItem.borrowBalance,
              loanMode: '01',
              loanPeriod: this.formItem.loansTimeLimit,
              loanRate: this.formItem.interestRate
            };
            let planList = await getBeijingRepaymentPlanTrial(params);
            if (planList?.data?.success && planList.data.data) {
              this.planList = planList.data.data.details;
              this.totalAmount = planList.data.data.totalAmount;
              this.previewRepayment = true;
            }
          } catch (error) {
            beijingDialog({
              message: error?.data?.msg || '还款计划查询失败!',
              confirmButtonText: '确定'
            });
          } finally {
            this.$toasting.hide();
          }
        }
      });
    },

    operateLoansAll() {
      this.loansAll();
    },

    /**
     * 处理借全部 --- 未加校验 （ 有风险 ）
     * */
    loansAll() {
      this.formItem.borrowBalance = this.formItem.approveCredit.toString();
      // let maxLoans = 500000; //单笔最多借50万
      // let secLoans = 499000;
      // if (this.formItem.approveCredit > maxLoans) {
      //   this.formItem.borrowBalance = secLoans.toString();
      // } else if (this.formItem.approveCredit === maxLoans) {
      //   this.formItem.borrowBalance = maxLoans.toString();
      // } else {
      //   this.formItem.borrowBalance = this.formItem.approveCredit.toString();
      // }
    },

    // get account list
    async getBankCardList() {
      try {
        let accountRes = await getBeijingRepayAccountList({ productId: '9999' });
        if (accountRes?.length) {
          this.bankCardList = accountRes;
          this.formItem.bankCardDesc = accountRes[0].bankDesc;
          this.formItem.bankCard = accountRes[0].cardNo;
          return;
        }
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '还款账户列表获取失败!',
          confirmButtonText: '确定'
        });
      } finally {
        this.$toasting.hide();
      }
    },

    // get credit info list
    async getCreditNum() {
      try {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        let creditList = await getUserCreditResult({ productId: this.formItem.productId || '9999' });
        if (!creditList?.data?.data) {
          return;
        }

        let canUseCreditInfo = creditList.data.data.find((creditItem) => {
          // creditItem.quotaValidFlag && creditItem.contStatus !== '104'
          return (
            String(creditItem.agreeProduct) === '9999' &&
            String(creditItem.applyUnionKey) === String(this.formItem.applyUnionKey)
          );
        });

        if (canUseCreditInfo) {
          this.formItem.creditNum = canUseCreditInfo.creditNo || '';
          // 可以借的最高金额
          let avaliableCredit = canUseCreditInfo.xmAvaliableCredit || '';
          // 可以借的最高金额的描述
          let avaliableCareitDesc = avaliableCredit ? toThousands(avaliableCredit.toFixed(2)) : '';
          this.formItem.approveCredit = avaliableCredit || '';
          // 贷款利率 -- 转换 % 的格式
          this.formItem.interestRate = canUseCreditInfo.interestRate;
          this.formItem.interestRateDesc = canUseCreditInfo.interestRate
            ? (canUseCreditInfo.interestRate * 100).toFixed(2) + '%'
            : '';
          // 单次授信的记录标识
          this.formItem.applyUnionKey = canUseCreditInfo.applyUnionKey;
          // 最高金额的描述
          this.maxLoansDesc = `${this.maxLoansDesc}${avaliableCareitDesc}`;
          // get bank list
          this.formItem.creditNum && this.getBankCardList();
          // update unionKey
          sessionStorage.setItem('union_key', canUseCreditInfo.applyUnionKey);

          // get face result
          this.getVerifyResult();

          // batch update
          this.$forceUpdate();
        }
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '获取用户授信信息错误',
          confirmButtonText: '确定'
        });
      } finally {
        this.$toasting.hide();
      }
    },

    // 借款期限
    onLoansTimeLimitSelect(item) {
      if (item) {
        this.formItem.loansTimeLimitName = item.label;
        this.formItem.loansTimeLimit = item.value;
        this.loansTimeLimitShow = false;
      }
    },

    // 借款用途的操作
    onLoansPurposeSelect(item) {
      if (item) {
        this.formItem.loansPurposeName = item.label;
        this.formItem.loansPurpose = item.value;
        this.loansPurposeShow = false;
      }
    },

    // 银行卡选择
    onLoansAccountSelect(item) {
      if (item?.cardNo) {
        this.formItem.bankCard = item.cardNo;
        this.formItem.bankCardDesc = item.bankDesc;
        this.openAccountSelect = false;
      }
    },

    /**
     * system no check， user whether open account in first borrow，next borrow can response account info
     *    type -- common 去开户
     *    type -- dialog
     * */
    goBeijingOpenAccount(type) {
      // 暂定
      if (!type) {
        return;
      }

      switch (type) {
        case 'common': {
          this.$toasting.show({ message: '加载中', forbidClick: true });
          setTimeout(() => {
            // https://cdnmobibank.bankofbeijing.com.cn/cdn/embank/AO/AO0/TAO0A01.html?channel=03 （ 生产 ）
            // https://commobitest.bankofbeijing.com.cn:30010/cdn/embank/AO/AO0/TAO0A01.html?channel=03 （ 测试 ）
            window.location.href = 'https://cdnmobibank.bankofbeijing.com.cn/cdn/embank/AO/AO0/TAO0A01.html?channel=03';
            this.$toasting.hide();
          }, 1000);
          break;
        }
      }
    },

    /**
     * repay amount sum
     * */
    rowRepayAmountSum(sum) {
      if (typeof sum === 'number') {
        return sum.toFixed(2);
      }

      return 0;
    },

    changeBankCard(value) {
      this.formItem.bankCard = value ? value.replace(/\ +/g, '') : value;
    }
  }
};
</script>
<style lang="scss" scoped>
.loans-base-info-wrapper {
  min-height: 100vh;
  background: #f4f6f9;
  width: 100vw;
  position: relative;

  .borrow-content {
    .top-back {
      width: 100%;
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

    .repayment {
      margin: 0 auto;
      margin-top: 32px;
      width: fit-content;
    }

    .form-module {
      width: 686px;
      padding: 10px 0;

      .tableTip {
        font-size: 28px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #df0301;

        ::v-deep .van-button__text {
          font-size: 28px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #df0301;
        }
      }

      /* account  */
      .account-module {
        min-height: 208px;
        background: #ffffff;
        box-shadow: 0px 0px 32px -8px rgba(78, 6, 6, 0.2);
        border-radius: 16px;
        margin-bottom: 32px;
        display: flex;
        flex-direction: column;

        .bank__arrow--select {
          display: flex;
          justify-content: flex-end;
          align-items: center;

          img {
            width: 28px;
            height: 28px;
          }
        }

        .operate-open-account {
          display: flex;
          align-items: center;
          flex: 1;

          .left-desc {
            margin-left: 32px;
            font-size: 24px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #2b0e0c;
          }

          .tableTip {
            margin-left: 12px;
            font-size: 24px;

            ::v-deep .van-button__text {
              font-family: PingFangSC-Medium, PingFang SC;
              font-weight: 500;
              color: #df0301;
            }
          }
        }
      }

      .other-module {
        background: #ffffff;
        box-shadow: 0px 0px 32px -8px rgba(78, 6, 6, 0.2);
        border-radius: 16px;
      }

      .van-cell {
        background-color: unset !important;
      }
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

      ::v-deep .van-button__text {
        font-size: 28px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #ffffff;
      }
    }
  }
}

.my-loan {
  .title {
    height: 125px;
    font-size: 32px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #2b0e0c;
    text-align: center;
    line-height: 125px;
    border-bottom: 1px solid #f8f9fa;
  }

  .list {
    height: 448px;
    overflow-y: scroll;
  }

  .list-item {
    height: 112px;
    text-align: center;
    line-height: 112px;
    font-size: 28px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #333333;
  }

  .selected {
    color: #a90600;
  }
}

.my-loan-remind {
  width: 620px;
  height: 640px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .icon {
    width: 280px;
    height: 190px;
    margin-top: 16px;
    margin-bottom: 20px;
  }

  .title {
    font-size: 32px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 600;
    color: #2b0e0c;
  }

  .tip-remind {
    margin-top: 24px;
    font-size: 24px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #8f8b8a;

    .colorE0C {
      font-weight: 600;
      color: #2b0e0c;
    }
  }

  .account-operate__button {
    margin-top: 44px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;

    .account-operate__button--left {
      width: 240px;
      height: 80px;
      background: #ffffff;
      border-radius: 44px;
      border: 2px solid #a60400;

      ::v-deep .van-button__text {
        font-size: 28px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #a60400;
      }
    }

    .account-operate__button--right {
      width: 240px;
      height: 80px;
      background: linear-gradient(129deg, #cd1101 0%, #a70500 100%);
      border-radius: 45px;

      ::v-deep .van-button__text {
        font-size: 28px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #ffffff;
      }
    }
  }
}

.confirm-loan {
  //width: 576px;
  //height: 786px;
  max-height: 80%;
  min-height: 60%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;

  .header-content {
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    border-bottom: 2px solid #f8f9fa;
    padding: 32px;

    .title {
      font-size: 30px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #2b0e0c;
    }

    .close-icon {
      position: absolute;
      right: 40px;
      display: flex;
      align-items: center;

      img {
        width: 30px;
        height: 30px;
      }
    }
  }

  .body-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: auto;
    padding: 0 32px;

    .borrow-info {
      width: 100%;
      margin-bottom: 56px;

      .title {
        width: 100%;
        display: flex;
        align-items: center;

        .fill {
          width: 6px;
          height: 24px;
          background: linear-gradient(129deg, #b80701 0%, #9a0400 100%);
          border-radius: 3px;
          margin-right: 14px;
        }

        .txt {
          margin-top: 2px;
          font-size: 28px;
          font-family: PingFangSC-Semibold, PingFang SC;
          font-weight: 600;
          color: #2b0e0c;
        }
      }

      .content {
        width: 100%;

        .table {
          width: 100%;
          border-radius: 8px 8px 0px 0px;
          border: 1px solid #e7e7e7;
          margin-top: 24px;

          .thead {
            width: 100%;
            display: flex;
            height: 64px;

            .headOne {
              width: 50%;
              background: #f9f7f7;
              border-right: 1px solid #e7e7e7;
              border-bottom: 1px solid #e7e7e7;
              font-size: 24px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #8f8b8a;
              line-height: 64px;
              text-align: center;
            }

            .headTwo {
              width: 50%;
              border-right: none;
            }
          }

          .tbody {
            width: 100%;
            display: flex;
            height: 64px;

            .bodyOne {
              width: 50%;
              background: #fff;
              border-right: 1px solid #e7e7e7;
              font-size: 24px;
              font-family: PingFangSC-Medium, PingFang SC;
              font-weight: 500;
              color: #2b0e0c;
              line-height: 64px;
              text-align: center;
            }

            .bodyTwo {
              width: 50%;
              border-right: none;
            }
          }
        }
      }
    }

    .repay-plan-content {
      width: 100%;

      .title {
        width: 100%;
        display: flex;
        align-items: center;

        .fill {
          width: 6px;
          height: 24px;
          background: linear-gradient(129deg, #b80701 0%, #9a0400 100%);
          border-radius: 3px;
          margin-right: 14px;
        }

        .txt {
          font-size: 28px;
          font-family: PingFangSC-Semibold, PingFang SC;
          font-weight: 600;
          color: #2b0e0c;
        }
      }

      .table {
        width: 100%;
        border-radius: 8px 8px 0px 0px;
        border: 1px solid #e7e7e7;
        margin-top: 24px;

        .thead {
          width: 100%;
          display: flex;
          height: 64px;

          .headOne {
            width: 50%;
            background: #f9f7f7;
            border-right: 1px solid #e7e7e7;
            border-bottom: 1px solid #e7e7e7;
            font-size: 24px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #8f8b8a;
            line-height: 64px;
            text-align: center;
          }

          .headTwo {
            width: 50%;
            border-right: none;
          }
        }

        .tbody {
          width: 100%;
          display: flex;
          height: 64px;

          .bodyOne {
            width: 50%;
            background: #fff;
            border-right: 1px solid #e7e7e7;
            font-size: 24px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #2b0e0c;
            line-height: 64px;
            text-align: center;
          }

          .bodyTwo {
            width: 50%;
            border-right: none;
          }
        }
      }

      .repay-plan-detail {
        padding-bottom: 280px;

        .table-1 {
          width: 100%;
          margin: 0 auto;
          margin-top: 16px;
          border-radius: 8px;
          border: 1px solid #e7e7e7;
          border-bottom: none;

          .thead-1 {
            display: flex;

            .headItem {
              width: 160px;
              height: 66px;
              background: #f9f7f7;
              //border-radius: 8px;
              border-right: 1px solid #e7e7e7;
              border-bottom: 1px solid #e7e7e7;
              line-height: 66px;
              text-align: center;
              font-size: 24px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #8f8b8a;

              &:first-child {
                width: 204px;
              }

              &:last-child {
                border-right: 0;
              }
            }
          }

          .tbody-1 {
            .bodyItem {
              height: 80px;
              display: flex;

              .date {
                width: 204px;
                background: #f9f7f7;
                font-size: 24px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: #8f8b8a;
                text-align: center;
                border-right: 1px solid #e7e7e7;
                border-bottom: 1px solid #e7e7e7;
              }

              .num {
                background-color: #fff;
                font-size: 24px;
                font-family: PingFangSC-Medium, PingFang SC;
                font-weight: 500;
                color: #2b0e0c;
                line-height: 80px;
                text-align: center;
                width: 160px;
                border-right: 1px solid #e7e7e7;
                border-bottom: 1px solid #e7e7e7;

                &:last-child {
                  border-right: none;
                }
              }
            }
          }
        }
      }
    }
  }

  .footer-fixed {
    position: fixed;
    bottom: 0;
    width: 100%;
    min-height: 242px;
    background: #ffffff;
    box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.11);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 0;

    .footer-tip {
      text-align: center;
      font-size: 28px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #2b0e0c;
      margin-bottom: 24px;
    }

    .submit-confirm {
      width: 686px;
      height: 88px;
      background: linear-gradient(129deg, #b80701 0%, #9a0400 100%), linear-gradient(129deg, #cd1101 0%, #a70500 100%);
      border-radius: 45px;

      ::v-deep .van-button__text {
        font-size: 28px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #ffffff;
      }
    }
  }
}
</style>

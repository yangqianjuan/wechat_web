<template>
  <div class="loans-base-info-wrapper">
    <div class="product-wrapper">
      <img class="product-logo" :src="producDetail.productLogo" alt="产品logo" />
      <p class="product-name">{{ producDetail.productName }}</p>
    </div>
    <div class="from-container">
      <Form :model="formItem" :label-width="75" :rules="ruleValidate" ref="formDynamic" label-position="left">
        <FormItem label="借款金额" prop="borrowBalance">
          <i-input v-model="formItem.borrowBalance" @input="borrowBalanceChange" :placeholder="maxLoansDesc">
            <span class="loans-all-btn" @click="loansAll" slot="append">借全部</span>
          </i-input>
        </FormItem>
        <FormItem label="还款方式" prop="refundMode">
          <Select v-model="formItem.refundMode" placeholder="请选择还款方式">
            <Option v-for="refundMode in refundModeList" :key="refundMode.value" :value="refundMode.value">
              {{ refundMode.label }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="借款期限" prop="loansTimeLimit">
          <Select v-model="formItem.loansTimeLimit" placeholder="请选择借款期限" disabled>
            <Option
              v-for="loansTimeLimit in loansTimeLimitList"
              :key="loansTimeLimit.value"
              :value="loansTimeLimit.value"
              >{{ loansTimeLimit.label }}</Option
            >
          </Select>
        </FormItem>
        <FormItem label="借款用途" prop="loansPurpose">
          <Select v-model="formItem.loansPurpose" placeholder="请选择借款用途">
            <Option v-for="loansPurpose in loansPurposeList" :key="loansPurpose.value" :value="loansPurpose.value">
              {{ loansPurpose.label }}
            </Option>
          </Select>
        </FormItem>
        <div>
          <FormItem label="收款账户" prop="bankCard">
            <Select v-model="formItem.bankCard" placeholder="请选择银行卡">
              <Option v-for="(bankCard, index) in bankCardList" :key="index" :value="bankCard.bankCardNo">
                {{ bankCard.bankDesc }}
              </Option>
            </Select>
          </FormItem>
        </div>

        <p class="warning-text">{{ warnText }}</p>
        <div class="protocol-link-wrapper">
          <input class="protocol-select-btn" id="agree" type="radio" value="agree" v-model="isAgree" />
          <label class="agree-text" for="agree">我已知晓</label>
        </div>
        <div class="sub-btn">
          <Button type="primary" @click="handleSubmit('formDynamic')">下一步</Button>
        </div>
      </Form>
    </div>
  </div>
</template>
<script>
import { jdugeNewUserRoute } from '@/controller/userController.js';
import { getBankListByCreditNo } from '@/controller/bank.js';
import { getUserCreditResult } from '@/request/interface/impower/UserInfo.js';
import { getProduceDetail } from '@/request/interface/impower/Bank.js';
import { toThousands } from '@/utils/common/common.js';
import { LOANS_TREM_TIMES, LOANS_PURPOSE_LIST, LOANS_REFUND_TYPE, WARN_TEXT } from './config';
export default {
  // xmkd 借款基本信息
  data() {
    const validateIncoming = (rule, value, callback) => {
      value = parseInt(value);
      const regPos = new RegExp(/^\d+$/);
      const regNeg = new RegExp(/^\-[1-9][0-9]*$/);
      const maxLoans = 500000; //单笔最多借50万
      const secLoans = 499000;
      if ((regPos.test(value) || regNeg.test(value)) && value > 0 && value <= this.formItem.approveCredit) {
        if (this.formItem.approveCredit > maxLoans && value <= secLoans) {
          callback();
        } else if (this.formItem.approveCredit === maxLoans && value <= maxLoans) {
          callback();
        } else if (this.formItem.approveCredit < maxLoans && value <= this.formItem.approveCredit) {
          callback();
        } else {
          callback(new Error('单笔不能大于49.9万'));
        }
      } else {
        callback(new Error('请输入正确的借款金额！'));
      }
    };
    return {
      formItem: {
        borrowBalance: '',
        refundMode: '',
        loansTimeLimit: '1年',
        loansPurpose: '1',
        receiptAcount: '',
        bankCard: '',
        productId: '',
        applyUnionKey: '',
        creditNum: '',
        approveCredit: '',
        interestRate: ''
      },
      isAgree: '',
      warnText: WARN_TEXT,
      refundMode: '',
      producDetail: {},
      maxLoansDesc: '最高可借',
      refundModeList: LOANS_REFUND_TYPE,
      loansTimeLimitList: LOANS_TREM_TIMES,
      loansPurposeList: LOANS_PURPOSE_LIST,
      bankCardList: [],
      ruleValidate: {
        borrowBalance: [
          { required: true, message: '请填写借款金额', trigger: 'blur' },
          { trigger: 'blur', validator: validateIncoming }
        ],
        refundMode: [{ required: true, message: '请选择', trigger: 'blur' }],
        loansTimeLimit: [{ required: true, message: '请选择', trigger: 'blur' }],
        loansPurpose: [{ required: true, message: '请选择', trigger: 'blur' }],
        receiptAcount: [{ required: true, message: '请选择', trigger: 'blur' }],
        bankCard: [{ required: true, message: '请选择', trigger: 'blur' }]
      },
      applyUnionKey: ''
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.applyUnionKey = this.$route.query.applyUnionKey;
      this.formItem.productId = 1000;
      window.localStorage.removeItem('liveVerifyTime');
      Promise.all([jdugeNewUserRoute(), this.getCreditNum(), this.getProductInfo()]);
    },

    /**
     * 借款的基本信息提交
     * */
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          if (!this.isAgree) {
            this.$notify.info({ msg: '请选择我已知晓！' });
            return;
          }
          this.formItem.bankCardDesc = this.getBankDescByBankNo();
          this.$router.replace({
            path: '/confirm_loans_info',
            query: { loansInfo: JSON.stringify(this.formItem), producDetail: JSON.stringify(this.producDetail) }
          });
        }
      });
    },
    loansAll() {
      let approveCredit = this.formItem.approveCredit;
      let maxLoans = 500000; //单笔最多借50万
      let secLoans = 499000;
      if (this.formItem.approveCredit > maxLoans) {
        this.formItem.borrowBalance = secLoans.toString();
      } else if (this.formItem.approveCredit === maxLoans) {
        this.formItem.borrowBalance = maxLoans.toString();
      } else {
        this.formItem.borrowBalance = this.formItem.approveCredit.toString();
      }
    },
    getBankCardList() {
      let creditNo = this.formItem.creditNum;
      getBankListByCreditNo({ creditNo }).then(res => {
        this.bankCardList = res;
      });
    },
    borrowBalanceChange() {
      let borrowBalance = this.formItem.borrowBalance;
      borrowBalance = borrowBalance.replace(/[^0-9]+/g, '');
      this.$nextTick(() => {
        this.formItem.borrowBalance = borrowBalance;
      });
    },
    getCreditNum() {
      let productId = this.formItem.productId;
      getUserCreditResult({ productId }).then(res => {
        let credits = res.data.data;
        let data = null;
        credits.forEach(creditItem => {
          let applyUnionKey = creditItem.applyUnionKey + '';
          let selfUnionKey = this.applyUnionKey + '';
          if (applyUnionKey === selfUnionKey) {
            data = creditItem;
          }
        });

        if (data) {
          this.formItem.creditNum = data.creditNo;
          // let avaliableCredit = data.avaliableCredit;
          let avaliableCredit = data.xmAvaliableCredit;
          let avaliableCareitDesc = toThousands(avaliableCredit.toFixed(2));
          this.formItem.approveCredit = avaliableCredit;
          this.formItem.interestRate = data.interestRate;
          this.formItem.applyUnionKey = data.applyUnionKey;
          this.applyUnionKey = data.applyUnionKey;
          this.maxLoansDesc = `${this.maxLoansDesc}${avaliableCareitDesc}`;
          this.getBankCardList();
        } else {
          this.$notify.info({ msg: '未查到该用户的此笔授信信息！' });
        }
      });
    },
    refundModeChange(value) {
      this.formItem.loansTimeLimit = '';
    },
    getBankDescByBankNo() {
      let bankCardList = this.bankCardList;
      let bankCardDesc = '';
      bankCardList.forEach(bankCard => {
        if (bankCard.bankCardNo === this.formItem.bankCard) {
          bankCardDesc = bankCard.bankDesc;
        }
      });
      return bankCardDesc;
    },
    getProductInfo() {
      getProduceDetail({ productId: this.formItem.productId || '1000' }).then(res => {
        let data = res.data.data;
        this.producDetail = {
          productName: data.productName,
          productLogo: data.productImage
        };
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.loans-base-info-wrapper {
  min-height: 100vh;
  background: #ffffff;
}
.product-wrapper {
  display: flex;
  align-items: center;

  background: #ffffff;
  height: 63px;
  margin-bottom: 15px;
  .product-logo {
    height: 80px;
    width: 80px;
    margin-left: 20px;
  }
  .product-name {
    margin-left: 12px;
    font-size: 26px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
  }
}
.from-container {
  padding: 20px 20px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.remind {
  background: rgba(244, 246, 249, 1);
  font-size: 24px;
  padding: 10px 0 10px 20px;
  font-weight: 400;
  color: rgba(127, 127, 127, 1);
}
.protocol-link-wrapper {
  display: flex;
  align-items: center;
  font-size: 24px;
  margin-top: 1.875rem;
  .agree-text {
    padding-left: 10px;
  }
}
.sub-btn {
  display: flex;
  justify-content: center;
  font-size: 26px;
  margin-top: 20px;
  button {
    width: 80%;
  }
}
.address-wrapper {
  display: flex;
}
.address-span {
  line-height: 30px;
  margin-right: 20px;
}
.selectAddress select {
  height: 30px;
  margin-left: 15px;
  border: 1px solid #dcdee2;
  border-radius: 4px;
}
.ivu-form-item {
  margin-bottom: 20px;
}
.loans-all-btn {
  font-size: 26px;
  font-weight: 400;
  color: rgba(27, 111, 251, 1);
}
.warning-text {
  font-size: 24px;
  font-weight: 400;
  color: #db2b13;
  margin-top: 50px;
  text-indent: 2rem;
  padding: 0 12px;
  letter-spacing: 1.5px;
}
/deep/.ivu-form-item {
  margin-bottom: 25px;
  border-bottom: 1px solid #edf1f5;
  padding-top: 0.6875rem;
}

/deep/.ivu-input {
  border: 0;
  border-radius: 0;
  padding-left: 0.8125rem;
}
/deep/.ivu-select-selection {
  border: 0;
  border-radius: 0;
  padding: 0 4px;
}
/deep/.ivu-form-item-content {
  // line-height: 1.25rem;
}
/deep/.ivu-form-item-error-tip {
  margin-left: 0.625rem;
  padding-top: 0;
}

/deep/ .ivu-form-item-label:before {
  content: '';
}
/deep/.ivu-input-group-append {
  border: 0;
  border-radius: 0;
  background: #ffffff;
}
</style>

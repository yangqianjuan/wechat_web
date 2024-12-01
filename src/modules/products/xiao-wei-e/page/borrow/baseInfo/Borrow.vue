<template>
  <div class="loans-base-info-wrapper reset-form" v-if="isLoading">
    <div v-if="isShow">
      <div class="product-wrapper">
        <img class="product-logo" :src="producDetail.productLogo" alt="产品logo" />
        <p class="product-name">{{ producDetail.productName }}</p>
      </div>
      <div class="from-container">
        <van-form validate-first ref="formDynamic">
          <van-field
            v-model="formItem.borrowBalance"
            name="borrowBalance"
            required
            label="借款金额"
            :placeholder="maxLoansDesc"
            @input="borrowBalanceChange"
            :rules="ruleValidate.borrowBalance"
          >
            <span class="loans-all-btn" slot="right-icon" @click="loansAll">借全部</span>
          </van-field>

          <van-field
            required
            v-model="formItem.refundMode"
            class="error-msg"
            name="refundMode"
            :rules="ruleValidate.refundMode"
          >
            <div slot="input" style="width:100%" class="bank-name">
              <van-cell class="self-cell" title="还款方式" :value="formItem.refundModeName" />
              <van-action-sheet
                v-model="refundModeShow"
                class="self-popup"
                :actions="refundModeList"
                disabled
                description="还款方式"
                @select="onRefundModeSelect"
                cancel-text="取消"
                close-on-click-action
              />
            </div>
          </van-field>

          <van-field
            required
            v-model="formItem.repayPrincipalCycle"
            class="error-msg"
            name="repayPrincipalCycle"
            :rules="ruleValidate.repayPrincipalCycle"
          >
            <div slot="input" style="width:100%" class="bank-name">
              <van-cell class="self-cell" title="还本周期" :value="formItem.repayPrincipalCycleName" />
              <van-action-sheet
                v-model="repayPrincipalCycleShow"
                class="self-popup"
                :actions="repayPrincipalCycleList"
                description="还本周期"
                disabled
                @select="onRepayPrincipalCycleSelect"
                cancel-text="取消"
                close-on-click-action
              />
            </div>
          </van-field>

          <van-field
            required
            v-model="formItem.repayInterestCycle"
            class="error-msg"
            name="repayInterestCycle"
            :rules="ruleValidate.repayInterestCycle"
          >
            <div slot="input" style="width:100%" class="bank-name">
              <van-cell class="self-cell" title="还息周期" :value="formItem.repayInterestCycleName" />
              <van-action-sheet
                v-model="repayInterestCycleShow"
                class="self-popup"
                disabled
                :actions="repayInterestCycleList"
                description="还息周期"
                @select="onRepayInterestCycleSelect"
                cancel-text="取消"
                close-on-click-action
              />
            </div>
          </van-field>

          <van-field
            required
            v-model="formItem.loansTimeLimit"
            class="error-msg"
            name="loansTimeLimit"
            :rules="ruleValidate.loansTimeLimit"
          >
            <div slot="input" style="width:100%" class="bank-name">
              <van-cell
                is-link
                class="self-cell"
                arrow-direction="down"
                clickable
                title="借款期限"
                @click="loansTimeLimitShow = true"
                :value="formItem.loansTimeLimitName"
              />
              <van-action-sheet
                v-model="loansTimeLimitShow"
                class="self-popup"
                :actions="loansTimeLimitList"
                description="借款期限"
                @select="onLoansTimeLimitSelect"
                cancel-text="取消"
                close-on-click-action
              />
            </div>
          </van-field>

          <van-field
            v-model="formItem.loansPurpose"
            class="error-msg"
            required
            name="loansPurpose"
            :rules="ruleValidate.loansPurpose"
          >
            <div slot="input" style="width:100%" class="bank-name">
              <van-cell
                is-link
                class="self-cell"
                arrow-direction="down"
                title="借款用途"
                :value="formItem.loansPurposeName"
                @click="loansPurposeShow = true"
              />
              <van-action-sheet
                v-model="loansPurposeShow"
                class="self-popup"
                :actions="loansPurposeList"
                description="借款用途"
                @select="onLoansPurposeSelect"
                cancel-text="取消"
                close-on-click-action
              />
            </div>
          </van-field>

          <van-field
            required
            v-model="formItem.bankCard"
            class="error-msg"
            name="bankCard"
            :rules="ruleValidate.bankCard"
          >
            <div slot="input" style="width:100%" class="bank-name">
              <van-cell
                is-link
                class="self-cell"
                arrow-direction="down"
                title="收款账户"
                :value="formItem.bankCardName"
                @click="bankCardShow = true"
              />
              <van-action-sheet
                v-model="bankCardShow"
                class="self-popup"
                :actions="bankCardList"
                description="收款账户"
                @select="onBankCardListSelect"
                cancel-text="取消"
                close-on-click-action
              />
            </div>
          </van-field>
        </van-form>
        <p class="warning-text">{{ warnText }}</p>
        <div class="protocol-link-wrapper">
          <input class="protocol-select-btn" id="agree" type="radio" value="agree" v-model="isAgree" />
          <label class="agree-text" for="agree">我已知晓</label>
        </div>
        <van-button class="sub-btn foot-operate-btn" type="primary" @click="handleSubmit('formDynamic')"
          >下一步</van-button
        >
      </div>
    </div>

    <div class="empty-wrapper" v-if="!isShow">
      <img class="empty-icon" :src="emptyIcon" alt />
      <p>暂不可以借款</p>
    </div>
  </div>
</template>
<script>
import { jdugeNewUserRoute } from '@/controller/userController.js';
import { getBankListByCreditNo } from '@/controller/bank.js';
import { getUserCreditResult } from '@/request/interface/impower/UserInfo.js';
import { getProduceDetail } from '@/request/interface/impower/Bank.js';
import { toThousands } from '@/utils/common/common.js';
import {
  LOANS_TREM_TIMES,
  LOANS_PURPOSE_LIST,
  LOANS_REFUND_TYPE,
  WARN_TEXT,
  LOANS_PRINC_CYCLE,
  LOANS_INTEREST_CYCLE
} from '../config.js';
import { getGfSessionId } from '@/controller/common.js';
export default {
  /**
   * 借款信息的基本填写
   * */
  name: 'GFBorrow',
  data() {
    const validateIncoming1 = (value, rule) => {
      value = parseInt(value);
      const regPos = new RegExp(/^\d+$/);
      const regNeg = new RegExp(/^\-[1-9][0-9]*$/);
      if ((regPos.test(value) || regNeg.test(value)) && value > 0) {
        return true;
      } else {
        return false;
      }
    };
    const validateIncoming2 = (value, rule) => {
      value = parseInt(value);
      const minMoney = 100;
      if (value < 100) {
        return false;
      } else {
        return true;
      }
    };
    return {
      refundModeShow: false,
      loansTimeLimitShow: false,
      loansPurposeShow: false,
      bankCardShow: false,
      repayPrincipalCycleShow: false,
      repayInterestCycleShow: false,
      isShow: false,
      isLoading: false,
      formItem: {
        // 借款的金额
        borrowBalance: '',

        // 还款的方式
        refundMode: '04',
        refundModeName: '按月等额本息',

        // 借款期限
        loansTimeLimit: '12',
        loansTimeLimitName: '12个月',

        // 借款用途
        loansPurpose: '',
        loansPurposeName: '',

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
        // 授信的单号
        creditNum: '',
        // 最高可以借的额度
        approveCredit: '',
        // 贷款利率
        interestRate: '',

        // 还本周期
        repayPrincipalCycle: '4',
        repayPrincipalCycleName: '按月',

        // 还息周期
        repayInterestCycle: '4',
        repayInterestCycleName: '按月'
      },
      isAgree: '',
      warnText: WARN_TEXT,
      refundMode: '',
      producDetail: {},
      maxLoansDesc: '最高可借',
      // 还款方式列表
      refundModeList: LOANS_REFUND_TYPE,
      // 借款期限列表
      loansTimeLimitList: LOANS_TREM_TIMES,
      // 借款用途列表
      loansPurposeList: LOANS_PURPOSE_LIST,
      // 还本周期列表
      repayPrincipalCycleList: LOANS_PRINC_CYCLE,
      // 还息周期
      repayInterestCycleList: LOANS_INTEREST_CYCLE,
      // 收款账户列表
      bankCardList: [],
      emptyIcon: require('@/assets/imgs/icon/ic_empty.png'),
      // 表单的验证
      ruleValidate: {
        borrowBalance: [
          { required: true, message: '请填写借款金额', trigger: 'onBlur' },
          { trigger: 'onBlur', validator: validateIncoming1, message: '请输入正确的金额' },
          { trigger: 'onBlur', validator: validateIncoming2, message: '单笔的金额须大于等于100' }
        ],
        refundMode: [{ required: true, message: '请选择还款方式', trigger: 'onBlur' }],
        loansTimeLimit: [{ required: true, message: '请选择借款期限', trigger: 'onBlur' }],
        loansPurpose: [{ required: true, message: '请选择借款用途', trigger: 'onBlur' }],
        receiptAcount: [{ required: true, message: '请选择', trigger: 'onBlur' }],
        bankCard: [{ required: true, message: '请选择收款账户', trigger: 'onBlur' }],
        repayPrincipalCycle: [{ required: true, message: '请选择还本周期', trigger: 'onBlur' }],
        repayInterestCycle: [{ required: true, message: '请选择还息周期', trigger: 'onBlur' }]
      }
    };
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      this.formItem.productId = this.$route.query.productId ? this.$route.query.productId : '1035';
      this.$toasting.show({ message: '加载中', forbidClick: true });
      if (this.formItem.productId) {
        // 删除活体识别
        window.localStorage.removeItem('borrowLiveVerifyTime');
        // 用户的基本信息
        jdugeNewUserRoute();
        // 查询用户授信的结果
        this.getCreditNum();
        // 获取产品信息
        this.getProductInfo();
      } else {
        setTimeout(() => {
          this.$toasting.error({ msg: '加载失败' });
          this.isLoading = true;
          this.isShow = false;
        }, 1500);
      }
    },

    /**
     *  功能：
     *
     *    验证：金额、还款方式、借款期限、借款用途、收款账户是否填写
     *         发起会话id
     *
     * */
    handleSubmit(name) {
      this.$refs[name]
        .validate(['borrowBalance', 'refundMode', 'loansTimeLimit', 'loansPurpose', 'bankCard'])
        .then(res => {
          if (!res) {
            if (!this.isAgree) {
              this.$notify.info({ msg: '请选择我已知晓！' });
              return;
            }
            this.formItem.bankCardDesc = this.getBankDescByBankNo();
            let params = {
              applyUnionKey: this.formItem.applyUnionKey,
              // 3 是放款阶段
              type: 3
            };
            this.$toasting.show({ message: '上传中', forbidClick: true });
            getGfSessionId(params)
              .then(res => {
                if (res?.data?.success) {
                  // 保存借款的基本信息的填写
                  this.$toasting.success({ msg: '成功' });
                  sessionStorage.setItem(
                    'xwe_borrow_info_single',
                    JSON.stringify({ formInfo: this.formItem, producDetail: this.producDetail })
                  );
                  setTimeout(() => {
                    this.$router.replace({
                      path: '/xwe_borrow_face'
                    });
                  }, 1500);
                } else {
                  this.$toasting.error({ msg: '上传失败！' });
                }
              })
              .catch(() => {
                this.$toasting.error({ msg: '上传失败！' });
              })
              .finally(() => {
                this.$toasting.hide();
              });
          }
        });
    },

    /**
     * 处理借全部
     * */
    loansAll() {
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

    // 获取收款账户的列表
    getBankCardList() {
      let creditNo = this.formItem.creditNum;
      getBankListByCreditNo({ creditNo })
        .then(res => {
          res && (this.bankCardList = res);
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    borrowBalanceChange() {
      let borrowBalance = this.formItem.borrowBalance;
      borrowBalance = borrowBalance.replace(/[^0-9]+/g, '');
      this.$nextTick(() => {
        this.formItem.borrowBalance = borrowBalance;
      });
    },

    // 获取授信的结果信息
    getCreditNum() {
      getUserCreditResult({ productId: this.formItem.productId })
        .then(res => {
          if (res?.data?.data) {
            let data = res.data.data.find(creditItem => {
              return creditItem.agreeProduct === 1035;
            });
            if (data) {
              this.isLoading = true;
              this.isShow = true;
              this.formItem.creditNum = data.creditNo ? data.creditNo : '';
              // 可以借的最高金额
              let avaliableCredit = data.xmAvaliableCredit ? data.xmAvaliableCredit : '';
              // let avaliableCredit = data.avaliableCredit ? data.avaliableCredit : '';
              // 可以借的最高金额的描述
              let avaliableCareitDesc = avaliableCredit ? toThousands(avaliableCredit.toFixed(2)) : '';
              this.formItem.approveCredit = avaliableCredit ? avaliableCredit : '';
              // 贷款利率
              this.formItem.interestRate = data.interestRate;
              // 单次授信的记录标识
              this.formItem.applyUnionKey = data.applyUnionKey;
              // 最高金额的描述
              this.maxLoansDesc = `${this.maxLoansDesc}${avaliableCareitDesc}`;
              this.formItem.creditNum && this.getBankCardList();
            } else {
              this.isLoading = true;
              this.isShow = false;
            }
          } else {
            this.isLoading = true;
            this.isShow = false;
            this.$notify.info({ msg: '暂无用户的授信信息！' });
          }
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '获取用户授信信息错误！' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
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
      getProduceDetail({ productId: this.formItem.productId || '1035' }).then(res => {
        if (res?.data?.data) {
          let data = res.data.data;
          this.producDetail = {
            productName: data.productName,
            productLogo: data.productImage
          };
        }
      });
    },

    // 还款的方式
    onRefundModeSelect(item) {
      if (item) {
        this.formItem.refundMode = item.value;
        this.formItem.refundModeName = item.name;
      }
    },

    // 借款期限
    onLoansTimeLimitSelect(item) {
      if (item) {
        this.formItem.loansTimeLimitName = item.name;
        this.formItem.loansTimeLimit = item.value;
      }
    },

    // 借款用途的操作
    onLoansPurposeSelect(item) {
      if (item) {
        this.formItem.loansPurposeName = item.name;
        this.formItem.loansPurpose = item.value;
      }
    },

    // 收款账户
    onBankCardListSelect(item) {
      if (item.bankCardNo) {
        this.formItem.bankCard = item.bankCardNo;
        this.formItem.bankCardName = item.name;
      }
    },

    // 还本周期
    onRepayPrincipalCycleSelect(item) {
      if (item) {
        this.formItem.repayPrincipalCycleName = item.name;
        this.formItem.repayPrincipalCycle = item.value;
      }
    },

    // 还息周期
    onRepayInterestCycleSelect(item) {
      if (item) {
        this.formItem.repayInterestCycleName = item.name;
        this.formItem.repayInterestCycle = item.value;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.loans-base-info-wrapper {
  min-height: 100vh;
  background: #f4f6f9;
}
.product-wrapper {
  display: flex;
  align-items: center;
  background: #ffffff;
  margin-bottom: 20px;
  .product-logo {
    height: 80px;
    width: 80px;
    margin-left: 20px;
  }
  .product-name {
    margin-left: 22px;
    font-size: 32px;
    font-weight: 600;
    color: rgba(51, 51, 51, 1);
  }
}
.from-container {
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.protocol-link-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 24px;
  margin-top: 1.875rem;
  margin-left: 30px;
  .agree-text {
    padding-left: 10px;
  }
}
.sub-btn {
  display: flex;
  justify-content: center;
  font-size: 26px;
  margin-top: 40px;
  width: 80%;
  margin-left: 10%;
  margin-bottom: 70px;
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
  padding: 8px 25px;
  font-size: 24px;
  font-weight: 400;
  color: #db2b13;
  margin-top: 50px;
  text-indent: 2rem;
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
// /deep/.ivu-form-item-content {
//   // line-height: 1.25rem;
// }
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

.bank-name {
  /deep/.van-cell {
    padding: 0;
  }
  .van-cell::after {
    border: 0 !important;
  }
}
.van-field--disabled {
  background-color: #ccc;
  .van-cell {
    background-color: #ccc;
  }
}

.error-msg {
  /deep/.van-field__error-message {
    margin-left: 130px;
  }
}
.empty-wrapper {
  position: absolute;
  top: -70px;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  p {
    font-size: 36px;
    margin-top: 22px;
    font-weight: 600;
  }
  .empty-icon {
    width: 330px;
    height: 330px;
  }
}
</style>

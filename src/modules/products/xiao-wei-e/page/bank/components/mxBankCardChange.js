import { bankCardChange, otherBankCardChangeVerify, saasNewEacountCard } from '@/request/interface/impower/Bank.js';
import { apllyEacount } from '@/controller/bank.js';
export default {
  data() {
    return {
      bankCard: {},
      isBack: false,
      changeNo: '',
      msg: '',
      smsLoading: false
    };
  },
  methods: {
    jdugeBankCardChange(params, isBack = false) {
      this.bankCard = params;
      this.isBack = this.isBack ? this.isBack : isBack;
      bankCardChange(params)
        .then((res) => {
          res?.data?.data && this.bankcardChangeHandle(res.data.data);
        })
        .catch((err) => {
          this.errHandle(err);
        })
        .finally((_) => {
          this.$toasting.hide();
        });
    },
    bankcardChangeHandle(data) {
      let type = data.code;
      this.$toasting.hide();
      if (type === '1001' || type === '1003' || type === '1004') {
        // 本行卡绑定成功, 跳转银行卡列表页面不需要改绑申请
        this.isBtnLoading = false;
        if (this.isBack) {
          this.$router.back(-1);
        } else {
          this.getBankCardList();
        }
      } else if (type === '1005') {
        // 他行卡绑定成功， 跳转银行卡列表页，需要提示点击改绑按钮
        this.changeNo = data.changeNo;
        this.isShowMask = true;
        this.isBtnLoading = false;
      } else {
        // 他行卡绑定成功，需要开通电子账户，开通过后返回
        this.isBtnLoading = false;
        this.bindEaCard();
      }
    },
    bindEaCard() {
      let bankCard = this.bankCard;
      let userInfo = this.$store.state.userInfo;
      bankCard.idNo = userInfo.idNo;
      apllyEacount(bankCard)
        .then((res) => {
          if (res?.data?.data?.actOpenNo) {
            this.bankCard.actOpenNo = res.data.data.actOpenNo;
            let routerFun = this.isBack ? 'replace' : 'push';
            this.$router[routerFun]({
              path: '/verify_phone',
              query: {
                bankInfo: JSON.stringify(this.bankCard),
                nextPath: '/bank_card_mana'
              }
            });
          }
        })
        .catch((err) => {
          this.$notify.error({
            msg: '电子账户申请失败！'
          });
        })
        .finally(() => {
          this.isBtnLoading = false;
        });
    },
    smsSend() {
      let bankCard = this.bankCard;
      if (this.productId === '1000') {
        this.jdugeBankCardChange(bankCard);
      } else if (this.productId === '1023') {
        this.saasSendSmsCode(bankCard);
      }
    },
    smsVerify(smsCode) {
      this.$toasting.show({ message: '验证中', forbidClick: true });
      this.isBtnLoading = true;
      this.smsLoading = true;
      if (this.productId === '1000') {
        this.xmVerify(smsCode);
      } else if (this.productId === '1023') {
        this.saasVerify(smsCode);
      }
    },
    saasVerify(smsCode) {
      let that = this;
      let bankCard = this.bankCard;
      let params = {
        applyUnionKey: this.applyUnionKey,
        bankCardNo: bankCard.bankCardNo,
        bankCardReservePhone: bankCard.bankCardReservePhone,
        bankName: bankCard.bankName,
        bankNo: bankCard.bankNo,
        productId: this.productId,
        acctSerialNo: this.changeNo,
        smsVeri: smsCode
      };
      saasNewEacountCard(params)
        .then((res) => {
          that.isShowMask = false;
          that.getBankCardList();
        })
        .catch((err) => {
          this.errHandle(err);
        })
        .finally(() => {
          this.smsLoading = false;
          this.isBtnLoading = false;
          this.itemIsLoading = false;
          this.$toasting.hide();
        });
    },
    xmVerify(smsCode) {
      let that = this;
      let params = {
        changeNo: this.changeNo,
        verifyCode: smsCode
      };
      otherBankCardChangeVerify(params)
        .then((res) => {
          if (that.isBack) {
            that.$router.back(-1);
          } else {
            that.isShowMask = false;
            that.getBankCardList();
          }
        })
        .catch((err) => {
          this.errHandle(err);
        })
        .finally(() => {
          this.smsLoading = false;
          this.isBtnLoading = false;
          this.itemIsLoading = false;
          this.$toasting.hide();
        });
    },
    switchMask() {
      this.isShowMask = !this.isShowMask;
    },
    errHandle(err) {
      this.isBtnLoading = false;
      this.itemIsLoading = false;
      this.$notify.error({
        msg: err?.data?.msg || '操作失败！'
      });
    }
  }
};

<template>
  <div class="bank-card-mana-wrapper">
    <div class="bank-card-list-wrapper">
      <bank-card-item
        class="bank-card-item"
        :loading="itemIsLoading"
        @changeBankCard="changeBankCard"
        v-for="bankcard in bankCardList"
        :key="bankcard.id"
        :bankcardConfig="bankcard"
      ></bank-card-item>
    </div>
    <Button class="add-card-btn" @click="gotoAddBankCard">添加银行卡</Button>
    <div v-if="isShowMask">
      <v-change-eacount-sms
        :phoneNum="phoneNum"
        :isShowMask="isShowMask"
        @hideMask="switchMask"
        :loading="smsLoading"
        @smsVerify="smsVerify"
        @smsSend="smsSend"
      ></v-change-eacount-sms>
    </div>
    <Modal v-model="showModel" title="银行卡变更申请" @on-ok="ok" @on-cancel="cancel">
      <p>变更到{{bankCard.bankName}}</p>
      <div class="bank-card-no">
        卡号：
        <div
          class="desc"
        >{{ bankCardShow ? formatBankNo(bankCard.bankCardNo) : desensitizationInfo(bankCard.bankCardNo, 'bankCard')}}</div>
        <img class="search-eye" v-if="!bankCardShow" :src="eyeClose" @click="bankCardShow = !bankCardShow" />
        <img class="search-eye" v-if="bankCardShow" :src="eyeOpen" @click="bankCardShow = !bankCardShow" />
      </div>
    </Modal>
  </div>
</template>
<script>
import BankCardItem from './components/BankCardItem.vue';
import { queryBankCardListByProdId } from '@/controller/bank.js';
import mxBankCardChangeMixin from './mxBankCardChange';
import ChaneEacountSmsVeriyf from './components/ChaneEacountSmsVeriyf';
import { sassSendSmsCode } from '@/request/interface/impower/Sass.js';
import { BIND_CARD_PATH } from './components/config';
import { desensitizationInfo } from '@/utils/common/common.js';
import commonFilters from '@/utils/vue/filters/common.js';

export default {
  data() {
    return {
      bankCardList: [],
      applyUnionKey: '',
      productId: '',
      isShowMask: false,
      itemIsLoading: false,
      showModel: false,
      phoneNum: '',
      bankCard: {},
      isBtnLoading: false,
      bankCardShow: false,
      eyeOpen: require('@/assets/imgs/icon/ic_eye.svg'),
      eyeClose: require('@/assets/imgs/icon/ic-eye-close.svg')
    };
  },
  components: {
    'bank-card-item': BankCardItem,
    'v-change-eacount-sms': ChaneEacountSmsVeriyf
  },
  mixins: [mxBankCardChangeMixin],
  created() {
    this.applyUnionKey = this.getUrlParam('applyUnionKey');
    this.productId = this.getUrlParam('productId');
    this.addCardPath = BIND_CARD_PATH[this.productId];
    this.getBankCardList();
  },
  methods: {
    getBankCardList() {
      queryBankCardListByProdId({ productId: this.productId }).then((bankCardList) => {
        this.$nextTick(() => {
          this.bankCardList = bankCardList;
        });
      });
    },
    desensitizationInfo,
    formatBankNo: commonFilters.formatBankNo,
    gotoAddBankCard() {
      let addCardPath = BIND_CARD_PATH[this.productId];
      this.$router.push({ path: addCardPath, query: { applyUnionKey: this.applyUnionKey, isNeedBack: true } });
    },
    changeBankCard(bankCard) {
      if (this.isBtnLoading) {
        return;
      }
      this.showModel = true;
      this.bankCard = bankCard;
    },
    saasSendSmsCode(params) {
      params.opType = '01';
      sassSendSmsCode(params)
        .then((res) => {
          this.changeNo = res?.data?.data;
          this.isShowMask = true;
          this.isBtnLoading = false;
          this.$notify.success({ msg: '发送成功！' });
        })
        .catch((err) => {
          this.showerrHandle(err, '账户申请失败');
        })
        .finally(() => {
          this.itemIsLoading = false;
          this.$toasting.hide();
        });
    },
    showerrHandle(err, defaultMsg) {
      this.$notify.error({ msg: err?.data?.msg || defaultMsg });
    },
    ok() {
      let bankCard = this.bankCard;
      bankCard.productId = this.productId;
      bankCard.applyUnionKey = this.applyUnionKey;
      this.itemIsLoading = true;
      this.phoneNum = bankCard.bankCardReservePhone;
      this.$toasting.show({ message: '申请中', forbidClick: true });
      if (this.productId === '1000') {
        this.jdugeBankCardChange(bankCard);
      } else if (this.productId === '1023') {
        this.saasSendSmsCode(bankCard);
      }
    },
    cancel() {
      this.showModel = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.bank-card-mana-wrapper {
  min-height: 100vh;
  background: #f2f4f8;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .bank-card-list-wrapper {
    width: 100%;
  }
}
.bank-card--warpper {
  display: flex;
  padding: 0.625rem 0 0 0.9375rem;
  .logo-warpper {
    display: flex;
    width: 20px;
    height: 20px;
    padding: 0.3125rem;
    background: #ffffff;
    border-radius: 50%;
  }
}
.bank-card-item {
  margin-bottom: 0.625rem;
}
.add-card-btn {
  width: 80%;
  margin-top: 3.75rem;
  background: #1b6ffb;
  box-shadow: -2px 2px 5px 2px rgba(27, 111, 251, 0.26);
  border-radius: 0.1875rem;
  outline: none;
  color: #ffffff;
}
.bank-card-no {
  display: flex;
  align-items: center;
  .search-eye {
    margin-left: 18px;
    width: 40px;
    height: 32px;
  }
}
</style>

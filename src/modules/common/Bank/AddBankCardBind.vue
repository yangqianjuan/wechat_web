<template>
  <div class="bind-bank-card-wrapper" v-if="isPageOverLoading">
    <div class="remind">请填写 {{ formItem.name }} 的银行储蓄卡</div>
    <div class="from-container">
      <Form :model="formItem" :label-width="85" :rules="ruleValidate" ref="formDynamic" label-position="left">
        <FormItem label="银行卡号" prop="debitCardNum">
          <i-input
            v-model="formItem.debitCardNum"
            placeholder="请输入银行卡号"
            :maxlength="debitCardNumMaxLegnth"
            type="number"
          >
            <Icon type="md-expand" slot="append" @click="gotoQrcBankCard" />
          </i-input>
        </FormItem>
        <FormItem label="银行名称" prop="bankName">
          <Select v-model="formItem.bankName" placeholder="请选择银行">
            <Option v-for="bankName in bankNameList" :key="bankName.value" :value="bankName.label">{{ bankName.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="预留手机号" prop="phoneNum">
          <i-input v-model="formItem.phoneNum" placeholder="银行预留手机号" :maxlength="phoneNumMaxLength"></i-input>
        </FormItem>
        <Button :loading="isBtnLoading" class="sub-btn" type="primary" @click="handleSubmit('formDynamic')">下一步</Button>
      </Form>
    </div>
    <div v-if="isShowMask">
      <v-change-eacount-sms
        :phoneNum="formItem.phoneNum"
        :isShowMask="isShowMask"
        @hideMask="switchMask"
        :loading="smsLoading"
        @smsVerify="smsVerify"
        @smsSend="smsSend"
      ></v-change-eacount-sms>
    </div>
  </div>
</template>
<script>
import initUploadObj from '@/controller/upload';
import { bankCardOCR } from '@/request/interface/txQrc/readerPci';
import { chooseWxImage, getFileName } from '@/utils/wx/wxUtils';
import { dataURLtoFile } from '@/utils/common/common';
import { BankCard } from '@/model/BankCard';
import { BANKLIST } from '@/utils/common/bankConfig';
import mxBankCardChangeMixin from './mxBankCardChange';
import ChaneEacountSmsVeriyf from './components/ChaneEacountSmsVeriyf';
import { bankCardCheck } from '@/utils/common/common';
export default {
  data() {
    const validatePhoneNum = (rule, value, callback) => {
      const regPhone = new RegExp(/^1\d{10}$/);
      if (regPhone.test(value)) {
        callback();
      } else {
        callback(new Error('请填写正确手机号'));
      }
    };
    const validateBankCard = (rule, value, callback) => {
      const result = bankCardCheck(value);
      if (result) {
        callback();
      } else {
        callback(new Error('请填写正确的银行卡号'));
      }
    };
    return {
      formItem: {
        debitCardNum: '',
        bankName: '',
        phoneNum: '',
        name: '',
        applyUnionKey: '',
        referrer: '',
        productId: ''
      },
      isShowMask: false,
      isPageOverLoading: false,
      isBtnLoading: false,
      bankCard: {},
      phoneNumMaxLength: 11,
      debitCardNumMaxLegnth: 21,
      isPicLoadOver: true,
      icScanUrl: require('@/assets/imgs/icon/ic_scan.png'),
      bankNameList: BANKLIST,
      productId: '1000',
      ruleValidate: {
        debitCardNum: [
          { required: true, message: '请填写银行卡号', trigger: 'blur' },
          { trigger: 'blur', validator: validateBankCard }
        ],
        bankName: [{ required: true, message: '请填写', trigger: 'blur' }],
        phoneNum: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { trigger: 'blur', validator: validatePhoneNum }
        ]
      }
    };
  },
  components: {
    'v-change-eacount-sms': ChaneEacountSmsVeriyf
  },
  mixins: [mxBankCardChangeMixin],
  created() {
    this.formItem.applyUnionKey = this.$route.query.applyUnionKey;
    this.formatePageLocalData();
  },
  methods: {
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        this.formItem.bankNo = this.getBankNumByName(this.formItem.bankName);
        let params = this.formItem;
        this.formItem.bankCardNo = params.debitCardNum;
        this.formItem.bankCardReservePhone = params.phoneNum;
        params.bankCardNo = params.debitCardNum;
        params.bankCardReservePhone = params.phoneNum;
        if (valid) {
          this.$toasting.show({ message: '申请中', forbidClick: true });
          this.isBtnLoading = true;
          let isBack = true;
          this.jdugeBankCardChange(params, isBack);
        }
      });
    },
    formatePageLocalData() {
      let user = this.$store.state.userInfo;
      this.formItem.name = user.name;
      this.formItem.userId = user.id;
      this.formItem.idNo = user.idNo;
      this.formItem.referrer = this.$store.state.referrer;
      this.formItem.productId = this.$store.state.productId;
      this.productId = this.$store.state.productId.toString();
      this.isPageOverLoading = true;
    },
    gotoQrcBankCard() {
      if (!this.isPicLoadOver) {
        return;
      }
      this.isPicLoadOver = false;
      let japiList = ['chooseImage', 'uploadImage', 'getLocalImgData', 'previewImage'];
      let picFace = '';
      chooseWxImage(japiList)
        .then((res) => {
          this.$toasting.show({ message: '识别中', forbidClick: true });
          picFace = dataURLtoFile(res, getFileName());
          return this.uploadUtil(picFace);
        })
        .then((res) => {
          return bankCardOCR({ imageUrl: res, userId: this.formItem.userId });
        })
        .then((res) => {
          let bankCard = new BankCard(res?.data?.data);
          this.bankCard = bankCard;
          this.formItem.debitCardNum = bankCard.cardNo;
          let bankCardCode = this.getBankNumByName(bankCard.bankName);
          bankCardCode && (this.formItem.bankName = bankCard.bankName);
        })
        .catch((err) => {
          this.hideLoading();
          this.$notify.error({ msg: '识别失败，请确认图片内容！' });
        })
        .finally(() => {
          this.hideLoading();
        });
    },
    hideLoading() {
      this.isPicLoadOver = true;
      this.$toasting.hide();
    },
    uploadUtil(picFace) {
      let that = this;
      return new Promise((resolve, reject) => {
        initUploadObj(
          that,
          new Date().getTime(),
          picFace,
          'image',
          (res) => {
            resolve(res.pic);
          },
          'bank_card'
        );
      });
    },
    getBankNumByName(bankName) {
      let bankList = this.bankNameList;
      let bankNum;
      bankList.forEach((bank) => {
        bank.label === bankName && (bankNum = bank.value);
      });
      return bankNum;
    }
  }
};
</script>
<style lang="scss" scoped>
.bind-bank-card-wrapper .from-container {
  padding: 10px 20px 0 20px;
}

.bind-bank-card-wrapper .sub-btn {
  width: 80%;
  position: fixed;
  bottom: 40px;
  right: 10%;
}
.bind-bank-card-wrapper .ivu-form-item {
  margin-bottom: 46px;
}
.ic-snan {
  height: 20px;
  width: 20px;
}
.errMsg {
  padding: 0 1.25rem;
  max-height: 120px;
  display: flex;
  overflow: auto;
}
.mask {
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 1000;
  width: 100vw;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  .protocol-wrapper {
    position: absolute;
    bottom: 0;
  }
}
</style>

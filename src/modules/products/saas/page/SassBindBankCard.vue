<template>
  <div class="bind-bank-card-wrapper" v-if="isOverLoading">
    <div v-if="isOpenAccunt">
      <div class="remind">请填写 {{formItem.name}} 的银行储蓄卡</div>
      <div class="from-container">
        <Form :model="formItem" :label-width="85" :rules="ruleValidate" ref="formDynamic" label-position="left">
          <FormItem label="银行卡号" prop="debitCardNum">
            <i-input
              v-model="formItem.debitCardNum"
              placeholder="请输入银行卡号"
              :maxlength="debitCardNumMaxLegnth"
              type="number"
            >
              <Icon class type="md-expand" slot="append" @click="gotoQrcBankCard" />
            </i-input>
          </FormItem>
          <FormItem label="银行名称" prop="bankName">
            <Select v-model="formItem.bankName" placeholder="请选择银行">
              <Option v-for="bankName in bankNameList" :key="bankName.value" :value="bankName.label">{{bankName.label}}</Option>
            </Select>
          </FormItem>
          <FormItem label="预留手机号" prop="phoneNum">
            <i-input v-model="formItem.phoneNum" placeholder="银行预留手机号" :maxlength="phoneNumMaxLength"></i-input>
          </FormItem>
          <FormItem label="验证码" prop="smsCode">
            <i-input v-model="formItem.smsCode" placeholder="短信验证码" :maxlength="6">
              <v-sms
                slot="append"
                :canClick="smsCanClick"
                ref="sms"
                :isSucc="isSmsSendSucc"
                @canNotSend="handleSubmit('formDynamic')"
                @sendSms="sendSmsCode"
              ></v-sms>
            </i-input>
          </FormItem>
          <Button class="sub-btn" type="primary" :loading="isBtnLoading" @click="handleSubmit('formDynamic')">确定</Button>
        </Form>
      </div>
    </div>
    <div v-if="!isOpenAccunt" class="bank-card-warpper">
      <div v-for="(value, name) in bankCard" :key="name">
        <div class="info-item" v-if="bankCardTitle[name]">
          <div class="title">{{bankCardTitle[name]}}</div>
          <div class="desc black-col">{{value}}</div>
        </div>
      </div>

      <Button class="sub-btn" type="primary" :loading="isBtnLoading" @click="confirmAcount">开通</Button>
    </div>
    <p-modal v-show="isShowErrMsg" title="绑卡失败" :isShowCancel="false" @ok="switchModel" @cancel="switchModel">
      <p class="errMsg">{{errMsg}}</p>
    </p-modal>
  </div>
</template>
<script>
import { chooseWxImage, getFileName } from '@/utils/wx/wxUtils';
import initUploadObj from '@/controller/upload';
import vSmsSendWaitSucc from '@/common/components/common/vSmsSendWaitSucc.vue';
import { dataURLtoFile } from '@/utils/common/common';
import { bankCardOCR } from '@/request/interface/txQrc/readerPci';
import { SESSION_ID } from '@/utils/common/config';
import { BankCard } from '@/model/BankCard';
import { getUnionKey } from '@/request/interface/common';
import { SAAS_BANK_LIST } from '@/utils/common/bankConfig';
import { SASS_BIND_CARD_VALIA } from './utils/util';
import { saasNewEacountCard } from '@/request/interface/impower/Bank.js';
import {
  sassSendSmsCode,
  sassEAcountVerify,
  querySassIsOpenEaccount,
  saasAutoAgreeBankCard
} from '@/request/interface/impower/Sass.js';
import mxModal from '@/common/mixin/mxModal.js';
export default {
  /**
   * sass绑定银行卡的页面，sass银行卡绑定成功之后，确认开通电子账户
   * */
  name: 'SassBindBankCard',
  data() {
    return {
      formItem: {
        debitCardNum: '',
        bankName: '',
        phoneNum: '',
        name: '',
        referrer: '',
        productId: '',
        applyUnionKey: '',
        acctSerialNo: ''
      },
      timer: '',
      isNeedBack: false,
      isOverLoading: false,
      isBtnLoading: false,
      isSmsSendSucc: false,
      isOpenAccunt: true,
      bankCard: {},
      phoneNumMaxLength: 11,
      debitCardNumMaxLegnth: 21,
      isPicLoadOver: true,
      icScanUrl: require('@/assets/imgs/icon/ic_scan.png'),
      bankNameList: SAAS_BANK_LIST,
      ruleValidate: SASS_BIND_CARD_VALIA,
      bankCardTitle: {
        userName: '姓名',
        bankCardReservePhone: '手机号',
        bankName: '开户行',
        bankCard: '银行卡号'
      }
    };
  },
  mixins: [mxModal],
  components: {
    'v-sms': vSmsSendWaitSucc
  },
  computed: {
    smsCanClick() {
      let isPass = false;
      const regPhone = new RegExp(/^1\d{10}$/);
      if (regPhone.test(this.formItem.phoneNum) && this.formItem.debitCardNum && this.formItem.phoneNum) {
        isPass = true;
      }
      return isPass;
    }
  },
  created() {
    this.isNeedBack = this.$route.query.isNeedBack;
    let applyUnionKey = this.$route.query.applyUnionKey;
    this.formItem.applyUnionKey = applyUnionKey;
    this.formatePageLocalData();
    if (!this.isNeedBack) {
      this.jdugeIsCanBindEaccount();
      this.getApplyUnionKey().then((res) => {
        let applyUnionKey = res?.data?.data;
        this.formItem.applyUnionKey = applyUnionKey;
        sessionStorage.setItem(SESSION_ID.unionKey, applyUnionKey);
      });
    } else {
      this.isOverLoading = true;
      this.applyUnionKey = applyUnionKey;
    }
  },
  methods: {
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        this.formItem.bankNo = this.getBankNumByName(this.formItem.bankName);
        if (valid) {
          if (this.isBtnLoading) {
            return false;
          }
          this.isBtnLoading = true;
          if (this.isNeedBack) {
            this.saasChangeNewCard();
          } else {
            this.sassSMSVerify();
          }
        }
      });
    },
    sendSms() {
      this.isSmsSendSucc = true;
    },

    // 发送验证码
    sendSmsCode() {
      let formItem = this.formItem;
      if (!formItem.debitCardNum || !formItem.phoneNum || !formItem.bankName) {
        return;
      }
      this.$toasting.show({ message: '发送中', forbidClick: true });
      let params = {
        applyUnionKey: formItem.applyUnionKey,
        bankCardNo: formItem.debitCardNum,
        bankCardReservePhone: formItem.phoneNum,
        bankName: formItem.bankName,
        bankNo: this.getBankNumByName(formItem.bankName),
        opType: this.isNeedBack ? '01' : '00',
        productId: formItem.productId
      };
      sassSendSmsCode(params)
        .then((res) => {
          this.isSmsSendSucc = true;
          this.formItem.acctSerialNo = res.data.data;
          this.$notify.success({ msg: '发送成功！' });
        })
        .catch((err) => {
          this.errHandle(err, '账户申请失败');
          this.$refs.sms.switchIsWaitingSucc();
        })
        .finally(() => {
          this.$toasting.hide();
          this.resetSmsStatus();
          this.isBtnLoading = false;
        });
    },

    //银行卡开户
    sassSMSVerify() {
      this.isBtnLoading = true;
      let formItem = this.formItem;
      this.$toasting.show({ message: '开通中', forbidClick: true });
      let params = {
        smsVeri: this.formItem.smsCode,
        acctSerialNo: formItem.acctSerialNo,
        applyUnionKey: formItem.applyUnionKey,
        productId: formItem.productId,
        referrer: formItem.referrer
      };
      sassEAcountVerify(params)
        .then((res) => {
          this.$notify.success({ msg: '开通成功！' });
          this.$router.replace({ path: '/sign_sass_contract' });
        })
        .catch((err) => {
          this.errHandle(err, '账户开通失败');
        })
        .finally(() => {
          this.$toasting.hide();
          this.isBtnLoading = false;
        });
    },

    // 修改卡
    saasChangeNewCard() {
      let formItem = this.formItem;
      let params = {
        applyUnionKey: this.applyUnionKey,
        bankCardNo: formItem.debitCardNum,
        bankCardReservePhone: formItem.phoneNum,
        bankName: formItem.bankName,
        bankNo: formItem.bankNo,
        productId: formItem.productId,
        acctSerialNo: formItem.acctSerialNo,
        smsVeri: formItem.smsCode
      };
      saasNewEacountCard(params)
        .then((res) => {
          this.$router.back(-1);
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

    // 电子账户快速开户 isOpenAccunt === '1002'
    confirmAcount() {
      this.$toasting.show({ message: '开通中', forbidClick: true });
      let params = {
        applyUnionKey: this.formItem.applyUnionKey,
        bankCardNo: this.bankCard.bankCard,
        stCardNo: this.bankCard.stCard,
        productId: '1023',
        referrer: this.formItem.referrer
      };
      saasAutoAgreeBankCard(params)
        .then((res) => {
          this.$notify.success({ msg: '开通成功！' });
          this.$router.replace({ path: '/sign_sass_contract' });
        })
        .catch((err) => {
          this.errHandle(err);
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    // 获取电子账户的信息 (判断用户是否已经开户了)
    jdugeIsCanBindEaccount() {
      querySassIsOpenEaccount({ productId: this.formItem.productId })
        .then((res) => {
          let data = res.data.data;
          let hasOpenCode = '1001'; // 用户还没有电子账户，需要先上传，银行卡进行开户
          let isOpenAccunt = data.code === hasOpenCode;
          this.isOpenAccunt = isOpenAccunt;
          // 1002 是已经绑定银行卡，已有电子账户信息，需要确认开通
          if (!isOpenAccunt) {
            let bancardInfo = data.bancardInfo;
            let bankCard = {
              userName: bancardInfo.userName,
              bankCardReservePhone: bancardInfo.bankCardReservePhone,
              bankName: bancardInfo.bankName,
              bankCard: bancardInfo.bankCard,
              stCard: bancardInfo.stCard
            };
            this.bankCard = bankCard;
          }
        })
        .finally(() => {
          this.isOverLoading = true;
        });
    },

    formatePageLocalData() {
      let user = this.$store.state.userInfo;
      this.formItem.name = user.name;
      this.formItem.userId = user.id;
      this.formItem.idNo = user.idNo;
      this.formItem.referrer = this.$store.state.referrer ? this.$store.state.referrer : localStorage.referrer;
      this.formItem.productId = this.$store.state.productId ? this.$store.state.productId : localStorage.productId;
    },

    getApplyUnionKey() {
      let payload = {};
      payload.referrer = this.$store.state.referrer;
      payload.productId = this.$store.state.productId;
      return getUnionKey(payload);
    },

    // 通过选中图片的形式，快速填入用户信息
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
          // console.log("nadade1", bankCard);
          this.bankCard = bankCard;
          this.formItem.debitCardNum = bankCard.cardNo;
          let bankCardCode = this.getBankNumByName(bankCard.bankName);
          if (bankCardCode) {
            this.formItem.bankName = bankCard.bankName;
          }
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

    resetSmsStatus() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        this.isSmsSendSucc = false;
      }, 2000);
    },

    /**
     * 通过银行的名字，获取银行的编号code
     *
     */
    getBankNumByName(bankName) {
      let bankList = this.bankNameList;
      let bankNum;
      bankList.forEach((bank) => {
        if (bank.label === bankName) {
          bankNum = bank.value;
        }
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
.bind-bank-card-wrapper .remind {
  background: rgba(244, 246, 249, 1);
  font-size: 24px;
  padding: 15px 0 15px 20px;
  font-weight: 400;
  color: rgba(127, 127, 127, 1);
}
.bind-bank-card-wrapper .sub-btn {
  width: 80%;
  margin-top: 10px;
  bottom: 50px;
  position: fixed;
  right: 10%;
}
.bank-card-warpper {
  background: #f4f6f9;
  height: 100vh;
}
.info-item {
  font-weight: 500;
  font-size: 24px;
  height: 3.4375rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 17px;
  background: #ffffff;
  border-bottom: 1px solid #f2f4f8;
}
.desc {
  font-weight: 400;
}
.black-col {
  color: #333333;
}
.bind-bank-card-wrapper .ivu-form-item {
  margin-bottom: 40px;
  ::v-deep(.ivu-form-item-error-tip) {
    padding-top: 0px;
  }
}
.ic-snan {
  height: 30px;
  width: 30px;
}
.errMsg {
  padding-left: 1.25rem;
}
</style>

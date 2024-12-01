<template>
  <div class="bank-replace-card">
    <div class="card-info">
      <div class="desc">请填写xxx的他行一类卡</div>
    </div>
    <div class="card-add">
      <Form :model="cardInfo" :label-width="120" :rules="ruleValidate" ref="formDynamic" label-position="left">
        <FormItem label="银行卡号" prop="debitCardNum">
          <i-input v-model="cardInfo.debitCardNum" placeholder="银行卡号" :maxlength="debitCardNumMaxLegnth" type="number">
            <Icon class type="md-expand" slot="append" @click="gotoQrcBankCard" />
          </i-input>
        </FormItem>
        <div class="line-fill"></div>
        <FormItem label="银行名称" prop="bankName">
          <i-input v-model="cardInfo.bankName" placeholder="银行名称"></i-input>
          <!-- <Select v-model="cardInfo.bankName" placeholder="银行">
            <Option v-for="bankName in bankNameList" :key="bankName.value" :value="bankName.label">{{ bankName.label }}</Option>
          </Select>-->
        </FormItem>
        <div class="line-fill"></div>
        <FormItem label="预留手机号" prop="phoneNum">
          <i-input v-model="cardInfo.phoneNum" placeholder="预留手机号" :maxlength="phoneNumMaxLength"></i-input>
        </FormItem>
        <div class="line-fill"></div>
        <FormItem class="sms-code" label="验证码" prop="smsCode">
          <div class="sms-content">
            <i-input v-model="cardInfo.smsCode" placeholder="验证码" type="text"></i-input>
            <SendSms ref="send-sms-bank" @sendSms="sendSmsBank"></SendSms>
          </div>
        </FormItem>
        <div class="line-fill"></div>
      </Form>
    </div>
    <div class="operate">
      <van-button round type="info" @click="toRepay">去还款</van-button>
    </div>
  </div>
</template>
<script>
import SendSms from '../../component/sms/SendSms.vue';
import { Dialog } from 'vant';
import { bankCardCheck } from '@/utils/common/common';
export default {
  // 换绑银行卡
  name: 'ReplaceCard',
  data() {
    //  验证身份证
    const validateIdNum = (rule, value, callback) => {
      let _IDRe18 = /^([1-6][1-9]|50)\d{4}(18|19|20)\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
      let _IDre15 = /^([1-6][1-9]|50)\d{4}\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}$/;
      const regIdNum18 = new RegExp(_IDRe18);
      const regIdNum15 = new RegExp(_IDre15);
      if (regIdNum18.test(value) || regIdNum15.test(value)) {
        callback();
      } else {
        callback(new Error('身份证号格式错误！'));
      }
    };
    const validatePhoneNum = (rule, value, callback) => {
      const regPhone = new RegExp(/^1\d{10}$/);
      if (regPhone.test(value)) {
        callback();
      } else {
        callback(new Error('请输入正确手机号！'));
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
      cardInfo: {
        debitCardNum: '',
        phoneNum: '',
        name: '',
        bankName: '',
        referrer: '',
        productId: '',
        applyUnionKey: '',
        idCard: '11111111111111'
      },
      bankNameList: [],
      isBtnLoading: false,
      phoneNumMaxLength: 11,
      debitCardNumMaxLegnth: 21,
      ruleValidate: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        debitCardNum: [
          { required: true, message: '请输入银行卡号', trigger: 'blur' },
          { trigger: 'blur', validator: validateBankCard }
        ],
        phoneNum: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { trigger: 'blur', validator: validatePhoneNum }
        ],
        idCard: [
          { required: true, message: '请输入身份证号', trigger: 'blur' },
          { required: true, validator: validateIdNum }
        ],
        smsCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
      }
    };
  },
  components: {
    SendSms
  },
  methods: {
    // 识别银行卡, 扫描图片
    gotoQrcBankCard() {
      if (!this.isPicLoadOver) {
        return;
      }
      this.isPicLoadOver = false;
      let japiList = ['chooseImage', 'uploadImage', 'getLocalImgData', 'previewImage'];
      let picFace = '';
      //   chooseWxImage(japiList)
      //     .then(res => {
      //
      //       picFace = dataURLtoFile(res, getFileName());
      //       return this.uploadUtil(picFace);
      //     })
      //     .then(res => {
      //       return bankCardOCR({ imageUrl: res, userId: this.cardInfo.userId });
      //     })
      //     .then(res => {
      //       let bankCard = new BankCard(res.data.data);
      //       this.bankCard = bankCard;
      //       this.cardInfo.debitCardNum = bankCard.cardNo;
      //     })
      //     .catch(err => {
      //       console.log(err);
      //       this.hideLoading();
      //
      //     })
      //     .finally(() => {
      //       this.hideLoading();
      //     });
    },
    // 发送验证码
    sendSmsBank() {
      /**
       * 验证码发送的前提是：
       *      1、银行卡号存在，且有效
       *      2、手机号存在且有效
       * */
      //   this.$refs.formDynamic.validateField("debitCardNum", res => {
      //     if (!res) {
      //       this.$refs.formDynamic.validateField("phoneNum", res => {
      //         if (!res) {
      //
      //           this.$refs["send-sms-bank"].smsSending();
      //           setTimeout(() => {
      //             this.$refs["send-sms-bank"].sendError();
      //             // this.$refs["send-sms-bank"].sendSuccess();
      //           }, 4500);
      //         }
      //       });
      //     }
      //   });
    },
    toRepay() {
      Dialog.confirm({
        title: '提醒',
        message: '请确认是否继续提现？',
        className: 'replac-card-dialog'
      })
        .then(() => {
          // on confirm
        })
        .catch(() => {
          // on cancel
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.bank-replace-card {
  height: 100vh;
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
  .card-add {
    width: 675px;
    margin-top: 30px;
    /deep/.ivu-form-item {
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
    /deep/.ivu-select-selection {
      //   height: 100%;
      .ivu-select-placeholder {
        border: 0;
        height: 100%;
        font-size: 32px;

        font-weight: 400;
        letter-spacing: 1px;
      }
    }
  }
  .operate {
    // display: flex;
    // justify-content: center;
    margin-top: 170px;
    .van-button {
      width: 532px;
      height: 100px;
      background: #3552d0;
      box-shadow: 0px 14px 23px -2px rgba(53, 82, 208, 0.45);
      border-radius: 50px;
      font-size: 34px;

      font-weight: 400;
      color: #ffffff;
      letter-spacing: 1px;
    }
  }
  .line-fill {
    width: 675px;
    height: 1px;
    // margin: 2px 0;
    background-color: #d8d8d8;
  }
}
</style>

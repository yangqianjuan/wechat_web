<template>
  <div class="bind-bank-card-wrapper" v-if="isOverLoading">
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
            <!-- <van-icon name="scan" slot="append" @click="gotoQrcBankCard" /> -->
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
        <div class="protocol-wrapper">
          <!-- <FormItem prop="protocol">
            <RadioGroup v-model="formItem.protocol">
              <Radio label="protocol">请阅读并勾选同意</Radio>
            </RadioGroup>
            <span>《委托三方支付扣款》</span>
          </FormItem>-->
        </div>
        <Button class="sub-btn" type="primary" :loading="isBtnLoading" @click="handleSubmit('formDynamic')">下一步</Button>
      </Form>
    </div>
    <p-modal v-show="isShowErrMsg" title="绑卡失败" :isShowCancel="false" @ok="switchModel" @cancel="switchModel">
      <div class="errMsg">{{errMsg}}</div>
    </p-modal>
    <div v-show="isShowProtocol" class="mask">
      <div class="protocol-wrapper">
        <p-read-prf
          :protocolText="pfCardNote"
          :isNeedCloseLoading="isNeedCloseLoading"
          @closePdf="handleSubmit('formDynamic')"
        ></p-read-prf>
      </div>
    </div>
  </div>
</template>
<script>
import { chooseWxImage, getFileName } from '@/utils/wx/wxUtils';
import initUploadObj from '@/controller/upload';
import ReadPdf from '@/common/components/common/ReadPdf.vue';
import { dataURLtoFile } from '@/utils/common/common';
import { bankCardOCR } from '@/request/interface/txQrc/readerPci';
import { SESSION_ID } from '@/utils/common/config';
import { BankCard } from '@/model/BankCard';
import { bindPfBankCard, apllyEacount } from '@/controller/bank.js';
import { getUnionKey } from '@/request/interface/common';
import { BANKLIST } from '@/utils/common/bankConfig';
import { queryUserInfo, jdugeIsCanBindBankCard } from '@/controller/userController.js';
import { PFCardNote } from './components/config';
import mxModal from '@/common/mixin/mxModal.js';
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
        protocol: '',
        name: '',
        referrer: '',
        productId: '',
        applyUnionKey: ''
      },
      pfCardNote: '',
      isOverLoading: false,
      isBtnLoading: false,
      isShowProtocol: false,
      bankCard: {},
      protocol: { isNess: true, isRead: false },
      phoneNumMaxLength: 11,
      debitCardNumMaxLegnth: 21,
      isPicLoadOver: true,
      icScanUrl: require('@/assets/imgs/icon/ic_scan.png'),
      bankNameList: BANKLIST,
      ruleValidate: {
        debitCardNum: [
          { required: true, message: '请填写银行卡号', trigger: 'blur' },
          { trigger: 'blur', validator: validateBankCard }
        ],
        bankName: [{ required: true, message: '请填写', trigger: 'blur' }],
        phoneNum: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { trigger: 'blur', validator: validatePhoneNum }
        ],
        protocol: [{ required: true, message: '请阅读并同意协议', trigger: 'blur' }]
      },
      isNeedCloseLoading: false
    };
  },
  components: {
    'p-read-prf': ReadPdf
  },
  mixins: [mxModal],
  created() {
    let prid = this.getUrlParam('prid');
    this.getApplyUnionKey().then((res) => {
      let applyUnionKey = res.data.data;
      this.formItem.applyUnionKey = applyUnionKey;
      sessionStorage.setItem(SESSION_ID.unionKey, applyUnionKey);
    });
    prid ? this.formatePageFronAcountMsg() : this.formatePageLocalData();
  },
  methods: {
    handleSubmit(name) {
      this.isShowProtocol = false;
      let bankName = '上海浦东发展银行';
      this.$refs[name].validate((valid) => {
        this.formItem.bankNo = this.getBankNumByName(this.formItem.bankName);
        if (valid) {
          if (this.isBtnLoading) {
            return false;
          }
          this.isBtnLoading = true;
          if (this.formItem.bankName === bankName) {
            this.bindPfCrad();
          } else {
            if (!this.protocol.isRead) {
              this.switchShowPdf();
              this.pfCardNote = PFCardNote;
              this.isNeedCloseLoading = true;
              this.protocol.isRead = true;
              this.isBtnLoading = false;
              return;
            }
            this.bindEaCard();
          }
        }
      });
    },
    switchShowPdf() {
      this.isShowProtocol = !this.isShowProtocol;
    },
    bindPfCrad() {
      this.getApplyUnionKey()
        .then((res) => {
          let applyUnionKey = res?.data?.data;
          this.formItem.applyUnionKey = applyUnionKey;
          sessionStorage.setItem(SESSION_ID.unionKey, applyUnionKey);
          return bindPfBankCard(this.formItem);
        })
        .then((res) => {
          this.$router.replace({ path: '/credut_result' });
        })
        .catch((err) => {
          this.errHandle(err, '银行卡绑定失败！！');
        })
        .finally(() => {
          this.isBtnLoading = false;
        });
    },
    bindEaCard() {
      if (this.formItem.applyUnionKey) {
        apllyEacount(this.formItem)
          .then((res) => {
            this.formItem.actOpenNo = res?.data?.data?.actOpenNo;
            this.$router.replace({ path: '/verify_phone', query: { bankInfo: JSON.stringify(this.formItem) } });
          })
          .catch((err) => {
            this.errHandle(err, '电子账户申请失败！！');
          })
          .finally(() => {
            this.isBtnLoading = false;
          });
      } else {
        this.getApplyUnionKey('bindEaCardNext');
      }
    },

    formatePageFronAcountMsg() {
      this.formItem.referrer = this.getUrlParam('uid');
      this.formItem.productId = this.getUrlParam('prid');
      console.log(this.formItem.referrer);
      localStorage.referrer = this.formItem.referrer;
      localStorage.productId = this.formItem.productId;
      this.$store.commit('setProductId', this.formItem.productId);
      this.$store.commit('setReferrer', this.formItem.referrer);
      queryUserInfo()
        .then((user) => {
          this.formItem.name = user?.name;
          this.formItem.userId = user?.id;
          this.formItem.idNo = user?.idNo;
          this.jdugeIsCanBind();
        })
        .finally(() => {
          this.isOverLoading = true;
        });
    },
    jdugeIsCanBind() {
      jdugeIsCanBindBankCard().then((isCanBind) => {
        !isCanBind && this.$router.replace({ path: '/credut_result' });
      });
    },
    formatePageLocalData() {
      let user = this.$store.state.userInfo;
      this.formItem.name = user.name;
      this.formItem.userId = user.id;
      this.formItem.idNo = user.idNo;
      this.formItem.referrer = this.$store.state.referrer || localStorage.getItem('referrer');
      this.formItem.productId = this.$store.state.productId
        ? this.$store.state.productId
        : localStorage.getItem('productId')
        ? localStorage.getItem('productId')
        : '1000';
      this.isOverLoading = true;
    },

    getApplyUnionKey(type) {
      let payload = {};
      payload.referrer = this.$store.state.referrer || localStorage.getItem('referrer');
      payload.productId = this.$store.state.productId
        ? this.$store.state.productId
        : localStorage.getItem('productId')
        ? localStorage.getItem('productId')
        : '1000';
      if (type === 'bindEaCardNext') {
        getUnionKey(payload).then((res) => {
          let applyUnionKey = res?.data?.data;
          this.formItem.applyUnionKey = applyUnionKey;
          sessionStorage.setItem(SESSION_ID.unionKey, applyUnionKey);
          apllyEacount(this.formItem)
            .then((res) => {
              this.formItem.actOpenNo = res?.data?.data?.actOpenNo;
              this.$router.replace({ path: '/verify_phone', query: { bankInfo: JSON.stringify(this.formItem) } });
            })
            .catch((err) => {
              this.errHandle(err, '电子账户申请失败！！');
            })
            .finally(() => {
              this.isBtnLoading = false;
            });
        });
      } else {
        return getUnionKey(payload);
      }
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

.bind-bank-card-wrapper .sub-btn {
  width: 80%;
  position: fixed;
  bottom: 40px;
  right: 10%;
}
.bind-bank-card-wrapper .ivu-form-item {
  margin-bottom: 46px;
  /deep/.ivu-form-item-error-tip {
    padding-top: 0;
    z-index: 100;
  }
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

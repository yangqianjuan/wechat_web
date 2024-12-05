<template>
  <div class="bind-bank-card-wrapper reset-form" v-if="isOverLoading">
    <div class="remind">请填写 {{ formItem.name }} 的银行储蓄卡</div>
    <div class="from-container">
      <van-form validate-first ref="formDynamic">
        <van-field
          v-model="formItem.debitCardNum"
          label="银行卡号"
          required
          :disabled="disableNoGFBankInfo"
          name="debitCardNum"
          placeholder="请输入银行卡号"
          :maxlength="debitCardNumMaxLegnth"
          :rules="ruleValidate.debitCardNum"
        >
          <van-icon name="scan" v-if="!disableNoGFBankInfo" slot="right-icon" @click="gotoQrcBankCard" />
        </van-field>
        <van-field
          v-model="formItem.bankName"
          class="error-msg"
          :label="disableNoGFBankInfo ? '银行名称' : ''"
          required
          :disabled="disableNoGFBankInfo"
          name="bankName"
          :rules="ruleValidate.bankName"
        >
          <div v-if="!disableNoGFBankInfo" slot="input" style="width:100%" class="bank-name">
            <van-cell
              is-link
              class="self-cell"
              arrow-direction="down"
              title="银行名称"
              :value="formItem.bankName"
              @click="bankNameShow = true"
            />
            <van-action-sheet
              v-model="bankNameShow"
              class="self-popup"
              :actions="bankNameList"
              description="银行名称"
              @select="onBankNameSelect"
              cancel-text="取消"
              close-on-click-action
            />
          </div>
        </van-field>
        <van-field
          v-model="formItem.phoneNum"
          name="phoneNum"
          required
          label="预留手机号"
          :disabled="disableNoGFBankInfo"
          placeholder="请输入预留手机号"
          :rules="ruleValidate.phoneNum"
        />
        <!-- <van-field
          v-model="formItem.smsCode"
          v-show="smsCodeShow"
          required
          name="smsCode"
          label="验证码"
          placeholder="请输入验证码"
          :rules="ruleValidate.smsCode"
        >
          <div slot="right-icon" class="sms-content">
            <SendSms ref="send-sms-bank" @sendSms="sendSmsBank"></SendSms>
          </div>
        </van-field>-->
      </van-form>
      <div v-show="isShowProtocol" class="mask">
        <div class="protocol-wrapper">
          <p-read-prf
            :protocolText="pfCardNote"
            :isNeedCloseLoading="isNeedCloseLoading"
            @closePdf="handleSubmit('formDynamic')"
          ></p-read-prf>
        </div>
      </div>
      <van-button class="btn-foot-fixed foot-operate-btn" type="primary" @click="handleSubmit('formDynamic')"
        >确定</van-button
      >
    </div>
  </div>
</template>

<script>
import ReadPdf from '@/common/components/common/ReadPdf.vue';
import { bindPfBankCard, apllyEacount } from '@/controller/bank.js';
import { queryUserInfo, jdugeIsCanBindBankCard } from '@/controller/userController.js';
import { PFCardNote } from '@/modules/common/Bank/components/config';
import { chooseWxImage, getFileName } from '@/utils/wx/wxUtils';
import initUploadObj from '@/controller/upload';
import { dataURLtoFile } from '@/utils/common/common';
import { bankCardOCR } from '@/request/interface/txQrc/readerPci';
import { BankCard } from '@/model/BankCard';
import { BANKLIST_COMMON } from '@/utils/common/bank';
import { validatePhoneNo, validateIdCard, bankCardCheck } from '@/utils/common/common';
import { getUnionKey } from '@/request/interface/common';
import { infoGet } from '@/utils/common/common';
export default {
  /**
   * 浦发实体卡绑定页
   * */
  nameL: 'PFBindBankCard',
  data() {
    return {
      formItem: {
        // 用户id
        userId: '',
        // 银行卡号
        debitCardNum: '',
        // 银行名
        bankName: '',
        // 手机号
        phoneNum: '',
        // 用户名
        name: '',
        // 销售id
        referrer: '',
        // 产品id
        productId: '1000',
        // 一次授信的记录
        applyUnionKey: '',
        //
        acctSerialNo: '',
        // 银行编号
        bankCardCode: '',
        // 用户的身份证号
        idNo: '',

        // 流水号
        smsSerialNo: '',
        protocol: ''
      },
      needBindPFCard: false,
      smsCodeShow: false,
      isOverLoading: false,
      // 银行卡扫描信息
      bankCard: {},
      phoneNumMaxLength: 11,
      debitCardNumMaxLegnth: 21,
      isPicLoadOver: true,
      isShowErrMsg: false,
      isShowProtocol: false,
      errMsg: '',
      bankNameShow: false,
      // 银行名验证
      bankNameList: BANKLIST_COMMON,

      // 控制更换银行卡的显示
      initBankInfo: true,

      // 广发的开户信息
      gfOpenAccountStatus: {},

      // 禁用银行卡信息修改（除广发）
      disableNoGFBankInfo: false,
      isNeedCloseLoading: false,
      pfCardNote: '',
      // 表单验证
      ruleValidate: {
        idCard: [
          { required: true, message: '请输入身份证号', trigger: 'onBlur' },
          { required: true, validator: validateIdCard, message: '请输入正确身份证号！' }
        ],
        debitCardNum: [
          { required: true, message: '请填写银行卡号', trigger: 'onBlur' },
          { validator: bankCardCheck, message: '请输入正确的银行卡号' }
        ],
        bankName: [{ required: true, message: '请选择银行名', trigger: 'onBlur' }],
        phoneNum: [
          { required: true, message: '请输入手机号', trigger: 'onBlur' },
          { validator: validatePhoneNo, message: '请输入正确手机号' }
        ],
        smsCode: [{ required: true, message: '请输入验证码', trigger: 'onBlur' }],
        protocol: [{ required: true, message: '请阅读并同意协议', trigger: 'blur' }]
      },
      protocol: { isNess: true, isRead: false },
      icScanUrl: require('@/assets/imgs/icon/ic_scan.png')
    };
  },

  components: {
    'p-read-prf': ReadPdf
  },

  created() {
    this.init();
  },

  methods: {
    /**
     * 初始化
     * */
    init() {
      let initInfo = infoGet('1000');
      this.formItem.referrer = initInfo.referrer || localStorage.referrer;
      this.formItem.referrer ? this.getApplyUnionKey() : this.$notify.info({ msg: '未获到销售的标识！' });
    },

    // 提交
    handleSubmit(name) {
      this.isShowProtocol = false;
      let validateArr = ['debitCardNum', 'bankName', 'phoneNum'];
      this.$refs[name].validate(validateArr).then(vaild => {
        if (!vaild) {
          this.formItem.bankNo = this.getBankNumByName(this.formItem.bankName);
          if (this.formItem.bankNo === '310290000013') {
            // 绑定浦发一类卡
            this.bindPfCrad();
          } else {
            if (!this.protocol.isRead) {
              this.switchShowPdf();
              this.pfCardNote = PFCardNote;
              this.isNeedCloseLoading = true;
              this.protocol.isRead = true;
              return;
            }
            // 其他的一类卡的绑定
            this.bindEaCard();
          }
        }
      });
    },

    switchShowPdf() {
      this.isShowProtocol = !this.isShowProtocol;
    },

    // 浦发卡的绑定
    bindPfCrad() {
      this.$toasting.show({ message: '申请中', forbidClick: true });
      bindPfBankCard(this.formItem)
        .then(res => {
          if (res?.data?.success) {
            setTimeout(() => {
              this.$router.replace({ path: '/credut_result' });
            }, 1000);
          } else {
            this.$notify.info({ msg: '申请失败！' });
          }
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '申请失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    // 非浦发一类卡的绑定
    bindEaCard() {
      this.$toasting.show({ message: '申请中', forbidClick: true });
      apllyEacount(this.formItem)
        .then(res => {
          if (res?.data?.success && res?.data?.data?.actOpenNo) {
            this.formItem.actOpenNo = res.data.data.actOpenNo;
            setTimeout(() => {
              this.$router.replace({ path: '/xm_bc_ce', query: { bankInfo: JSON.stringify(this.formItem) } });
            }, 1000);
          } else {
            this.$notify.info({ msg: '申请失败！' });
          }
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '申请失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    /**
     * 获取用户信息
     * */
    formatePageFronAcountMsg() {
      queryUserInfo()
        .then(user => {
          if (user) {
            this.formItem.name = user.name;
            this.formItem.userId = user.id;
            this.formItem.idNo = user.idNo;
            this.jdugeIsCanBind();
          } else {
            this.$notify.info({ msg: '未获取到用户信息！' });
          }
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '获取用户信息失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    /**
     * 是否可以绑卡
     * */
    jdugeIsCanBind() {
      jdugeIsCanBindBankCard()
        .then(isCanBind => {
          if (!isCanBind) {
            this.$router.replace({ path: '/credut_result' });
          }
        })
        .finally(_ => {
          this.isOverLoading = true;
        });
    },

    getApplyUnionKey() {
      let payload = {
        referrer: this.formItem.referrer,
        productId: this.formItem.productId
      };
      this.$toasting.show({ message: '加载中', forbidClick: true });
      getUnionKey(payload)
        .then(res => {
          if (res?.data?.data) {
            this.formItem.applyUnionKey = res.data.data;
            this.formatePageFronAcountMsg();
          } else {
            this.$toasting.hide();
            this.$notify.info({ msg: '未获取到用户申请标识！' });
          }
        })
        .catch(err => {
          this.$toasting.hide();
          this.$notify.error({ msg: err?.data?.msg || '获取用户申请标识失败！' });
        });
    },

    hideLoading() {
      this.isPicLoadOver = true;
    },

    uploadUtil(picFace) {
      let that = this;
      return new Promise((resolve, reject) => {
        initUploadObj(
          that,
          new Date().getTime(),
          picFace,
          'image',
          res => {
            resolve(res.pic);
          },
          'bank_card'
        );
      });
    },

    onBankNameSelect(item) {
      if (item) {
        this.formItem.bankName = item.name;
      }
    },

    // 更换银行卡
    resetChangeBank() {
      // 修改文档的title
      this.setWechatTitle('更换银行卡');
      this.initBankInfo = false;
      this.formItem.debitCardNum = '';
      this.formItem.phoneNum = '';
      this.formItem.bankName = '';
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
        .then(res => {
          this.$toasting.show({ message: '识别中', forbidClick: true });
          picFace = dataURLtoFile(res, getFileName());
          return this.uploadUtil(picFace);
        })
        .then(res => {
          return bankCardOCR({ imageUrl: res, userId: this.formItem.userId });
        })
        .then(res => {
          let bankCard = new BankCard(res?.data?.data);
          this.bankCard = bankCard;
          this.formItem.debitCardNum = bankCard.cardNo;
          let bankCardCode = this.getBankNumByName(bankCard.bankName);
          if (bankCardCode) {
            this.formItem.bankName = bankCard.bankName;
          }
        })
        .catch(err => {
          this.hideLoading();
          this.$notify.error({
            msg: '识别失败，请确认图片内容！'
          });
        })
        .finally(() => {
          this.$toasting.hide();
          this.hideLoading();
        });
    },

    /**
     * 通过银行的名字，获取银行的编号code
     *
     */
    getBankNumByName(bankName) {
      let bankList = this.bankNameList;
      let bankNum;
      bankList.forEach(bank => {
        if (bank.name === bankName) {
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
  padding-top: 20px;
}
.bind-bank-card-wrapper .sub-btn {
  width: 80%;
  margin-top: 10px;
  bottom: 50px;
  position: fixed;
  right: 10%;
}
.bank-name {
  ::v-deep(.van-cell) {
    padding: 0;
  }
  .van-cell::after {
    border: 0 !important;
  }
}
.bank-card-warpper {
  background: #f4f6f9;
  height: 100vh;
}
.tootip {
  display: flex;
  justify-content: center;
  padding: 50px 40px;
  // .circle {
  //   margin: 20px 30px 0 20px;
  //   width: 20px;
  //   height: 16px;
  //   background: #d8d8d8;
  //   border: 1px solid #979797;
  //   border-radius: 50%;
  // }
  .tootip-desc {
    font-size: 26px;
    font-weight: 400;
    color: #a7a7a7;
    text-stroke: 1px #979797;
  }
}
.info-item {
  padding: 20px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-bottom: 1px solid #f2f4f8;
  .title {
    font-weight: 500;
    font-size: 28px;
  }
  .desc {
    font-weight: 500;
    font-size: 26px;
  }
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
.error-msg {
  ::v-deep(.van-field__error-message) {
    margin-left: 170px;
  }
}

.bind-bank-card-wrapper .sub-btn {
  width: 80%;
  position: fixed;
  bottom: 40px;
  right: 10%;
}
.bind-bank-card-wrapper .ivu-form-item {
  margin-bottom: 46px;
  ::v-deep(.ivu-form-item-error-tip) {
    padding-top: 0;
    z-index: 100;
  }
}
.ic-snan {
  height: 20px;
  width: 20px;
}
// .protocol-wrapper {
//   position: relative;
//   @include property-dpr("top", 20);
//   right: 12%;
// }
// .protocol-wrapper .ivu-form-item-error-tip {
//   position: relative;
//   @include property-dpr("bottom", 10);
// }
.errMsg {
  padding: 0 1.25rem;
  max-height: 120px;
  display: flex;
  overflow: auto;
}
.mask {
  position: fixed;
  top: 0;
  right: 0;
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
